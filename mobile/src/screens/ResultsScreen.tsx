import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Challenge, GradeInsight } from '../types';
import * as api from '../services/api';

interface ResultsScreenProps {
  challenge: Challenge;
  token: string;
  onBackToSelection: () => void;
  onTryAgain: () => void;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  B: { bg: '#dbeafe', text: '#1e3a8a', border: '#3b82f6' },
  C: { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' },
  D: { bg: '#fed7aa', text: '#9a3412', border: '#ea580c' },
  F: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
};

export default function ResultsScreen({
  challenge,
  token,
  onBackToSelection,
  onTryAgain,
}: ResultsScreenProps) {
  const [gradeInsights, setGradeInsights] = useState<Record<string, GradeInsight> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchGradeInsights();
  }, []);

  const fetchGradeInsights = async () => {
    try {
      const insights = await api.getGradeInsights(token);
      setGradeInsights(insights);
    } catch (error) {
      console.error('Failed to fetch grade insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!challenge.grade || saved) return;

    setSaving(true);
    try {
      await api.saveResult(
        challenge.id,
        challenge.timeInZone,
        challenge.grade,
        token
      );
      setSaved(true);
      Alert.alert('Success', 'Your result has been saved!', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Failed to save result:', error);
      Alert.alert('Error', 'Failed to save result. Please try again.', [{ text: 'OK' }]);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  const grade = challenge.grade || 'F';
  const gradeColor = GRADE_COLORS[grade] || GRADE_COLORS.F;
  const insight = gradeInsights?.[grade];
  const percentage = ((challenge.timeInZone / challenge.goalDuration) * 100).toFixed(1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Grade Display */}
      <View style={[styles.gradeCard, { backgroundColor: gradeColor.bg, borderColor: gradeColor.border }]}>
        <Text style={[styles.gradeLabel, { color: gradeColor.text }]}>Your Grade</Text>
        <Text style={[styles.gradeValue, { color: gradeColor.text }]}>{grade}</Text>
        {insight && (
          <Text style={[styles.gradeTitle, { color: gradeColor.text }]}>{insight.title}</Text>
        )}
      </View>

      {/* Performance Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Performance Summary</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Challenge:</Text>
          <Text style={styles.statValue}>{challenge.name}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Time in Zone:</Text>
          <Text style={styles.statValue}>
            {formatTime(challenge.timeInZone)} / {formatTime(challenge.goalDuration)}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Percentage:</Text>
          <Text style={[styles.statValue, styles.statHighlight]}>{percentage}%</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Time:</Text>
          <Text style={styles.statValue}>{formatTime(challenge.elapsedTime)}</Text>
        </View>
      </View>

      {/* Feedback Section */}
      {insight && (
        <>
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>📝 Feedback</Text>
            <Text style={styles.feedbackText}>{insight.feedback}</Text>
          </View>

          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>💡 How to Improve</Text>
            <Text style={styles.feedbackText}>{insight.improvement}</Text>
          </View>

          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>🏥 Health Impact</Text>
            <Text style={styles.feedbackText}>{insight.impact}</Text>
          </View>
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.saveButton, (saved || saving) && styles.saveButtonDisabled]}
          onPress={handleSaveResult}
          disabled={saved || saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {saved ? '✓ Result Saved' : '💾 Save Result'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tryAgainButton}
          onPress={onTryAgain}
          activeOpacity={0.8}
        >
          <Text style={styles.tryAgainButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackToSelection}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back to Challenges</Text>
        </TouchableOpacity>
      </View>
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
  gradeCard: {
    borderRadius: 16,
    borderWidth: 3,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  gradeLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  gradeValue: {
    fontSize: 80,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '600',
  },
  statHighlight: {
    color: '#3b82f6',
    fontSize: 16,
  },
  feedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  actionButtons: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tryAgainButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tryAgainButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
