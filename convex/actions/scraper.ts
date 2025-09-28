"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

// 1. WEEKEND EVENTS - Using EventBrite Chennai
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
      console.log("🎪 Attempting AI extraction from EventBrite Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.eventbrite.com/d/india--chennai/events/", 
          formats: ["extract"],
          extract: {
            prompt: "Extract weekend events happening in Chennai including event names, dates, venues, descriptions, and ticket prices",
            schema: {
              type: "object",
              properties: {
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Event name" },
                      date: { type: "string", description: "Event date and time" },
                      venue: { type: "string", description: "Venue location" },
                      description: { type: "string", description: "Event description" },
                      category: { type: "string", description: "Event category (music, party, workshop, etc.)" },
                      ticketPrice: { type: "string", description: "Ticket price or free status" },
                      organizer: { type: "string", description: "Event organizer" }
                    },
                    required: ["name", "date", "venue"]
                  }
                }
              },
              required: ["events"]
            }
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 3000
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ EventBrite extraction failed, using demo data");
        return {
          success: true,
          count: generateWeekendEventsData().length,
          events: generateWeekendEventsData(),
          source: "demo_fallback",
        };
      }

      const extractedData = data.extract || data.data;

      if (extractedData && extractedData.events && extractedData.events.length > 0) {
        const formattedEvents = extractedData.events.map(event => ({
          title: event.name,
          description: event.description || `${event.category} event in Chennai`,
          location: "Chennai",
          eventDate: event.date,
          venue: event.venue,
          category: event.category || "Weekend Event",
          ticketPrice: event.ticketPrice,
          organizer: event.organizer,
          tags: ["weekend", "event", "chennai"],
        }));

        console.log(`🎯 AI extracted ${formattedEvents.length} weekend events`);
        return {
          success: true,
          count: formattedEvents.length,
          events: formattedEvents,
          source: "ai_extracted",
        };
      } else {
        return {
          success: true,
          count: generateWeekendEventsData().length,
          events: generateWeekendEventsData(),
          source: "demo_extraction_failed",
        };
      }
    } catch (error) {
      console.error("💥 Weekend events AI extraction error:", error.message);
      return {
        success: true,
        count: generateWeekendEventsData().length,
        events: generateWeekendEventsData(),
        source: "demo_error_fallback",
      };
    }
  },
});

// 2. LOCAL NEWS - Using Times of India Chennai
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
      console.log("📰 Attempting AI extraction from Times of India Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://timesofindia.indiatimes.com/city/chennai",
          formats: ["extract"], 
          extract: {
            prompt: "Extract recent local news from Chennai including headlines, brief summaries, publication times, and news categories",
            schema: {
              type: "object",
              properties: {
                news: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      headline: { type: "string", description: "News headline" },
                      summary: { type: "string", description: "Brief news summary" },
                      category: { type: "string", description: "News category (politics, crime, traffic, etc.)" },
                      publishedTime: { type: "string", description: "When published" },
                      location: { type: "string", description: "Specific area in Chennai if mentioned" }
                    },
                    required: ["headline", "summary"]
                  }
                }
              },
              required: ["news"]
            }
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 4000
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ Times of India extraction failed, using demo data");
        return {
          success: true,
          count: generateLocalNewsData().length,
          news: generateLocalNewsData(),
          source: "demo_fallback",
        };
      }

      const extractedData = data.extract || data.data;

      if (extractedData && extractedData.news && extractedData.news.length > 0) {
        const formattedNews = extractedData.news.map(article => ({
          title: article.headline,
          description: article.summary,
          category: article.category || "Local News",
          publishedTime: article.publishedTime,
          location: article.location || "Chennai",
          source: "Times of India",
          tags: ["news", "chennai", "local"],
        }));

        console.log(`🎯 AI extracted ${formattedNews.length} news articles`);
        return {
          success: true,
          count: formattedNews.length,
          news: formattedNews,
          source: "ai_extracted",
        };
      } else {
        return {
          success: true,
          count: generateLocalNewsData().length,
          news: generateLocalNewsData(),
          source: "demo_extraction_failed",
        };
      }
    } catch (error) {
      console.error("💥 Local news AI extraction error:", error.message);
      return {
        success: true,
        count: generateLocalNewsData().length,
        news: generateLocalNewsData(),
        source: "demo_error_fallback",
      };
    }
  },
});

