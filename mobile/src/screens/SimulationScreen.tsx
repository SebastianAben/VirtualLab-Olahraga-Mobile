import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Challenge, ExerciseIntensity, HeartRateZone, SimulationState } from '../types';
import { ZONE_COLORS, ZONE_INFO, INTENSITY_TARGETS } from '../constants';
import * as api from '../services/api';

interface SimulationScreenProps {
  challenge: Challenge;
  token: string;
  onComplete: (challenge: Challenge) => void;
  onBackToSelection: () => void;
}

export default function SimulationScreen({
  challenge,
  token,
  onComplete,
  onBackToSelection,
}: SimulationScreenProps) {
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [currentHeartRate, setCurrentHeartRate] = useState(70);
  const [zone, setZone] = useState<HeartRateZone>('resting');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('rest');
  const [history, setHistory] = useState<number[]>([70]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeInZone, setTimeInZone] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [grade, setGrade] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeSimulation();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Pulse animation for heart icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const initializeSimulation = async () => {
    try {
      const simData = await api.startSimulation(token);
      setSimulationId(simData.simulationId);
      await api.setSimulationChallenge(simData.simulationId, challenge, token);
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
    }
  };

  const startSimulation = () => {
    if (!simulationId || isRunning) return;
    
    setIsRunning(true);
    lastUpdateRef.current = Date.now();

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      try {
        const updatedState = await api.updateSimulation(
          simulationId,
          null,
          deltaTime,
          token
        );

        setCurrentHeartRate(updatedState.currentHeartRate);
        setZone(updatedState.zone);
        setHistory((prev) => {
          const newHistory = [...prev, updatedState.currentHeartRate];
          return newHistory.slice(-150); // Keep last 150 points
        });

        if (updatedState.challenge) {
          setElapsedTime(updatedState.elapsedTime);
          setTimeInZone(updatedState.timeInZone);

          if (updatedState.completed) {
            setCompleted(true);
            setGrade(updatedState.grade);
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        }
      } catch (error) {
        console.error('Simulation update failed:', error);
      }
    }, 100);
  };

  const handleIntensityChange = async (newIntensity: ExerciseIntensity) => {
    if (!simulationId || completed) return;

    setIntensity(newIntensity);

    try {
      await api.updateSimulation(simulationId, newIntensity, 0, token);
    } catch (error) {
      console.error('Failed to update intensity:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goalProgress = Math.min((timeInZone / challenge.goalDuration) * 100, 100);
  const overallProgress = Math.min((elapsedTime / challenge.totalDuration) * 100, 100);
  const zoneInfo = ZONE_INFO[zone];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Challenge Info */}
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{challenge.name}</Text>
        <Text style={styles.challengeDesc}>{challenge.description}</Text>
      </View>

      {/* Heart Rate Display */}
      <View style={[styles.heartRateCard, { backgroundColor: zoneInfo.bgColor }]}>
        <View style={styles.heartRateHeader}>
          <Animated.Text style={[styles.heartIcon, { transform: [{ scale: pulseAnim }] }]}>
            ❤️
          </Animated.Text>
          <Text style={styles.heartRateLabel}>Heart Rate Monitor</Text>
        </View>

        <View style={styles.bpmContainer}>
          <Text style={styles.bpmValue}>{Math.round(currentHeartRate)}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>

        <View style={[styles.zoneIndicator, { borderColor: ZONE_COLORS[zone] }]}>
          <Text style={styles.zoneLabel}>{zoneInfo.label} Zone</Text>
          <Text style={styles.zoneDesc}>{zoneInfo.description}</Text>
          <Text style={styles.zoneRange}>{zoneInfo.range}</Text>
        </View>
      </View>

      {/* Progress Bars */}
      <View style={styles.progressCard}>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Time in Zone</Text>
            <Text style={styles.progressValue}>
              {formatTime(timeInZone)} / {formatTime(challenge.goalDuration)}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${goalProgress}%`, backgroundColor: '#10b981' }]} />
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Total Time</Text>
            <Text style={styles.progressValue}>
              {formatTime(elapsedTime)} / {formatTime(challenge.totalDuration)}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${overallProgress}%`, backgroundColor: completed ? '#f59e0b' : '#3b82f6' }]} />
          </View>
        </View>
      </View>

      {/* Grade Display (if completed) */}
      {completed && grade && (
        <View style={styles.gradeCard}>
          <Text style={styles.gradeLabel}>Your Grade</Text>
          <Text style={styles.gradeValue}>{grade}</Text>
        </View>
      )}

      {/* Intensity Controls */}
      <View style={styles.controlsCard}>
        <Text style={styles.controlsTitle}>Exercise Controls</Text>
        <View style={styles.intensityButtons}>
          <TouchableOpacity
            style={[
              styles.intensityButton,
              intensity === 'rest' && styles.intensityButtonActive,
              { backgroundColor: intensity === 'rest' ? '#10b981' : '#e5e7eb' },
            ]}
            onPress={() => handleIntensityChange('rest')}
            disabled={completed}
            activeOpacity={0.7}
          >
            <Text style={[styles.intensityLabel, intensity === 'rest' && styles.intensityLabelActive]}>
              Rest
            </Text>
            <Text style={[styles.intensityTarget, intensity === 'rest' && styles.intensityTargetActive]}>
              {INTENSITY_TARGETS.rest.target} BPM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.intensityButton,
              intensity === 'jog' && styles.intensityButtonActive,
              { backgroundColor: intensity === 'jog' ? '#f59e0b' : '#e5e7eb' },
            ]}
            onPress={() => handleIntensityChange('jog')}
            disabled={completed}
            activeOpacity={0.7}
          >
            <Text style={[styles.intensityLabel, intensity === 'jog' && styles.intensityLabelActive]}>
              Jog
            </Text>
            <Text style={[styles.intensityTarget, intensity === 'jog' && styles.intensityTargetActive]}>
              {INTENSITY_TARGETS.jog.target} BPM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.intensityButton,
              intensity === 'sprint' && styles.intensityButtonActive,
              { backgroundColor: intensity === 'sprint' ? '#ef4444' : '#e5e7eb' },
            ]}
            onPress={() => handleIntensityChange('sprint')}
            disabled={completed}
            activeOpacity={0.7}
          >
            <Text style={[styles.intensityLabel, intensity === 'sprint' && styles.intensityLabelActive]}>
              Sprint
            </Text>
            <Text style={[styles.intensityTarget, intensity === 'sprint' && styles.intensityTargetActive]}>
              {INTENSITY_TARGETS.sprint.target} BPM
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isRunning && !completed && (
          <TouchableOpacity style={styles.startButton} onPress={startSimulation} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>▶️ Start Challenge</Text>
          </TouchableOpacity>
        )}

        {completed && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete({ ...challenge, elapsedTime, timeInZone, completed, grade })}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>View Results</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.backButton} onPress={onBackToSelection} activeOpacity={0.8}>
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
  challengeHeader: {
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  heartRateCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heartRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heartIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  heartRateLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bpmContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bpmValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bpmLabel: {
    fontSize: 24,
    color: '#6b7280',
  },
  zoneIndicator: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  zoneLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  zoneDesc: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 2,
  },
  zoneRange: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  progressValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  gradeCard: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  gradeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#15803d',
  },
  controlsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  intensityButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 4,
  },
  intensityLabelActive: {
    color: '#ffffff',
  },
  intensityTarget: {
    fontSize: 12,
    color: '#6b7280',
  },
  intensityTargetActive: {
    color: '#ffffff',
    opacity: 0.9,
  },
  actionButtons: {
    gap: 12,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
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
