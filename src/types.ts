import {
  Timestamp,
} from 'firebase/firestore';
import {
  User
} from 'firebase/auth';

export interface AuthState {
  user: null | User;
  loading: boolean;
};

export interface linkedinUser {
  displayName: string,
  email: string,
  jobTitle: string,
  industry: string,
  whoCanContact: string,
  bio: string,
  profilePic: string,
  linkedin: string,
  facebook: string,
  twitter: string,
  instagram: string,
  createdAt: Timestamp,
};

export interface FireState {
  user: null | User,
  linkedinUser: null | linkedinUser,
  linkedinUsers: linkedinUser[],
  messages: any[],
  ideas: any[]
};