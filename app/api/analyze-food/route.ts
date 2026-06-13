import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type FoodAnalysis = {
  status: "fresh" | "spoilt";
  foodName: string;
  quantity: string;
  category: "Meals" | "Bakery" | "Produce" | "Groceries" | "Beverages" | "Desserts";
  estimatedPreparedHours: number;
  freshnessNotes: string[];
  confidence: number;
  description: string;
};

const validCategories = ["Meals", "Bakery", "Produce", "Groceries", "Beverages", "Desserts"] as const;

const fallbackAnalysis: FoodAnalysis = {
  status: "spoilt",
  foodName: "Unverified food",
  quantity: "1 serving",
  category: "Meals",
  estimatedPreparedHours: 2,
  freshnessNotes: ["The image could not be verified clearly enough for a safe donation."],
  confidence: 0,
  description: "The image could not be verified clearly enough for a safe donation."
};

function getCandidateModels() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  return [
    configuredModel,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest"
  ].filter((model, index, models): model is string => Boolean(model) && models.indexOf(model) === index);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Gemini API error";
}

function isGeminiAuthError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("api key not valid") ||
    message.includes("invalid api key") ||
    message.includes("invalid authentication credentials") ||
    message.includes("permission denied") ||
    message.includes("unauthorized") ||
    message.includes("403") ||
    message.includes("401")
  );
}

