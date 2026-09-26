import {
  View,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

export default function WelcomeScreen({ navigation }) {
  const { completeOnboarding } = useAuth();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../../assets/first_page_login_started.png")}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* Login button touch area */}
        <Pressable
          style={styles.loginButton}
          onPress={completeOnboarding}
          android_ripple={{ color: "rgba(255,255,255,0.08)" }}
        />

        {/* Get Started button touch area */}
        <Pressable
          style={styles.startButton}
          onPress={() => navigation.navigate("OnboardingQuestions")}
          android_ripple={{ color: "rgba(0,0,0,0.08)" }}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  loginButton: {
    position: "absolute",

    // Matches the Login button in the background image
    left: "7%",
    bottom: "3.7%",

    width: "44%",
    height: "7%",
  },

  startButton: {
    position: "absolute",

    // Matches the Get Started button in the background image
    right: "3.5%",
    bottom: "3.7%",

    width: "44%",
    height: "7%",
  },
});