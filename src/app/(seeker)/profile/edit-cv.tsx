import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, Pressable } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "@/providers/AuthProvider";

interface CVDetails {
  seeker_id: string;
  cv: string;
  portfolio: string;
}

export default function EditCV() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [file, setFile] = useState<CVDetails>({
    seeker_id: "",
    cv: "",
    portfolio: "",
  });
  const navigation = useNavigation();

  async function getCV() {
    try {
      const { data, error } = await supabase
        .from("ProjectSeeker")
        .select("*")
        .eq("seeker_id", user.user_id);
      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error fetching CV: ${errorMessage}`);
      }
      setFile(data[0]);
    } catch (error) {
      console.error("Failed to fetch CV:", error);
      throw error;
    }
  }
  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (user?.user_id && isFocused) {
      getCV();
    }
  }, [user?.user_id, isFocused]);

  const handleChange = (name: keyof CVDetails, value: string) => {
    setFile((prev) => ({ ...prev, [name]: value }));
  };

  const isButtonDisabled = file.cv === "";

  async function handleEditCV() {
    try {
      const { data, error } = await supabase
        .from("ProjectSeeker")
        .update([
          {
            cv: file.cv,
          },
        ])
        .eq("seeker_id", user.user_id);

      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error updating CV: ${errorMessage}`);
      }
      console.log("CV updated successfully:", data);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update CV:", error);
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
            CV
          </Text>
        </View>
        <View style={styles.bodyContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputTitle}>CV</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter CV"
              value={file.cv}
              onChangeText={(value) => handleChange("cv", value)}
              maxLength={80}
            />
            <Button
              mode="contained"
              style={[styles.button, isButtonDisabled && styles.disabledButton]}
              onPress={handleEditCV}
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
