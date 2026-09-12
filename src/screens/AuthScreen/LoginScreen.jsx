import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {

  const handleLogin = () => {
    navigation.replace("Main");
  };

  return (
    <View style={styles.container}>

      {/* LOGO */}
      <View style={styles.logo}>
        <Ionicons name="analytics" size={54} color="#3A7BD5" />
      </View>

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Log in to continue tracking the markets
      </Text>

      {/* FAKE INPUT BOXES — just for layout, not functional */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={18} color="#8C949E" />
          <Text style={styles.placeholderText}>you@example.com</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={18} color="#8C949E" />
          <Text style={styles.placeholderText}>••••••••</Text>
        </View>
      </View>

      <Pressable style={styles.forgotButton}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </Pressable>

      {/* LOGIN BUTTON */}
      <Pressable style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </Pressable>

      {/* DIVIDER */}
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.divider} />
      </View>

      {/* SOCIAL BUTTONS */}
      <Pressable style={styles.socialButton}>
        <Ionicons name="logo-google" size={18} color="#FFFFFF" />
        <Text style={styles.socialText}>Continue with Google</Text>
      </Pressable>

      <Pressable style={styles.socialButton}>
        <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
        <Text style={styles.socialText}>Continue with Apple</Text>
      </Pressable>

      {/* SIGN UP LINK */}
      <View style={styles.signUpRow}>
        <Text style={styles.signUpText}>Don't have an account? </Text>

        <Pressable onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingTop: 70,
    alignItems: "center",
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
  },

  subtitle: {
    color: "#8C949E",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 30,
    textAlign: "center",
  },

  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },

  label: {
    color: "#C8CDD3",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  inputBox: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },

  placeholderText: {
    color: "#5F6B76",
    fontSize: 14,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },

  forgotText: {
    color: "#3A7BD5",
    fontSize: 13,
    fontWeight: "600",
  },

  loginButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
    gap: 10,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#1C2630",
  },

  dividerText: {
    color: "#5F6B76",
    fontSize: 12,
  },

  socialButton: {
    width: "100%",
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1C2630",
    backgroundColor: "#101820",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },

  socialText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  signUpRow: {
    flexDirection: "row",
    marginTop: 20,
  },

  signUpText: {
    color: "#8C949E",
    fontSize: 14,
  },

  signUpLink: {
    color: "#3A7BD5",
    fontSize: 14,
    fontWeight: "700",
  },
});