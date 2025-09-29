"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

// =====================================
// GENERIC MULTI-CITY SCRAPER FUNCTION
// =====================================

/**
 * Performs a scrape operation for a given city using a dynamic configuration.
 * @param {string} city - The city to scrape data for (e.g., "Chennai", "Mumbai").
 * @param {object} config - The configuration for the scraping task.
 * @returns {Promise<object>} - A promise that resolves to the scraped data or demo data.
 */
async function performScrape(city: string, config: any) {
  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

  const getDemoData = (source: string) => ({
    success: true,
    data: config.demoDataFunction(city),
    source: source,
  });

  if (!FIRECRAWL_API_KEY) {
    return getDemoData("demo");
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: config.query.replace(/{{city}}/g, city),
        location: city,
        limit: 4,
        ...config.searchParams,
        scrapeOptions: {
          formats: [
            {
              type: "json",
              schema: config.schema,
              prompt: config.prompt.replace(/{{city}}/g, city),
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!data.success || !data.data?.web || data.data.web.length === 0) {
      console.error(
        `Firecrawl API did not return successful data for ${config.dataKey} in ${city}. Full response:`,
        JSON.stringify(data, null, 2)
      );
    }

    if (data.success && data.data?.length > 0) {
      const allItems = [];

      // CORRECTED: Changed 'result.data.web' to 'data.data.web'
      data.data.forEach((page: any) => {
        // CORRECTED: Changed 'config.resultKey' to 'config.dataKey' to match your config
        const extractedData = page.json?.[config.dataKey];
        if (extractedData && Array.isArray(extractedData)) {
          extractedData.forEach((item: any) => {
            const mappedItem = config.transform(item, page, city);

            // Apply the filter if it exists
            if (config.filter ? config.filter(mappedItem, city) : true) {
              allItems.push(mappedItem);
            }
          });
        }
      });

      if (allItems.length > 0) {
        // CORRECTED: Simplified the return object to use a 'data' key,
        // which is what your dataIngestion file expects.
        return { success: true, data: allItems, source: "search_extracted" };
      }
    }

    throw new Error("No results from search");
  } catch (error) {
    console.error(`Error scraping ${config.dataKey} for ${city}:`, error);
    return getDemoData("demo_fallback");
  }
}

// =====================================
// EXPORTED CONVEX ACTIONS
// =====================================

// 1. Restaurants
export const scrapeRestaurants = action({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const config = {
      query: "best restaurants {{city}} food dining 2025",
      schema: {
        /* Restaurant Schema */ type: "object",
        properties: {
          restaurants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                cuisine: { type: "string" },
                priceRange: { type: "string" },
                rating: { type: "number" },
                location: { type: "string" },
                description: { type: "string" },
              },
              required: ["name", "cuisine"],
            },
          },
        },
        required: ["restaurants"],
      },
      prompt:
        "Extract restaurant information from these {{city}} restaurant search results",
      dataKey: "restaurants",
      resultKey: "restaurants",
      transform: (item, result, city) => ({
        title: item.name,
        description:
          item.description || `${item.cuisine} restaurant in ${city}`,
        location: item.location || city,
        cuisine: item.cuisine || "Various",
        rating: item.rating || Math.random() * 1.5 + 3.5,
        priceRange: item.priceRange || "₹₹",
        sourceUrl: result.url || result.sourceURL,
        price: item.priceRange || "₹300-500 per person",
        tags: ["restaurant", city.toLowerCase()],
      }),
      fallbackTransform: (result, city) => ({
        title: (result.title || `${city} Restaurant`).substring(0, 50),
        description:
          result.description?.substring(0, 200) ||
          `Popular restaurant in ${city}`,
        location: city,
        cuisine: "Various",
        rating: Math.random() * 1.5 + 3.5,
        priceRange: "₹₹",
        sourceUrl: result.url || result.sourceURL,
        price: "₹300-500 per person",
        tags: ["restaurant", city.toLowerCase()],
      }),
      demoDataFunction: generateRestaurantData,
      searchParams: { tbs: "qdr:m" },
    };
    return await performScrape(args.city, config);
  },
});

