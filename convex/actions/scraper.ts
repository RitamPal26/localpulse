"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

// =====================================
// 1. RESTAURANTS
// =====================================
export const scrapeChennaiRestaurants = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    if (!FIRECRAWL_API_KEY) {
      return {
        success: true,
        count: generateChennaiRestaurantData().length,
        restaurants: generateChennaiRestaurantData(),
        source: "demo",
      };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "best restaurants Chennai food dining 2025",
          location: "Chennai",
          limit: 12,
          tbs: "qdr:m",
          scrapeOptions: {
            formats: [
              {
                type: "json",
                schema: {
                  type: "object",
                  properties: {
                    restaurants: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "Restaurant name",
                          },
                          cuisine: {
                            type: "string",
                            description: "Cuisine type",
                          },
                          priceRange: {
                            type: "string",
                            description: "Price range",
                          },
                          rating: { type: "number", description: "Rating" },
                          location: {
                            type: "string",
                            description: "Area in Chennai",
                          },
                          description: {
                            type: "string",
                            description: "Description",
                          },
                        },
                        required: ["name", "cuisine"],
                      },
                    },
                  },
                  required: ["restaurants"],
                },
                prompt:
                  "Extract restaurant information from these Chennai restaurant search results",
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.web?.length > 0) {
        const allRestaurants = [];

        data.data.web.forEach((result) => {
          if (
            result.json?.restaurants &&
            Array.isArray(result.json.restaurants)
          ) {
            result.json.restaurants.forEach((restaurant) => {
              allRestaurants.push({
                title: restaurant.name,
                description:
                  restaurant.description ||
                  `${restaurant.cuisine} restaurant in Chennai`,
                location: restaurant.location || "Chennai",
                cuisine: restaurant.cuisine || "Various",
                rating: restaurant.rating || Math.random() * 1.5 + 3.5,
                priceRange: restaurant.priceRange || "₹₹",
                tags: ["restaurant", "chennai"],
              });
            });
          } else {
            let restaurantName = result.title || "Chennai Restaurant";
            if (restaurantName.includes(" - ")) {
              restaurantName = restaurantName.split(" - ")[0];
            }

            allRestaurants.push({
              title: restaurantName.substring(0, 50),
              description:
                result.description?.substring(0, 200) ||
                "Popular restaurant in Chennai",
              location: "Chennai",
              cuisine: "Various",
              rating: Math.random() * 1.5 + 3.5,
              priceRange: "₹₹",
              tags: ["restaurant", "chennai"],
            });
          }
        });

        if (allRestaurants.length > 0) {
          return {
            success: true,
            count: allRestaurants.length,
            restaurants: allRestaurants.slice(0, 12),
            source: "search_extracted",
          };
        }
      }

      throw new Error("No results from search");
    } catch (error) {
      return {
        success: true,
        count: generateChennaiRestaurantData().length,
        restaurants: generateChennaiRestaurantData(),
        source: "demo_fallback",
      };
    }
  },
});

// =====================================
// 2. WEEKEND EVENTS
// =====================================
export const scrapeWeekendEvents = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    if (!FIRECRAWL_API_KEY) {
      return {
        success: true,
        count: generateWeekendEventsData().length,
        events: generateWeekendEventsData(),
        source: "demo",
      };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "weekend events Chennai parties concerts festivals",
          location: "Chennai",
          limit: 10,
          tbs: "qdr:m",
          scrapeOptions: {
            formats: [
              {
                type: "json",
                schema: {
                  type: "object",
                  properties: {
                    events: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Event name" },
                          date: { type: "string", description: "Event date" },
                          venue: {
                            type: "string",
                            description: "Venue location",
                          },
                          description: {
                            type: "string",
                            description: "Event description",
                          },
                          category: {
                            type: "string",
                            description: "Event category",
                          },
                          ticketPrice: {
                            type: "string",
                            description: "Ticket price",
                          },
                        },
                        required: ["name", "date"],
                      },
                    },
                  },
                  required: ["events"],
                },
                prompt:
                  "Extract weekend event information from these Chennai event search results",
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.web?.length > 0) {
        const allEvents = [];

        data.data.web.forEach((result) => {
          if (result.json?.events && Array.isArray(result.json.events)) {
            result.json.events.forEach((event) => {
              allEvents.push({
                title: event.name,
                description:
                  event.description || `${event.category} event in Chennai`,
                location: "Chennai",
                eventDate: event.date,
                venue: event.venue,
                category: event.category || "Weekend Event",
                ticketPrice: event.ticketPrice,
                tags: ["weekend", "event", "chennai"],
              });
            });
          } else {
            let eventName = result.title || "Chennai Event";
            allEvents.push({
              title: eventName.substring(0, 50),
              description:
                result.description?.substring(0, 200) ||
                "Exciting event in Chennai",
              location: "Chennai",
              eventDate: "TBD",
              venue: "Various venues",
              category: "Event",
              tags: ["event", "chennai"],
            });
          }
        });

        if (allEvents.length > 0) {
          return {
            success: true,
            count: allEvents.length,
            events: allEvents,
            source: "search_extracted",
          };
        }
      }

      throw new Error("No results from search");
    } catch (error) {
      return {
        success: true,
        count: generateWeekendEventsData().length,
        events: generateWeekendEventsData(),
        source: "demo_fallback",
      };
    }
  },
});

