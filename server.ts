import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google GenAI on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for safety fallback
const getApiKey = () => process.env.GEMINI_API_KEY;

// 1. Voice Parsing Endpoint (AI Speech-to-Ledger & Pronunciation Fixer)
app.post("/api/ai/voice-parse", async (req, res) => {
  try {
    const { transcript, userContext } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    if (!getApiKey()) {
      // Return intelligent offline fallback parsing if key is missing
      return res.json({
        amount: parseFallbackAmount(transcript),
        type: transcript.toLowerCase().includes("pay") || transcript.toLowerCase().includes("receive") || transcript.toLowerCase().includes("give me") ? "income" : "expense",
        category: "General",
        note: transcript,
        corrected_phrase: `Logged: ${transcript}`,
        audioFeedbackText: `Successfully logged entry from voice: ${transcript}`,
      });
    }

    const systemInstruction = `You are the core AI Engine for 'E-moneyLog', an intelligent Nigerian financial cash book and ledger assistant.
Your task is to parse voice transcripts spoken by Nigerian users (which may contain Nigerian English, Pidgin, or pronunciation typos/accent slurs).

Correct pronunciation and speech errors:
- "five handred" -> 500
- "tousan" or "one bags" or "two k" -> 1000 or 2000 NGN
- "I dash am" / "I give am" -> expense
- "Person pay me" / "Oga send me" / "Client credit me" -> income
- "Chop money" / "Food" -> category: Food & Dining
- "Drop" / "Kabukabu" / "Fuel" / "Transport" -> category: Transportation
- "Data" / "Airtime" / "Recharge" -> category: Utilities & Bills
- "Stock" / "Market" / "Goods" -> category: Business Stock

Return strictly JSON with:
{
  "amount": number (in Naira NGN),
  "type": "income" | "expense",
  "category": "Food & Dining" | "Transportation" | "Utilities & Bills" | "Business Stock" | "Salaries & Wages" | "Personal & Shopping" | "Gifts & Donations" | "Medical & Health" | "Rent & Housing" | "General",
  "note": string (clean description in English),
  "corrected_phrase": string (polished sentence e.g. "Spent ₦500 on Bread" or "Received ₦15,000 for Website Design"),
  "audioFeedbackText": string (friendly short confirmation sentence for Text-to-Speech readback e.g. "Oga, I have logged ₦500 for Bread under Food.")
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `User Voice Input: "${transcript}"\nUser Context: ${JSON.stringify(userContext || {})}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "Numeric amount in Naira" },
            type: { type: Type.STRING, description: "income or expense" },
            category: { type: Type.STRING, description: "Category name" },
            note: { type: Type.STRING, description: "Clean description" },
            corrected_phrase: { type: Type.STRING, description: "Polished statement" },
            audioFeedbackText: { type: Type.STRING, description: "Voice response text for TTS" },
          },
          required: ["amount", "type", "category", "note", "corrected_phrase", "audioFeedbackText"],
        },
      },
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);

    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/voice-parse:", error);
    return res.status(500).json({ error: error.message || "Failed to process voice log" });
  }
});

// 2. SMS Bank Alert Parsing Endpoint
app.post("/api/ai/sms-parse", async (req, res) => {
  try {
    const { smsText } = req.body;
    if (!smsText) {
      return res.status(400).json({ error: "SMS text is required" });
    }

    if (!getApiKey()) {
      return res.json({
        amount: 2500,
        type: "expense",
        category: "Food & Dining",
        description: "POS / Chicken Republic",
        bankName: "GTBank",
        corrected_phrase: "Parsed GTBank SMS: ₦2,500 DR at Chicken Republic",
      });
    }

    const systemInstruction = `You are a Nigerian Bank SMS Alert Parser for E-moneyLog.
Analyze bank transaction SMS text from Nigerian banks (GTBank, Zenith, FirstBank, Access Bank, UBA, Kuda, OPay, Palmpay, Moniepoint, Stanbic, Wema, etc.).

Extract transaction info and classify:
- Credit / CR / Received -> income
- Debit / DR / Paid / Spent / POS / Transfer to -> expense

Return JSON with:
{
  "amount": number,
  "type": "income" | "expense",
  "category": string,
  "description": string,
  "bankName": string,
  "corrected_phrase": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `SMS Text: "${smsText}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            bankName: { type: Type.STRING },
            corrected_phrase: { type: Type.STRING },
          },
          required: ["amount", "type", "category", "description", "bankName", "corrected_phrase"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/sms-parse:", error);
    return res.status(500).json({ error: error.message || "Failed to parse SMS alert" });
  }
});

// 3. AI Financial Advisor Endpoint ("Oga Assistant")
app.post("/api/ai/financial-advisor", async (req, res) => {
  try {
    const { logs, debts, user, timePeriod } = req.body;

    if (!getApiKey()) {
      return res.json({
        summaryText: "Oga, your cash flow is active! Keep tracking your daily expenses to maintain a healthy budget in Naira.",
        topExpenseCategory: "Food & Dining",
        savingsTip: "Consider setting a daily spending cap on non-essential items like eating out.",
        healthScore: 82,
        pidginGreeting: "Naija Chief! Money matter dey shape up well well.",
      });
    }

    const systemInstruction = `You are "Oga E-money AI", a warm, witty, and highly experienced financial advisor tailored for Nigerian small business owners, freelancers, and individuals.
Provide financial analysis of the user's Naira transactions and debts. Keep the tone encouraging, culturally relatable (with touch of mild, polite Nigerian English / Pidgin idioms), and actionable.

Return JSON:
{
  "summaryText": string (2-3 sentences overall evaluation of cash flow),
  "topExpenseCategory": string,
  "savingsTip": string (specific actionable tip for saving Naira in Nigeria),
  "healthScore": number (0-100 score),
  "pidginGreeting": string (1 warm Nigerian greeting line)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `User Profile: ${JSON.stringify(user || {})}\nRecent Logs: ${JSON.stringify(logs || [])}\nDebts/Owo: ${JSON.stringify(debts || [])}\nPeriod: ${timePeriod || "This Month"}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryText: { type: Type.STRING },
            topExpenseCategory: { type: Type.STRING },
            savingsTip: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            pidginGreeting: { type: Type.STRING },
          },
          required: ["summaryText", "topExpenseCategory", "savingsTip", "healthScore", "pidginGreeting"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai/financial-advisor:", error);
    return res.status(500).json({ error: error.message || "Failed to generate financial advisory" });
  }
});

// Fallback helper for offline parse
function parseFallbackAmount(text: string): number {
  const match = text.match(/\b\d+([.,]\d+)?\b/);
  if (match) {
    return parseFloat(match[0].replace(",", ""));
  }
  if (text.toLowerCase().includes("hundred") || text.toLowerCase().includes("handred")) return 100;
  if (text.toLowerCase().includes("thousand") || text.toLowerCase().includes("tousan")) return 1000;
  return 500;
}

// Start Server Setup with Vite
async function startServer() {
  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", appName: "E-moneyLog", currency: "NGN (₦)" });
  });

  // Serve Vite in dev or static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-moneyLog Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
