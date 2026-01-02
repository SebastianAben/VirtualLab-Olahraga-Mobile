import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LearningChapter } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { scale } from '../utils/responsiveness';

interface LearningChapterDetailProps {
  chapter: LearningChapter;
  onBack: () => void;
}

export default function LearningChapterDetailScreen({ chapter, onBack }: LearningChapterDetailProps) {
  const { theme, isDarkMode } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backText, { color: theme.colors.primary }]}>← Kembali ke Learning Center</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={[styles.tag, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff' }]}>
          <Text style={[styles.tagText, { color: theme.colors.primary }]}>🔖 Materi Perkuliahan</Text>
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>{chapter.title}</Text>
        <Text style={[styles.summary, { color: theme.colors.textSecondary }]}>{chapter.summary}</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>📋</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Pokok Bahasan</Text>
        </View>
        <View style={styles.list}>
          {chapter.takeaways.map((point, index) => (
            <View key={index} style={[styles.listItem, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#eff6ff' }]}>
              <View style={[styles.numberBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <Text style={[styles.listText, { color: theme.colors.text }]}>{point}</Text>
            </View>
          ))}
        </View>
      </View>

      {chapter.detailedContent && chapter.detailedContent.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📖</Text>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Penjelasan Materi</Text>
          </View>
          {chapter.detailedContent.map((paragraph, index) => (
            <Text key={index} style={[styles.paragraph, { color: theme.colors.text }]}>
              {paragraph}
            </Text>
          ))}
        </View>
      )}

      {chapter.recommendedReading && chapter.recommendedReading.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📚</Text>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Referensi Rekomendasi</Text>
          </View>
          {chapter.recommendedReading.map((ref, index) => (
            <View key={index} style={styles.refItem}>
              <Text style={[styles.bullet, { color: theme.colors.text }]}>•</Text>
              <Text style={[styles.refText, { color: theme.colors.text }]}>{ref}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  backButton: {
    marginBottom: scale(16),
    paddingVertical: scale(8),
  },
  backText: {
    fontSize: scale(14),
    fontWeight: '600',
  },
  header: {
    marginBottom: scale(24),
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(12),
    marginBottom: scale(12),
  },
  tagText: {
    fontSize: scale(12),
    fontWeight: '700',
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    marginBottom: scale(12),
  },
  summary: {
    fontSize: scale(16),
    lineHeight: scale(24),
  },
  section: {
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(16),
    gap: scale(8),
  },
  sectionIcon: {
    fontSize: scale(20),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
  },
  list: {
    gap: scale(12),
  },
  listItem: {
    flexDirection: 'row',
    padding: scale(12),
    borderRadius: scale(12),
    gap: scale(12),
  },
  numberBadge: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(2),
  },
  numberText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: 'bold',
  },
  listText: {
    flex: 1,
    fontSize: scale(14),
    lineHeight: scale(20),
  },
  paragraph: {
    fontSize: scale(14),
    lineHeight: scale(22),
    marginBottom: scale(12),
  },
  refItem: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: scale(8),
  },
  bullet: {
    fontSize: scale(14),
    lineHeight: scale(22),
  },
  refText: {
    flex: 1,
    fontSize: scale(14),
    lineHeight: scale(22),
  },
});