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

interface ChallengeSelectionProps {
  onSelectChallenge: (challenge: Omit<Challenge, 'elapsedTime' | 'timeInZone' | 'completed' | 'grade'>) => void;
  token: string;
}

export default function ChallengeSelectionScreen({ onSelectChallenge, token }: ChallengeSelectionProps) {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Challenge</Text>
        <Text style={styles.subtitle}>
          Select an exercise simulation to test your cardiovascular control.
        </Text>
      </View>

      {challenges.map((challenge) => (
        <View key={challenge.id} style={styles.challengeCard}>
          <View style={styles.cardContent}>
            <Text style={styles.challengeName}>{challenge.name}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>🎯 Goal</Text>
                <Text style={styles.infoValue}>{formatDuration(challenge.goalDuration)} in zone</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>⏱️ Total Time</Text>
                <Text style={styles.infoValue}>{formatDuration(challenge.totalDuration)}</Text>
              </View>
            </View>

            <View style={styles.benefitBox}>
              <Text style={styles.benefitTitle}>📚 Why this is a good challenge:</Text>
              <Text style={styles.benefitText}>{challenge.benefit}</Text>
            </View>

            <TouchableOpacity
              style={styles.selectButton}
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
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
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
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  challengeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
  },
  challengeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#4b5563',
  },
  benefitBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
