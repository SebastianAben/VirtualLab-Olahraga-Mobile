import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SimulationResult } from '../types';
import * as api from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { scale } from '../utils/responsiveness';

interface ProfileScreenProps {
  userEmail: string;
  onBack: () => void;
  onLogout: () => void;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  B: { bg: '#dbeafe', text: '#1e3a8a', border: '#3b82f6' },
  C: { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' },
  D: { bg: '#fed7aa', text: '#9a3412', border: '#ea580c' },
  F: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
};

export default function ProfileScreen({ userEmail, onBack, onLogout }: ProfileScreenProps) {
  const { theme, isDarkMode } = useTheme();
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = await api.getToken();
      if (token) {
        const fetchedResults = await api.getResults(token);
        setResults(fetchedResults);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const sortedResults = [...results].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const averageGrade = results.length > 0
    ? results.reduce((sum, r) => {
        const gradePoints: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
        return sum + (gradePoints[r.grade] || 0);
      }, 0) / results.length
    : 0;

  const gradeFromPoints = (points: number): string => {
    if (points >= 3.5) return 'A';
    if (points >= 2.5) return 'B';
    if (points >= 1.5) return 'C';
    if (points >= 0.5) return 'D';
    return 'F';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back to Lab</Text>
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🏆</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>My Profile</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>👤</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Email</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{userEmail}</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>🏅</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Challenges</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{results.length}</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : '#faf5ff' }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>⭐</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avg Grade</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {results.length > 0 ? gradeFromPoints(averageGrade) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.header}>
            <Text style={styles.headerIcon}>📅</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Challenge History</Text>
          </View>

          {sortedResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No challenges completed yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
                Complete challenges in the lab to see your results here!
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {sortedResults.map((result, index) => {
                const gradeColor = GRADE_COLORS[result.grade] || GRADE_COLORS.F;
                return (
                  <View key={index} style={[styles.historyItem, { borderColor: theme.colors.border }]}>
                    <View style={styles.historyContent}>
                      <Text style={[styles.historyTitle, { color: theme.colors.text }]}>{result.challenge}</Text>
                      <View style={styles.historyMeta}>
                        <Text style={[styles.historyText, { color: theme.colors.textSecondary }]}>
                          Time: {result.timeAchieved.toFixed(1)}s
                        </Text>
                        <Text style={[styles.historyDivider, { color: theme.colors.textSecondary }]}>|</Text>
                        <Text style={[styles.historyText, { color: theme.colors.textSecondary }]}>
                          {formatDate(result.timestamp)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.gradeBadge, { backgroundColor: gradeColor.bg, borderColor: gradeColor.border }]}>
                      <Text style={[styles.gradeText, { color: gradeColor.text }]}>{result.grade}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity onPress={handleLogoutPress} style={[styles.logoutButton, { backgroundColor: theme.colors.danger }]}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutConfirm}
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Log Out</Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={cancelLogout}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.danger }]}
                onPress={confirmLogout}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: scale(16),
    paddingBottom: scale(40),
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
  backButton: {
    marginBottom: scale(16),
    paddingVertical: scale(8),
  },
  backText: {
    fontSize: scale(14),
    fontWeight: '600',
  },
  card: {
    borderRadius: scale(12),
    padding: scale(20),
    marginBottom: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(20),
    gap: scale(8),
  },
  headerIcon: {
    fontSize: scale(24),
  },
  title: {
    fontSize: scale(20),
    fontWeight: 'bold',
  },
  statsGrid: {
    gap: scale(12),
  },
  statBox: {
    borderRadius: scale(12),
    padding: scale(16),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(8),
    gap: scale(8),
  },
  statIcon: {
    fontSize: scale(16),
  },
  statLabel: {
    fontSize: scale(14),
    fontWeight: '600',
  },
  statValue: {
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: scale(32),
  },
  emptyIcon: {
    fontSize: scale(48),
    marginBottom: scale(16),
    opacity: 0.5,
  },
  emptyText: {
    fontSize: scale(16),
    fontWeight: '500',
    marginBottom: scale(8),
  },
  emptySubtext: {
    fontSize: scale(14),
    textAlign: 'center',
    opacity: 0.8,
  },
  historyList: {
    gap: scale(12),
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  historyContent: {
    flex: 1,
    marginRight: scale(12),
  },
  historyTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    marginBottom: scale(4),
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  historyText: {
    fontSize: scale(12),
  },
  historyDivider: {
    fontSize: scale(12),
  },
  gradeBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(8),
    borderWidth: 1,
  },
  gradeText: {
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
    marginTop: scale(20),
    marginBottom: scale(20),
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContent: {
    width: '100%',
    maxWidth: scale(320),
    borderRadius: scale(16),
    padding: scale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    marginBottom: scale(12),
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: scale(14),
    marginBottom: scale(24),
    textAlign: 'center',
    lineHeight: scale(20),
  },
  modalActions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  modalButtonText: {
    fontSize: scale(14),
    fontWeight: '600',
  },
});
