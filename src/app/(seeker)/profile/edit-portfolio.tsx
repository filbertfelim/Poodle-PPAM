import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, Pressable } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/providers/AuthProvider";

interface PortfolioDetails {
  seeker_id: string;
  cv: string;
  portfolio: string;
}

export default function EditPortfolio() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [file, setFile] = useState<PortfolioDetails>({
    seeker_id: "",
    cv: "",
    portfolio: "",
  });
  const navigation = useNavigation();

  async function getPortfolio() {
    try {
      const { data, error } = await supabase
        .from("ProjectSeeker")
        .select("*")
        .eq("seeker_id", user.user_id);
      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error fetching portfolio: ${errorMessage}`);
      }
      setFile(data[0]);
      console.log("Portfolio fetched successfully:", data);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
      throw error;
    }
  }
  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (user?.user_id && isFocused) {
      getPortfolio();
    }
  }, [user?.user_id, isFocused]);

  const handleChange = (name: keyof PortfolioDetails, value: string) => {
    setFile((prev) => ({ ...prev, [name]: value }));
  };

  const isButtonDisabled = file.portfolio === "";

  async function handleEditPortfolio() {
    try {
      const { data, error } = await supabase
        .from("ProjectSeeker")
        .update([
          {
            portfolio: file.portfolio,
          },
        ])
        .eq("seeker_id", user.user_id);

      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error updating portfolio: ${errorMessage}`);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update portfolio:", error);
      throw error;
    }
  }
  if (file.seeker_id === "") {
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#471D67" />
    </View>;
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={goBack}>
            <Icon name="chevron-left" color="#471D67" size={30} />
          </Pressable>
          <Text variant="headlineSmall" style={styles.header}>
            Portfolio
          </Text>
        </View>
        <View style={styles.bodyContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputTitle}>Portfolio</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter portfolio"
              value={file.portfolio}
              onChangeText={(value) => handleChange("portfolio", value)}
              maxLength={80}
            />
            <Button
              mode="contained"
              style={[styles.button, isButtonDisabled && styles.disabledButton]}
              onPress={handleEditPortfolio}
              disabled={isButtonDisabled}
            >
              <Text
                style={[
                  styles.buttonText,
                  isButtonDisabled && styles.disabledButtonText,
                ]}
              >
                Update CV
              </Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  header: {
    marginLeft: 15,
    textAlign: "left",
    fontWeight: "bold",
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    padding: 10,
  },
  inputTitle: {
    fontSize: 16,
    marginTop: 5,
  },
  input: {
    backgroundColor: "transparent",
    marginBottom: 10,
    fontSize: 15,
    paddingHorizontal: 0,
  },
  datePicker: {
    height: 150,
  },
  button: {
    marginTop: 25,
    borderRadius: 12,
    backgroundColor: "#471D67",
    paddingVertical: 4,
  },
  disabledButton: {
    backgroundColor: "#E6E6E6",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "medium",
  },
  disabledButtonText: {
    color: "#A2A2A2",
    fontSize: 16,
    fontWeight: "medium",
  },
});
