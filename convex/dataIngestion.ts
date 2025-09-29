"use node";

import { api } from "./_generated/api";
import { v } from "convex/values";
import { action } from "./_generated/server";

const MAX_ITEMS_PER_CATEGORY = 5;
const SUPPORTED_CITIES = ["Chennai", "Mumbai", "Bangalore", "Delhi"];

// =================================================
// MANAGER ACTION
// This is the main action you will run.
// =================================================
export const populateAllCities = action({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting data ingestion for all supported cities...");
    await ctx.runMutation(api.pulses.deleteAllPulseContent);

    for (const city of SUPPORTED_CITIES) {
      await ctx.scheduler.runAfter(0, api.dataIngestion.populateSingleCity, {
        city: city,
      });
    }
    console.log("✅ All city scraping jobs have been scheduled.");
  },
});

// =================================================
// WORKER ACTION
// This action performs all the scraping and processing for ONE city.
// =================================================
export const populateSingleCity = action({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = args;
    console.log(`➡️ Populating all content for ${city}...`);
    let totalProcessed = 0;

    // Run all scraper actions for the given city
    const restaurants = await ctx.runAction(
      api.actions.scraper.scrapeRestaurants,
      { city }
    );
    const limitedRestaurants =
      restaurants.data?.slice(0, MAX_ITEMS_PER_CATEGORY) ?? [];
    totalProcessed += await processItems(
      ctx,
      limitedRestaurants,
      "restaurants",
      "restaurant",
      city
    );

    const weekendEvents = await ctx.runAction(
      api.actions.scraper.scrapeWeekendEvents,
      { city }
    );
    const limitedEvents =
      weekendEvents.data?.slice(0, MAX_ITEMS_PER_CATEGORY) ?? [];
    totalProcessed += await processItems(
      ctx,
      limitedEvents,
      "weekend-events",
      "weekend-event",
      city
    );

    const localNews = await ctx.runAction(api.actions.scraper.scrapeLocalNews, {
      city,
    });
    const limitedNews = localNews.data?.slice(0, MAX_ITEMS_PER_CATEGORY) ?? [];
    totalProcessed += await processItems(
      ctx,
      limitedNews,
      "local-news",
      "news",
      city
    );

    // ADDED: Scrape and process Apartments
    const apartments = await ctx.runAction(
      api.actions.scraper.scrapeApartmentHunt,
      { city }
    );
    const limitedApartments =
      apartments.data?.slice(0, MAX_ITEMS_PER_CATEGORY) ?? [];
    totalProcessed += await processItems(
      ctx,
      limitedApartments,
      "apartment-hunt",
      "apartment",
      city
    );

    // ADDED: Scrape and process Tech Meetups
    const techMeetups = await ctx.runAction(
      api.actions.scraper.scrapeTechMeetups,
      { city }
    );
    const limitedMeetups =
      techMeetups.data?.slice(0, MAX_ITEMS_PER_CATEGORY) ?? [];
    totalProcessed += await processItems(
      ctx,
      limitedMeetups,
      "tech-meetups",
      "tech-meetup",
      city
    );

    console.log(
      `✅ Finished populating content for ${city}. Total items: ${totalProcessed}`
    );
  },
});

// =================================================
// HELPER FUNCTION
// This function processes and saves items for a specific city.
// =================================================
async function processItems(
  ctx: any,
  items: any[],
  pulseId: string,
  contentType: string,
  city: string
) {
  let processed = 0;
  if (!items || !Array.isArray(items)) {
    console.log(`⚠️ No items to process for ${contentType} in ${city}`);
    return 0;
  }
  console.log(`Processing ${items.length} ${contentType} items for ${city}...`);

  for (const item of items) {
    try {
      const aiResult = await ctx.runAction(
        api.actions.aiProcessor.enhanceWithAI,
        {
          title: item.title,
          description: item.description,
          contentType: contentType,
          sourceUrl: item.sourceUrl || getSourceUrlForType(contentType, city),
          eventDate: item.eventDate,
          location: item.location || city,
          price: item.price || item.rent,
          rating: item.rating,
          cuisine: item.cuisine,
        }
      );

      const baseContent = {
        pulseId: pulseId,
        title: item.title,
        description: aiResult.aiSummary || item.description,
        source: getSourceForType(contentType, city),
        sourceUrl: item.sourceUrl || getSourceUrlForType(contentType, city),
        scrapedAt: Date.now(),
        location: item.location || city,
        contentType: contentType,
        aiSummary: aiResult.aiSummary,
        highlights: aiResult.highlights || [],
        callToAction: aiResult.callToAction || "Learn more!",
        localContext: aiResult.localContext || "",
        extractedData: aiResult.extractedData || {},
        tags: item.tags || [contentType, city.toLowerCase()],
        city: city,
      };

      let contentItem = { ...baseContent };

      if (contentType === "restaurant") {
        contentItem = {
          ...contentItem,
          cuisine: item.cuisine,
          priceRange: item.priceRange,
          rating: item.rating,
        };
      } else if (
        contentType === "weekend-event" ||
        contentType === "tech-meetup"
      ) {
        contentItem = {
          ...contentItem,
          eventDate: item.eventDate,
          venue: item.venue,
          category: item.category,
          organizer: item.organizer,
        };
      } else if (contentType === "news") {
        contentItem = {
          ...contentItem,
          category: item.category,
          publishedTime: item.publishedTime,
        };
      } else if (contentType === "apartment") {
        contentItem = {
          ...contentItem,
          rent: item.rent,
          bedrooms: item.bedrooms,
          area: item.area,
          amenities: item.amenities,
        };
      }

      await ctx.runMutation(api.pulses.addPulseContent, contentItem);
      processed++;
      console.log(`✓ Processed: ${item.title} for ${city}`);
    } catch (error) {
      console.error(`❌ Error processing ${item.title} for ${city}:`, error);
    }
  }
  return processed;
}

// Helper functions
function getSourceForType(contentType: string, city: string) {
  const sources = {
    restaurant: "TripAdvisor",
    "weekend-event": "EventBrite",
    news: "Times of India",
    apartment: "99acres",
    "tech-meetup": "GDG",
  };
  return sources[contentType] || "Local Source";
}
function getSourceUrlForType(contentType: string, city: string) {
  const urls = {
    restaurant: `https://www.tripadvisor.in/Restaurants-g304556-${city}.html`,
    "weekend-event": `https://www.eventbrite.com/d/india--${city}/events/`,
    news: `https://timesofindia.indiatimes.com/city/${city}`,
    apartment: `https://www.99acres.com/rent/residential-property/${city}`,
    "tech-meetup": `https://gdg.community.dev/gdg-${city}/`,
  };
  return urls[contentType] || "https://example.com";
}
