import { View, ActivityIndicator, StyleSheet } from "react-native";
import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

const index = () => {
  const { session, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#471D67" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }

  if (user?.role === "seeker") {
    return <Redirect href={"/(seeker)"} />;
  } else if (user?.role === "owner") {
    return <Redirect href={"/(owner)"} />;
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default index;
