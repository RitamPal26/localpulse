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
          limit: 10,
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
                sourceUrl:
                  result.url ||
                  result.sourceURL ||
                  "https://www.tripadvisor.in/Restaurants-g304556-Chennai.html", // NEW
                price: restaurant.priceRange || "₹300-500 per person", // NEW - for AI processor
                //contactInfo: restaurant.phone || restaurant.contact || undefined, // NEW
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
              sourceUrl:
                result.url || result.sourceURL || "https://example.com", // NEW
              price: "₹300-500 per person", // NEW
              tags: ["restaurant", "chennai"],
            });
          }
        });

        if (allRestaurants.length > 0) {
          return {
            success: true,
            count: allRestaurants.length,
            restaurants: allRestaurants.slice(0, 10),
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
                location: event.venue || "Chennai",
                eventDate: event.date,
                venue: event.venue,
                category: event.category || "Weekend Event",
                organizer: event.organizer || "Event Organizer", // NEW
                ticketPrice: event.ticketPrice,
                sourceUrl:
                  result.url ||
                  result.sourceURL ||
                  "https://www.eventbrite.com/d/india--chennai/events/", // NEW
                price: event.ticketPrice || "₹500", // NEW - for AI processor
                //contactInfo: event.contact || event.phone || undefined, // NEW
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
              sourceUrl:
                result.url || result.sourceURL || "https://example.com", // NEW
              price: "₹500", // NEW
              tags: ["event", "chennai"],
            });
          }
        });

        if (allEvents.length > 0) {
          return {
            success: true,
            count: allEvents.length,
            events: allEvents.slice(0, 10),
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
                sourceUrl:
                  result.url ||
                  result.sourceURL ||
                  "https://timesofindia.indiatimes.com/city/chennai", // NEW
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
              sourceUrl:
                result.url || result.sourceURL || "https://example.com", // NEW
              tags: ["news", "chennai", "local"],
            });
          }
        });

        if (allNews.length > 0) {
          return {
            success: true,
            count: allNews.length,
            news: allNews.slice(0, 10),
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
                sourceUrl:
                  result.url ||
                  result.sourceURL ||
                  "https://www.99acres.com/rent/residential-property/chennai", // NEW
                price: apt.rent || "₹25,000/month", // NEW - for AI processor
                //contactInfo: apt.contact || apt.phone || undefined, // NEW
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
              sourceUrl:
                result.url || result.sourceURL || "https://example.com", // NEW
              price: "₹25,000/month", // NEW
              tags: ["apartment", "rental", "chennai"],
            });
          }
        });

        if (allApartments.length > 0) {
          return {
            success: true,
            count: allApartments.length,
            apartments: allApartments.slice(0, 10),
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
                sourceUrl:
                  result.url ||
                  result.sourceURL ||
                  "https://gdg.community.dev/gdg-chennai/", // NEW
                price: "Free", // NEW - most tech meetups are free
                //contactInfo: meetup.contact || null, // NEW
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
              organizer: "Tech Community", // NEW
              sourceUrl:
                result.url || result.sourceURL || "https://example.com", // NEW
              price: "Free", // NEW
              tags: ["tech", "meetup", "chennai"],
            });
          }
        });

        if (allMeetups.length > 0) {
          return {
            success: true,
            count: allMeetups.length,
            meetups: allMeetups.slice(0, 10),
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
      sourceUrl: "https://www.zomato.com/chennai/murugan-idli-shop", // NEW
      price: "₹100-200 per person", // NEW
      contactInfo: "044-12345678", // NEW
      tags: ["breakfast", "traditional", "vegetarian"],
    },
    {
      title: "Buhari Hotel",
      description: "Legendary biryani destination since 1951",
      location: "Anna Salai, Chennai",
      cuisine: "Indian",
      rating: 4.1,
      priceRange: "₹₹",
      sourceUrl: "https://www.zomato.com/chennai/buhari-hotel", // NEW
      price: "₹300-500 per person", // NEW
      contactInfo: "044-87654321", // NEW
      tags: ["biryani", "historic", "non-vegetarian"],
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
      organizer: "Chennai Music Academy", // NEW
      ticketPrice: "₹500-2000", // NEW
      sourceUrl: "https://www.chennaimusic.org/festival", // NEW
      price: "₹500-2000", // NEW - for AI processor
      contactInfo: "044-28117162", // NEW
      tags: ["weekend", "event", "chennai"],
    },
    {
      title: "Chennai Book Fair",
      description:
        "Annual book fair with thousands of titles and author interactions",
      location: "Chennai",
      eventDate: "Jan 2026",
      venue: "YMCA Nandanam",
      category: "Literature",
      organizer: "Booksellers & Publishers Association", // NEW
      ticketPrice: "₹30 entry", // NEW
      sourceUrl: "https://www.chennaibookfair.com", // NEW
      price: "₹30 entry", // NEW
      contactInfo: "044-24332371", // NEW
      tags: ["weekend", "event", "chennai", "books"],
    },
    {
      title: "Marina Beach Food Festival",
      description:
        "Street food festival featuring Chennai's best local cuisine",
      location: "Chennai",
      eventDate: "Weekend in Feb 2026",
      venue: "Marina Beach",
      category: "Food",
      organizer: "Chennai Corporation", // NEW
      ticketPrice: "Free entry", // NEW
      sourceUrl: "https://www.chennaicorporation.gov.in/events", // NEW
      price: "Free entry", // NEW
      contactInfo: "044-25619111", // NEW
      tags: ["weekend", "event", "chennai", "food"],
    },
  ];
}

