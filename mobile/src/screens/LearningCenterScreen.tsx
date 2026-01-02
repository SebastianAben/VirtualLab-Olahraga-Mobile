import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LearningChapter } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { scale } from '../utils/responsiveness';

interface LearningCenterScreenProps {
  chapters: LearningChapter[];
  onSelectChapter: (chapterId: string) => void;
}

const iconMap: Record<string, string> = {
  book: '📖',
  activity: '🏃',
  brain: '🧠',
  heart: '❤️',
  target: '🎯',
  recovery: '🔋',
};

export default function LearningCenterScreen({ chapters, onSelectChapter }: LearningCenterScreenProps) {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.badgeText, { color: theme.colors.primary }]}>📚 Learning Center</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Pelajari Ilmu Kebugaran Jasmani</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Kumpulan materi yang dibuat khusus untuk membantu pemahaman akan materi kebugaran jasmani.
        </Text>
      </View>

      <View style={styles.grid}>
        {chapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.id}
            style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => onSelectChapter(chapter.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={styles.icon}>{iconMap[chapter.icon] || '📄'}</Text>
              </View>
              <Text style={[styles.arrow, { color: theme.colors.primary }]}>→</Text>
            </View>
            
            <Text style={[styles.chapterTitle, { color: theme.colors.text }]}>{chapter.title}</Text>
            <Text style={[styles.chapterSummary, { color: theme.colors.textSecondary }]} numberOfLines={3}>
              {chapter.summary}
            </Text>
          </TouchableOpacity>
        ))}
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
  header: {
    alignItems: 'center',
    marginBottom: scale(24),
  },
  badge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontSize: scale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: scale(24),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(8),
  },
  subtitle: {
    fontSize: scale(14),
    textAlign: 'center',
    lineHeight: scale(20),
  },
  grid: {
    gap: scale(16),
  },
  card: {
    borderRadius: scale(16),
    padding: scale(20),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(12),
  },
  iconContainer: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: scale(24),
  },
  arrow: {
    fontSize: scale(20),
    fontWeight: 'bold',
  },
  chapterTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    marginBottom: scale(8),
  },
  chapterSummary: {
    fontSize: scale(14),
    lineHeight: scale(20),
  },
});
