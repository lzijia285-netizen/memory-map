export type Visibility = "Only Me" | "Friends";

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  eventTime: string;
  createdAt: string;
  location: Location;
  photos: string[];
  mood: string;
  moodLabel: string;
  visibility: Visibility;
  tags: string[];
  people: string[];
  user: User;
  likes?: number;
}
