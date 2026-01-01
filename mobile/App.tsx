import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import ChallengeSelectionScreen from './src/screens/ChallengeSelectionScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import { Challenge } from './src/types';
import * as api from './src/services/api';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { scale } from './src/utils/responsiveness';

type AppView = 'challenges' | 'simulation' | 'results' | 'login';

function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme Hook
  const { theme, toggleTheme, isDarkMode } = useTheme();

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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  // Temporary Login Screen
  if (currentView === 'login') {
    return (
      <View style={[styles.loginContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loginTitle, { color: theme.colors.text }]}>Virtual Sports Lab</Text>
        <Text style={[styles.loginSubtitle, { color: theme.colors.textSecondary }]}>Mobile Version</Text>
        <Text style={styles.loginNote}>
          🚧 Login screen will be implemented by your teammate
        </Text>
        <Text style={[styles.loginInstruction, { color: theme.colors.textSecondary }]}>
          Note: Make sure backend is running on http://localhost:5000
        </Text>
        <Text
          style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
          onPress={async () => {
            try {
              const result = await api.signIn('demo@example.com', 'demo123');
              handleLogin('demo@example.com', result.token);
            } catch (error) {
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
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </View>
    );
  }

  // Main App Navigation
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'light'} />
      
      {/* Navbar with Dynamic Colors */}
      <View style={[styles.navbar, { backgroundColor: theme.colors.navbar, borderBottomWidth: isDarkMode ? 1 : 0, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={handleBackToSelection}>
             <Text style={[styles.navText, styles.navTitle, { color: isDarkMode ? theme.colors.text : '#ffffff' }]}>Virtual Sport Lab</Text>
        </TouchableOpacity>
        
        <View style={styles.navRight}>
            {/* Theme Toggle Button */}
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text style={[styles.navText, { color: isDarkMode ? theme.colors.textSecondary : '#dbeafe' }]}>Learning</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navRightSpacing} onPress={() => console.log('Profile clicked')} onLongPress={handleLogout}>
                <Text style={[styles.navIcon, { color: isDarkMode ? theme.colors.text : '#ffffff' }]}>👤</Text>
            </TouchableOpacity>
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

// Root App Component
export default function App() {
    return (
        <ThemeProvider>
            <MainApp />
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 18,
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
    marginBottom: 24,
  },
  loginButton: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    overflow: 'hidden',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: scale(40),
    paddingBottom: scale(20),
    paddingHorizontal: 20,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navRightSpacing: {
    marginLeft: 20,
  },
  themeToggle: {
    marginRight: 20,
    padding: 4,
  },
  navTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
});