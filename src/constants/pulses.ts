import { PulseType } from '../types';

export const AVAILABLE_PULSES: PulseType[] = [
  {
    id: 'restaurants',
    name: 'New Restaurants',
    description: 'Fresh dining spots, hidden gems & food reviews',
    icon: '🍽️',
    color: '#FF6B6B',
    preview: 'New rooftop cafe in T. Nagar with coastal vibes...',
    category: 'food'
  },
  {
    id: 'events',
    name: 'Weekend Events',
    description: 'Concerts, markets, festivals & local happenings',
    icon: '🎉',
    color: '#4ECDC4',
    preview: 'Art exhibition at DakshinaChitra this weekend...',
    category: 'events'
  },
  {
    id: 'local-news',
    name: 'Local News',
    description: 'Chennai city updates, infrastructure & community news',
    icon: '📰',
    color: '#45B7D1',
    preview: 'New metro line extension approved for OMR...',
    category: 'news'
  },
  {
    id: 'apartments',
    name: 'Apartment Hunt',
    description: 'New listings, rental deals & housing updates',
    icon: '🏠',
    color: '#96CEB4',
    preview: '2BHK in Adyar with parking, ₹25k/month...',
    category: 'housing'
  },
  {
    id: 'tech-meetups',
    name: 'Tech Meetups',
    description: 'Developer events, startup news & tech community',
    icon: '💻',
    color: '#FFEAA7',
    preview: 'React meetup at Tidel Park next Saturday...',
    category: 'tech'
  }
];

// Helper functions
export const getPulseById = (id: string): PulseType | undefined => {
  return AVAILABLE_PULSES.find(pulse => pulse.id === id);
};

export const getPulsesByCategory = (category: PulseType['category']): PulseType[] => {
  return AVAILABLE_PULSES.filter(pulse => pulse.category === category);
};
