import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChallengeSelectionScreen from './src/screens/ChallengeSelectionScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { Challenge } from './src/types';
import * as api from './src/services/api';

const Tab = createBottomTabNavigator();

type AppView = 'challenges' | 'simulation' | 'results' | 'login';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await api.getToken();
      const storedEmail = await api.getUserEmail();
      
      if (storedToken && storedEmail) {
        setToken(storedToken);
        setUserEmail(storedEmail);
        setCurrentView('challenges');
      } else {
        setCurrentView('login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setCurrentView('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, userToken: string) => {
    setToken(userToken);
    setUserEmail(email);
    await api.storeToken(userToken);
    await api.storeUserEmail(email);
    setCurrentView('challenges');
  };

  const handleLogout = async () => {
    await api.removeToken();
    await api.removeUserEmail();
    setToken(null);
    setUserEmail(null);
    setCurrentView('login');
  };

  const handleSelectChallenge = (challenge: Omit<Challenge, 'elapsedTime' | 'timeInZone' | 'completed' | 'grade'>) => {
    setSelectedChallenge({
      ...challenge,
      elapsedTime: 0,
      timeInZone: 0,
      completed: false,
      grade: null,
    });
    setCurrentView('simulation');
  };

  const handleSimulationComplete = (completedChallenge: Challenge) => {
    setSelectedChallenge(completedChallenge);
    setCurrentView('results');
  };

  const handleBackToSelection = () => {
    setSelectedChallenge(null);
    setCurrentView('challenges');
  };

  const handleTryAgain = () => {
    if (selectedChallenge) {
      setSelectedChallenge({
        ...selectedChallenge,
        elapsedTime: 0,
        timeInZone: 0,
        completed: false,
        grade: null,
      });
      setCurrentView('simulation');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Temporary Login Screen (your friend will replace this)
  if (currentView === 'login') {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Virtual Sports Lab</Text>
        <Text style={styles.loginSubtitle}>Mobile Version</Text>
        <Text style={styles.loginNote}>
          🚧 Login screen will be implemented by your teammate
        </Text>
        <Text style={styles.loginInstruction}>
          Note: Make sure backend is running on http://localhost:5000
        </Text>
        <Text
          style={styles.loginButton}
          onPress={async () => {
            try {
              // Use real backend signup/signin
              const result = await api.signIn('demo@example.com', 'demo123');
              handleLogin('demo@example.com', result.token);
            } catch (error) {
              // If demo user doesn't exist, create it
              try {
                const result = await api.signUp('demo@example.com', 'demo123');
                handleLogin('demo@example.com', result.token);
              } catch (signupError) {
                console.error('Login failed:', signupError);
                alert('Backend not running! Start backend first: cd backend && npm start');
              }
            }
          }}
        >
          Continue as Demo User
        </Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  // Main App Navigation
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Combined Header with Navigation */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Virtual Sports Lab</Text>
            {userEmail && <Text style={styles.headerEmail}>{userEmail}</Text>}
          </View>
          <Text style={styles.logoutButton} onPress={handleLogout}>
            Logout
          </Text>
        </View>
        
        {/* Navigation Tabs */}
        <View style={styles.tabNav}>
          <Text
            style={[styles.tabButton, currentView === 'challenges' && styles.tabButtonActive]}
            onPress={handleBackToSelection}
          >
            🎯 Challenges
          </Text>
          <Text style={styles.tabButton}>
            📚 Learning
          </Text>
          <Text style={styles.tabButton}>
            📊 History
          </Text>
          <Text style={styles.tabButton}>
            👤 Profile
          </Text>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {currentView === 'challenges' && token && (
          <ChallengeSelectionScreen
            onSelectChallenge={handleSelectChallenge}
            token={token}
          />
        )}

        {currentView === 'simulation' && selectedChallenge && token && (
          <SimulationScreen
            challenge={selectedChallenge}
            token={token}
            onComplete={handleSimulationComplete}
            onBackToSelection={handleBackToSelection}
          />
        )}

        {currentView === 'results' && selectedChallenge && token && (
          <ResultsScreen
            challenge={selectedChallenge}
            token={token}
            onBackToSelection={handleBackToSelection}
            onTryAgain={handleTryAgain}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 40,
  },
  loginNote: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginInstruction: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingTop: 40,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerEmail: {
    fontSize: 12,
    color: '#dbeafe',
  },
  logoutButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#2563eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tabNav: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 13,
    color: '#dbeafe',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
