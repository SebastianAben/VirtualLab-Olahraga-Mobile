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
import { useTheme } from '../theme/ThemeContext';
import { scale } from '../utils/responsiveness';

interface ResultsScreenProps {
  challenge: Challenge;
  token: string;
  onBackToSelection: () => void;
  onTryAgain: () => void;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string; darkBg: string }> = {
  A: { bg: '#fef3c7', darkBg: 'rgba(245, 158, 11, 0.2)', text: '#d97706', border: '#f59e0b' },
  B: { bg: '#dbeafe', darkBg: 'rgba(59, 130, 246, 0.2)', text: '#1d4ed8', border: '#3b82f6' },
  C: { bg: '#e0e7ff', darkBg: 'rgba(99, 102, 241, 0.2)', text: '#4338ca', border: '#6366f1' },
  D: { bg: '#fed7aa', darkBg: 'rgba(249, 115, 22, 0.2)', text: '#c2410c', border: '#ea580c' },
  F: { bg: '#fee2e2', darkBg: 'rgba(239, 68, 68, 0.2)', text: '#b91c1c', border: '#ef4444' },
};

export default function ResultsScreen({
  challenge,
  token,
  onBackToSelection,
  onTryAgain,
}: ResultsScreenProps) {
  const { theme, isDarkMode } = useTheme();
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading results...</Text>
      </View>
    );
  }

  const grade = challenge.grade || 'F';
  const gradeConfig = GRADE_COLORS[grade] || GRADE_COLORS.F;
  const gradeBg = isDarkMode ? gradeConfig.darkBg : gradeConfig.bg;
  const gradeTextColor = isDarkMode ? gradeConfig.border : gradeConfig.text; 

  const insight = gradeInsights?.[grade];
  const percentage = Math.min((challenge.timeInZone / challenge.goalDuration) * 100, 100).toFixed(1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.gradeCard, { backgroundColor: gradeBg, borderColor: gradeConfig.border }]}>
        <Text style={[styles.gradeLabel, { color: gradeTextColor }]}>Your Grade</Text>
        <Text style={[styles.gradeValue, { color: gradeTextColor }]}>{grade}</Text>
        {insight && (
          <Text style={[styles.gradeTitle, { color: gradeTextColor }]}>{insight.title}</Text>
        )}
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.text }]}>Performance Summary</Text>
        
        <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Challenge:</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{challenge.name}</Text>
        </View>

        <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Time in Zone:</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatTime(challenge.timeInZone)} / {formatTime(challenge.goalDuration)}
          </Text>
        </View>

        <View style={[styles.statRow, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Percentage:</Text>
          <Text style={[styles.statValue, styles.statHighlight, { color: theme.colors.primary }]}>{percentage}%</Text>
        </View>

        <View style={[styles.statRow, { borderBottomColor: 'transparent' }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Time:</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{formatTime(challenge.elapsedTime)}</Text>
        </View>
      </View>

      {insight && (
        <>
          <View style={[styles.feedbackCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.feedbackTitle, { color: theme.colors.text }]}>📝 Feedback</Text>
            <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>{insight.feedback}</Text>
          </View>

          <View style={[styles.feedbackCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.feedbackTitle, { color: theme.colors.text }]}>💡 How to Improve</Text>
            <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>{insight.improvement}</Text>
          </View>

          <View style={[styles.feedbackCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.feedbackTitle, { color: theme.colors.text }]}>🏥 Health Impact</Text>
            <Text style={[styles.feedbackText, { color: theme.colors.textSecondary }]}>{insight.impact}</Text>
          </View>
        </>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.success }, (saved || saving) && styles.saveButtonDisabled]}
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
          style={[styles.tryAgainButton, { backgroundColor: theme.colors.warning }]}
          onPress={onTryAgain}
          activeOpacity={0.8}
        >
          <Text style={styles.tryAgainButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.textSecondary }]}
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
  gradeCard: {
    borderRadius: scale(16),
    borderWidth: scale(3),
    padding: scale(32),
    marginBottom: scale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  gradeLabel: {
    fontSize: scale(18),
    fontWeight: '600',
    marginBottom: scale(8),
  },
  gradeValue: {
    fontSize: scale(80),
    fontWeight: 'bold',
    marginBottom: scale(8),
  },
  gradeTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsCard: {
    borderRadius: scale(12),
    padding: scale(20),
    marginBottom: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    marginBottom: scale(16),
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: scale(10),
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: scale(15),
    fontWeight: '500',
  },
  statValue: {
    fontSize: scale(15),
    fontWeight: '600',
  },
  statHighlight: {
    fontSize: scale(16),
  },
  feedbackCard: {
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    marginBottom: scale(8),
  },
  feedbackText: {
    fontSize: scale(14),
    lineHeight: scale(22),
  },
  actionButtons: {
    marginTop: scale(8),
    gap: scale(12),
  },
  saveButton: {
    paddingVertical: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  tryAgainButton: {
    paddingVertical: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  tryAgainButtonText: {
    color: '#ffffff',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: scale(14),
    borderRadius: scale(8),
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: scale(16),
    fontWeight: '600',
  },
});
