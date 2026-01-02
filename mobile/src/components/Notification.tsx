import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale } from '../utils/responsiveness';
import { useTheme } from '../theme/ThemeContext';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Notification({ message, type, onClose }: NotificationProps) {
  const { theme } = useTheme();
  
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const borderColor = isSuccess ? theme.colors.success : theme.colors.danger;
  const textColor = isSuccess ? theme.colors.success : theme.colors.danger;
  const icon = isSuccess ? '✅' : '❌';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>
          {isSuccess ? 'Berhasil' : 'Terjadi Kesalahan'}
        </Text>
        <Text style={[styles.message, { color: theme.colors.text }]}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={[styles.closeText, { color: theme.colors.textSecondary }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: scale(16),
    marginHorizontal: scale(20),
    marginTop: scale(10), 
    borderRadius: scale(8),
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 100,
    position: 'absolute',
    top: scale(40), 
    right: 0,
  },
  icon: {
    fontSize: scale(18),
    marginRight: scale(12),
    marginTop: scale(2),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: scale(14),
    marginBottom: scale(4),
  },
  message: {
    fontSize: scale(13),
    lineHeight: scale(18),
  },
  closeButton: {
    padding: scale(4),
    marginLeft: scale(8),
  },
  closeText: {
    fontSize: scale(14),
    fontWeight: 'bold',
  },
});
