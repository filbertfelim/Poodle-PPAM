import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { Link, Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

const index = () => {
  const { session, loading, user, isSeeker } = useAuth();

  //   if (loading) {
  //     return <ActivityIndicator />;
  //   }

  if (!session) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }
  console.log(user);
  console.log(session);

  if (!isSeeker) {
    return <Redirect href={"/(seeker)"} />;
  } else {
    return <Redirect href={"/(owner)"} />;
  }
};

export default index;