function parseGeminiJson(text: string) {
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0] ?? text;

  try {
    return JSON.parse(jsonText);
  } catch {
    // Gemini can occasionally return almost-JSON with a broken string. Extract
    // the fields line-by-line so the upload flow does not fail for donors.
  }

  const lineValue = (key: string) => {
    const match = jsonText.match(new RegExp(`"${key}"\\s*:\\s*"?([^\\n,}]*)`, "i"));
    return match?.[1]?.replace(/^["']|["']$/g, "").trim();
  };

  const numberValue = (key: string) => {
    const value = Number(lineValue(key)?.match(/\d+(\.\d+)?/)?.[0]);
    return Number.isFinite(value) ? value : undefined;
  };

  const notesBlock = jsonText.match(/"freshnessNotes"\s*:\s*\[([\s\S]*?)\]/i)?.[1] ?? "";
  const freshnessNotes = [...notesBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

  return {
    status: lineValue("status") ?? fallbackAnalysis.status,
    foodName: lineValue("foodName") ?? fallbackAnalysis.foodName,
    quantity: lineValue("quantity") ?? fallbackAnalysis.quantity,
    category: lineValue("category") ?? fallbackAnalysis.category,
    estimatedPreparedHours: numberValue("estimatedPreparedHours") ?? fallbackAnalysis.estimatedPreparedHours,
    freshnessNotes: freshnessNotes.length > 0 ? freshnessNotes : fallbackAnalysis.freshnessNotes,
    confidence: numberValue("confidence") ?? fallbackAnalysis.confidence,
    description: lineValue("description") ?? fallbackAnalysis.description
  };
}

function normalizeAnalysis(raw: unknown): FoodAnalysis {
  const fallback = fallbackAnalysis;

  if (!raw || typeof raw !== "object") return fallback;

  const data = raw as {
    status?: unknown;
    foodName?: unknown;
    quantity?: unknown;
    category?: unknown;
    estimatedPreparedHours?: unknown;
    freshnessNotes?: unknown;
    confidence?: unknown;
    description?: unknown;
  };
  const statusText = String(data.status ?? "").trim().toLowerCase();
  const status: FoodAnalysis["status"] =
    statusText === "fresh" || statusText === "safe" || statusText === "good" ? "fresh" : "spoilt";

  const category = validCategories.includes(data.category as FoodAnalysis["category"])
    ? (data.category as FoodAnalysis["category"])
    : fallback.category;

  const estimatedPreparedHours = Math.min(
    24,
    Math.max(0, Number.isFinite(Number(data.estimatedPreparedHours)) ? Number(data.estimatedPreparedHours) : 2)
  );

  const freshnessNotes = Array.isArray(data.freshnessNotes)
    ? data.freshnessNotes
        .filter((note): note is string => typeof note === "string" && note.trim().length > 0)
        .slice(0, 4)
        .map((note) => note.trim())
    : fallback.freshnessNotes;

  const confidence = Math.min(
    100,
    Math.max(0, Number.isFinite(Number(data.confidence)) ? Number(data.confidence) : 60)
  );

  const description =
    typeof data.description === "string" && data.description.trim().length > 0
      ? data.description.trim()
      : fallback.description;

  return {
    status,
    foodName:
      typeof data.foodName === "string" && data.foodName.trim().length > 0
        ? data.foodName.trim()
        : fallback.foodName,
    quantity:
      typeof data.quantity === "string" && data.quantity.trim().length > 0
        ? data.quantity.trim()
        : fallback.quantity,
    category,
    estimatedPreparedHours,
    freshnessNotes,
    confidence,
    description
  };
}

export async function POST(req: Request) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
    console.log("API Key present:", !!API_KEY);

    if (!API_KEY) {
      return NextResponse.json({ error: "Gemini API Key is not configured in .env.local. Please ensure the file exists in the project root and restart your development server." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Please upload a valid food image." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const prompt = `
      Analyze this uploaded food image for a food donation app.

      MANDATORY STEP: Decide whether the visible food is safe-looking/fresh or spoilt/unsafe.
      Return "spoilt" if:
      - the image is unclear, too dark, not food, or does not show enough food detail
      - there is visible mold, rot, discoloration, slime, leakage, pests, bad packaging, or other spoilage signs
      - you cannot confidently verify the food condition from the photo
      
      Return only one valid JSON object. Do not wrap it in markdown.
      Keep every string on one line. Do not use unescaped quote marks inside string values.
      Use this exact structure:
      {
        "status": "fresh" | "spoilt",
        "foodName": "short, donor-friendly food title inferred from the photo",
        "quantity": "best visible estimate such as '8 servings', '2 trays', or '1 box'",
        "category": "Meals" | "Bakery" | "Produce" | "Groceries" | "Beverages" | "Desserts",
        "estimatedPreparedHours": number between 0 and 24 based on visible freshness cues, use 2 if uncertain,
        "freshnessNotes": ["2 to 4 short visible observations that explain the decision"],
        "confidence": number from 0 to 100,
        "description": "A concise donation listing description that names the food, visible packaging/portion details, and condition. If spoilt, explain the safety concern."
      }
    `;

    const parts = [
      { text: prompt },
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type || "image/png",
        },
      },
    ];

    const errors: string[] = [];
    let text = "";

    const candidates = getCandidateModels();

    for (const modelName of candidates) {
      try {
        const isLegacy = modelName.includes("pro-vision");
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: isLegacy ? {
            temperature: 0.1,
            maxOutputTokens: 1024,
          } : {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 1024,
          }
        });
        const result = await model.generateContent(parts);
        text = result.response.text();
        if (text) break;
      } catch (error) {
        if (isGeminiAuthError(error)) {
          const message = getErrorMessage(error);
          console.error("Gemini authentication failed:", message);
          return NextResponse.json(
            {
              error:
                "Gemini API authentication failed. Replace GEMINI_API_KEY in .env.local with an API key from Google AI Studio, then restart the dev server."
            },
            { status: 401 }
          );
        }

        try {
          const fallbackModel = genAI.getGenerativeModel({ model: modelName });
          const result = await fallbackModel.generateContent(parts);
          text = result.response.text();
          if (text) break;
        } catch (fallbackError) {
          if (isGeminiAuthError(fallbackError)) {
            const message = getErrorMessage(fallbackError);
            console.error("Gemini authentication failed:", message);
            return NextResponse.json(
              {
                error:
                  "Gemini API authentication failed. Replace GEMINI_API_KEY in .env.local with an API key from Google AI Studio, then restart the dev server."
              },
              { status: 401 }
            );
          }

          const primaryMessage = getErrorMessage(error);
          const fallbackMessage = getErrorMessage(fallbackError);
          console.error(`Model ${modelName} failed:`, fallbackMessage || primaryMessage);
          errors.push(`${modelName}: ${fallbackMessage || primaryMessage}`);
        }
      }
    }

    if (!text) {
      return NextResponse.json(
        {
          error:
            "No configured Gemini model could analyze the image. Tried: " +
            getCandidateModels().join(", "),
          details: errors
        },
        { status: 502 }
      );
    }
    
    const analysis = normalizeAnalysis(parseGeminiJson(text));
    
    return NextResponse.json(analysis);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Check your internet connection and API key.";
    console.error("Gemini Analysis Error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
