# E-MoneyLog Capabilities & System Architecture

This document lists the production capabilities and preview/simulated features of E-MoneyLog.

## Live Production Capabilities
- **Backend Architecture:** Fast, persistent REST API on Express Node.js (`/api/v1/*`) with structured file database (`/server/db.ts`) storing Users, Cash Book Logs, Debts ("Owo"), and Audit Logs.
- **Authentication:** Password hashing using `bcryptjs`, JWT access & refresh tokens, password-protected record resets, and server-side verification.
- **AI Engine (Gemini 3.5 Flash):**
  - AI Voice Speech-to-Ledger & Accent Correction (Nigerian English, Pidgin, "five handred" -> 500, "two k" -> 2000 NGN).
  - Bank SMS Alert Parser (GTBank, Zenith, FirstBank, Access, OPay, Palmpay, Moniepoint, etc.).
  - "Oga Financial Advisor" AI Cash Flow analysis and NGN savings suggestions.
  - Offline fallback parsers for resilient zero-key operations.
- **Reports & Export:** Cash Book statement generation, CSV/PDF statement export, and audit log generation.
- **PWA & Offline:** Web App Manifest (`manifest.json`), service worker caching, and local storage fallback queue.

## Simulated Previews
- **WhatsApp Bot Simulator (`WhatsAppBotSimulator.tsx`):** In-app simulator demonstrating how WhatsApp Business Cloud API messages map directly to the AI voice-parse engine and ledger database.
- **60s Video Walkthrough (`VideoDemoModal.tsx`):** Interactive scene walkthrough simulating application onboarding, voice recording, SMS parsing, and debt management.
- **SMS Telephony Gateway:** In-browser paste simulator for Nigerian Bank alert SMS processing.
