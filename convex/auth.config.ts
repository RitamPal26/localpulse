export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
  // Add CORS configuration for Expo web
  trustedOrigins: [
    "http://localhost:8081", // Your Expo web development server
    "https://your-production-domain.com" // Add your production domain
  ],
};
