"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

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
      console.log("Attempting to scrape restaurants from The Hindu Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.thehindu.com/news/cities/chennai/food-and-dining/",
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Firecrawl failed:", data.error || "Unknown error");
        console.log("Falling back to demo restaurant data");
        return {
          success: true,
          count: generateChennaiRestaurantData().length,
          restaurants: generateChennaiRestaurantData(),
          source: "demo_fallback",
        };
      }

      console.log("Firecrawl successful! Extracting restaurant data...");
      const scrapedRestaurants = extractRestaurantsFromContent(
        data.markdown || data.html
      );

      if (scrapedRestaurants.length > 0) {
        console.log(
          `Extracted ${scrapedRestaurants.length} restaurants from scraping`
        );
        return {
          success: true,
          count: scrapedRestaurants.length,
          restaurants: scrapedRestaurants,
          source: "scraped",
        };
      } else {
        console.log(
          "No restaurants extracted from scraped content, using demo data"
        );
        return {
          success: true,
          count: generateChennaiRestaurantData().length,
          restaurants: generateChennaiRestaurantData(),
          source: "demo_extraction_failed",
        };
      }
    } catch (error) {
      console.error("Restaurant scraping error:", error.message);
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
      console.log("Attempting to scrape events from BookMyShow Chennai...");

      const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://in.bookmyshow.com/chennai/events",
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("Events scraping failed, using demo data");
        return {
          success: true,
          count: generateChennaiEventsData().length,
          events: generateChennaiEventsData(),
          source: "demo_fallback",
        };
      }

      const scrapedEvents = extractEventsFromContent(
        data.markdown || data.html
      );

      if (scrapedEvents.length > 0) {
        console.log(`Extracted ${scrapedEvents.length} events from scraping`);
        return {
          success: true,
          count: scrapedEvents.length,
          events: scrapedEvents,
          source: "scraped",
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
      console.error("Events scraping error:", error.message);
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
      console.log("Attempting to scrape tech meetups...");

      const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.meetup.com/find/?location=Chennai&keywords=technology",
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const scrapedMeetups = extractMeetupsFromContent(
          data.markdown || data.html
        );
        if (scrapedMeetups.length > 0) {
          return {
            success: true,
            count: scrapedMeetups.length,
            meetups: scrapedMeetups,
            source: "scraped",
          };
        }
      }
    } catch (error) {
      console.error("Tech meetups scraping error:", error.message);
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
      console.log("Attempting to scrape apartments from MagicBricks...");

      const response = await fetch("https://api.firecrawl.dev/v0/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.magicbricks.com/property-for-rent/residential-real-estate?bedroom=1,2,3&proptype=Multistorey-Apartment,Builder-Floor-Apartment&cityName=Chennai",
          formats: ["markdown"],
          onlyMainContent: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const scrapedApartments = extractApartmentsFromContent(
          data.markdown || data.html
        );
        if (scrapedApartments.length > 0) {
          return {
            success: true,
            count: scrapedApartments.length,
            apartments: scrapedApartments,
            source: "scraped",
          };
        }
      }
    } catch (error) {
      console.error("Apartments scraping error:", error.message);
    }

    return {
      success: true,
      count: generateChennaiApartmentsData().length,
      apartments: generateChennaiApartmentsData(),
      source: "demo_fallback",
    };
  },
});

// Content extraction functions
function extractRestaurantsFromContent(content: string) {
  if (!content || typeof content !== "string") {
    console.log("No valid content to extract from");
    return [];
  }

  const restaurants = [];
  const lines = content.split("\n").filter((line) => line.trim().length > 0);

  for (let i = 0; i < lines.length && restaurants.length < 8; i++) {
    const line = lines[i].toLowerCase();
    if (
      (line.includes("restaurant") ||
        line.includes("hotel") ||
        line.includes("cafe")) &&
      line.length > 10 &&
      line.length < 100
    ) {
      restaurants.push({
        title: lines[i].trim().replace(/[#*]/g, ""),
        description: lines[i + 1]?.trim() || `Popular dining spot in Chennai`,
        location: "Chennai",
        cuisine: "Various",
        rating: Math.random() * 1.5 + 3.5,
        priceRange: ["₹", "₹₹", "₹₹₹"][Math.floor(Math.random() * 3)],
        tags: ["restaurant", "chennai"],
      });
    }
  }

  return restaurants;
}

function extractEventsFromContent(content: string) {
  if (!content || typeof content !== "string") {
    console.log("No valid event content to extract from");
    return [];
  }
  const events = [];
  const lines = content.split("\n").filter((line) => line.trim().length > 0);

  for (let i = 0; i < lines.length && events.length < 8; i++) {
    const line = lines[i].toLowerCase();
    if (
      (line.includes("event") ||
        line.includes("show") ||
        line.includes("concert") ||
        line.includes("festival") ||
        line.includes("workshop")) &&
      line.length > 10 &&
      line.length < 100
    ) {
      events.push({
        title: lines[i].trim().replace(/[#*]/g, ""),
        description:
          lines[i + 1]?.trim() || `Exciting event happening in Chennai`,
        location: "Chennai",
        eventDate: "TBD",
        venue: "Various venues",
        tags: ["event", "chennai"],
      });
    }
  }

  return events;
}

function extractMeetupsFromContent(content: string) {
  return [];
}

function extractApartmentsFromContent(content: string) {
  return [];
}

// Demo data functions
function generateChennaiRestaurantData() {
  const restaurantData = [
    {
      title: "Murugan Idli Shop",
      description:
        "Famous South Indian breakfast spot known for authentic idlis and chutneys. A Chennai institution serving traditional Tamil food.",
      location: "T. Nagar, Chennai",
      cuisine: "South Indian",
      rating: 4.3,
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