// 3. APARTMENT HUNT - Using 99acres Chennai  
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
      console.log("🏠 Attempting AI extraction from 99acres Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.99acres.com/rent/residential-property/chennai?bedroom=1,2,3&property_type=apartment",
          formats: ["extract"],
          extract: {
            prompt: "Extract apartment rental listings in Chennai including property names, locations, rent amounts, bedroom counts, amenities, and contact details",
            schema: {
              type: "object",
              properties: {
                apartments: {
                  type: "array",
                  items: {
                    type: "object", 
                    properties: {
                      name: { type: "string", description: "Property/building name" },
                      location: { type: "string", description: "Area/locality in Chennai" },
                      rent: { type: "string", description: "Monthly rent amount" },
                      bedrooms: { type: "string", description: "Number of bedrooms (1BHK, 2BHK, etc.)" },
                      area: { type: "string", description: "Square feet area" },
                      amenities: { type: "string", description: "Key amenities" },
                      furnishing: { type: "string", description: "Furnished/Semi-furnished/Unfurnished" },
                      description: { type: "string", description: "Property description" }
                    },
                    required: ["name", "location", "rent", "bedrooms"]
                  }
                }
              },
              required: ["apartments"]
            }
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 5000 // Longer wait for real estate sites
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ 99acres extraction failed, using demo data");
        return {
          success: true,
          count: generateApartmentHuntData().length,
          apartments: generateApartmentHuntData(),
          source: "demo_fallback",
        };
      }

      const extractedData = data.extract || data.data;

      if (extractedData && extractedData.apartments && extractedData.apartments.length > 0) {
        const formattedApartments = extractedData.apartments.map(apt => ({
          title: apt.name,
          description: apt.description || `${apt.bedrooms} apartment in ${apt.location}`,
          location: apt.location,
          rent: apt.rent,
          bedrooms: apt.bedrooms,
          area: apt.area,
          amenities: apt.amenities,
          furnishing: apt.furnishing,
          source: "99acres",
          tags: ["apartment", "rental", "chennai"],
        }));

        console.log(`🎯 AI extracted ${formattedApartments.length} apartments`);
        return {
          success: true,
          count: formattedApartments.length,
          apartments: formattedApartments,
          source: "ai_extracted",
        };
      } else {
        return {
          success: true,
          count: generateApartmentHuntData().length,
          apartments: generateApartmentHuntData(),
          source: "demo_extraction_failed",
        };
      }
    } catch (error) {
      console.error("💥 Apartment hunt AI extraction error:", error.message);
      return {
        success: true,
        count: generateApartmentHuntData().length,
        apartments: generateApartmentHuntData(),
        source: "demo_error_fallback",
      };
    }
  },
});