// =====================================
// 3. LOCAL NEWS
// =====================================
export const scrapeLocalNews = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    if (!FIRECRAWL_API_KEY) {
      return {
        success: true,
        count: generateLocalNewsData().length,
        news: generateLocalNewsData(),
        source: "demo",
      };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "Chennai news today local Tamil Nadu traffic metro",
          location: "Chennai",
          sources: ["news"],
          limit: 10,
          tbs: "qdr:d",
          scrapeOptions: {
            formats: [
              {
                type: "json",
                schema: {
                  type: "object",
                  properties: {
                    news: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          headline: {
                            type: "string",
                            description: "News headline",
                          },
                          summary: {
                            type: "string",
                            description: "Brief summary",
                          },
                          category: {
                            type: "string",
                            description: "News category",
                          },
                          publishedTime: {
                            type: "string",
                            description: "When published",
                          },
                        },
                        required: ["headline", "summary"],
                      },
                    },
                  },
                  required: ["news"],
                },
                prompt:
                  "Extract local news from these Chennai news search results",
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.web?.length > 0) {
        const allNews = [];

        data.data.web.forEach((result) => {
          if (result.json?.news && Array.isArray(result.json.news)) {
            result.json.news.forEach((article) => {
              allNews.push({
                title: article.headline,
                description: article.summary,
                category: article.category || "Local News",
                publishedTime: article.publishedTime,
                location: "Chennai",
                source: "News Search",
                tags: ["news", "chennai", "local"],
              });
            });
          } else {
            allNews.push({
              title: result.title || "Chennai News",
              description:
                result.description?.substring(0, 200) ||
                "Local news from Chennai",
              category: "Local News",
              location: "Chennai",
              source: "News Search",
              tags: ["news", "chennai", "local"],
            });
          }
        });

        if (allNews.length > 0) {
          return {
            success: true,
            count: allNews.length,
            news: allNews,
            source: "search_extracted",
          };
        }
      }

      throw new Error("No results from search");
    } catch (error) {
      return {
        success: true,
        count: generateLocalNewsData().length,
        news: generateLocalNewsData(),
        source: "demo_fallback",
      };
    }
  },
});

// =====================================
// 4. APARTMENT HUNT
// =====================================
export const scrapeApartmentHunt = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    if (!FIRECRAWL_API_KEY) {
      return {
        success: true,
        count: generateApartmentHuntData().length,
        apartments: generateApartmentHuntData(),
        source: "demo",
      };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "apartments for rent Chennai 1BHK 2BHK 3BHK rental",
          location: "Chennai",
          limit: 10,
          tbs: "qdr:m",
          scrapeOptions: {
            formats: [
              {
                type: "json",
                schema: {
                  type: "object",
                  properties: {
                    apartments: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string",
                            description: "Property name",
                          },
                          location: {
                            type: "string",
                            description: "Area in Chennai",
                          },
                          rent: { type: "string", description: "Monthly rent" },
                          bedrooms: {
                            type: "string",
                            description: "Number of bedrooms",
                          },
                          area: {
                            type: "string",
                            description: "Square feet area",
                          },
                          amenities: {
                            type: "string",
                            description: "Key amenities",
                          },
                          description: {
                            type: "string",
                            description: "Property description",
                          },
                        },
                        required: ["name", "location", "rent"],
                      },
                    },
                  },
                  required: ["apartments"],
                },
                prompt:
                  "Extract apartment rental information from these Chennai apartment search results",
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.web?.length > 0) {
        const allApartments = [];

        data.data.web.forEach((result) => {
          if (
            result.json?.apartments &&
            Array.isArray(result.json.apartments)
          ) {
            result.json.apartments.forEach((apt) => {
              allApartments.push({
                title: apt.name,
                description:
                  apt.description ||
                  `${apt.bedrooms} apartment in ${apt.location}`,
                location: apt.location,
                rent: apt.rent,
                bedrooms: apt.bedrooms,
                area: apt.area,
                amenities: apt.amenities,
                tags: ["apartment", "rental", "chennai"],
              });
            });
          } else {
            allApartments.push({
              title: result.title || "Chennai Apartment",
              description:
                result.description?.substring(0, 200) ||
                "Apartment for rent in Chennai",
              location: "Chennai",
              rent: "₹25,000/month",
              bedrooms: "2BHK",
              area: "1200 sq ft",
              tags: ["apartment", "rental", "chennai"],
            });
          }
        });

        if (allApartments.length > 0) {
          return {
            success: true,
            count: allApartments.length,
            apartments: allApartments,
            source: "search_extracted",
          };
        }
      }

      throw new Error("No results from search");
    } catch (error) {
      return {
        success: true,
        count: generateApartmentHuntData().length,
        apartments: generateApartmentHuntData(),
        source: "demo_fallback",
      };
    }
  },
});

