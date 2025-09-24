export const MOCK_FEED_DATA = [
  {
    id: '1',
    pulseId: 'restaurants',
    title: 'New Rooftop Cafe Opens in T. Nagar',
    description: 'Cloud Kitchen introduces "Sky Bites" - a rooftop dining experience with South Indian fusion cuisine and Chennai skyline views.',
    source: 'The Hindu',
    sourceUrl: 'https://thehindu.com',
    scrapedAt: Date.now() - 1000 * 60 * 30, // 30 min ago
    location: 'T. Nagar',
    tags: ['restaurants', 'rooftop', 'fusion'],
    pulseIcon: '🍽️',
    pulseColor: '#FF6B6B',
    timeAgo: '30 min ago'
  },
  {
    id: '2', 
    pulseId: 'events',
    title: 'Weekend Music Festival at Marina Beach',
    description: 'Tamil indie bands and classical fusion artists will perform this Saturday. Free entry, food stalls available.',
    source: 'Chennai Live',
    sourceUrl: 'https://chennailive.com',
    scrapedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    location: 'Marina Beach',
    tags: ['music', 'festival', 'free'],
    pulseIcon: '🎉',
    pulseColor: '#4ECDC4',
    timeAgo: '2 hours ago'
  },
  {
    id: '3',
    pulseId: 'tech-meetups',
    title: 'React Native Meetup - Building Local Apps',
    description: 'Join fellow developers to discuss React Native best practices, with special focus on location-based apps. Snacks provided.',
    source: 'Meetup.com',
    sourceUrl: 'https://meetup.com',
    scrapedAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    location: 'Tidel Park',
    tags: ['react-native', 'developers', 'networking'],
    pulseIcon: '💻',
    pulseColor: '#FFEAA7',
    timeAgo: '4 hours ago'
  },
  {
    id: '4',
    pulseId: 'local-news',
    title: 'Metro Phase 2 Construction Update',
    description: 'New OMR extension timeline announced. Expected completion by 2026, will connect Sholinganallur to Airport.',
    source: 'Times of India',
    sourceUrl: 'https://timesofindia.com',
    scrapedAt: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    location: 'OMR',
    tags: ['metro', 'transportation', 'infrastructure'],
    pulseIcon: '📰',
    pulseColor: '#45B7D1',
    timeAgo: '6 hours ago'
  },
  {
    id: '5',
    pulseId: 'apartments',
    title: '2BHK Available in Adyar - Great Deal',
    description: 'Newly renovated apartment near Adyar signal. Parking included, pet-friendly. Contact for viewing.',
    source: '99acres',
    sourceUrl: 'https://99acres.com',
    scrapedAt: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    location: 'Adyar',
    tags: ['2bhk', 'parking', 'pet-friendly'],
    pulseIcon: '🏠',
    pulseColor: '#96CEB4',
    timeAgo: '8 hours ago'
  }
];
