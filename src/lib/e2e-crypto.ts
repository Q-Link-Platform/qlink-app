// Client-side End-to-End Encryption (E2E) using Web Crypto API and IndexedDB

// Helper to open IndexedDB
function getDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open("qlink-e2e", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get value from IndexedDB
async function getStoredKey(name: string): Promise<any> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys", "readonly");
    const store = transaction.objectStore("keys");
    const request = store.get(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save value to IndexedDB
async function setStoredKey(name: string, value: any): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("keys", "readwrite");
    const store = transaction.objectStore("keys");
    const request = store.put(value, name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Check if crypto is supported (Web Crypto subtle is only available in HTTPS/localhost)
export function isCryptoSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.crypto !== undefined &&
    window.crypto.subtle !== undefined
  );
}

// Generate ECDH Keypair, store Private Key as extractable (to support backup), return Public Key JWK string
export async function initE2EKeys(
  encryptedPrivateKeyBackup?: string | null,
  backupPublicKeyString?: string | null,
  masterSeedHex?: string | null
): Promise<string | null> {
  if (!isCryptoSupported()) {
    console.warn("[E2E] Cryptography not supported (requires HTTPS/localhost). E2E disabled.");
    return null;
  }

  try {
    // Check if we already have a private key and public key string in IndexedDB
    const existingPrivateKey = await getStoredKey("private-key");
    const existingPublicKeyString = await getStoredKey("public-key-string");

    if (existingPrivateKey && existingPublicKeyString) {
      return existingPublicKeyString;
    }

    // If IndexedDB is empty, but we have a backup, restore it!
    if (encryptedPrivateKeyBackup && backupPublicKeyString && masterSeedHex) {
      console.log("[E2E] Local keys missing, but backup found. Attempting silent restore...");
      const restored = await restorePrivateKey(encryptedPrivateKeyBackup, backupPublicKeyString, masterSeedHex);
      if (restored) {
        return backupPublicKeyString;
      }
    }

    console.log("[E2E] No existing keys found. Generating new ECDH keypair...");

    // Generate ECDH key pair on P-256 curve
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true, // extractable = true (needed to export and backup the private key)
      ["deriveKey"]
    );

    // Export public key as JWK
    const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const publicKeyString = JSON.stringify(publicKeyJwk);

    // Save keypair to IndexedDB
    await setStoredKey("private-key", keyPair.privateKey);
    await setStoredKey("public-key-string", publicKeyString);

    console.log("[E2E] ECDH keypair generated and saved successfully.");
    return publicKeyString;
  } catch (err: any) {
    console.warn("[E2E] Failed to initialize keys:", err?.message || err);
    return null;
  }
}

// Helper to derive a CryptoKey from the hex master seed
async function getMasterSeedKey(masterSeedHex: string): Promise<CryptoKey> {
  const rawKey = new Uint8Array(
    masterSeedHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  return await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt a string using the derived master seed key (AES-GCM)
export async function encryptWithMasterSeed(text: string, masterSeedHex: string): Promise<string | null> {
  if (!isCryptoSupported()) return null;
  try {
    const key = await getMasterSeedKey(masterSeedHex);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoder.encode(text)
    );
    
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
    
    return JSON.stringify({
      iv: ivBase64,
      ciphertext: ciphertextBase64,
    });
  } catch (err: any) {
    console.warn("[E2E] Master seed encryption failed:", err?.message || err);
    return null;
  }
}

// Decrypt a string using the derived master seed key (AES-GCM)
export async function decryptWithMasterSeed(encryptedPayloadJson: string, masterSeedHex: string): Promise<string | null> {
  if (!isCryptoSupported()) return null;
  try {
    const key = await getMasterSeedKey(masterSeedHex);
    const payload = JSON.parse(encryptedPayloadJson);
    if (!payload.iv || !payload.ciphertext) {
      return null;
    }
    
    const ivBytes = new Uint8Array(atob(payload.iv).split("").map((c) => c.charCodeAt(0)));
    const ciphertextBytes = new Uint8Array(atob(payload.ciphertext).split("").map((c) => c.charCodeAt(0)));
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes,
      },
      key,
      ciphertextBytes
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err: any) {
    console.warn("[E2E] Master seed decryption failed:", err?.message || err);
    return null;
  }
}

