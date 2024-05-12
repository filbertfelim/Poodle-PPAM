import { Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button, Text, RadioButton } from "react-native-paper";
import { supabase } from "@/lib/supabase";

const SignUpDataScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const { access_token, refresh_token, user_id, email, name } = params;

  const [cvLink, setCvLink] = useState<string>("");
  const [portfolioLink, setPortfolioLink] = useState<string>("");
  const [value, setValue] = React.useState("");

  async function handleSignup() {
    await supabase.from("User").insert({
      user_id: user_id,
      email: email,
      name: name,
      role: value,
    });
    if (value === "seeker") {
      await supabase.from("ProjectSeeker").insert({
        seeker_id: user_id,
        cv: cvLink,
        portfolio: portfolioLink,
      });
    } else {
      await supabase.from("ProjectOwner").insert({
        owner_id: user_id,
      });
    }
    await supabase.from("Workspace").insert({
      workspace_name: "My Workspace",
      workspace_type: "private",
      user_id: user_id,
    });
    await supabase.auth.setSession({
      access_token: access_token as string,
      refresh_token: refresh_token as string,
    });
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.header}>
        Complete <Text style={styles.accountheader}>Your Data!</Text>
      </Text>
      <Text style={styles.subheader}>Choose user type</Text>
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
          value != "" &&
            ((value === "seeker" && cvLink != "" && portfolioLink != "") ||
              value === "owner") &&
            styles.button,
        ]}
        disabled={
          !(
            value !== "" &&
            ((value === "seeker" && cvLink !== "" && portfolioLink !== "") ||
              value === "owner")
          )
        }
      >
        Sign up
      </Button>
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
    marginBottom: 30,
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

export default SignUpDataScreen;