// 4. TECH MEETUPS - Using GDG Chennai
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
      console.log("💻 Attempting AI extraction from GDG Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://gdg.community.dev/gdg-chennai/", 
          formats: ["extract"],
          extract: {
            prompt: "Extract upcoming tech meetups, workshops, conferences and developer events in Chennai including event names, dates, venues, topics, and registration details",
            schema: {
              type: "object",
              properties: {
                meetups: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Event/meetup name" },
                      date: { type: "string", description: "Event date and time" },
                      venue: { type: "string", description: "Venue location" },
                      topic: { type: "string", description: "Tech topic/focus area" },
                      description: { type: "string", description: "Event description" },
                      type: { type: "string", description: "Event type (meetup, workshop, conference)" },
                      organizer: { type: "string", description: "Organizing group" },
                      registrationInfo: { type: "string", description: "Registration details" }
                    },
                    required: ["name", "date", "topic"]
                  }
                }
              },
              required: ["meetups"]
            }
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 3000
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ GDG Chennai extraction failed, using demo data");
        return {
          success: true,
          count: generateTechMeetupsData().length,
          meetups: generateTechMeetupsData(),
          source: "demo_fallback",
        };
      }

      const extractedData = data.extract || data.data;

      if (extractedData && extractedData.meetups && extractedData.meetups.length > 0) {
        const formattedMeetups = extractedData.meetups.map(meetup => ({
          title: meetup.name,
          description: meetup.description || `${meetup.topic} ${meetup.type} in Chennai`,
          location: "Chennai",
          eventDate: meetup.date,
          venue: meetup.venue,
          topic: meetup.topic,
          type: meetup.type || "Tech Meetup",
          organizer: meetup.organizer || "GDG Chennai",
          registrationInfo: meetup.registrationInfo,
          tags: ["tech", "meetup", "chennai", "developer"],
        }));

        console.log(`🎯 AI extracted ${formattedMeetups.length} tech meetups`);
        return {
          success: true,
          count: formattedMeetups.length,
          meetups: formattedMeetups,
          source: "ai_extracted",
        };
      } else {
        return {
          success: true,
          count: generateTechMeetupsData().length,
          meetups: generateTechMeetupsData(),
          source: "demo_extraction_failed",
        };
      }
    } catch (error) {
      console.error("💥 Tech meetups AI extraction error:", error.message);
      return {
        success: true,
        count: generateTechMeetupsData().length,
        meetups: generateTechMeetupsData(),
        source: "demo_error_fallback",
      };
    }
  },
});

// Demo data generation functions (add these)
function generateWeekendEventsData() {
  return [
    {
      title: "Chennai Music Festival",
      description: "Classical music performances across the city",
      location: "Chennai", 
      eventDate: "Dec 2025",
      venue: "Music Academy",
      category: "Music",
      tags: ["weekend", "event", "chennai"]
    }
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
      tags: ["news", "chennai", "local"]
    }
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
      tags: ["apartment", "rental", "chennai"]
    }
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
      tags: ["tech", "meetup", "chennai", "developer"]
    }
  ];
}

export const scrapeChennaiRestaurants = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    if (!FIRECRAWL_API_KEY) {
      console.log("No Firecrawl API key, using demo data");
      return {
        success: true,
        count: generateChennaiRestaurantData().length,
        restaurants: generateChennaiRestaurantData(),
        source: "demo",
      };
    }

    try {
      console.log("🍽️ Attempting AI extraction from TripAdvisor Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.tripadvisor.in/Restaurants-g304556-Chennai_Madras_Chennai_District_Tamil_Nadu.html",
          formats: ["extract"],
          extract: {
            prompt:
              "Extract restaurant information from this TripAdvisor page including restaurant names, cuisine types, price ranges, ratings, and any available details",
            schema: {
              type: "object",
              properties: {
                restaurants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Restaurant name" },
                      cuisine: { type: "string", description: "Cuisine type" },
                      priceRange: {
                        type: "string",
                        description: "Price range (₹, ₹₹, etc.)",
                      },
                      rating: {
                        type: "number",
                        description: "Rating if available",
                      },
                      reviewCount: {
                        type: "number",
                        description: "Number of reviews",
                      },
                      location: {
                        type: "string",
                        description: "Area or specific location",
                      },
                      description: {
                        type: "string",
                        description: "Brief description or specialties",
                      },
                    },
                    required: ["name", "cuisine"],
                  },
                },
              },
              required: ["restaurants"],
            },
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 3000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ TripAdvisor AI extraction failed:");
        console.log("Status:", response.status);
        console.log("Error:", JSON.stringify(data, null, 2));
        console.log("Falling back to demo restaurant data");
        return {
          success: true,
          count: generateChennaiRestaurantData().length,
          restaurants: generateChennaiRestaurantData(),
          source: "demo_fallback",
          error: data,
        };
      }

      console.log("✅ AI extraction successful!");
      const extractedData = data.extract || data.data;

      if (
        extractedData &&
        extractedData.restaurants &&
        extractedData.restaurants.length > 0
      ) {
        // Format extracted data to match your existing structure
        const formattedRestaurants = extractedData.restaurants.map(
          (restaurant) => ({
            title: restaurant.name,
            description:
              restaurant.description ||
              `${restaurant.cuisine} restaurant in Chennai`,
            location: restaurant.location || "Chennai",
            cuisine: restaurant.cuisine || "Various",
            rating: restaurant.rating || Math.random() * 1.5 + 3.5,
            priceRange: restaurant.priceRange || "₹₹",
            tags: ["restaurant", "chennai"],
            reviewCount: restaurant.reviewCount,
          })
        );

        console.log(
          `🎯 Extracted ${formattedRestaurants.length} restaurants with AI`
        );
        return {
          success: true,
          count: formattedRestaurants.length,
          restaurants: formattedRestaurants,
          source: "ai_extracted",
        };
      } else {
        console.log("⚠️ No restaurants in AI extraction, using demo data");
        return {
          success: true,
          count: generateChennaiRestaurantData().length,
          restaurants: generateChennaiRestaurantData(),
          source: "demo_extraction_failed",
        };
      }
    } catch (error) {
      console.error("💥 Restaurant AI extraction error:", error.message);
      console.log("Falling back to demo restaurant data");

      return {
        success: true,
        count: generateChennaiRestaurantData().length,
        restaurants: generateChennaiRestaurantData(),
        source: "demo_error_fallback",
      };
    }
  },
});

