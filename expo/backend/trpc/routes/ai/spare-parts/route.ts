import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export interface SparePart {
  name: string;
  partNumber: string;
  category: string;
  estimatedPrice: string;
  compatibility: string;
  notes: string;
}

export interface SparePartsResponse {
  parts: SparePart[];
  summary: string;
  maintenanceTips: string[];
}

export const sparePartsSearchProcedure = publicProcedure
  .input(
    z.object({
      query: z.string().min(1).max(1000),
      vehicleBrand: z.string().optional(),
      vehicleModel: z.string().optional(),
      vehicleYear: z.number().optional(),
      vin: z.string().optional(),
      language: z.enum(["en", "az", "ru"]).default("en"),
    })
  )
  .mutation(async ({ input }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // SECURITY: Sanitize user inputs to prevent prompt injection
    const sanitize = (s: string) => s.replace(/[\n\r]/g, ' ').replace(/["'`{}\[\]]/g, '').slice(0, 200);
    const safeQuery = sanitize(input.query);
    const safeBrand = input.vehicleBrand ? sanitize(input.vehicleBrand) : undefined;
    const safeModel = input.vehicleModel ? sanitize(input.vehicleModel) : undefined;
    const safeVin = input.vin ? input.vin.replace(/[^A-Z0-9]/gi, '').slice(0, 17) : undefined;

    const vehicleContext = [
      input.vehicleYear,
      safeBrand,
      safeModel,
    ]
      .filter(Boolean)
      .join(" ");

    const vinContext = safeVin ? ` (VIN: ${safeVin})` : "";

    const languageInstruction =
      input.language === "az"
        ? "Respond in Azerbaijani language."
        : input.language === "ru"
        ? "Respond in Russian language."
        : "Respond in English.";

    const systemPrompt = `You are an expert automotive parts advisor for Qaraj, an Azerbaijani car service platform. 
You help customers find the correct spare parts for their vehicles.
${languageInstruction}
Always respond with valid JSON matching the exact schema provided.
Be specific about part numbers (use realistic OEM-style numbers), pricing in AZN (Azerbaijani Manat), and compatibility.
For pricing, use realistic Azerbaijani market prices (1 USD ≈ 1.7 AZN).`;

    const userPrompt = `Find spare parts for: "${safeQuery}"
${vehicleContext ? `Vehicle: ${vehicleContext}${vinContext}` : ""}

Return a JSON object with this exact structure:
{
  "parts": [
    {
      "name": "Part name",
      "partNumber": "OEM part number",
      "category": "Category (e.g., Engine, Brakes, Filters, Electrical)",
      "estimatedPrice": "Price range in AZN (e.g., '45-65 AZN')",
      "compatibility": "Compatible vehicles/years",
      "notes": "Installation notes or important info"
    }
  ],
  "summary": "Brief explanation of what these parts are for",
  "maintenanceTips": ["tip1", "tip2", "tip3"]
}

Return 3-5 relevant parts. Be accurate and helpful.`;

    try {
      const response = await fetch(
        `${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("OpenAI API error:", error);
        throw new Error("AI service temporarily unavailable");
      }

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No response from AI");
      }

      const parsed: SparePartsResponse = JSON.parse(content);

      return {
        success: true,
        result: parsed,
      };
    } catch (error: any) {
      console.error("Spare parts AI error:", error);
      // Return a graceful fallback
      return {
        success: false,
        result: {
          parts: [],
          summary: "Unable to fetch AI recommendations at this time. Please try again.",
          maintenanceTips: [],
        } as SparePartsResponse,
      };
    }
  });