// =====================================
// 5. TECH MEETUPS
// =====================================
export const scrapeTechMeetups = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    if (!FIRECRAWL_API_KEY) {
      return {
        success: true,
        count: generateTechMeetupsData().length,
        meetups: generateTechMeetupsData(),
        source: "demo",
      };
    }

    try {
      const response = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "tech meetups Chennai developer events programming",
          location: "Chennai",
          categories: ["github"],
          limit: 10,
          tbs: "qdr:m",
          scrapeOptions: {
            formats: [
              {
                type: "json",
                schema: {
                  type: "object",
                  properties: {
                    meetups: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Meetup name" },
                          date: { type: "string", description: "Event date" },
                          venue: {
                            type: "string",
                            description: "Venue location",
                          },
                          topic: { type: "string", description: "Tech topic" },
                          description: {
                            type: "string",
                            description: "Event description",
                          },
                          type: { type: "string", description: "Event type" },
                          organizer: {
                            type: "string",
                            description: "Organizing group",
                          },
                        },
                        required: ["name", "date", "topic"],
                      },
                    },
                  },
                  required: ["meetups"],
                },
                prompt:
                  "Extract tech meetup information from these Chennai developer event search results",
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.web?.length > 0) {
        const allMeetups = [];

        data.data.web.forEach((result) => {
          if (result.json?.meetups && Array.isArray(result.json.meetups)) {
            result.json.meetups.forEach((meetup) => {
              allMeetups.push({
                title: meetup.name,
                description:
                  meetup.description ||
                  `${meetup.topic} ${meetup.type} in Chennai`,
                location: "Chennai",
                eventDate: meetup.date,
                venue: meetup.venue,
                topic: meetup.topic,
                type: meetup.type || "Tech Meetup",
                organizer: meetup.organizer || "Tech Community",
                tags: ["tech", "meetup", "chennai", "developer"],
              });
            });
          } else {
            allMeetups.push({
              title: result.title || "Chennai Tech Meetup",
              description:
                result.description?.substring(0, 200) ||
                "Tech meetup in Chennai",
              location: "Chennai",
              eventDate: "TBD",
              venue: "TBD",
              topic: "Technology",
              type: "Meetup",
              tags: ["tech", "meetup", "chennai"],
            });
          }
        });

        if (allMeetups.length > 0) {
          return {
            success: true,
            count: allMeetups.length,
            meetups: allMeetups,
            source: "search_extracted",
          };
        }
      }

      throw new Error("No results from search");
    } catch (error) {
      return {
        success: true,
        count: generateTechMeetupsData().length,
        meetups: generateTechMeetupsData(),
        source: "demo_fallback",
      };
    }
  },
});

// =====================================
// DEMO DATA GENERATION FUNCTIONS
// =====================================
function generateChennaiRestaurantData() {
  return [
    {
      title: "Murugan Idli Shop",
      description: "Famous for soft idlis and filter coffee",
      location: "T. Nagar, Chennai",
      cuisine: "South Indian",
      rating: 4.3,
      priceRange: "₹",
      tags: ["breakfast", "traditional", "vegetarian"],
    },
    {
      title: "Buhari Hotel",
      description: "Legendary biryani destination since 1951",
      location: "Anna Salai, Chennai",
      cuisine: "Indian",
      rating: 4.1,
      priceRange: "₹₹",
      tags: ["biryani", "historic", "non-vegetarian"],
    },
    {
      title: "Sangeetha Restaurant",
      description: "Pure vegetarian South Indian meals",
      location: "Multiple locations",
      cuisine: "South Indian",
      rating: 4.2,
      priceRange: "₹",
      tags: ["vegetarian", "meals", "traditional"],
    },
  ];
}

function generateWeekendEventsData() {
  return [
    {
      title: "Chennai Music Festival",
      description: "Classical music performances across the city",
      location: "Chennai",
      eventDate: "Dec 2025",
      venue: "Music Academy",
      category: "Music",
      tags: ["weekend", "event", "chennai"],
    },
  ];
}

function generateLocalNewsData() {
  return [
    {
      title: "Chennai Metro Expansion Update",
      description: "New metro line construction progress",
      category: "Infrastructure",
      location: "Chennai",
      source: "Demo Data",
      tags: ["news", "chennai", "local"],
    },
  ];
}

function generateApartmentHuntData() {
  return [
    {
      title: "Modern 2BHK Apartment",
      description: "Fully furnished apartment in prime location",
      location: "T. Nagar, Chennai",
      rent: "₹25,000/month",
      bedrooms: "2BHK",
      area: "1200 sq ft",
      tags: ["apartment", "rental", "chennai"],
    },
  ];
}

function generateTechMeetupsData() {
  return [
    {
      title: "GDG Chennai Monthly Meetup",
      description: "Latest in Google technologies and web development",
      location: "Chennai",
      eventDate: "Every first Saturday",
      topic: "Web Development",
      type: "Meetup",
      tags: ["tech", "meetup", "chennai", "developer"],
    },
  ];
}