export const scrapeChennaiEvents = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    if (!FIRECRAWL_API_KEY) {
      return {
        success: true,
        count: generateChennaiEventsData().length,
        events: generateChennaiEventsData(),
        source: "demo",
      };
    }

    try {
      console.log("🎪 Attempting AI extraction from AllEvents Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://allevents.in/chennai/all",
          formats: ["extract"],
          extract: {
            prompt:
              "Extract upcoming events from this page including event names, dates, venues, descriptions, and any ticket information",
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
                      venue: { type: "string", description: "Venue location" },
                      description: {
                        type: "string",
                        description: "Event description",
                      },
                      category: {
                        type: "string",
                        description: "Event category",
                      },
                      ticketInfo: {
                        type: "string",
                        description: "Ticket price or free status",
                      },
                    },
                    required: ["name", "date"],
                  },
                },
              },
              required: ["events"],
            },
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 3000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ Events AI extraction failed, using demo data");
        return {
          success: true,
          count: generateChennaiEventsData().length,
          events: generateChennaiEventsData(),
          source: "demo_fallback",
        };
      }

      const extractedData = data.extract || data.data;

      if (
        extractedData &&
        extractedData.events &&
        extractedData.events.length > 0
      ) {
        // Format for your existing structure
        const formattedEvents = extractedData.events.map((event) => ({
          title: event.name,
          description: event.description || `Exciting event in Chennai`,
          location: "Chennai",
          eventDate: event.date || "TBD",
          venue: event.venue || "Various venues",
          category: event.category,
          tags: ["event", "chennai"],
        }));

        console.log(`🎯 AI extracted ${formattedEvents.length} events`);
        return {
          success: true,
          count: formattedEvents.length,
          events: formattedEvents,
          source: "ai_extracted",
        };
      } else {
        return {
          success: true,
          count: generateChennaiEventsData().length,
          events: generateChennaiEventsData(),
          source: "demo_extraction_failed",
        };
      }
    } catch (error) {
      console.error("💥 Events AI extraction error:", error.message);
      return {
        success: true,
        count: generateChennaiEventsData().length,
        events: generateChennaiEventsData(),
        source: "demo_error_fallback",
      };
    }
  },
});

