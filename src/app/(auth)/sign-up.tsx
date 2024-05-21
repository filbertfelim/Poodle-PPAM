import { Link, Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Alert } from "react-native";
import {
  TextInput,
  Button,
  RadioButton,
  Text,
  Checkbox,
} from "react-native-paper";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";

const SignupScreen: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secureTextEntry, setSecureTextEntry] = useState<boolean>(false);
  const [cvLink, setCvLink] = useState<string>("");
  const [portfolioLink, setPortfolioLink] = useState<string>("");
  const [value, setValue] = React.useState("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const router = useRouter();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

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

  async function handleSignup() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    await supabase.from("User").insert({
      user_id: data.user?.id,
      email: email,
      name: username,
      role: value,
    });
    if (value === "seeker") {
      await supabase.from("ProjectSeeker").insert({
        seeker_id: data.user?.id,
        cv: cvLink,
        portfolio: portfolioLink,
      });
    } else {
      await supabase.from("ProjectOwner").insert({
        owner_id: data.user?.id,
      });
    }
    await supabase.from("Workspace").insert({
      workspace_name: "My Workspace",
      workspace_type: "private",
      user_id: data.user?.id,
    });
    if (error) Alert.alert(error.message);
    else
      Alert.alert(
        "Successfully signed up! Please verify your email before logging in!"
      );
  }

  async function handleSignupWithGoogle() {
    const redirectUri = AuthSession.makeRedirectUri();

    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUri },
    });

    const authUrl = data.url || "";

    try {
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

        const { data } = await supabase.auth.getUser(accessToken);
        const { error: userDataError } = await supabase
          .from("User")
          .select("*")
          .eq("user_id", data.user?.id)
          .single();
        if (!userDataError) {
          Alert.alert("Email has already been registered!");
        } else {
          router.push({
            pathname: "/(auth)/sign-up-data",
            params: {
              access_token: accessToken,
              refresh_token: refreshToken,
              user_id: data.user?.id,
              email: data.user?.email,
              name: data.user?.user_metadata.full_name,
            },
          });
        }
      } else {
        console.log("Auth session was cancelled or failed:", result.type);
      }
    } catch (error) {
      console.error("Failed to open web browser:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.header}>
        Create <Text style={styles.accountheader}>Account</Text>
      </Text>
      <Text style={styles.subheader}>Sign up to get started</Text>
      <TextInput
        label="Name"
        mode="outlined"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
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
        error={!!passwordError}
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
      <View style={styles.checkboxContainer}>
        <Checkbox.Android
          onPress={toggleSecureEntry}
          status={secureTextEntry ? "unchecked" : "checked"}
        />
        <Text style={styles.passwordText}>Show password</Text>
      </View>
      <Text style={styles.chooseType}>Choose user type</Text>
      <RadioButton.Group
        onValueChange={(value) => setValue(value)}
        value={value}
      >
        <RadioButton.Item
          label="Project Seeker"
          value="seeker"
          mode="android"
        />
        <RadioButton.Item label="Project Owner" value="owner" mode="android" />
      </RadioButton.Group>
      {value === "seeker" ? (
        <>
          <TextInput
            label="Link CV"
            mode="outlined"
            value={cvLink}
            onChangeText={setCvLink}
            style={styles.input}
          />
          <TextInput
            label="Link Portfolio"
            mode="outlined"
            value={portfolioLink}
            onChangeText={setPortfolioLink}
            style={styles.input}
          />
        </>
      ) : (
        <></>
      )}
      <Button
        mode="contained"
        onPress={handleSignup}
        style={[
          styles.disabledbutton,
          emailError == "" &&
            passwordError == "" &&
            email != "" &&
            password != "" &&
            username != "" &&
            value != "" &&
            ((value === "seeker" && cvLink != "" && portfolioLink != "") ||
              value === "owner") &&
            styles.button,
        ]}
        disabled={
          !(
            emailError === "" &&
            passwordError === "" &&
            email !== "" &&
            password !== "" &&
            username !== "" &&
            value !== "" &&
            ((value === "seeker" && cvLink !== "" && portfolioLink !== "") ||
              value === "owner")
          )
        }
      >
        Sign up
      </Button>
      <TouchableOpacity
        onPress={handleSignupWithGoogle}
        style={styles.googlebutton}
      >
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../assets/images/google.png")}
            style={styles.icon}
          />
        </View>
        <Text style={styles.text}>Sign Up With Google</Text>
      </TouchableOpacity>
      <Text style={styles.loginText}>
        Already have an account?{" "}
        <Link href={"/sign-in"} asChild>
          <Text style={styles.loginLink}>Login</Text>
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
  checkboxContainer: {
    flex: 0,
    flexDirection: "row",
  },
  passwordText: {
    color: "black",
    fontWeight: "bold",
    marginTop: 10,
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
  chooseType: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
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
  googlesignup: {
    color: "blue",
    marginTop: 10,
  },
  loginText: {
    marginTop: 10,
  },
  loginLink: {
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

export default SignupScreen;
