const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function generateTermsPDF() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Corporate Palette
  const colorPrimary = rgb(0.05, 0.12, 0.22); // Deep Navy
  const colorBody = rgb(0.2, 0.23, 0.27); // Charcoal text
  const colorMuted = rgb(0.45, 0.5, 0.55); // Slate gray
  const colorLine = rgb(0.82, 0.85, 0.88); // Light border
  const colorHighlight = rgb(0.04, 0.45, 0.65); // Subtle corporate blue

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89; // A4
  const MARGIN_LEFT = 54;
  const MARGIN_RIGHT = 54;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  let currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let currentY = PAGE_HEIGHT - 60;
  let pageNumber = 1;

  function addNewPage() {
    currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNumber++;
    currentY = PAGE_HEIGHT - 60;
    drawPageHeader();
  }

  function drawPageHeader() {
    // Header rule
    currentPage.drawLine({
      start: { x: MARGIN_LEFT, y: PAGE_HEIGHT - 40 },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: PAGE_HEIGHT - 40 },
      thickness: 0.75,
      color: colorLine,
    });

    currentPage.drawText("Q-LINK PROTOCOL  |  OFFICIAL TERMS OF SERVICE & PRIVACY POLICY", {
      x: MARGIN_LEFT,
      y: PAGE_HEIGHT - 35,
      size: 8,
      font: fontBold,
      color: colorMuted,
    });

    currentPage.drawText("DOC REF: QL-TOS-2026-V3", {
      x: PAGE_WIDTH - MARGIN_RIGHT - 110,
      y: PAGE_HEIGHT - 35,
      size: 8,
      font: fontRegular,
      color: colorMuted,
    });
  }

  function checkSpace(neededHeight) {
    if (currentY - neededHeight < 60) {
      drawPageFooter();
      addNewPage();
    }
  }

  function drawPageFooter() {
    currentPage.drawLine({
      start: { x: MARGIN_LEFT, y: 45 },
      end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: 45 },
      thickness: 0.75,
      color: colorLine,
    });

    currentPage.drawText("Confidential & Proprietary © 2026 Q-Link Communications. All rights reserved.", {
      x: MARGIN_LEFT,
      y: 32,
      size: 8,
      font: fontRegular,
      color: colorMuted,
    });

    currentPage.drawText(`Page ${pageNumber}`, {
      x: PAGE_WIDTH - MARGIN_RIGHT - 35,
      y: 32,
      size: 8,
      font: fontBold,
      color: colorMuted,
    });
  }

  function wrapText(text, maxWidth, font, fontSize) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function drawHeading1(text) {
    checkSpace(50);
    currentY -= 15;
    currentPage.drawText(text, {
      x: MARGIN_LEFT,
      y: currentY,
      size: 14,
      font: fontBold,
      color: colorPrimary,
    });
    currentY -= 8;
    currentPage.drawLine({
      start: { x: MARGIN_LEFT, y: currentY },
      end: { x: MARGIN_LEFT + 220, y: currentY },
      thickness: 1.5,
      color: colorHighlight,
    });
    currentY -= 12;
  }

  function drawHeading2(text) {
    checkSpace(35);
    currentY -= 8;
    currentPage.drawText(text, {
      x: MARGIN_LEFT,
      y: currentY,
      size: 11,
      font: fontBold,
      color: colorPrimary,
    });
    currentY -= 14;
  }

  function drawParagraph(text, isOblique = false) {
    const font = isOblique ? fontOblique : fontRegular;
    const lines = wrapText(text, CONTENT_WIDTH, font, 9.5);
    const lineHeight = 13.5;
    checkSpace(lines.length * lineHeight + 8);

    for (const line of lines) {
      currentPage.drawText(line, {
        x: MARGIN_LEFT,
        y: currentY,
        size: 9.5,
        font,
        color: colorBody,
      });
      currentY -= lineHeight;
    }
    currentY -= 6;
  }

  function drawBullet(title, text) {
    const prefix = `•  ${title}: `;
    const fullText = prefix + text;
    const lines = wrapText(fullText, CONTENT_WIDTH - 12, fontRegular, 9.5);
    const lineHeight = 13.5;
    checkSpace(lines.length * lineHeight + 4);

    let isFirst = true;
    for (const line of lines) {
      currentPage.drawText(line, {
        x: MARGIN_LEFT + (isFirst ? 8 : 16),
        y: currentY,
        size: 9.5,
        font: fontRegular,
        color: colorBody,
      });
      isFirst = false;
      currentY -= lineHeight;
    }
    currentY -= 4;
  }

  // --- Document Title & Banner ---
  drawPageHeader();

  currentPage.drawText("Q-LINK NETWORK COMMUNICATIONS", {
    x: MARGIN_LEFT,
    y: currentY,
    size: 20,
    font: fontBold,
    color: colorPrimary,
  });
  currentY -= 18;

  currentPage.drawText("TERMS OF SERVICE & PRIVACY PROTOCOL CHARTER", {
    x: MARGIN_LEFT,
    y: currentY,
    size: 13,
    font: fontBold,
    color: colorHighlight,
  });
  currentY -= 16;

  currentPage.drawText("Effective Epoch: September 2026  |  Document Version: 3.0.4  |  Governing Standard: Zero-Knowledge Architecture", {
    x: MARGIN_LEFT,
    y: currentY,
    size: 8.5,
    font: fontOblique,
    color: colorMuted,
  });
  currentY -= 10;

  currentPage.drawLine({
    start: { x: MARGIN_LEFT, y: currentY },
    end: { x: PAGE_WIDTH - MARGIN_RIGHT, y: currentY },
    thickness: 1,
    color: colorLine,
  });
  currentY -= 16;

  // Introduction
  drawParagraph(
    "Please read this Terms of Service & Privacy Protocol Agreement carefully before accessing or authenticating into the Q-Link platform. By logging in, creating an account, or interacting with Q-Link nodes, you agree to be bound by the terms, operating covenants, and data policies described herein. If you do not accept these terms, you must discontinue platform use immediately."
  );

  // Section 1
  drawHeading1("1. Acceptance of Terms & Protocol Identity");
  drawParagraph(
    "Q-Link is a next-generation peer network and high-performance communication platform engineered around client-side zero-knowledge cryptography. Authentication options (Google OAuth, Microsoft Azure AD, GitHub, or Phone OTP) are provided strictly to issue an authenticated session and associate your sovereign Quantum Handle. Your login constitutes affirmative consent to these operating rules and protocol principles."
  );

  // Section 2
  drawHeading1("2. Cryptographic Architecture & Data Privacy");
  drawParagraph(
    "Unlike legacy social platforms that inspect and harvest user conversations, Q-Link enforces strict mathematical immunity through client-side cryptography:"
  );
  drawBullet(
    "Client-Side Key Generation",
    "All cryptographic key pairs (ECDH P-256 and AES-256-GCM) are minted strictly inside the user's browser runtime (W3C WebCrypto API). Private keys never touch Q-Link infrastructure."
  );
  drawBullet(
    "Zero Plaintext Storage",
    "Communication payloads are encrypted on the sender's local device before transmission. Q-Link relays operate as blind conduits; our servers and databases cannot decipher your private conversations."
  );
  drawBullet(
    "Telemetry Immunity",
    "We strictly prohibit background keystroke telemetry, unposted draft profiling, ultrasonic acoustic beacons, or relational address book harvesting. Unposted message state exists solely within local browser memory."
  );

  // Section 3
  drawHeading1("3. Data Minimization: What Is Stored vs. What Is Impossible to Store");
  drawParagraph(
    "In full transparency and adherence to international privacy standards (GDPR Art. 5(1)(c) and CCPA / CPRA), our records are limited to the minimal viable metadata needed for real-time delivery:"
  );
  drawBullet("Retained Records", "User handle (@username), public display name, public encryption key, ephemeral ciphertext transit buffer, and gamification aura metrics.");
  drawBullet("Impossible to Retain", "Plaintext message bodies, voice audio data, private keys, location telemetry, cross-site tracking cookies, and advertising identity tokens.");

  // Section 4
  drawHeading1("4. Permitted Use & Community Conduct");
  drawParagraph(
    "Users must respect network stability and the rights of other participants. Prohibited conduct results in immediate, non-negotiable cryptographic node revocation:"
  );
  drawBullet("Safety Mandate", "Zero tolerance for Child Sexual Abuse Material (CSAM), non-consensual imagery, terror mobilization, or credible threats of physical violence.");
  drawBullet("Network Integrity", "Prohibition of distributed denial-of-service (DDoS) command relays, automated scraping botnets, credential harvesting, or exploitation of protocol APIs.");
  drawBullet("Rate Limiting", "Upstash Redis token-bucket governors enforce protective traffic thresholds at the edge. High-frequency automated spam triggers automatic temporary throttling.");

  // Section 5
  drawHeading1("5. The 'Nuclear Purge' Right to Absolute Deletion");
  drawParagraph(
    "Q-Link fully implements the Right to Erasure (GDPR Article 17). When you select 'Nuclear Purge' or delete your profile from the ID Console, our database executes an atomic hard-delete cascade across all user records, push tokens, and transit buffers. No residual shadow profile or archived backup copy is retained."
  );

  // Section 6
  drawHeading1("6. Third-Party Embeds & External Services");
  drawParagraph(
    "When you share social links (YouTube, X, Instagram, Facebook), Q-Link utilizes native players or secure embed previews. Third-party content providers operate under their respective privacy policies. Q-Link does not transmit your profile credentials or private keys to external content networks."
  );

  // Section 7
  drawHeading1("7. Warrant Canary & Subpoena Mathematics");
  drawParagraph(
    "As of September 2026, Q-Link has received ZERO (0) National Security Letters, FISA court orders, or governmental interception directives. Because Q-Link does not possess user decryption keys, any subpoena compelling decryption receives the only technically truthful response: decryption is mathematically impossible."
  );

  // Section 8
  drawHeading1("8. Limitation of Liability & Disclaimers");
  drawParagraph(
    "The Q-Link protocol is provided on an 'AS IS' and 'AS AVAILABLE' basis without warranties of any kind. You are solely responsible for safeguarding your device security and cryptographic credentials. Q-Link is not liable for data loss caused by unauthorized physical device access, browser cache wipes without backup, or network-level disruptions."
  );

  // Section 9
  drawHeading1("9. Amendments & Corporate Governance");
  drawParagraph(
    "Any material updates to this charter will be cryptographically tagged and announced across the official platform status channel. Continued usage following published revisions constitutes acceptance of the modified protocol terms."
  );

  // Section 10
  drawHeading1("10. Legal Coordinates & Inquiries");
  drawParagraph(
    "For legal notices, vulnerability disclosures, or regulatory inquiries, contact our compliance team:"
  );
  drawBullet("Legal & Regulatory Affairs", "legal@qlink.chat");
  drawBullet("Security Vulnerability Team", "security@qlink.chat");
  drawBullet("Platform Coordinates", "Q-Link Systems Inc. • Global Network Infrastructure");

  // Final footer on last page
  drawPageFooter();

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, "..", "public", "terms.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Successfully generated terms.pdf (${pdfBytes.length} bytes) at: ${outputPath}`);
}

generateTermsPDF().catch((err) => {
  console.error("Failed to generate Terms PDF:", err);
  process.exit(1);
});