export const scrapeChennaiTechMeetups = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    try {
      console.log("💻 Attempting AI extraction for tech meetups...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://allevents.in/chennai/digital",
          formats: ["extract"],
          extract: {
            prompt:
              "Extract technology and digital events, meetups, workshops from this page",
            schema: {
              type: "object",
              properties: {
                meetups: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Meetup/event name",
                      },
                      date: { type: "string", description: "Event date" },
                      venue: { type: "string", description: "Venue" },
                      description: {
                        type: "string",
                        description: "Event description",
                      },
                      type: {
                        type: "string",
                        description: "Type (workshop, meetup, conference)",
                      },
                    },
                    required: ["name", "date"],
                  },
                },
              },
              required: ["meetups"],
            },
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 3000,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const extractedData = data.extract || data.data;
        if (
          extractedData &&
          extractedData.meetups &&
          extractedData.meetups.length > 0
        ) {
          const formattedMeetups = extractedData.meetups.map((meetup) => ({
            title: meetup.name,
            description: meetup.description || "Tech meetup in Chennai",
            location: "Chennai",
            eventDate: meetup.date,
            venue: meetup.venue || "TBD",
            type: meetup.type,
            tags: ["tech", "meetup", "chennai"],
          }));

          return {
            success: true,
            count: formattedMeetups.length,
            meetups: formattedMeetups,
            source: "ai_extracted",
          };
        }
      }
    } catch (error) {
      console.error("💥 Tech meetups AI extraction error:", error.message);
    }

    return {
      success: true,
      count: generateChennaiTechMeetupsData().length,
      meetups: generateChennaiTechMeetupsData(),
      source: "demo_fallback",
    };
  },
});

export const scrapeChennaiApartments = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    try {
      console.log("🏠 Attempting AI extraction from 99acres Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.99acres.com/rent/residential-property/chennai?bedroom=1,2,3&property_type=apartment",
          formats: ["extract"],
          extract: {
            prompt:
              "Extract apartment rental listings including property names, locations, rent amounts, bedroom counts, and descriptions",
            schema: {
              type: "object",
              properties: {
                apartments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Property name" },
                      location: {
                        type: "string",
                        description: "Area/locality",
                      },
                      rent: { type: "string", description: "Rent amount" },
                      bedrooms: {
                        type: "string",
                        description: "Number of bedrooms",
                      },
                      area: { type: "string", description: "Square feet area" },
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
          },
          blockAds: true,
          removeBase64Images: true,
          waitFor: 5000, // Longer wait for real estate sites
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const extractedData = data.extract || data.data;
        if (
          extractedData &&
          extractedData.apartments &&
          extractedData.apartments.length > 0
        ) {
          const formattedApartments = extractedData.apartments.map((apt) => ({
            title: apt.name,
            description:
              apt.description || `${apt.bedrooms} apartment in ${apt.location}`,
            location: apt.location,
            rent: apt.rent,
            bedrooms: apt.bedrooms,
            area: apt.area,
            tags: ["apartment", "chennai", "rental"],
          }));

          return {
            success: true,
            count: formattedApartments.length,
            apartments: formattedApartments,
            source: "ai_extracted",
          };
        }
      }
    } catch (error) {
      console.error("💥 Apartments AI extraction error:", error.message);
    }

    return {
      success: true,
      count: generateChennaiApartmentsData().length,
      apartments: generateChennaiApartmentsData(),
      source: "demo_fallback",
    };
  },
});

// Test API connection function
export const testFirecrawlV2Connection = action({
  args: {},
  handler: async (ctx) => {
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

    try {
      console.log("🔗 Testing Firecrawl v2 connection...");

      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://example.com",
          formats: ["markdown"],
        }),
      });

      const data = await response.json();

      console.log("✅ API Test Results:");
      console.log("Status:", response.status);
      console.log("Success:", response.ok);
      console.log("Has data:", !!data.markdown);
      console.log("Data length:", data.markdown?.length || 0);

      return {
        success: response.ok,
        status: response.status,
        hasData: !!data.markdown,
        dataLength: data.markdown?.length || 0,
        apiVersion: "v2",
      };
    } catch (error) {
      console.error("❌ API Test failed:", error.message);
      return {
        success: false,
        error: error.message,
        apiVersion: "v2",
      };
    }
  },
});

