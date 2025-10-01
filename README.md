# LocalPulse

**Discover places and events in your area, refreshed in real-time.**

Free on the weekends? Bored? or wanna try new restaurants? try LocalPulse, it is a mobile app that helps you stay connected to your local community by surfacing fresh events, restaurants, news, apartment listings, and tech meetups—all through intelligent web scraping and AI-powered recommendations. Choose from 4 different metro cities in India, coming to your local area very soon!

Built for the [Modern Stack Hackathon](https://www.convex.dev/hackathons/modernstack) by Convex.
  
📺 **Video Demo**: [DEMO_VIDEO](https://drive.google.com/file/d/1G33ZV9kuorI6Iz-cxLICef13q0nljno5/view?usp=sharing)

***

## ✨ Features

- **Pull-to-Refresh Discovery**: Swipe down to trigger Firecrawl and fetch the latest local events, news, and places
- **AI-Powered Recommendations**: Leverages OpenAI's GPT-OSS 120B model via Groq for intelligent event curation and personalized suggestions
- **Multiple Categories**: Browse local news, restaurants, weekend events, apartment hunts, and tech events—all in one place
- **Share with Friends**: Send curated events directly to friends via email using Resend integration
- **Real-time Updates**: Powered by Convex for instant synchronization across devices
- **Secure Authentication**: Email/password auth with Better Auth

***

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Expo** | Cross-platform mobile framework (React Native) |
| **Convex** | Real-time backend database and API |
| **Better Auth** | Secure email/password authentication |
| **Firecrawl** | Web scraping for discovering local events and places |
| **Groq** | Fast inference for OpenAI GPT-OSS 120B model |
| **Resend** | Transactional email service for sharing events |

***

## 🏆 Hackathon Integration Highlights

### OpenAI (via Groq)

Uses OpenAI's open-weight **GPT-OSS 120B** model through Groq's ultra-fast inference platform for intelligent event recommendations, content summarization, and personalized local discovery.

### Firecrawl

Implements dynamic web scraping triggered by user pull-to-refresh actions, searching for fresh local content including events, restaurants, news, and apartment listings across multiple sources.

### Convex

Serves as the real-time backend infrastructure, storing scraped events, user preferences, and providing instant synchronization across all connected devices.

### Better Auth

Provides secure, privacy-focused authentication with email/password flows, managing user sessions and protecting user data.

### Resend

Powers the "Share with Friends" feature, sending beautifully formatted emails with event details and personalized recommendations.

***

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```
# Clone the repository
git clone https://github.com/RitamPal26/localpulse.git
cd localpulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys for Convex, Firecrawl, Groq, Better Auth, and Resend

# Start the development server
npx expo start

# Start the convex backend
npx convex dev
```

### Environment Variables

Create a `.env` file with the following keys:

```
CONVEX_DEPLOYMENT=your_convex_deployment
EXPO_PUBLIC_CONVEX_URL=your_convex_url
EXPO_PUBLIC_BETTER_AUTH_URL=your_convex_better-auth_url
GROQ_API_KEY=your_groq_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
BETTER_AUTH_SECRET=your_better_auth_secret
RESEND_API_KEY=your_resend_api_key
```

***

## 📱 How It Works

1. **Authentication**: Users sign up/login with email and password via Better Auth
2. **Location-Based Discovery**: Currently, top four Indian cities are there, Chennai, Delhi, Mumbai, Bangalore
3. **Pull-to-Refresh**: User swipes down to trigger Firecrawl scraping for fresh local content
4. **AI Curation**: GPT-OSS 120B analyzes scraped content and surfaces relevant, personalized recommendations
5. **Real-time Sync**: Convex updates the feed across all devices instantly
6. **Share**: Users can email events to friends using Resend integration

***

***

## 📸 Screenshots

<div>
  <img src="https://github.com/user-attachments/assets/0fda6b41-c004-4964-a90d-29ccfb07791d" alt="Homepage" width="250">
  <img src="https://github.com/user-attachments/assets/b824c8a9-ed03-498b-863d-4d97b0304a4d" alt="Events" width="250">
</div>

<div>
  <img src="https://github.com/user-attachments/assets/a7c45cde-67fc-4773-a4ec-ae697de852ee" alt="Login" width="250">
  <img src="https://github.com/user-attachments/assets/4cb80ff5-4050-46bf-ab88-fa6bdc974c3f" alt="Categories" width="250">
</div>

***

## 🎯 What Makes LocalPulse Unique?

Unlike generic event platforms or map apps, LocalPulse:

- **Always Fresh**: Pull-to-refresh scraping ensures you see the latest happenings
- **AI-Curated**: Not just a list—intelligent recommendations tailored to your interests
- **All-in-One**: Events, dining, news, apartments, and tech meetups in a single feed
- **Privacy-First**: Your data stays yours with Better Auth's secure implementation

***

## 🔮 Future Additions

### Expanding Beyond 4 Cities

Currently, LocalPulse supports **Chennai, Delhi, Bangalore, and Mumbai**. The next major feature will enable **custom city selection**, allowing users to:

- **Type their own city**: Search and select from a global database of cities and towns
- **Automatic location detection**: Option to auto-detect user's current city using GPS
- **Multi-city following**: Save and switch between multiple cities (e.g., home city + frequently visited locations)
- **Regional customization**: Tailored scraping sources based on each city's popular local news sites, event platforms, and community forums
- **Crowd-sourced sources**: Allow users to submit local websites/sources for their cities, expanding coverage organically

This expansion will transform LocalPulse from a metro-focused app into a **truly global local discovery platform**, making it useful for users anywhere—from small towns to major metropolitan areas.

### Additional Planned Features

- **Personalized feeds**: AI learns user preferences over time to surface more relevant events
- **Event reminders**: Push notifications for saved events
- **Community reviews**: Users can rate and review local places/events
- **Collaborative lists**: Share curated event collections with friend groups
- **Offline mode**: Cache recent events for viewing without internet connection
- **Advanced filters**: Filter by date range, price, distance, and category preferences

***

## 🙏 Acknowledgments

Built with amazing tools from:

- [Convex](https://www.convex.dev/) - Modern Stack Hackathon Host
- [OpenAI](https://openai.com/) - GPT-OSS Models
- [Groq](https://groq.com/) - Lightning-fast inference
- [Firecrawl](https://www.firecrawl.dev/) - Web scraping infrastructure
- [Better Auth](https://www.better-auth.com/) - Authentication solution
- [Resend](https://resend.com/) - Email infrastructure

***

**Made with ❤️ for the Modern Stack Hackathon**
