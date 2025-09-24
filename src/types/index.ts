// Core pulse types for Chennai discovery
export interface PulseType {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  color: string; // hex color
  preview: string; // example content users will see
  category: 'food' | 'events' | 'news' | 'housing' | 'tech';
}

// User's pulse preferences stored in Convex
export interface UserPulsePreferences {
  userId: string;
  selectedPulses: string[]; // array of pulse IDs
  onboardingCompleted: boolean;
  createdAt: number; // timestamp
  updatedAt: number;
}

// Individual content items that will appear in the feed
export interface PulseContent {
  id: string;
  pulseId: string; // which pulse this belongs to
  title: string;
  description: string;
  source: string; // website name
  sourceUrl: string;
  scrapedAt: number; // timestamp
  embeddings?: number[]; // for RAG later
  location?: string; // Chennai area if relevant
  tags: string[];
}

// User's saved collections
export interface Collection {
  id: string;
  userId: string;
  name: string; // "Restaurants to Try", "Articles to Read"
  description?: string;
  items: string[]; // array of PulseContent IDs
  createdAt: number;
  updatedAt: number;
}

// User profile
export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: UserPulsePreferences;
  collections: string[]; // array of Collection IDs
  createdAt: number;
}
