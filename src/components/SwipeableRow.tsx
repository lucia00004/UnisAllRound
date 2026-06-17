import React from 'react';
import { View, Text, Animated, PanResponder } from 'react-native';
import { Archive, Trash2 } from 'lucide-react-native';

import { useTheme, radii } from '../theme';

export function SwipeableRow({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Archivia',
  rightLabel = 'Elimina',
  leftColor,
  rightColor,
  leftIcon: LeftIcon = Archive,
  rightIcon: RightIcon = Trash2,
}: {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  leftIcon?: any;
  rightIcon?: any;
}) {
  const { colors, styles } = useTheme();
  const activeLeftColor = leftColor || colors.teal;
  const activeRightColor = rightColor || colors.danger;
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (gestureState.dx > 0 && !onSwipeRight) {
          return false;
        }
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 8;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!onSwipeRight && gestureState.dx > 0) {
          pan.x.setValue(0);
        } else {
          pan.x.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120 && onSwipeRight) {
          Animated.timing(pan, {
            toValue: { x: 500, y: 0 },
            duration: 180,
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -120) {
          Animated.timing(pan, {
            toValue: { x: -500, y: 0 },
            duration: 180,
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ position: 'relative', overflow: 'hidden', borderRadius: radii.md, marginBottom: 10 }}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          borderRadius: radii.md,
          backgroundColor: pan.x.interpolate({
            inputRange: [-100, 0, 100],
            outputRange: [activeRightColor, 'transparent', activeLeftColor],
          }),
        }}
      >
        <Animated.View
          style={{
            opacity: pan.x.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <LeftIcon color={colors.surface} size={20} />
          <Text style={{ color: colors.surface, fontWeight: 'bold', marginLeft: 8, fontSize: 14 }}>
            {leftLabel}
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: pan.x.interpolate({
              inputRange: [-50, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.surface, fontWeight: 'bold', marginRight: 8, fontSize: 14 }}>
            {rightLabel}
          </Text>
          <RightIcon color={colors.surface} size={20} />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: pan.x }],
          backgroundColor: colors.surface,
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}