// Demo data functions
function generateChennaiRestaurantData() {
  const restaurantData = [
    {
      title: "Murugan Idli Shop",
      description:
        "Famous South Indian breakfast spot known for authentic idlis and chutneys. A Chennai institution serving traditional Tamil food.",
      location: "T. Nagar, Chennai",
      cuisine: "South Indian",
      rating: 2.3,
      priceRange: "₹",
      tags: ["breakfast", "traditional", "vegetarian"],
    },
    {
      title: "Buhari Hotel",
      description:
        "Historic restaurant credited with inventing chicken biryani. Heritage dining experience in the heart of Chennai.",
      location: "Anna Salai, Chennai",
      cuisine: "Mughlai",
      rating: 4.1,
      priceRange: "₹₹",
      tags: ["biryani", "heritage", "non-vegetarian"],
    },
    {
      title: "Sangeetha Restaurant",
      description:
        "Popular vegetarian chain known for variety of South Indian dishes and North Indian options. Great for families.",
      location: "Multiple locations, Chennai",
      cuisine: "Multi-cuisine",
      rating: 4.0,
      priceRange: "₹₹",
      tags: ["vegetarian", "family", "chain"],
    },
    {
      title: "Ponnusamy Hotel",
      description:
        "Legendary non-vegetarian restaurant famous for Chettinad chicken and mutton dishes. A must-visit for meat lovers.",
      location: "Egmore, Chennai",
      cuisine: "Chettinad",
      rating: 4.4,
      priceRange: "₹₹",
      tags: ["chettinad", "spicy", "non-vegetarian"],
    },
    {
      title: "Rayar's Cafe",
      description:
        "Cozy neighborhood cafe serving excellent filter coffee and South Indian snacks. Perfect for evening hangouts.",
      location: "Mylapore, Chennai",
      cuisine: "Cafe",
      rating: 4.2,
      priceRange: "₹",
      tags: ["coffee", "snacks", "local"],
    },
    {
      title: "Mathsya",
      description:
        "Upscale seafood restaurant offering fresh catches and innovative coastal preparations. Great ambiance for special occasions.",
      location: "ECR, Chennai",
      cuisine: "Seafood",
      rating: 4.5,
      priceRange: "₹₹₹",
      tags: ["seafood", "fine-dining", "coastal"],
    },
    {
      title: "Cream Centre",
      description:
        "Popular vegetarian restaurant chain known for Indian Chinese fusion dishes and ice cream desserts.",
      location: "Express Avenue, Chennai",
      cuisine: "Indian Chinese",
      rating: 4.1,
      priceRange: "₹₹",
      tags: ["vegetarian", "fusion", "desserts"],
    },
    {
      title: "Hotel Saravana Bhavan",
      description:
        "World-famous South Indian vegetarian restaurant chain. Known for consistent quality and authentic flavors.",
      location: "Multiple locations, Chennai",
      cuisine: "South Indian",
      rating: 4.3,
      priceRange: "₹₹",
      tags: ["vegetarian", "authentic", "global-chain"],
    },
    {
      title: "Azzuri Bay",
      description:
        "Trendy rooftop restaurant offering Italian cuisine with stunning city views. Perfect for romantic dinners.",
      location: "VR Chennai Mall",
      cuisine: "Italian",
      rating: 4.2,
      priceRange: "₹₹₹",
      tags: ["rooftop", "italian", "romantic"],
    },
    {
      title: "Thalappakatti Restaurant",
      description:
        "Famous for Dindigul-style biryani with unique spices and tender mutton. A biryani lover's paradise.",
      location: "Adyar, Chennai",
      cuisine: "Biryani",
      rating: 4.3,
      priceRange: "₹₹",
      tags: ["biryani", "mutton", "authentic"],
    },
    {
      title: "The Marina",
      description:
        "Beachfront restaurant offering continental and Indian dishes with ocean views. Great for weekend brunches.",
      location: "Marina Beach, Chennai",
      cuisine: "Multi-cuisine",
      rating: 4.0,
      priceRange: "₹₹₹",
      tags: ["beachfront", "continental", "brunch"],
    },
    {
      title: "Kabab Magic",
      description:
        "Street-style kabab joint famous for seekh kababs and rolls. Perfect late-night food destination.",
      location: "Nungambakkam, Chennai",
      cuisine: "Kababs",
      rating: 4.1,
      priceRange: "₹",
      tags: ["kababs", "street-food", "late-night"],
    },
  ];

  return restaurantData;
}

