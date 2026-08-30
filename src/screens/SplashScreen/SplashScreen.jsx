
import { View, Text, Image } from "react-native";
import { useEffect } from "react";

import styles from "./SplashScreen.styles";


export default function SplashScreen({ navigation }) {

  // Wait 3 seconds
  useEffect(() => {

    const timer = setTimeout(() => {

      // Go to the main application
      navigation.replace("Main");

    }, 3000);


    // Clear timer
    return () => clearTimeout(timer);

  }, [navigation]);


  return (

    <View style={styles.container}>

      {/* App logo */}
      <Image
        source={require("../../../assets/logO.jpeg")}
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
