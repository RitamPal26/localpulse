"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { Groq } from "groq-sdk";

export const enhanceWithAI = action({
  args: {
    title: v.string(),
    description: v.string(),
    contentType: v.string(),
    rating: v.optional(v.number()),
    cuisine: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { title, description, contentType, rating, cuisine }
  ) => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not found");
    }

    const groq = new Groq({
      apiKey: GROQ_API_KEY,
    });

    try {
      const prompt = `Create a compelling 2-3 sentence summary for this Chennai ${contentType}:
      
Title: ${title}
Description: ${description}
${rating ? `Rating: ${rating}/5` : ""}
${cuisine ? `Cuisine: ${cuisine}` : ""}

Make it sound exciting and locally relevant to Chennai residents. Focus on what makes it special.`;

      // Try NON-streaming first to debug
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 0.7,
        max_completion_tokens: 200,
        top_p: 1,
        stream: false, // Changed to false for debugging
        reasoning_effort: "medium",
        stop: null,
      });

      const aiSummary = chatCompletion.choices[0]?.message?.content?.trim();

      if (aiSummary) {
        console.log(
          "AI Summary generated:",
          aiSummary.substring(0, 50) + "..."
        );
        return {
          success: true,
          aiSummary: aiSummary,
        };
      }

      return {
        success: false,
        error: "No AI response generated",
        aiSummary: description,
      };
    } catch (error) {
      console.error("Groq AI error:", error);
      return {
        success: false,
        error: error.message,
        aiSummary: description,
      };
    }
  },
});