function generateChennaiEventsData() {
  return [
    {
      title: "Chennai Music Festival 2025",
      description:
        "Classical Carnatic music performances by renowned artists across multiple venues in the city.",
      location: "Music Academy, T. Nagar",
      eventDate: "December 15-30, 2025",
      venue: "Music Academy",
      tags: ["music", "classical", "cultural"],
    },
    {
      title: "Madras Day Celebrations",
      description:
        "Celebrating Chennai's rich heritage with food festivals, heritage walks, and cultural performances.",
      location: "Marina Beach",
      eventDate: "August 22, 2025",
      venue: "Marina Beach & Multiple Venues",
      tags: ["heritage", "culture", "festival"],
    },
    {
      title: "Chennai Book Fair 2025",
      description:
        "Annual book exhibition featuring Tamil and English literature, educational books, and author interactions.",
      location: "YMCA Ground, Nandanam",
      eventDate: "January 10-26, 2025",
      venue: "YMCA Ground",
      tags: ["books", "literature", "education"],
    },
    {
      title: "Margazhi Ragas Concert",
      description:
        "Evening classical music concert featuring upcoming artists in the traditional Margazhi season.",
      location: "Bharatiya Vidya Bhavan",
      eventDate: "December 20, 2025",
      venue: "Bharatiya Vidya Bhavan",
      tags: ["music", "margazhi", "evening"],
    },
    {
      title: "Chennai Marathon 2025",
      description:
        "Annual running event with 5K, 10K, and marathon categories. Registration includes timing chip and medal.",
      location: "Nehru Stadium",
      eventDate: "February 16, 2025",
      venue: "Nehru Stadium",
      tags: ["sports", "marathon", "fitness"],
    },
    {
      title: "Pongal Food Festival",
      description:
        "Traditional Tamil food festival featuring authentic Pongal dishes from different regions of Tamil Nadu.",
      location: "Phoenix MarketCity",
      eventDate: "January 14-16, 2025",
      venue: "Phoenix MarketCity",
      tags: ["food", "pongal", "traditional"],
    },
    {
      title: "Chennai Dance Festival",
      description:
        "Bharatanatyam and contemporary dance performances by local and national artists.",
      location: "Kalakshetra Foundation",
      eventDate: "March 5-7, 2025",
      venue: "Kalakshetra",
      tags: ["dance", "bharatanatyam", "arts"],
    },
    {
      title: "Weekend Beach Cleanup",
      description:
        "Community-driven beach cleaning initiative at Marina Beach. Gloves and bags provided.",
      location: "Marina Beach",
      eventDate: "Every Saturday 6 AM",
      venue: "Marina Beach",
      tags: ["community", "environment", "volunteer"],
    },
  ];
}

function generateChennaiTechMeetupsData() {
  return [
    {
      title: "React Chennai Meetup - Building Local Apps",
      description:
        "Monthly meetup for React developers discussing local app development, state management, and deployment strategies.",
      location: "Tidel Park, Chennai",
      eventDate: "October 15, 2025 - 6:30 PM",
      venue: "Tidel Park Conference Hall",
      tags: ["react", "javascript", "development"],
    },
    {
      title: "Chennai Python Users Group",
      description:
        "Python enthusiasts sharing knowledge about data science, web development, and automation projects.",
      location: "IIT Madras Research Park",
      eventDate: "October 22, 2025 - 7:00 PM",
      venue: "IIT Madras Research Park",
      tags: ["python", "data-science", "automation"],
    },
    {
      title: "Mobile App Development Bootcamp",
      description:
        "Weekend intensive workshop on React Native and Flutter development with hands-on projects.",
      location: "SRM University",
      eventDate: "October 26-27, 2025",
      venue: "SRM University",
      tags: ["mobile", "react-native", "flutter"],
    },
    {
      title: "AI/ML Chennai Community",
      description:
        "Machine learning practitioners discussing latest trends in AI, computer vision, and NLP applications.",
      location: "Zoho Corporation",
      eventDate: "November 5, 2025 - 6:00 PM",
      venue: "Zoho Chennai Office",
      tags: ["ai", "machine-learning", "data"],
    },
    {
      title: "DevOps Chennai Meetup",
      description:
        "Cloud computing, containerization, and CI/CD best practices discussion with industry experts.",
      location: "Freshworks Office",
      eventDate: "November 12, 2025 - 6:30 PM",
      venue: "Freshworks",
      tags: ["devops", "cloud", "containers"],
    },
    {
      title: "Blockchain Chennai Workshop",
      description:
        "Hands-on workshop on building decentralized applications and understanding cryptocurrency technologies.",
      location: "Anna University",
      eventDate: "November 18, 2025 - 10:00 AM",
      venue: "Anna University",
      tags: ["blockchain", "web3", "crypto"],
    },
    {
      title: "Women in Tech Chennai",
      description:
        "Networking event for women in technology featuring career guidance and mentorship opportunities.",
      location: "PayU India Office",
      eventDate: "November 25, 2025 - 5:00 PM",
      venue: "PayU India",
      tags: ["women-in-tech", "networking", "careers"],
    },
    {
      title: "Open Source Saturday",
      description:
        "Collaborative coding session for contributing to open source projects. Bring your laptop and ideas!",
      location: "91springboard, Guindy",
      eventDate: "Every Saturday 10:00 AM",
      venue: "91springboard",
      tags: ["opensource", "collaboration", "coding"],
    },
  ];
}

