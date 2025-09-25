"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

export const geocodeAddress = action({
  args: { address: v.string() },
  handler: async (ctx, { address }) => {
    try {
      const query = encodeURIComponent(
        `${address}, Chennai, Tamil Nadu, India`
      );
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          success: true,
          coordinates: {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          },
          formattedAddress: data[0].display_name,
        };
      }

      return {
        success: false,
        error: "No coordinates found",
        coordinates: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        coordinates: null,
      };
    }
  },
});
