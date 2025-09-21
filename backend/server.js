import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Optional Firestore initialization
let db = null;
// Uncomment if you have Firebase Admin credentials
// initializeApp({ credential: cert(serviceAccount) });
// db = getFirestore();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("🚀 Backend server is running!");
});

// Generate AI suggestions with fixed targets
app.post("/api/suggestions", async (req, res) => {
  try {
    // Fixed target values
    const fixedTargets = {
      temperature: 1475, // °C
      pressure: 1250000000, // Pa
      emissions: 1000 // kg/day
    };

    const { metrics } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Cement Plant Metrics:
{
  "current_temperature": ${metrics.temperature},
  "current_pressure": ${metrics.pressure},
  "current_emissions": ${metrics.emissions},
  "target_temperature": ${fixedTargets.temperature},
  "target_pressure": ${fixedTargets.pressure},
  "target_emissions": ${fixedTargets.emissions}
}

For each metric (temperature, pressure, emissions), provide actionable steps to reach the target and possible problems.
Return ONLY JSON like this:

{
  "temperature": [
    "action: ...",
    "problem: ..."
  ],
  "pressure": [
    "action: ...",
    "problem: ..."
  ],
  "emissions": [
    "action: ...",
    "problem: ..."
  ]
}
`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text();

    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let suggestionsByMetric = { temperature: [], pressure: [], emissions: [] };
    try {
      suggestionsByMetric = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse AI suggestions JSON:", err, "\nRaw text:", rawText);
    }

    res.json({ 
      target: fixedTargets,
      suggestions: suggestionsByMetric 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));






// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { initializeApp, applicationDefault } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";

// dotenv.config();
// const app = express();
// app.use(express.json());
// app.use(cors({ origin: "http://localhost:3000" }));

// // Initialize Firestore Admin SDK
// initializeApp({
//   credential: applicationDefault(), // or use serviceAccountKey.json
// });
// const db = getFirestore();

// // Initialize Google Gemini AI client
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// app.get("/", (req, res) => {
//   res.send("🚀 Backend server is running!");
// });

// // Generate AI suggestions
// app.post("/api/suggestions", async (req, res) => {
//   try {
//     const { metrics } = req.body;

//     // Get Gemini model
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Prompt for AI
//     const prompt = `
// Given these cement plant metrics:
// - Temperature: ${metrics.temperature} °C
// - Pressure: ${metrics.pressure} bar
// - Emissions: ${metrics.emissions} ppm

// Suggest 2 operational optimizations for each metric separately.
// Return as lines starting with Temperature:, Pressure:, Emissions:
// `;

//     const result = await model.generateContent(prompt);
//     const rawText = result.response.text();

//     // Split into lines and separate by metric
//     const lines = rawText.split("\n").filter(l => l.trim() !== "");

//     const suggestions = {
//       temperature: lines.filter(l => l.toLowerCase().includes("temperature")),
//       pressure: lines.filter(l => l.toLowerCase().includes("pressure")),
//       emissions: lines.filter(l => l.toLowerCase().includes("emissions")),
//     };

//     res.json({ suggestions });
//   } catch (err) {
//     console.error("Error generating suggestions:", err);
//     res.status(500).json({ error: "Failed to generate suggestions" });
//   }
// });

// // Store approved suggestions in Firestore
// app.post("/api/approve-suggestion", async (req, res) => {
//   try {
//     const { suggestion, metricId, metrics } = req.body;

//     await db.collection("approvedSuggestions").add({
//       suggestion,
//       metricId,
//       approvedMetrics: metrics,
//       timestamp: new Date(),
//     });

//     res.json({ success: true });
//   } catch (err) {
//     console.error("Error storing approved suggestion:", err);
//     res.status(500).json({ error: "Failed to store approved suggestion" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));



// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";        // ✅ import cors
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();
// const app = express();
// app.use(express.json());

// // ✅ Allow frontend requests from localhost:3000
// app.use(cors({ origin: "http://localhost:3000" }));

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// app.get("/", (req, res) => {
//   res.send("🚀 Backend server is running!");
// });

// app.post("/api/suggestions", async (req, res) => {
//   try {
//     const { metrics } = req.body;
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
//     Given these cement plant metrics:
//     - Temperature: ${metrics.temperature} °C
//     - Pressure: ${metrics.pressure} bar
//     - Emissions: ${metrics.emissions} ppm

//     Suggest operational optimizations.
//     `;

//     const result = await model.generateContent(prompt);

//     res.json({ suggestions: result.response.text() });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to generate suggestions" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