function generateChennaiApartmentsData() {
  return [
    {
      title: "2BHK Furnished Apartment - Adyar",
      description:
        "Spacious 2BHK with modern furnishing, parking, and 24/7 security. Close to IT corridor and metro station.",
      location: "Adyar, Chennai",
      price: "₹35,000/month",
      type: "2BHK",
      furnishing: "Fully Furnished",
      tags: ["2bhk", "furnished", "parking", "security"],
    },
    {
      title: "1BHK Studio - Velachery",
      description:
        "Compact studio apartment perfect for young professionals. High-speed internet and gym access included.",
      location: "Velachery, Chennai",
      price: "₹18,000/month",
      type: "1BHK",
      furnishing: "Semi Furnished",
      tags: ["1bhk", "studio", "professional", "gym"],
    },
    {
      title: "3BHK Independent House - Mylapore",
      description:
        "Traditional independent house with courtyard, ideal for families. Near temples and local markets.",
      location: "Mylapore, Chennai",
      price: "₹45,000/month",
      type: "3BHK",
      furnishing: "Unfurnished",
      tags: ["3bhk", "independent", "family", "traditional"],
    },
    {
      title: "2BHK Sea View - Besant Nagar",
      description:
        "Beautiful apartment with partial sea view, modern amenities, and walking distance to Elliot's Beach.",
      location: "Besant Nagar, Chennai",
      price: "₹42,000/month",
      type: "2BHK",
      furnishing: "Semi Furnished",
      tags: ["2bhk", "sea-view", "beach", "modern"],
    },
    {
      title: "1BHK IT Park Nearby - Sholinganallur",
      description:
        "Convenient location for IT professionals, walking distance to multiple tech companies and food courts.",
      location: "Sholinganallur, Chennai",
      price: "₹22,000/month",
      type: "1BHK",
      furnishing: "Furnished",
      tags: ["1bhk", "it-park", "tech", "convenient"],
    },
    {
      title: "4BHK Luxury Villa - ECR",
      description:
        "Premium villa with private garden, swimming pool access, and modern security systems.",
      location: "ECR, Chennai",
      price: "₹80,000/month",
      type: "4BHK",
      furnishing: "Fully Furnished",
      tags: ["4bhk", "luxury", "villa", "pool"],
    },
    {
      title: "2BHK Metro Connected - Guindy",
      description:
        "Excellent metro connectivity, shopping mall nearby, perfect for working couples.",
      location: "Guindy, Chennai",
      price: "₹28,000/month",
      type: "2BHK",
      furnishing: "Semi Furnished",
      tags: ["2bhk", "metro", "couples", "shopping"],
    },
    {
      title: "PG for Women - T. Nagar",
      description:
        "Safe and secure paying guest accommodation for working women with all meals included.",
      location: "T. Nagar, Chennai",
      price: "₹12,000/month",
      type: "PG",
      furnishing: "Fully Furnished",
      tags: ["pg", "women", "safe", "meals"],
    },
  ];
}
