export enum AppView {
  Marketplace = 'Marketplace',
  InfoHub = 'Info Hub',
  B2B = 'B2B Connect',
  FarmManager = 'Farm Manager',
  Community = 'Community',
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface CropPrice {
  name: string;
  price: number; // Price per quintal
}

export interface MarketInfo {
  id: number;
  name: string;
  type?: 'Mandi' | 'Wholesale Shop';
  address: string;
  city: string;
  state: string;
  phone: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  crops: CropPrice[];
}

export interface B2BContact {
    id: number;
    name: string;
    type: 'Supplier' | 'Wholesaler' | 'Expert';
    specialty: string;
    location: string;
    phone: string;
}

export interface FarmTask {
    id: number;
    text: string;
    completed: boolean;
}

export interface CommunityPost {
    id: number;
    author: string;
    avatarUrl: string;
    content: string;
    timestamp: string;
    isAI?: boolean;
}

export interface CropRecommendation {
    name: string;
    reason: string;
    cultivation_details: string;
}

export interface FarmConditions {
    city?: string;
    district?: string;
    state: string;
    soilType: string;
    rainfall: number;
    temperature: number;
}

export interface CartItem {
  market: MarketInfo;
  crop: CropPrice;
  quantity: number;
}