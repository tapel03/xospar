
import { View, Text, Image } from "react-native";
import { useEffect } from "react";

import styles from "./SplashScreen.styles";

export default function SplashScreen({ navigation }) 
{

  // Wait 3 seconds and then move to Home
  useEffect(() => {

    const timer = setTimeout(() => {

      // Navigate to Home Screen
      navigation.replace("Home");

    }, 3000);

    // Clear timer when screen closes
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

      {/* App tagline */}
      <Text style={styles.tagline}>
        Understand the market.
      </Text>

    </View>
  );
}
