"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { Groq } from "groq-sdk";

export const enhanceWithAI = action({
  args: {
    title: v.string(),
    description: v.string(),
    contentType: v.string(),
    sourceUrl: v.string(),
    eventDate: v.optional(v.string()),
    location: v.optional(v.string()),
    price: v.optional(v.string()),
    rating: v.optional(v.number()),
    cuisine: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      title,
      description,
      contentType,
      sourceUrl,
      eventDate,
      location,
      price,
      rating,
      cuisine,
    } = args;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not found");
    }

    const groq = new Groq({
      apiKey: GROQ_API_KEY,
    });

    try {
      const prompt = `You are an expert Chennai local guide and content creator. Create an engaging summary for this ${contentType} that will excite Chennai locals.

### CONTENT TO SUMMARIZE ###
Title: ${title}
Description: ${description}
${eventDate ? `Date/Time: ${eventDate}` : ""}
${location ? `Location: ${location}` : ""}
${price ? `Price: ${price}` : ""}
${rating ? `Rating: ${rating}/5 stars` : ""}
${cuisine ? `Cuisine: ${cuisine}` : ""}

### REQUIREMENTS ###
- Write exactly 2-3 compelling sentences that grab attention
- Focus on what makes this special for Chennai residents
- Include practical details (timing, location, price) naturally in the text
- Make it locally relevant and exciting
- Use Chennai context and cultural references where appropriate
- End with an engaging call-to-action phrase

### OUTPUT FORMAT ###
Return a valid JSON object with this exact structure:
{
  "summary": "Your engaging 2-3 sentence summary here",
  "highlights": ["key feature 1", "key feature 2", "key feature 3"],
  "callToAction": "Short exciting call-to-action phrase!",
  "localContext": "Why this matters to Chennai locals specifically"
}

Ensure the JSON is properly formatted and valid.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a Chennai local guide expert. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.7,
        max_completion_tokens: 300,
        top_p: 1,
        stream: false,
        reasoning_effort: "medium",
        stop: null,
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content?.trim();

      if (aiResponse) {
        try {
          // Parse the JSON response
          const parsedResponse = JSON.parse(aiResponse);

          console.log("AI Enhancement successful:", {
            title: title.substring(0, 30) + "...",
            summaryLength: parsedResponse.summary?.length || 0,
            highlightsCount: parsedResponse.highlights?.length || 0,
          });

          return {
            success: true,
            aiSummary: parsedResponse.summary || description,
            highlights: parsedResponse.highlights || [],
            callToAction: parsedResponse.callToAction || "Check it out!",
            localContext: parsedResponse.localContext || "",
            sourceUrl: sourceUrl,
            extractedData: {
              eventDate,
              location,
              price,
              //contactInfo,
              rating,
              cuisine,
            },
          };
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          // Fallback to original description if JSON parsing fails
          return {
            success: false,
            error: "JSON parsing failed",
            aiSummary: description,
            highlights: [],
            callToAction: "Learn more!",
            localContext: "",
            sourceUrl: sourceUrl,
            extractedData: {
              eventDate,
              location,
              price,
              //contactInfo,
              rating,
              cuisine,
            },
          };
        }
      }

      return {
        success: false,
        error: "No AI response generated",
        aiSummary: description,
        highlights: [],
        callToAction: "Check it out!",
        localContext: "",
        sourceUrl: sourceUrl,
        extractedData: {
          eventDate,
          location,
          price,
          //contactInfo,
          rating,
          cuisine,
        },
      };
    } catch (error) {
      console.error("Groq AI error:", error);
      return {
        success: false,
        error: error.message,
        aiSummary: description,
        highlights: [],
        callToAction: "Learn more!",
        localContext: "",
        sourceUrl: sourceUrl,
        extractedData: {
          eventDate,
          location,
          price,
          //contactInfo,
          rating,
          cuisine,
        },
      };
    }
  },
});
