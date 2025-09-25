import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const populateFeedContent = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting data ingestion pipeline...");

    try {
      // Step 1: Scrape restaurants
      console.log("Scraping restaurants...");
      const scrapingResult = await ctx.runAction(
        api.actions.scraper.scrapeChennaiRestaurants,
        {}
      );

      if (!scrapingResult.success) {
        throw new Error(`Scraping failed: ${scrapingResult.error}`);
      }

      console.log(`Scraped ${scrapingResult.restaurants.length} restaurants`);

      // Step 2: Process each restaurant
      const processedItems = [];

      for (const restaurant of scrapingResult.restaurants) {
        try {
          console.log(`Processing: ${restaurant.title}`);

          // Only enhance with AI - no geocoding needed
          const aiResult = await ctx.runAction(
            api.actions.aiProcessor.enhanceWithAI,
            {
              title: restaurant.title,
              description: restaurant.description,
              contentType: "restaurant",
              rating: restaurant.rating,
              cuisine: restaurant.cuisine,
            }
          );

          // Prepare data for storage (no coordinates)
          const contentItem = {
            pulseId: "restaurants",
            title: restaurant.title,
            description: aiResult.aiSummary || restaurant.description,
            source: "TripAdvisor",
            sourceUrl: "https://www.tripadvisor.in/",
            scrapedAt: Date.now(),
            location: restaurant.location || "Chennai",
            contentType: "restaurant",
            cuisine: restaurant.cuisine,
            priceRange: restaurant.priceRange,
            rating: restaurant.rating,
            aiSummary: aiResult.aiSummary,
            tags: restaurant.tags || ["restaurant"],
          };

          // Store in database
          await ctx.runMutation(api.pulses.addPulseContent, contentItem);
          processedItems.push(contentItem);

          console.log(`✓ Processed: ${restaurant.title}`);

          // Small delay to avoid overwhelming AI API
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error processing ${restaurant.title}:`, error);
          // Continue with next restaurant
        }
      }

      console.log(
        `Data ingestion completed. Processed ${processedItems.length} items.`
      );

      return {
        success: true,
        processedCount: processedItems.length,
        items: processedItems,
      };
    } catch (error) {
      console.error("Data ingestion pipeline error:", error);
      return {
        success: false,
        error: error.message,
        processedCount: 0,
      };
    }
  },
});

// Helper action to clear all content (for testing)
export const clearAllContent = action({
  args: {},
  handler: async (ctx) => {
    const allContent = await ctx.runQuery(api.pulses.getAllPulseContent);

    for (const item of allContent) {
      await ctx.runMutation(api.pulses.deletePulseContent, { id: item._id });
    }

    return { cleared: allContent.length };
  },
});

function getChennaiAreaCoordinates(location: string) {
  const areaCoordinates = {
    "T. Nagar": { lat: 13.0418, lng: 80.2341 },
    "Anna Salai": { lat: 13.0827, lng: 80.2707 },
    Adyar: { lat: 13.0067, lng: 80.2206 },
    Mylapore: { lat: 13.0338, lng: 80.2619 },
    Egmore: { lat: 13.0732, lng: 80.2609 },
    ECR: { lat: 12.9165, lng: 80.2731 },
    Nungambakkam: { lat: 13.0594, lng: 80.2428 },
    "Marina Beach": { lat: 13.0475, lng: 80.2824 },
  };

  // Try to match location to known areas
  for (const [area, coords] of Object.entries(areaCoordinates)) {
    if (location?.includes(area)) {
      return coords;
    }
  }

  // Default Chennai center coordinates
  return { lat: 13.0827, lng: 80.2707 };
}

// Add this new comprehensive ingestion function
export const populateAllContentTypes = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting comprehensive data ingestion...");

    try {
      let totalProcessed = 0;

      // 1. Restaurants (already working)
      const restaurants = await ctx.runAction(
        api.actions.scraper.scrapeChennaiRestaurants,
        {}
      );
      totalProcessed += await processItems(
        ctx,
        restaurants.restaurants,
        "restaurants",
        "restaurant"
      );

      // 2. Events
      const events = await ctx.runAction(
        api.actions.scraper.scrapeChennaiEvents,
        {}
      );
      totalProcessed += await processItems(
        ctx,
        events.events,
        "events",
        "event"
      );

      // 3. Tech Meetups
      const meetups = await ctx.runAction(
        api.actions.scraper.scrapeChennaiTechMeetups,
        {}
      );
      totalProcessed += await processItems(
        ctx,
        meetups.meetups,
        "tech-meetups",
        "meetup"
      );

      // 4. Apartments
      const apartments = await ctx.runAction(
        api.actions.scraper.scrapeChennaiApartments,
        {}
      );
      totalProcessed += await processItems(
        ctx,
        apartments.apartments,
        "apartments",
        "apartment"
      );

      return {
        success: true,
        totalProcessed: totalProcessed,
        breakdown: {
          restaurants: restaurants.restaurants.length,
          events: events.events.length,
          meetups: meetups.meetups.length,
          apartments: apartments.apartments.length,
        },
      };
    } catch (error) {
      console.error("Comprehensive ingestion error:", error);
      return { success: false, error: error.message, totalProcessed: 0 };
    }
  },
});

// Helper function to process any content type
async function processItems(ctx, items, pulseId, contentType) {
  let processed = 0;

  for (const item of items) {
    try {
      // AI enhance
      const aiResult = await ctx.runAction(
        api.actions.aiProcessor.enhanceWithAI,
        {
          title: item.title,
          description: item.description,
          contentType: contentType,
          rating: item.rating,
          cuisine: item.cuisine,
        }
      );

      // Prepare content based on type
      const baseContent = {
        pulseId: pulseId,
        title: item.title,
        description: aiResult.aiSummary || item.description,
        source: getSourceForType(contentType),
        sourceUrl: getSourceUrlForType(contentType),
        scrapedAt: Date.now(),
        location: item.location || "Chennai",
        contentType: contentType,
        aiSummary: aiResult.aiSummary,
        tags: item.tags || [contentType],
      };

      // Add type-specific fields
      let contentItem = { ...baseContent };

      if (contentType === "restaurant") {
        contentItem = {
          ...contentItem,
          cuisine: item.cuisine,
          priceRange: item.priceRange,
          rating: item.rating,
        };
      } else if (contentType === "event" || contentType === "meetup") {
        contentItem = {
          ...contentItem,
          eventDate: item.eventDate,
          venue: item.venue,
        };
      }

      await ctx.runMutation(api.pulses.addPulseContent, contentItem);
      processed++;
    } catch (error) {
      console.error(`Error processing ${item.title}:`, error);
    }
  }

  return processed;
}

function getSourceForType(contentType) {
  const sources = {
    restaurant: "Zomato",
    event: "BookMyShow",
    meetup: "Meetup.com",
    apartment: "99acres",
  };
  return sources[contentType] || "Local Source";
}

function getSourceUrlForType(contentType) {
  const urls = {
    restaurant: "https://www.zomato.com/chennai",
    event: "https://in.bookmyshow.com/chennai",
    meetup: "https://meetup.com/chennai",
    apartment: "https://www.99acres.com/chennai",
  };
  return urls[contentType] || "https://example.com";
}
