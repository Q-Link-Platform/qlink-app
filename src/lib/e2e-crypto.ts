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

// Generate ECDH Keypair, store Private Key as non-extractable, return Public Key JWK string
export async function initE2EKeys(): Promise<string | null> {
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

    console.log("[E2E] No existing keys found. Generating new ECDH keypair...");

    // Generate ECDH key pair on P-256 curve
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      false, // extractable = false (forces private key to be non-extractable JS-side)
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
  } catch (err) {
    console.error("[E2E] Failed to initialize keys:", err);
    return null;
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
  } catch (err) {
    console.error("[E2E] Shared key derivation failed:", err);
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
  } catch (err) {
    console.error("[E2E] Encryption failed:", err);
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
  } catch (err) {
    console.error("[E2E] Decryption failed:", err);
    return "🔒 [Encrypted Message - Decryption Failed]";
  }
}