function generateLocalNewsData() {
  return [
    {
      title: "Chennai Metro Expansion Update",
      description:
        "New metro line construction progress in OMR and Kilpauk corridors",
      category: "Infrastructure",
      location: "Chennai",
      source: "Demo Data",
      sourceUrl:
        "https://www.thehindu.com/news/cities/chennai/metro-expansion-update", // NEW
      publishedTime: "2 hours ago", // NEW
      tags: ["news", "chennai", "local"],
    },
    {
      title: "New IT Park Opens in Sholinganallur",
      description:
        "State-of-the-art IT park with capacity for 10,000 employees inaugurated",
      category: "Business",
      location: "Chennai",
      source: "Demo Data",
      sourceUrl: "https://www.timesofinda.com/chennai/it-park-sholinganallur", // NEW
      publishedTime: "1 hour ago", // NEW
      tags: ["news", "chennai", "local", "it"],
    },
    {
      title: "Chennai Traffic Police Launch New Mobile App",
      description:
        "Citizens can now pay fines and check vehicle registration through mobile app",
      category: "Technology",
      location: "Chennai",
      source: "Demo Data",
      sourceUrl: "https://www.newindianexpress.com/chennai-traffic-police-app", // NEW
      publishedTime: "4 hours ago", // NEW
      tags: ["news", "chennai", "local", "traffic"],
    },
  ];
}

function generateApartmentHuntData() {
  return [
    {
      title: "Modern 2BHK Apartment",
      description:
        "Fully furnished apartment in prime location with all modern amenities",
      location: "T. Nagar, Chennai",
      rent: "₹25,000/month",
      bedrooms: "2BHK",
      area: "1200 sq ft",
      amenities: "Gym, Swimming Pool, 24/7 Security, Parking", // NEW
      sourceUrl: "https://www.99acres.com/rent/2bhk-apartment-t-nagar-chennai", // NEW
      price: "₹25,000/month", // NEW - for AI processor
      contactInfo: "9841234567", // NEW
      furnishing: "Fully Furnished", // NEW
      tags: ["apartment", "rental", "chennai"],
    },
    {
      title: "Spacious 3BHK Villa",
      description:
        "Independent villa with garden and parking in quiet residential area",
      location: "Adyar, Chennai",
      rent: "₹45,000/month",
      bedrooms: "3BHK",
      area: "1800 sq ft",
      amenities: "Garden, Parking, Power Backup, Water Supply", // NEW
      sourceUrl: "https://www.magicbricks.com/rent/3bhk-villa-adyar-chennai", // NEW
      price: "₹45,000/month", // NEW
      contactInfo: "9876543210", // NEW
      furnishing: "Semi Furnished", // NEW
      tags: ["apartment", "rental", "chennai", "villa"],
    },
    {
      title: "Budget 1BHK Near IT Corridor",
      description:
        "Affordable apartment perfect for working professionals in OMR",
      location: "OMR, Chennai",
      rent: "₹15,000/month",
      bedrooms: "1BHK",
      area: "600 sq ft",
      amenities: "Lift, Security, Parking", // NEW
      sourceUrl: "https://www.housing.com/rent/1bhk-apartment-omr-chennai", // NEW
      price: "₹15,000/month", // NEW
      contactInfo: "8765432109", // NEW
      furnishing: "Unfurnished", // NEW
      tags: ["apartment", "rental", "chennai", "budget"],
    },
  ];
}

function generateTechMeetupsData() {
  return [
    {
      title: "GDG Chennai Monthly Meetup",
      description:
        "Latest in Google technologies and web development with hands-on workshops",
      location: "Chennai",
      eventDate: "Every first Saturday",
      venue: "PayPal Office, OMR",
      topic: "Web Development",
      type: "Meetup",
      organizer: "Google Developer Group Chennai", // NEW
      sourceUrl: "https://gdg.community.dev/gdg-chennai/", // NEW
      price: "Free", // NEW - for AI processor
      contactInfo: "gdgchennai@gmail.com", // NEW
      tags: ["tech", "meetup", "chennai", "developer"],
    },
    {
      title: "React Chennai Meetup",
      description:
        "Monthly gathering for React developers to share knowledge and network",
      location: "Chennai",
      eventDate: "Every third Saturday",
      venue: "Zoho Office, Estancia IT Park",
      topic: "React, Frontend Development",
      type: "Meetup",
      organizer: "React Chennai Community", // NEW
      sourceUrl: "https://www.meetup.com/react-chennai/", // NEW
      price: "Free", // NEW
      contactInfo: "reactchennai@gmail.com", // NEW
      tags: ["tech", "meetup", "chennai", "react", "frontend"],
    },
    {
      title: "Chennai Python User Group",
      description:
        "Python enthusiasts gathering for talks, workshops and networking",
      location: "Chennai",
      eventDate: "Every second Saturday",
      venue: "Microsoft Office, RMZ Millenia",
      topic: "Python, Data Science, AI/ML",
      type: "User Group",
      organizer: "Chennai Python User Group", // NEW
      sourceUrl: "https://www.meetup.com/chennai-python-user-group/", // NEW
      price: "Free", // NEW
      contactInfo: "chennaipug@gmail.com", // NEW
      tags: ["tech", "meetup", "chennai", "python", "data-science"],
    },
  ];
}
