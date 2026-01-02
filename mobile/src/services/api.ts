import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import { Challenge, SimulationResult } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const signUp = async (email: string, password: string) => {
  const response = await api.post('/api/auth/signup', { email, password });
  return response.data;
};

export const signIn = async (email: string, password: string) => {
  const response = await api.post('/api/auth/signin', { email, password });
  return response.data;
};

// Challenges
export const getChallenges = async (token: string): Promise<Omit<Challenge, 'elapsedTime' | 'timeInZone' | 'completed' | 'grade'>[]> => {
  const response = await api.get('/api/challenges', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Results
export const saveResult = async (
  challenge: string,
  timeAchieved: number,
  grade: string,
  token: string
) => {
  const response = await api.post(
    '/api/results',
    { challenge, timeAchieved, grade },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getResults = async (token: string): Promise<SimulationResult[]> => {
  const response = await api.get('/api/results', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Grade Insights
export const getGradeInsights = async (token: string) => {
  const response = await api.get('/api/grade-insights', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Token Management
export const storeToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('token');
};

export const storeUserEmail = async (email: string) => {
  await AsyncStorage.setItem('userEmail', email);
};

export const getUserEmail = async () => {
  return await AsyncStorage.getItem('userEmail');
};

export const removeUserEmail = async () => {
  await AsyncStorage.removeItem('userEmail');
};
