import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Animated } from 'react-native';
import AuthScreen from './src/screens/AuthScreen';
import ChallengeSelectionScreen from './src/screens/ChallengeSelectionScreen';
import SimulationScreen from './src/screens/SimulationScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import LearningCenterScreen from './src/screens/LearningCenterScreen';
import LearningChapterDetailScreen from './src/screens/LearningChapterDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { Challenge, LearningChapter } from './src/types';
import { learningChapters } from './src/data/learningChapters';
import * as api from './src/services/api';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { scale } from './src/utils/responsiveness';

type AppView = 'challenges' | 'simulation' | 'results' | 'login' | 'learning' | 'learningDetail' | 'profile';

function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme Hook
  const { theme, toggleTheme, isDarkMode } = useTheme();
  
  // Theme Transition Animation (0 = Light, 1 = Dark)
  const themeAnim = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(themeAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300, // Smooth transition duration
      useNativeDriver: false, // Color interpolation doesn't support native driver
    }).start();
  }, [isDarkMode]);

  // Interpolate background color
  const interpolatedBackgroundColor = themeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f1f5f9', '#0f172a'], // Matching ThemeContext colors
  });

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

  const handleNavigateToLearning = () => {
    setCurrentView('learning');
  };

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setCurrentView('learningDetail');
  };

  const handleBackFromChapter = () => {
    setCurrentView('learning');
  };

  const handleNavigateToProfile = () => {
    setCurrentView('profile');
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
        <AuthScreen onLoginSuccess={handleLogin} />
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </View>
    );
  }

  const selectedChapter = selectedChapterId ? learningChapters.find(c => c.id === selectedChapterId) : null;

  // Main App Navigation
  return (
    <Animated.View style={[styles.container, { backgroundColor: interpolatedBackgroundColor }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      
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

            {/* Dynamic Navigation Button */}
            {(currentView === 'learning' || currentView === 'learningDetail') ? (
              <TouchableOpacity onPress={handleBackToSelection}>
                  <Text style={[styles.navText, { color: isDarkMode ? theme.colors.textSecondary : '#dbeafe' }]}>Virtual Lab</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleNavigateToLearning}>
                  <Text style={[styles.navText, { color: isDarkMode ? theme.colors.textSecondary : '#dbeafe' }]}>Learning</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.navRightSpacing} onPress={handleNavigateToProfile} onLongPress={handleLogout}>
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

        {currentView === 'learning' && (
          <LearningCenterScreen 
            chapters={learningChapters}
            onSelectChapter={handleSelectChapter}
          />
        )}

        {currentView === 'learningDetail' && selectedChapter && (
          <LearningChapterDetailScreen 
            chapter={selectedChapter}
            onBack={handleBackFromChapter}
          />
        )}

        {currentView === 'profile' && userEmail && (
          <ProfileScreen
            userEmail={userEmail}
            onBack={handleBackToSelection}
            onLogout={handleLogout}
          />
        )}
      </View>
    </Animated.View>
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