import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Challenge } from '../types';
import * as api from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { scale } from '../utils/responsiveness';

interface ChallengeSelectionProps {
  onSelectChallenge: (challenge: Omit<Challenge, 'elapsedTime' | 'timeInZone' | 'completed' | 'grade'>) => void;
  token: string;
}

export default function ChallengeSelectionScreen({ onSelectChallenge, token }: ChallengeSelectionProps) {
  const { theme, isDarkMode } = useTheme();
  const [challenges, setChallenges] = useState<Omit<Challenge, 'elapsedTime' | 'timeInZone' | 'completed' | 'grade'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const fetchedChallenges = await api.getChallenges(token);
      setChallenges(fetchedChallenges);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} min`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Choose Your Challenge</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Select an exercise simulation to test your cardiovascular control.
        </Text>
      </View>

      {challenges.map((challenge) => (
        <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardContent}>
            <Text style={[styles.challengeName, { color: theme.colors.text }]}>{challenge.name}</Text>
            <Text style={[styles.challengeDescription, { color: theme.colors.textSecondary }]}>{challenge.description}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.colors.primary }]}>🎯 Goal</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatDuration(challenge.goalDuration)} in zone</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.colors.primary }]}>⏱️ Total Time</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatDuration(challenge.totalDuration)}</Text>
              </View>
            </View>

            <View style={[
                styles.benefitBox, 
                { 
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                    borderLeftColor: theme.colors.primary 
                }
            ]}>
              <Text style={[styles.benefitTitle, { color: isDarkMode ? theme.colors.primary : '#1e40af' }]}>📚 Why this is a good challenge:</Text>
              <Text style={[styles.benefitText, { color: isDarkMode ? theme.colors.text : '#1e40af' }]}>{challenge.benefit}</Text>
            </View>

            <TouchableOpacity
              style={[styles.selectButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => onSelectChallenge(challenge)}
              activeOpacity={0.8}
            >
              <Text style={styles.selectButtonText}>Select Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: scale(16),
    paddingBottom: scale(32),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: scale(12),
    fontSize: scale(16),
  },
  header: {
    marginBottom: scale(24),
    alignItems: 'center',
  },
  title: {
    fontSize: scale(32),
    fontWeight: 'bold',
    marginBottom: scale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scale(18),
    textAlign: 'center',
    paddingHorizontal: scale(16),
  },
  challengeCard: {
    borderRadius: scale(12),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(8),
    elevation: 3,
  },
  cardContent: {
    padding: scale(20),
  },
  challengeName: {
    fontSize: scale(20),
    fontWeight: 'bold',
    marginBottom: scale(8),
  },
  challengeDescription: {
    fontSize: scale(14),
    marginBottom: scale(16),
    lineHeight: scale(20),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: scale(16),
    gap: scale(16),
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: scale(12),
    fontWeight: '600',
    marginBottom: scale(4),
  },
  infoValue: {
    fontSize: scale(13),
  },
  benefitBox: {
    borderLeftWidth: scale(4),
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: scale(16),
  },
  benefitTitle: {
    fontSize: scale(13),
    fontWeight: '600',
    marginBottom: scale(6),
  },
  benefitText: {
    fontSize: scale(13),
    lineHeight: scale(18),
  },
  selectButton: {
    paddingVertical: scale(14),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
});