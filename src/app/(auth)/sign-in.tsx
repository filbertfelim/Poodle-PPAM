import { Link, Stack } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Alert } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  async function openGoogleSignIn() {
    // Your Supabase URL for Google authentication

    const redirectUri = AuthSession.makeRedirectUri();

    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUri },
    });

    const authUrl = data.url || "";

    try {
      // Attempt to open the web browser for auth and wait for the redirect to come back to the app
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
      if (result.type === "success") {
        const parsedUrl = new URL(result.url);
        const accessToken = parsedUrl.hash.split("&").reduce((acc, part) => {
          const item = part.split("=");
          if (item[0] === "#access_token") acc = decodeURIComponent(item[1]);
          return acc;
        }, "");
        const refreshToken = parsedUrl.hash.split("&").reduce((acc, part) => {
          const item = part.split("=");
          if (item[0] === "refresh_token") acc = decodeURIComponent(item[1]);
          return acc;
        }, "");

        const { data, error } = await supabase.auth.getUser(accessToken);
        const { data: userData, error: userDataError } = await supabase
          .from("User")
          .select("*")
          .eq("user_id", data.user?.id)
          .single();
        if (userDataError) {
          Alert.alert("Could not find this email, please sign up!");
        } else {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      } else {
        console.log("Auth session was cancelled or failed:", result.type);
      }
    } catch (error) {
      console.error("Failed to open web browser:", error);
    }
  }

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (password: string) => {
    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
    } else {
      setPasswordError("");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.header}>
        Welcome <Text style={styles.accountheader}>Again!</Text>
      </Text>
      <Text style={styles.subheader}>Log in to continue</Text>
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={(email) => {
          setEmail(email);
          validateEmail(email);
        }}
        style={styles.input}
        error={!!emailError}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={(password) => {
          setPassword(password);
          validatePassword(password);
        }}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={secureTextEntry ? "eye" : "eye-off"}
            onPress={toggleSecureEntry}
          />
        }
        error={!!passwordError}
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
      <Button
        mode="contained"
        onPress={handleLogin}
        style={[
          styles.disabledbutton,
          emailError == "" &&
            passwordError == "" &&
            email != "" &&
            password != "" &&
            styles.button,
        ]}
        disabled={
          !(
            emailError == "" &&
            passwordError == "" &&
            email != "" &&
            password != ""
          )
        }
      >
        Log in
      </Button>
      <TouchableOpacity onPress={openGoogleSignIn} style={styles.googlebutton}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../assets/images/google.png")}
            style={styles.icon}
          />
        </View>
        <Text style={styles.text}>Log in With Google</Text>
      </TouchableOpacity>
      <Text style={styles.signupText}>
        Don't have an account?{" "}
        <Link href={"/sign-up"} asChild>
          <Text style={styles.signupLink}>Sign up</Text>
        </Link>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  header: {
    fontSize: 38,
    marginBottom: 4,
    fontWeight: "bold",
  },
  accountheader: {
    fontSize: 38,
    color: "#471D67",
    marginBottom: 4,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 10,
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "transparent",
    borderRadius: 20,
  },
  text: {
    color: "black",
    fontWeight: "bold",
  },
  button: {
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#471D67",
    paddingVertical: 5,
  },
  disabledbutton: {
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#B7B7B7",
    paddingVertical: 5,
    color: "#FFFFFF",
  },
  signupText: {
    marginTop: 10,
  },
  signupLink: {
    color: "blue",
  },
  googlebutton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#471D67",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  error: {
    color: "red",
    marginBottom: 5,
  },
});

export default SignInScreen;
