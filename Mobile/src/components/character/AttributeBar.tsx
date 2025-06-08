import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface AttributeBarProps {
  label: string;
  value: number;
  max?: number;
  color: string;
  iconColor: string;
  iconBg: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  disabledIncrement?: boolean;
  disabledDecrement?: boolean;
}

const AttributeBar: React.FC<AttributeBarProps> = ({
  label,
  value,
  max = 100,
  color,
  iconColor,
  iconBg,
  onIncrement,
  onDecrement,
  disabledIncrement,
  disabledDecrement,
}) => {
  const widthPercent = (value / max) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Text style={[styles.iconText, { color: iconColor }]}>✓</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.value, { color: iconColor }]}>{value}</Text>
        </View>

        <View style={styles.barContainer}>
          <TouchableOpacity
            onPress={onDecrement}
            disabled={disabledDecrement}
            style={[
              styles.button,
              disabledDecrement && styles.buttonDisabled,
              { borderColor: iconColor }
            ]}
          >
            <Text style={[styles.buttonText, { color: iconColor }]}>−</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${widthPercent}%`, backgroundColor: color }
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={onIncrement}
            disabled={disabledIncrement}
            style={[
              styles.button,
              disabledIncrement && styles.buttonDisabled,
              { borderColor: iconColor }
            ]}
          >
            <Text style={[styles.buttonText, { color: iconColor }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default AttributeBar;