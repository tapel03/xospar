import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingBackdrop from "../../components/OnboardingBackdrop";

// Full-bleed hero image for the welcome screen. If this is ever set back
// to null, the screen falls back to the OnboardingBackdrop blobs.
const HERO_IMAGE = require("../../../assets/first_page_login_started.png");

const SCRIM_STEPS = 28;

// Faux gradient built from stacked, increasingly opaque strips - keeps the
// screen free of expo-linear-gradient. "bottom" fades to black at the
// bottom edge (behind the headline/buttons), "top" fades to black at the
// top edge (behind the logo).
function GradientScrim({ position = "bottom", height = "62%", maxOpacity = 0.94 }) {
  const strips = Array.from({ length: SCRIM_STEPS }, (_, index) => {
    const t = (index + 1) / SCRIM_STEPS;
    return Math.pow(t, 1.7) * maxOpacity;
  });

  const ordered = position === "bottom" ? strips : strips.slice().reverse();

  return (
    <View
      pointerEvents="none"
      style={[
        styles.scrim,
        position === "bottom" ? styles.scrimBottom : styles.scrimTop,
        { height },
      ]}
    >
      {ordered.map((opacity, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            backgroundColor: `rgba(0,0,0,${opacity.toFixed(3)})`,
          }}
        />
      ))}
    </View>
  );
}

// Small logo lockup (mark + wordmark) for the top-left corner.
function LogoLockup() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoMark}>
        <View style={styles.markSquare} />
        <View style={styles.markCircle} />
        <View style={styles.markBlob} />
      </View>

      <Text style={styles.logoText}>MARKET</Text>
    </View>
  );
}

export default function AuthWelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {HERO_IMAGE ? (
        <ImageBackground
          source={HERO_IMAGE}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <OnboardingBackdrop variant="welcome" />
      )}

      {/* Darkening layers so text stays readable over any photo */}
      <GradientScrim position="top" height="24%" maxOpacity={0.55} />
      <GradientScrim position="bottom" height="62%" maxOpacity={0.94} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Top-left logo */}
        <LogoLockup />

        {/* Bottom block: headline, tagline, buttons */}
        <View>
          <Text style={styles.heading}>{"Trade With More\nClarity"}</Text>

          <Text style={styles.tagline}>
            Everything you need to explore the markets, refine your strategy,
            and stay consistent.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("SignUp")}
            >
              <Text style={styles.startButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  /* Scrims */
  scrim: {
    position: "absolute",
    left: 0,
    right: 0,
  },

  scrimTop: {
    top: 0,
  },

  scrimBottom: {
    bottom: 0,
  },

  /* Layout */
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },

  /* Logo lockup */
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logoMark: {
    width: 30,
    height: 30,
  },

  markSquare: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#3A7BD5",
    transform: [{ rotate: "8deg" }],
  },

  markCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#8F7CFF",
  },

  markBlob: {
    position: "absolute",
    bottom: 0,
    left: 5,
    width: 14,
    height: 14,
    borderRadius: 5,
    backgroundColor: "#FF9D7C",
    transform: [{ rotate: "-6deg" }],
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 2,
  },

  /* Headline + tagline */
  heading: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },

  tagline: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    maxWidth: 340,
  },

  /* Buttons */
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },

  loginButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,20,22,0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  startButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  startButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
});