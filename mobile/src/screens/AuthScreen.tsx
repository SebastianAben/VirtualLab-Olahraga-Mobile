import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { scale } from '../utils/responsiveness';
import * as api from '../services/api';
import { Notification } from '../components/Notification';
import { Feather } from '@expo/vector-icons';

interface AuthScreenProps {
  onLoginSuccess: (email: string, token: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const { theme, isDarkMode } = useTheme();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setNotification(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async () => {
    setNotification(null);
    
    if (!email || !password) {
      setNotification({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setNotification({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setNotification({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await api.signUp(email, password);
      } else {
        result = await api.signIn(email, password);
      }
      
      // Success
      onLoginSuccess(email, result.token);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Authentication failed';
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <View style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: isDarkMode ? '#000' : '#ccc' }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Virtual Sports Lab Mobile
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  color: theme.colors.text, 
                  borderColor: theme.colors.border,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff'
                }
              ]}
              placeholder="your@email.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
            <View style={[
                styles.passwordContainer, 
                { 
                  borderColor: theme.colors.border,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff'
                }
              ]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                {showPassword ? (
                  <Feather name="eye-off" size={scale(20)} color={theme.colors.primary} />
                ) : (
                  <Feather name="eye" size={scale(20)} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Confirm Password</Text>
              <View style={[
                  styles.passwordContainer, 
                  { 
                    borderColor: theme.colors.border,
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff'
                  }
                ]}>
                <TextInput
                  style={[styles.passwordInput, { color: theme.colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                  {showConfirmPassword ? (
                    <Feather name="eye-off" size={scale(20)} color={theme.colors.primary} />
                  ) : (
                    <Feather name="eye" size={scale(20)} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary, opacity: loading ? 0.7 : 1 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? 'Create Account' : 'Login'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
            <Text style={[styles.toggleText, { color: theme.colors.primary }]}>
              {isSignUp
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: scale(20),
  },
  card: {
    borderRadius: scale(16),
    padding: scale(24),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(8),
  },
  subtitle: {
    fontSize: scale(14),
    textAlign: 'center',
    marginBottom: scale(32),
  },
  inputContainer: {
    marginBottom: scale(16),
  },
  label: {
    fontSize: scale(14),
    fontWeight: '600',
    marginBottom: scale(8),
  },
  input: {
    borderWidth: 1,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
    fontSize: scale(16),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scale(8),
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(12),
    fontSize: scale(16),
  },
  eyeButton: {
    padding: scale(12),
  },
  submitButton: {
    paddingVertical: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
    marginTop: scale(8),
    marginBottom: scale(16),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  toggleButton: {
    alignItems: 'center',
    padding: scale(8),
  },
  toggleText: {
    fontSize: scale(14),
    fontWeight: '600',
  },
});
