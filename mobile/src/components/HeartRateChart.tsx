import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Polyline, Circle } from 'react-native-svg';
import { HeartRateZone } from '../types';
import { ZONE_COLORS } from '../constants';

interface HeartRateChartProps {
  history: number[];
  currentZone: HeartRateZone;
  width?: number;
  height?: number;
  title?: string;
}

const ZONE_RANGES: Record<HeartRateZone, { min: number; max: number }> = {
  resting: { min: 60, max: 94 },
  'fat-burn': { min: 95, max: 114 },
  cardio: { min: 115, max: 154 },
  peak: { min: 155, max: 200 },
};

const MIN_HR = 60;
const MAX_HR = 200;

export function HeartRateChart({ history, currentZone, width = 320, height = 200, title = "Heart Rate Monitor" }: HeartRateChartProps) {
  const points = useMemo(() => {
    if (!history.length) return '';
    const stepX = history.length > 1 ? width / (history.length - 1) : width;
    return history
      .map((hr, idx) => {
        const x = Math.min(stepX * idx, width);
        const y = height - ((hr - MIN_HR) / (MAX_HR - MIN_HR)) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [history, width, height]);

  const lastPoint = useMemo(() => {
    if (!history.length) return null;
    const hr = history[history.length - 1];
    const x = width;
    const y = height - ((hr - MIN_HR) / (MAX_HR - MIN_HR)) * height;
    return { x, y, hr };
  }, [history, width, height]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Svg width={width} height={height}>
        {Object.entries(ZONE_RANGES).map(([zone, range]) => {
          const yMin = height - ((range.min - MIN_HR) / (MAX_HR - MIN_HR)) * height;
          const yMax = height - ((range.max - MIN_HR) / (MAX_HR - MIN_HR)) * height;
          return (
            <Rect
              key={zone}
              x={0}
              y={yMax}
              width={width}
              height={Math.max(yMin - yMax, 0)}
              fill={`${ZONE_COLORS[zone as HeartRateZone]}20`}
            />
          );
        })}

        {/* Polyline for history */}
        {points && (
          <Polyline
            points={points}
            fill="none"
            stroke={ZONE_COLORS[currentZone]}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Last point marker */}
        {lastPoint && (
          <>
            <Circle
              cx={lastPoint.x - 6}
              cy={lastPoint.y}
              r={6}
              fill={ZONE_COLORS[currentZone]}
            />
            <Circle
              cx={lastPoint.x - 6}
              cy={lastPoint.y}
              r={6}
              stroke="#ffffff"
              strokeWidth={2}
              fill="none"
            />
          </>
        )}
      </Svg>
      <View style={styles.legendRow}>
        {Object.entries(ZONE_COLORS).map(([zone, color]) => (
          <View style={styles.legendItem} key={zone}>
            <View style={[styles.legendSwatch, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{zone.replace('-', ' ')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    color: '#d1d5db',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default HeartRateChart;
