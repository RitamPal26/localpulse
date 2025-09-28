import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const populateFeedContent = action({
  args: {},
  handler: async (ctx) => {
    console.log("Starting data ingestion pipeline...");

    try {
      // Step 1: Scrape restaurants (using your working TripAdvisor function)
      console.log("Scraping restaurants...");
      const scrapingResult = await ctx.runAction(
        api.actions.scraper.scrapeChennaiRestaurants, // This stays the same
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
            source: "TripAdvisor", // Updated to match your new source
            sourceUrl:
              "https://www.tripadvisor.in/Restaurants-g304556-Chennai_Madras_Chennai_District_Tamil_Nadu.html",
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

// UPDATED: Complete data ingestion with all 5 categories
export const populateAllContentTypes = action({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting comprehensive data ingestion with NEW sources...");

    try {
      let totalProcessed = 0;
      const results = {};

      // 1. RESTAURANTS - TripAdvisor (working well)
      console.log("📍 Scraping restaurants from TripAdvisor...");
      const restaurants = await ctx.runAction(
        api.actions.scraper.scrapeChennaiRestaurants, // Keep existing working function
        {}
      );
      const restaurantCount = await processItems(
        ctx,
        restaurants.restaurants,
        "restaurants",
        "restaurant"
      );
      totalProcessed += restaurantCount;
      results.restaurants = {
        count: restaurantCount,
        source: restaurants.source,
      };

      // 2. WEEKEND EVENTS - EventBrite (NEW)
      console.log("🎪 Scraping weekend events from EventBrite...");
      const weekendEvents = await ctx.runAction(
        api.actions.scraper.scrapeWeekendEvents, // NEW function name
        {}
      );
      const weekendCount = await processItems(
        ctx,
        weekendEvents.events,
        "weekend-events",
        "weekend-event"
      );
      totalProcessed += weekendCount;
      results.weekendEvents = {
        count: weekendCount,
        source: weekendEvents.source,
      };

      // 3. LOCAL NEWS - Times of India (NEW)
      console.log("📰 Scraping local news from Times of India...");
      const localNews = await ctx.runAction(
        api.actions.scraper.scrapeLocalNews, // NEW function name
        {}
      );
      const newsCount = await processItems(
        ctx,
        localNews.news,
        "local-news",
        "news"
      );
      totalProcessed += newsCount;
      results.localNews = { count: newsCount, source: localNews.source };

      // 4. APARTMENT HUNT - 99acres (NEW)
      console.log("🏠 Scraping apartments from 99acres...");
      const apartments = await ctx.runAction(
        api.actions.scraper.scrapeApartmentHunt, // NEW function name
        {}
      );
      const apartmentCount = await processItems(
        ctx,
        apartments.apartments,
        "apartment-hunt",
        "apartment"
      );
      totalProcessed += apartmentCount;
      results.apartments = { count: apartmentCount, source: apartments.source };

      // 5. TECH MEETUPS - GDG Chennai (NEW)
      console.log("💻 Scraping tech meetups from GDG Chennai...");
      const techMeetups = await ctx.runAction(
        api.actions.scraper.scrapeTechMeetups, // NEW function name
        {}
      );
      const meetupCount = await processItems(
        ctx,
        techMeetups.meetups,
        "tech-meetups",
        "tech-meetup"
      );
      totalProcessed += meetupCount;
      results.techMeetups = { count: meetupCount, source: techMeetups.source };

      console.log("✅ All categories scraped successfully!");
      console.log(`📊 Total processed: ${totalProcessed} items`);

      return {
        success: true,
        totalProcessed: totalProcessed,
        results: results,
        message: "All 5 categories scraped with new AI extraction!",
      };
    } catch (error) {
      console.error("💥 Comprehensive ingestion error:", error);
      return {
        success: false,
        error: error.message,
        totalProcessed: 0,
      };
    }
  },
});

// UPDATED: Helper function to process any content type
async function processItems(ctx, items, pulseId, contentType) {
  let processed = 0;

  if (!items || !Array.isArray(items)) {
    console.log(`⚠️ No items to process for ${contentType}`);
    return 0;
  }

  console.log(`Processing ${items.length} ${contentType} items...`);

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

      console.log(`✓ Processed: ${item.title}`);

      // Small delay between items
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`❌ Error processing ${item.title}:`, error);
      // Continue with next item
    }
  }

  console.log(
    `✅ Completed ${contentType}: ${processed}/${items.length} items processed`
  );
  return processed;
}

// UPDATED: Source mapping for new scraping sources
function getSourceForType(contentType) {
  const sources = {
    restaurant: "TripAdvisor",
    "weekend-event": "EventBrite",
    news: "Times of India",
    apartment: "99acres",
    "tech-meetup": "GDG Chennai",
  };
  return sources[contentType] || "Local Source";
}

// UPDATED: Source URLs for new scraping sources
function getSourceUrlForType(contentType) {
  const urls = {
    restaurant:
      "https://www.tripadvisor.in/Restaurants-g304556-Chennai_Madras_Chennai_District_Tamil_Nadu.html",
    "weekend-event": "https://www.eventbrite.com/d/india--chennai/events/",
    news: "https://timesofindia.indiatimes.com/city/chennai",
    apartment: "https://www.99acres.com/rent/residential-property/chennai",
    "tech-meetup": "https://gdg.community.dev/gdg-chennai/",
  };
  return urls[contentType] || "https://example.com";
}

// Helper action to clear all content (for testing)
export const clearAllContent = action({
  args: {},
  handler: async (ctx) => {
    console.log("🗑️ Clearing all content...");
    const allContent = await ctx.runQuery(api.pulses.getAllPulseContent);

    for (const item of allContent) {
      await ctx.runMutation(api.pulses.deletePulseContent, { id: item._id });
    }

    console.log(`✅ Cleared ${allContent.length} items`);
    return { cleared: allContent.length };
  },
});

// Test individual categories
export const testRestaurantScraping = action({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.runAction(
      api.actions.scraper.scrapeChennaiRestaurants,
      {}
    );
    return result;
  },
});

export const testWeekendEventScraping = action({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.runAction(
      api.actions.scraper.scrapeWeekendEvents,
      {}
    );
    return result;
  },
});

export const testNewsScraping = action({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.runAction(api.actions.scraper.scrapeLocalNews, {});
    return result;
  },
});

export const testApartmentScraping = action({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.runAction(
      api.actions.scraper.scrapeApartmentHunt,
      {}
    );
    return result;
  },
});

export const testTechMeetupScraping = action({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.runAction(
      api.actions.scraper.scrapeTechMeetups,
      {}
    );
    return result;
  },
});
