
import { View, Text, Image } from "react-native";
import { useEffect, useState } from "react";

import styles from "./SplashScreen.styles";

// Splash face sequence, cycled continuously for as long as this screen
// is mounted. Navigation is no longer driven from here - RootNavigator
// renders this directly while AuthContext checks for a saved session,
// then swaps it out for Auth / Onboarding / Main once that resolves.
const FACES = [
  require("../../../assets/splash-face-1.jpeg"), // eyes open
  require("../../../assets/splash-face-2.jpeg"), // eyes closed / resting
  require("../../../assets/splash-face-3.jpeg"), // wink
];

const FACE_DURATION = 800;

export default function SplashScreen() {

  const [faceIndex, setFaceIndex] = useState(0);

  useEffect(() => {

    const timer = setInterval(() => {
      setFaceIndex((prev) => (prev + 1) % FACES.length);
    }, FACE_DURATION);

    return () => clearInterval(timer);

  }, []);


  return (

    <View style={styles.container}>

      {/* App logo - animated face sequence */}
      <Image
        source={FACES[faceIndex]}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* App name */}
      <Text style={styles.appName}>
        MARKET
      </Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Understand the market.
      </Text>

    </View>

  );
}