// Export the private key from IndexedDB and encrypt it using the master seed
export async function backupPrivateKey(masterSeedHex: string): Promise<string | null> {
  if (!isCryptoSupported()) return null;
  try {
    const privateKey = await getStoredKey("private-key");
    if (!privateKey) {
      console.warn("[E2E] No private key found in IndexedDB to backup");
      return null;
    }
    
    // Export private key as JWK JSON
    const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", privateKey);
    const privateKeyString = JSON.stringify(privateKeyJwk);
    
    // Encrypt with master seed
    return await encryptWithMasterSeed(privateKeyString, masterSeedHex);
  } catch (err: any) {
    console.warn("[E2E] Failed to backup private key (key might not be extractable):", err?.message || err);
    return null;
  }
}

// Decrypt the private key backup using the master seed and import it back into IndexedDB
export async function restorePrivateKey(
  encryptedPrivateKeyString: string,
  publicKeyString: string,
  masterSeedHex: string
): Promise<boolean> {
  if (!isCryptoSupported()) return false;
  try {
    // Decrypt the private key JWK string
    const privateKeyString = await decryptWithMasterSeed(encryptedPrivateKeyString, masterSeedHex);
    if (!privateKeyString) {
      console.warn("[E2E] Decryption of private key failed");
      return false;
    }
    
    const privateKeyJwk = JSON.parse(privateKeyString);
    
    // Import back as CryptoKey
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      privateKeyJwk,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true, // extractable = true
      ["deriveKey"]
    );
    
    // Save to IndexedDB
    await setStoredKey("private-key", privateKey);
    await setStoredKey("public-key-string", publicKeyString);
    console.log("[E2E] Private key and public key string restored to IndexedDB silently");
    return true;
  } catch (err: any) {
    console.warn("[E2E] Failed to restore private key:", err?.message || err);
    return false;
  }
}

// Derive shared AES-GCM key from local private key and peer's public key JWK
async function getSharedKey(peerPublicKeyJwkString: string): Promise<CryptoKey | null> {
  if (!isCryptoSupported()) return null;

  try {
    const myPrivateKey = await getStoredKey("private-key");
    if (!myPrivateKey) {
      console.warn("[E2E] Missing local private key");
      return null;
    }

    const peerPublicKeyJwk = JSON.parse(peerPublicKeyJwkString);
    const peerPublicKey = await window.crypto.subtle.importKey(
      "jwk",
      peerPublicKeyJwk,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );

    // Derive symmetric key for AES-GCM 256
    return await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: peerPublicKey,
      },
      myPrivateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      false, // non-extractable shared key
      ["encrypt", "decrypt"]
    );
  } catch (err: any) {
    console.debug("[E2E] Shared key derivation failed:", err?.message || err);
    return null;
  }
}

// Encrypt plaintext message content using peer's public key string
export async function encryptMessage(text: string, peerPublicKeyString: string): Promise<string> {
  if (!text.trim() || !peerPublicKeyString) return text;
  if (!isCryptoSupported()) return text;

  try {
    const sharedKey = await getSharedKey(peerPublicKeyString);
    if (!sharedKey) return text;

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      sharedKey,
      encoder.encode(text)
    );

    // Convert iv and ciphertext to base64
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));

    return JSON.stringify({
      __e2e: true,
      iv: ivBase64,
      ciphertext: ciphertextBase64,
    });
  } catch (err: any) {
    console.warn("[E2E] Encryption failed:", err?.message || err);
    return text;
  }
}

// Decrypt message content using peer's public key string
export async function decryptMessage(encryptedPayloadJson: string, peerPublicKeyString: string): Promise<string> {
  if (!encryptedPayloadJson || !peerPublicKeyString) return encryptedPayloadJson;
  if (!isCryptoSupported()) return encryptedPayloadJson;

  try {
    // Check if the payload is actually an E2E JSON structure
    if (!encryptedPayloadJson.trim().startsWith('{"__e2e"')) {
      return encryptedPayloadJson; // Return plain text as-is (backward compatibility)
    }

    const payload = JSON.parse(encryptedPayloadJson);
    if (!payload.__e2e || !payload.iv || !payload.ciphertext) {
      return encryptedPayloadJson;
    }

    const sharedKey = await getSharedKey(peerPublicKeyString);
    if (!sharedKey) {
      return "🔒 [Encrypted Message - Key Unavailable]";
    }

    // Convert base64 back to byte arrays
    const ivBytes = new Uint8Array(atob(payload.iv).split("").map((c) => c.charCodeAt(0)));
    const ciphertextBytes = new Uint8Array(atob(payload.ciphertext).split("").map((c) => c.charCodeAt(0)));

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes,
      },
      sharedKey,
      ciphertextBytes
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err: any) {
    console.debug("[E2E] Decryption failed:", err?.message || err);
    return "🔒 [Encrypted Message - Decryption Failed]";
  }
}
