import { StyleSheet, Alert, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { View } from "@/components/Themed";
import { useAuth } from "@/providers/AuthProvider";
import { Button, Text } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function TabOneScreen() {
  const { session, loading, user, isSeeker } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) Alert.alert(error.message);
    else router.replace("/(auth)/sign-in");
  }

  if (!user) {
    return <View />;
  } else {
    navigation.navigate("ProjectTabs" as never);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  button: {
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#471D67",
    paddingVertical: 5,
  },
});
