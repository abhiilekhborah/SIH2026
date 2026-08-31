import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const BLUE = '#1A66E8';
const CIRCLE_SIZE = 52;
const PADDING = 8;

type Props = {
  onSlideComplete: () => void;
};

export function GetStartedButton({ onSlideComplete }: Props) {
  // How wide the track is. We only know this after it is drawn on screen.
  const [trackWidth, setTrackWidth] = useState(0);

  // How far the circle can travel from left to right.
  const maxSlide = trackWidth - CIRCLE_SIZE - PADDING * 2;

  // The circle's current x position. Lives on the UI thread so it stays smooth.
  const offsetX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      // Follow the finger, but never go past the two ends.
      offsetX.value = Math.min(Math.max(event.translationX, 0), maxSlide);
    })
    .onEnd(() => {
      if (offsetX.value > maxSlide * 0.6) {
        // Slid far enough -> snap to the end and fire the action.
        offsetX.value = withTiming(maxSlide, { duration: 120 }, (finished) => {
          if (finished) {
            runOnJS(onSlideComplete)();
            offsetX.value = withTiming(0, { duration: 250 });
          }
        });
      } else {
        // Not far enough -> spring back to the start.
        offsetX.value = withSpring(0);
      }
    });

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  // The label fades out as the circle slides over it.
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offsetX.value, [0, maxSlide], [1, 0]),
  }));

  return (
    <View
      style={styles.track}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <Animated.Text style={[styles.label, labelStyle]}>
        Get Started
      </Animated.Text>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.circle, circleStyle]}>
          <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: CIRCLE_SIZE + PADDING * 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: (CIRCLE_SIZE + PADDING * 2) / 2,
    paddingHorizontal: PADDING,
  },
  label: {
    // Sits behind the circle, pushed to the right half of the track.
    position: 'absolute',
    right: 32,
    fontSize: 17,
    color: '#111827',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
