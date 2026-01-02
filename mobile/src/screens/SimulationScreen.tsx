import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Challenge, ExerciseIntensity, HeartRateZone } from '../types';
import { ZONE_COLORS, ZONE_INFO } from '../constants';
import HeartRateChart from '../components/HeartRateChart';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { socketService } from '../services/socket';

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
  const { theme } = useTheme();
  const { scale, SCREEN_WIDTH } = useResponsive();

  const GRID_GAP = scale(12);
  const PADDING = scale(16);
  const AVAILABLE_WIDTH = SCREEN_WIDTH - (PADDING * 2);
  const isStacked = AVAILABLE_WIDTH < 500; 

  const LEFT_WIDTH = isStacked ? AVAILABLE_WIDTH : (AVAILABLE_WIDTH * 0.65) - (GRID_GAP / 2);
  const RIGHT_WIDTH = isStacked ? AVAILABLE_WIDTH : (AVAILABLE_WIDTH * 0.35) - (GRID_GAP / 2);

  const DASHBOARD_HEIGHT = scale(340);
  const CHART_CARD_HEIGHT = scale(260);
  const CHART_HEIGHT = scale(180);
  const RIGHT_CARD_HEIGHT = scale(160);

  const [currentHeartRate, setCurrentHeartRate] = useState(70);
  const [zone, setZone] = useState<HeartRateZone>('resting');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('rest');
  const [history, setHistory] = useState<number[]>([70]);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeInZone, setTimeInZone] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [grade, setGrade] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    socketService.connect(token);
    
    socketService.on('simulation_update', (state) => {
      setCurrentHeartRate(state.currentHeartRate);
      setZone(state.zone);
      setHistory(state.history);
      setIntensity(state.intensity);
      setElapsedTime(state.elapsedTime);
      setTimeInZone(state.timeInZone);
      
      if (state.completed && !completed) {
        setCompleted(true);
        setGrade(state.grade);
        setIsRunning(false);
      }
    });

    socketService.emit('set_challenge', challenge);

    return () => {
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const startSimulation = () => {
    setIsRunning(true);
    socketService.emit('start_simulation');
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setElapsedTime(0);
    setTimeInZone(0);
    setHistory([70]);
    setCurrentHeartRate(70);
    setCompleted(false);
    setGrade(null);
    setIntensity('rest');
    setIsRunning(false);
    socketService.emit('start_simulation');
    socketService.emit('set_challenge', challenge);
  };

  const saveAndExit = () => {
    if (completed) {
      onComplete({ ...challenge, elapsedTime, timeInZone, completed, grade });
    } else {
      Alert.alert("End Session?", "Are you sure you want to stop and save current progress?", [
        { text: "Cancel", style: "cancel" },
        { text: "Save & Exit", onPress: () => onComplete({ ...challenge, elapsedTime, timeInZone, completed: true, grade: 'C' }) } 
      ]);
    }
  };

  const handleIntensityChange = (newIntensity: ExerciseIntensity) => {
    if (completed) return;
    socketService.emit('set_intensity', newIntensity);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goalProgress = Math.min((timeInZone / challenge.goalDuration) * 100, 100);
  const overallProgress = Math.min((elapsedTime / challenge.totalDuration) * 100, 100);
  const zoneInfo = ZONE_INFO[zone];
  const textPrimary = { color: theme.colors.text };
  const textSecondary = { color: theme.colors.textSecondary };

  const dynamicStyles: Record<string, any> = {
    contentContainer: { padding: PADDING, paddingBottom: scale(40) },
    headerContainer: { marginBottom: scale(24) },
    screenTitle: { fontSize: scale(24), marginBottom: scale(8) },
    screenDesc: { fontSize: scale(14), lineHeight: scale(20), marginBottom: scale(12) },
    goalBadge: { borderRadius: scale(8), padding: scale(8) },
    goalText: { fontSize: scale(12) },
    dashboardRow: { 
        flexDirection: (isStacked ? 'column' : 'row'), 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: isStacked ? scale(16) : 0, 
    },
    columnGap: { gap: scale(16) },
    card: { borderRadius: scale(12), padding: scale(8) },
    progressCard: { padding: scale(12) },
    textLabel: { fontSize: scale(12), marginBottom: scale(2) },
    textValue: { fontSize: scale(16), marginBottom: scale(4) },
    progressBarBg: { height: scale(6), borderRadius: scale(3) },
    buttonGroup: { flexDirection: 'row', gap: scale(8) },
    actionBtn: { paddingVertical: scale(14), borderRadius: scale(12) },
    actionBtnText: { fontSize: scale(12) },
    challengeCard: { padding: scale(12) },
    challengeLabel: { fontSize: scale(10) },
    challengeName: { fontSize: scale(14) },
    switchBtn: { paddingVertical: scale(6), paddingHorizontal: scale(12), borderRadius: scale(6) },
    switchBtnText: { fontSize: scale(12) },
    heartMonitorCard: { height: RIGHT_CARD_HEIGHT },
    monitorTitle: { fontSize: scale(12) },
    heartIcon: { fontSize: scale(24), marginBottom: scale(2) },
    bpmValue: { fontSize: scale(28) },
    zoneTag: { paddingVertical: scale(2), borderRadius: scale(8), paddingHorizontal: scale(6), marginTop: scale(4) },
    zoneTagText: { fontSize: scale(10) },
    controlsCard: { padding: scale(8), minHeight: scale(200) },
    controlsTitle: { fontSize: scale(12), marginBottom: scale(8) },
    verticalControls: { gap: scale(8) },
    controlBtn: { paddingVertical: scale(12), paddingHorizontal: scale(8), borderRadius: scale(8) },
    emoji: { fontSize: scale(16), marginRight: scale(8) },
    controlText: { fontSize: scale(13) },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={dynamicStyles.contentContainer}>
      <View style={dynamicStyles.headerContainer}>
        <Text style={[styles.baseText, dynamicStyles.screenTitle, textPrimary, { fontWeight: 'bold' }]}>{challenge.name}</Text>
        <Text style={[styles.baseText, dynamicStyles.screenDesc, textSecondary]}>{challenge.description}</Text>
        <View style={[styles.baseBorder, dynamicStyles.goalBadge, { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }]}>
          <Text style={[styles.baseText, dynamicStyles.goalText, { color: theme.colors.primary, fontWeight: 'bold' }]}>
            🎯 Goal: Maintain {ZONE_INFO[challenge.targetZone].label} Zone for {formatTime(challenge.goalDuration)}
          </Text>
        </View>
      </View>

      <View style={dynamicStyles.dashboardRow}>
        <View style={[{ width: LEFT_WIDTH }, dynamicStyles.columnGap]}>
            <View style={[styles.baseCard, dynamicStyles.card, { height: CHART_CARD_HEIGHT, backgroundColor: theme.colors.chartBackground }]}>
                <HeartRateChart 
                    history={history} 
                    currentZone={zone} 
                    width={LEFT_WIDTH - scale(16)} 
                    height={CHART_HEIGHT}
                    title="Live Chart"
                />
            </View>

            <View style={[styles.baseCard, dynamicStyles.card, dynamicStyles.progressCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.rowCenter}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.baseText, dynamicStyles.textLabel, textSecondary]}>Time in Zone</Text>
                        <Text style={[styles.baseText, dynamicStyles.textValue, textPrimary, { fontWeight: 'bold' }]}>{formatTime(timeInZone)}</Text>
                        <View style={[dynamicStyles.progressBarBg, { backgroundColor: theme.colors.border }]}>
                            <View style={{ height: '100%', borderRadius: scale(3), width: `${goalProgress}%`, backgroundColor: theme.colors.success }} />
                        </View>
                    </View>
                    <View style={{ width: 1, height: '80%', backgroundColor: theme.colors.border, marginHorizontal: scale(12) }} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.baseText, dynamicStyles.textLabel, textSecondary]}>Total Time</Text>
                        <Text style={[styles.baseText, dynamicStyles.textValue, textPrimary, { fontWeight: 'bold' }]}>{formatTime(elapsedTime)}</Text>
                        <View style={[dynamicStyles.progressBarBg, { backgroundColor: theme.colors.border }]}>
                            <View style={{ height: '100%', borderRadius: scale(3), width: `${overallProgress}%`, backgroundColor: theme.colors.primary }} />
                        </View>
                    </View>
                </View>
            </View>

            <View style={dynamicStyles.buttonGroup}>
                {!isRunning ? (
                    <TouchableOpacity style={[styles.centerBtn, dynamicStyles.actionBtn, { backgroundColor: theme.colors.primary, flex: 1 }]} onPress={startSimulation}>
                        <Text style={[styles.baseText, dynamicStyles.actionBtnText, { color: '#fff', fontWeight: 'bold' }]}>START</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.centerBtn, dynamicStyles.actionBtn, { backgroundColor: theme.colors.warning, flex: 1 }]} onPress={stopSimulation}>
                        <Text style={[styles.baseText, dynamicStyles.actionBtnText, { color: '#fff', fontWeight: 'bold' }]}>STOP</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.centerBtn, dynamicStyles.actionBtn, { backgroundColor: theme.colors.textSecondary, flex: 1 }]} onPress={resetSimulation}>
                    <Text style={[styles.baseText, dynamicStyles.actionBtnText, { color: '#fff', fontWeight: 'bold' }]}>RESET</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.centerBtn, dynamicStyles.actionBtn, { backgroundColor: theme.colors.success, flex: 1 }]} onPress={saveAndExit}>
                    <Text style={[styles.baseText, dynamicStyles.actionBtnText, { color: '#fff', fontWeight: 'bold' }]}>SAVE</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.baseCard, dynamicStyles.card, dynamicStyles.challengeCard, { backgroundColor: theme.colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.baseText, dynamicStyles.challengeLabel, textSecondary, { textTransform: 'uppercase' }]}>Current Challenge</Text>
                    <Text style={[styles.baseText, dynamicStyles.challengeName, textPrimary, { fontWeight: 'bold' }]} numberOfLines={1}>{challenge.name}</Text>
                </View>
                <TouchableOpacity style={[dynamicStyles.switchBtn, { borderWidth: 1, borderColor: theme.colors.primary }]} onPress={onBackToSelection}>
                    <Text style={[styles.baseText, dynamicStyles.switchBtnText, { color: theme.colors.primary, fontWeight: '600' }]}>Change</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={[{ width: RIGHT_WIDTH }, dynamicStyles.columnGap]}>
            
            <View style={[styles.baseCard, dynamicStyles.card, dynamicStyles.heartMonitorCard, { backgroundColor: zoneInfo.bgColor, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={[styles.baseText, dynamicStyles.monitorTitle, { textAlign: 'center', color: '#1f2937', fontWeight: '600' }]}>Heart Monitor</Text>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Animated.Text style={[dynamicStyles.heartIcon, { transform: [{ scale: pulseAnim }] }]}>❤️</Animated.Text>
                <Text style={[styles.baseText, dynamicStyles.bpmValue, { color: '#1f2937', fontWeight: 'bold' }]}>{Math.round(currentHeartRate)}</Text>
              </View>
              <View style={[styles.baseBorder, dynamicStyles.zoneTag, { borderColor: ZONE_COLORS[zone], backgroundColor: 'rgba(255,255,255,0.5)' }]}>
                <Text style={[styles.baseText, dynamicStyles.zoneTagText, { color: '#374151', fontWeight: 'bold' }]}>{zoneInfo.label}</Text>
              </View>
            </View>

            <View style={[styles.baseCard, dynamicStyles.card, dynamicStyles.controlsCard, { backgroundColor: theme.colors.card, justifyContent: 'center', flex: 1 }]}>
                <Text style={[styles.baseText, dynamicStyles.controlsTitle, { textAlign: 'center', color: theme.colors.textSecondary, fontWeight: '600' }]}>Controls</Text>
                <View style={[dynamicStyles.verticalControls, { flex: 1, justifyContent: 'space-between' }]}>
                    <TouchableOpacity
                        style={[dynamicStyles.controlBtn, { flexDirection: 'row', alignItems: 'center', flex: 1 }, intensity === 'rest' ? { backgroundColor: theme.colors.success } : { backgroundColor: theme.colors.border }]}
                        onPress={() => handleIntensityChange('rest')}
                    >
                        <Text style={dynamicStyles.emoji}>🧘</Text>
                        <Text style={[styles.baseText, dynamicStyles.controlText, { fontWeight: '600' }, intensity === 'rest' ? { color: '#fff' } : { color: theme.colors.text }]}>Rest</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[dynamicStyles.controlBtn, { flexDirection: 'row', alignItems: 'center', flex: 1 }, intensity === 'jog' ? { backgroundColor: theme.colors.warning } : { backgroundColor: theme.colors.border }]}
                        onPress={() => handleIntensityChange('jog')}
                    >
                        <Text style={dynamicStyles.emoji}>🏃</Text>
                        <Text style={[styles.baseText, dynamicStyles.controlText, { fontWeight: '600' }, intensity === 'jog' ? { color: '#fff' } : { color: theme.colors.text }]}>Jog</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[dynamicStyles.controlBtn, { flexDirection: 'row', alignItems: 'center', flex: 1 }, intensity === 'sprint' ? { backgroundColor: theme.colors.danger } : { backgroundColor: theme.colors.border }]}
                        onPress={() => handleIntensityChange('sprint')}
                    >
                        <Text style={dynamicStyles.emoji}>⚡</Text>
                        <Text style={[styles.baseText, dynamicStyles.controlText, { fontWeight: '600' }, intensity === 'sprint' ? { color: '#fff' } : { color: theme.colors.text }]}>Sprint</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  baseText: {},
  baseCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  baseBorder: { borderWidth: 1 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  centerBtn: { alignItems: 'center', justifyContent: 'center' },
});