import { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
} from "react-native";

export default function InAppModalOverlay({
  visible,
  children,
  onClose,
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  // Slide-up entrance animation - every time this overlay transitions
  // from hidden to visible, the sheet starts off-screen (below the
  // bottom edge) and springs up into place. This is shared by every
  // bottom sheet in the app (AlertFormModal, AssetDetailModal,
  // OrderTicketModal, etc.) so they all get the same feel for free.
  useEffect(() => {
    if (visible) {
      translateY.setValue(700);

      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 4,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only capture obvious vertical downward swipes.
        return (
          gesture.dy > 8 &&
          Math.abs(gesture.dy) >
            Math.abs(gesture.dx)
        );
      },

      onPanResponderMove: (_, gesture) => {
        // Don't allow dragging upward.
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        const shouldClose =
          gesture.dy > 120 ||
          gesture.vy > 1.2;

        if (shouldClose) {
          Animated.timing(translateY, {
            toValue: 900,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);

            if (onClose) {
              onClose();
            }
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 70,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 10,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.overlay}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [
              {
                translateY,
              },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },

  sheet: {
    flex: 1,
  },
});