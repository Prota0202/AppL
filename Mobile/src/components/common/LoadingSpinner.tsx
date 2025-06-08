import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  showMessage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  showMessage = true,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startSpinAnimation = () => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    };

    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startSpinAnimation();
    startPulseAnimation();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small': return 32;
      case 'medium': return 64;
      case 'large': return 96;
      default: return 64;
    }
  };

  const containerSize = getSize();

  return (
    <View style={styles.container}>
      <View style={[styles.spinnerContainer, { width: containerSize, height: containerSize }]}>
        {/* Outer rotating ring */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: containerSize,
              height: containerSize,
              transform: [{ rotate: spin }],
            },
          ]}
        />
        
        {/* Inner pulsing circle */}
        <Animated.View
          style={[
            styles.innerCircle,
            {
              width: containerSize * 0.4,
              height: containerSize * 0.4,
              transform: [{ scale: pulseValue }],
            },
          ]}
        />
        
        {/* Orbiting particles */}
        <Animated.View
          style={[
            styles.particle,
            {
              width: containerSize * 0.1,
              height: containerSize * 0.1,
              top: 0,
              left: containerSize / 2 - (containerSize * 0.05),
              transform: [{ rotate: spin }],
            },
          ]}
        />
      </View>
      
      {showMessage && size !== 'small' && (
        <Text style={[styles.message, size === 'large' && styles.largeMessage]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinnerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: Colors.primary,
    borderRadius: 1000,
  },
  innerCircle: {
    backgroundColor: Colors.primary,
    borderRadius: 1000,
    opacity: 0.3,
  },
  particle: {
    position: 'absolute',
    backgroundColor: Colors.primaryLight,
    borderRadius: 1000,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primaryLight,
    textAlign: 'center',
  },
  largeMessage: {
    fontSize: 18,
  },
});

export default LoadingSpinner;