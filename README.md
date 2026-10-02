# Q-Link Platform (v3.0 Production Core)

> **Resilient, Private & Low-Latency Real-Time Communication Platform for Web and Desktop.**

Official repository and technical documentation for **Q-Link v3.0**.

---

## 🌐 Live Services & Endpoints
* **Production Web App**: [https://q-link-v3-0.vercel.app/](https://q-link-v3-0.vercel.app/)
* **AI Agent Context Specification**: [https://q-link-v3-0.vercel.app/llms.txt](https://q-link-v3-0.vercel.app/llms.txt)
* **Windows Desktop Binary**: [Download Q-Link-Setup.exe](https://q-link-v3-0.vercel.app/downloads/Q-Link-Setup.exe)
* **Core Team & Org**: [https://github.com/Q-Link-Platform](https://github.com/Q-Link-Platform)

---

## 🏗️ High-Level System Architecture

`	ext
┌────────────────────────────────────────────────────────┐
│             Q-Link Clients (Web / Desktop)             │
│   Next.js 14 App Router + Web Crypto API + Electron    │
└───────────────────────────┬────────────────────────────┘
                            │ (HTTPS / WSS)
┌───────────────────────────▼────────────────────────────┐
│              Edge Gateway & API Handlers               │
│    Next.js Edge Runtime + Zod Schemas + Auth Guard     │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼─────────────┐   ┌─────────▼──────────────┐
│  State & Recency Engine   │   │  Ephemeral Media Store │
│ Neon Serverless Postgres  │   │  Blob Storage Engine   │
│   via Prisma ORM Client   │   │   24h TTL Auto-Purge   │
└───────────────────────────┘   └────────────────────────┘
`

---

## 🌟 Core Features & Technical Highlights

### 1. Real-Time State & Recency Engine
- **Dynamic Recency Sorting**: Contacts dynamically re-order in real time based on message timestamps and unread counters.
- **Triple-State Delivery Receipts**: Event-driven delivery status:
  - Sent (Single Grey Tick)
  - Delivered (Double Grey Tick via server socket ACK)
  - Seen (Double Emerald Glowing Tick upon focus/intersection)
- **Presence & Typing Oscillators**: Sub-50ms presence heartbeats and audio/typing wave visualizers.

### 2. Security & Ephemeral Storage Pipeline
- **Client-Side Cryptography Handshake**: Web Crypto API (SubtleCrypto) primitives for AES-GCM / RSA key exchange.
- **24-Hour Ephemeral Media Auto-Purge**: Media attachments self-destruct after 24 hours, automatically purging blobs.
- **Zod Schema Validation**: Strict type enforcement across mutation routes (/api/friends/request, /api/chat, auth).

### 3. Community Pulse & Discovery
- **Aura Engagement Protocol**: Real-time algorithmic ranking calculated from platform activity, verified invites, and VIP tiers (Sapphire 10 & Diamond 10 canvas shaders).
- **Universal Social Media Embeds**: Zero-dependency OpenGraph & Twitter card parser with full-bleed 9:16 vertical reels previews.

### 4. Native Windows Desktop Client (.exe)
- System Tray lifecycle with background notification listener.
- Hardware-accelerated 60fps rendering toggle with Battery Saver mode.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & Shaders** | TailwindCSS, Framer Motion, HTML5 Canvas 2D / WebGL |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM |
| **Cryptography** | Web Crypto API (crypto.subtle) |
| **Desktop Runtime** | Electron, Node.js Native Bridge |
| **Deployment** | Vercel Serverless & Edge Network |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL connection string (Neon or local)

### Installation
`ash
# 1. Clone repository
git clone https://github.com/Q-Link-Platform/qlink-app.git
cd qlink-app

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Push database schema
npx prisma db push

# 5. Start development server
npm run dev
`

Visit http://localhost:3000 to launch the platform locally.

---

## 📄 License
MIT License © 2026 Q-Link Platform. Authored by the Q-Link Core Team.