// 2. Weekend Events
export const scrapeWeekendEvents = action({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const config = {
      query: "weekend events {{city}} parties concerts festivals",
      schema: {
        /* Events Schema */ type: "object",
        properties: {
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                date: { type: "string" },
                venue: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                ticketPrice: { type: "string" },
              },
              required: ["name", "date"],
            },
          },
        },
        required: ["events"],
      },
      prompt:
        "Extract weekend event information from these {{city}} event search results",
      dataKey: "events",
      resultKey: "events",
      transform: (item, result, city) => ({
        title: item.name,
        description: item.description || `${item.category} event in ${city}`,
        location: item.venue || city,
        eventDate: item.date,
        venue: item.venue,
        category: item.category || "Weekend Event",
        ticketPrice: item.ticketPrice,
        sourceUrl: result.url || result.sourceURL,
        price: item.ticketPrice || "₹500",
        tags: ["weekend", "event", city.toLowerCase()],
      }),
      fallbackTransform: (result, city) => ({
        title: (result.title || `${city} Event`).substring(0, 50),
        description:
          result.description?.substring(0, 200) || `Exciting event in ${city}`,
        location: city,
        eventDate: "TBD",
        venue: "Various venues",
        category: "Event",
        sourceUrl: result.url || result.sourceURL,
        price: "₹500",
        tags: ["event", city.toLowerCase()],
      }),
      demoDataFunction: generateWeekendEventsData,
      searchParams: { tbs: "qdr:m" },
    };
    return await performScrape(args.city, config);
  },
});

// 3. Local News
export const scrapeLocalNews = action({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const config = {
      query: "{{city}} news today local traffic metro",
      schema: {
        type: "object",
        properties: {
          news: {
            type: "array",
            items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                summary: { type: "string" },
                category: { type: "string" },
                publishedTime: { type: "string" },
              },
              required: ["headline", "summary"],
            },
          },
        },
        required: ["news"],
      },
      prompt: "Extract local news from these {{city}} news search results",
      dataKey: "news",
      transform: (item: any, result: any, city: string) => ({
        title: item.headline,
        description: item.summary,
        category: item.category || "Local News",
        publishedTime: item.publishedTime,
        location: city,
        sourceUrl: result.url || result.sourceURL,
        tags: ["news", city.toLowerCase(), "local"],
      }),
      // ADDED: The filter function to keep only relevant news
      filter: (item: any, city: string) => {
        const cityLower = city.toLowerCase();
        return (
          item.title.toLowerCase().includes(cityLower) ||
          item.description.toLowerCase().includes(cityLower)
        );
      },
      fallbackTransform: (result: any, city: string) => ({
        title: result.title || `${city} News`,
        description:
          result.description?.substring(0, 200) || `Local news from ${city}`,
        category: "Local News",
        location: city,
        sourceUrl: result.url || result.sourceURL,
        tags: ["news", city.toLowerCase(), "local"],
      }),
      demoDataFunction: generateLocalNewsData, // Assuming this function exists
      searchParams: { sources: ["news"], tbs: "qdr:d" },
    };
    return await performScrape(args.city, config);
  },
});

// 4. Apartment Hunt
export const scrapeApartmentHunt = action({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const config = {
      query: "apartments for rent {{city}} 1BHK 2BHK 3BHK rental",
      schema: {
        /* Apartments Schema */ type: "object",
        properties: {
          apartments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                location: { type: "string" },
                rent: { type: "string" },
                bedrooms: { type: "string" },
                area: { type: "string" },
                amenities: { type: "string" },
                description: { type: "string" },
              },
              required: ["name", "location", "rent"],
            },
          },
        },
        required: ["apartments"],
      },
      prompt:
        "Extract apartment rental information from these {{city}} apartment search results",
      dataKey: "apartments",
      resultKey: "apartments",
      transform: (item, result, city) => ({
        title: item.name,
        description:
          item.description || `${item.bedrooms} apartment in ${item.location}`,
        location: item.location || city,
        rent: item.rent,
        bedrooms: item.bedrooms,
        area: item.area,
        amenities: item.amenities,
        sourceUrl: result.url || result.sourceURL,
        price: item.rent || "Contact for price",
        tags: ["apartment", "rental", city.toLowerCase()],
      }),
      fallbackTransform: (result, city) => ({
        title: result.title || `${city} Apartment`,
        description:
          result.description?.substring(0, 200) ||
          `Apartment for rent in ${city}`,
        location: city,
        rent: "Contact for price",
        bedrooms: "2BHK",
        area: "1200 sq ft",
        sourceUrl: result.url || result.sourceURL,
        price: "Contact for price",
        tags: ["apartment", "rental", city.toLowerCase()],
      }),
      demoDataFunction: generateApartmentHuntData,
      searchParams: { tbs: "qdr:m" },
    };
    return await performScrape(args.city, config);
  },
});

