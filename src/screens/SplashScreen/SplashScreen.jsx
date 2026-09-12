
import { View, Text, Image } from "react-native";
import { useEffect, useState } from "react";

import styles from "./SplashScreen.styles";

// Splash face sequence, shown in order.
// The last face is the "fully loaded" state, shown right before
// entering the app and clearing the splash screen away.
const FACES = [
  require("../../../assets/splash-face-1.jpeg"), // eyes open
  require("../../../assets/splash-face-2.jpeg"), // eyes closed / resting
  require("../../../assets/splash-face-3.jpeg"), // wink - fully loaded, entering app
];

// How long each face stays on screen before switching to the next one (ms)
const FACE_DURATION = 800;


export default function SplashScreen({ navigation }) {

  const [faceIndex, setFaceIndex] = useState(0);

  useEffect(() => {

    const isLastFace = faceIndex === FACES.length - 1;

    const timer = setTimeout(() => {

      if (isLastFace) {
        // Fully loaded - go to the login screen
        navigation.replace("Login");
      } else {
        // Move on to the next face in the sequence
        setFaceIndex((prev) => prev + 1);
      }

    }, FACE_DURATION);

    // Clear timer
    return () => clearTimeout(timer);

  }, [faceIndex, navigation]);


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