// 5. Tech Meetups
export const scrapeTechMeetups = action({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const config = {
      query: "tech meetups {{city}} developer events programming",
      schema: {
        /* Meetups Schema */ type: "object",
        properties: {
          meetups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                date: { type: "string" },
                venue: { type: "string" },
                topic: { type: "string" },
                description: { type: "string" },
                type: { type: "string" },
                organizer: { type: "string" },
              },
              required: ["name", "date", "topic"],
            },
          },
        },
        required: ["meetups"],
      },
      prompt:
        "Extract tech meetup information from these {{city}} developer event search results",
      dataKey: "meetups",
      resultKey: "meetups",
      transform: (item, result, city) => ({
        title: item.name,
        description:
          item.description || `${item.topic} ${item.type} in ${city}`,
        location: city,
        eventDate: item.date,
        venue: item.venue,
        topic: item.topic,
        organizer: item.organizer || "Tech Community",
        sourceUrl: result.url || result.sourceURL,
        price: "Free",
        tags: ["tech", "meetup", city.toLowerCase(), "developer"],
      }),
      fallbackTransform: (result, city) => ({
        title: result.title || `${city} Tech Meetup`,
        description:
          result.description?.substring(0, 200) || `Tech meetup in ${city}`,
        location: city,
        eventDate: "TBD",
        venue: "TBD",
        topic: "Technology",
        organizer: "Tech Community",
        sourceUrl: result.url || result.sourceURL,
        price: "Free",
        tags: ["tech", "meetup", city.toLowerCase()],
      }),
      demoDataFunction: generateTechMeetupsData,
      searchParams: { tbs: "qdr:m" },
    };
    return await performScrape(args.city, config);
  },
});

// =====================================
// GENERIC DEMO DATA FUNCTIONS
// =====================================
function generateRestaurantData(city) {
  return [
    {
      title: `Famous Idli Shop in ${city}`,
      description: "Authentic South Indian breakfast",
      location: `A popular area, ${city}`,
      cuisine: "South Indian",
      rating: 4.5,
      priceRange: "₹",
      tags: ["restaurant", city.toLowerCase()],
    },
    {
      title: `Legendary Biryani in ${city}`,
      description: "Known for its rich and aromatic biryani",
      location: `City center, ${city}`,
      cuisine: "Mughlai",
      rating: 4.8,
      priceRange: "₹₹",
      tags: ["restaurant", city.toLowerCase()],
    },
  ];
}

function generateWeekendEventsData(city) {
  return [
    {
      title: `Music Festival in ${city}`,
      description: "Featuring local and national artists",
      location: `Main Auditorium, ${city}`,
      eventDate: "This Saturday",
      category: "Music",
      price: "₹1000",
      tags: ["event", city.toLowerCase()],
    },
    {
      title: `Food Carnival ${city}`,
      description: "Experience the best street food",
      location: `Exhibition Grounds, ${city}`,
      eventDate: "This Weekend",
      category: "Food",
      price: "Free Entry",
      tags: ["event", city.toLowerCase()],
    },
  ];
}

function generateLocalNewsData(city) {
  return [
    {
      title: `${city} Metro Phase 2 Update`,
      description: "New line to connect the airport is nearing completion.",
      category: "Infrastructure",
      location: city,
      publishedTime: "3 hours ago",
      tags: ["news", city.toLowerCase()],
    },
    {
      title: `Traffic Diversions in ${city} This Weekend`,
      description: "Major roads closed for a marathon event.",
      category: "Traffic",
      location: city,
      publishedTime: "1 day ago",
      tags: ["news", city.toLowerCase()],
    },
  ];
}

function generateApartmentHuntData(city) {
  return [
    {
      title: `Modern 2BHK in ${city}`,
      description: "Apartment in a prime location with modern amenities.",
      location: `Near Tech Park, ${city}`,
      rent: "₹30,000/month",
      bedrooms: "2BHK",
      price: "₹30,000/month",
      tags: ["apartment", city.toLowerCase()],
    },
    {
      title: `Spacious 3BHK Villa in ${city}`,
      description: "Independent villa with a garden in a quiet area.",
      location: `Suburb, ${city}`,
      rent: "₹65,000/month",
      bedrooms: "3BHK",
      price: "₹65,000/month",
      tags: ["apartment", city.toLowerCase()],
    },
  ];
}

function generateTechMeetupsData(city) {
  return [
    {
      title: `GDG ${city} Monthly Meetup`,
      description: "Talks on the latest in Google technologies.",
      location: city,
      eventDate: "First Saturday of the month",
      topic: "Web Development",
      price: "Free",
      tags: ["tech", city.toLowerCase()],
    },
    {
      title: `${city} AI/ML Hub`,
      description: "Deep dive into machine learning models.",
      location: city,
      eventDate: "Third Friday of the month",
      topic: "AI/ML",
      price: "Free",
      tags: ["tech", city.toLowerCase()],
    },
  ];
}
