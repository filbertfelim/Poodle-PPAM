import React, { useEffect, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Button, Text, Divider } from "react-native-paper";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "@/lib/supabase";

interface ProjectInterface {
  project_id: number;
  project_title: string;
  project_desc: string;
  project_deadline: Date;
  project_fee: number;
  project_status: string;
  project_date_created: string;
  owner_id: string;
}

export default function ProjectDetails() {
  const isFocused = useIsFocused();
  const { projectId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [project, setProject] = useState<ProjectInterface>();

  const getProjectById = async (projectId: number) => {
    try {
      const { data, error } = await supabase
        .from("Project")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw new Error(error.message);
      setProject(data[0]);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getProjectById(Number(projectId));
    }
  }, [isFocused]);

  const getStatusStyles = (status: string) => {
    if (status === "available") {
      return {
        container: styles.statusContainerAvailable,
        text: styles.statusTextAvailable,
        dot: styles.statusDotAvailable,
      };
    } else if (status === "unavailable") {
      return {
        container: styles.statusContainerUnavailable,
        text: styles.statusTextUnavailable,
        dot: styles.statusDotUnavailable,
      };
    } else {
      return {
        container: styles.statusContainerInReview,
        text: styles.statusTextInReview,
        dot: styles.statusDotInReview,
      };
    }
  };

  const capitalizeWords = (sentence: string) => {
    return sentence
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (project) {
    const statusStyles = getStatusStyles(project.project_status);
    const capitalizedStatus = capitalizeWords(project.project_status);
    const formattedDate = new Date(project.project_deadline).toLocaleDateString(
      "en-GB",
      { day: "2-digit", month: "long", year: "numeric" }
    );
    const isProjectAvailable = project.project_status === "available";

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" color="#471D67" size={30} />
          </Pressable>
        </View>
        <View style={styles.bodyContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{project.project_title}</Text>
            <Text style={styles.sectionTitle}>Project Description :</Text>
            <Text style={styles.description}>{project.project_desc}</Text>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Status Project :</Text>
            <View style={styles.statusWrapper}>
              <View style={statusStyles.container}>
                <Text style={statusStyles.text}>{capitalizedStatus}</Text>
                <View style={statusStyles.dot} />
              </View>
              <Icon name="help-circle-outline" color="#777777" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              Project Estimation Deadline :
            </Text>
            <View style={styles.deadlineWrapper}>
              <Text style={styles.deadlineLabel}>max.</Text>
              <Text style={styles.deadlineText}>{formattedDate}</Text>
            </View>
            <Text style={styles.sectionTitle}>Project Fee :</Text>
            <View style={styles.feeWrapper}>
              <Text style={styles.feeLabel}>IDR</Text>
              <Text style={styles.feeText}>
                {project.project_fee.toLocaleString("id-ID")}
              </Text>
            </View>
          </ScrollView>
          <Button
            mode="contained"
            style={[styles.button, isProjectAvailable && styles.disabledButton]}
            labelStyle={[
              styles.buttonText,
              isProjectAvailable && styles.disabledButtonText,
            ]}
            disabled={isProjectAvailable}
            onPress={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: "ProjectApplicant",
                  params: { projectApplicant: projectId },
                })
              );
            }}
          >
            View Applicants
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 18,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 10,
  },
  bodyContainer: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    color: "#471D67",
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#777777",
  },
  divider: {
    marginVertical: 25,
    paddingHorizontal: 25,
    height: 1,
  },
  deadlineWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  deadlineLabel: {
    fontSize: 14,
    color: "#777777",
    fontWeight: "bold",
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4E833C",
  },
  feeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  feeLabel: {
    fontSize: 14,
    color: "#777777",
    fontWeight: "bold",
  },
  feeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4E833C",
  },
  statusWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    justifyContent: "space-between",
  },
  statusContainerAvailable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0ECFD",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    width: 150,
    marginTop: 3,
    justifyContent: "space-between",
  },
  statusTextAvailable: {
    color: "#151970",
    fontWeight: "bold",
  },
  statusDotAvailable: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#151970",
  },
  statusContainerUnavailable: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    width: 150,
    marginTop: 3,
    justifyContent: "space-between",
  },
  statusTextUnavailable: {
    color: "#646464",
    fontWeight: "bold",
  },
  statusDotUnavailable: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#646464",
  },
  statusContainerInReview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFCBE",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    width: 150,
    marginTop: 3,
    justifyContent: "space-between",
  },
  statusTextInReview: {
    color: "#C67243",
    fontWeight: "bold",
  },
  statusDotInReview: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#C67243",
  },
  button: {
    marginTop: 25,
    borderRadius: 12,
    backgroundColor: "#471D67",
    paddingVertical: 3,
  },
  disabledButton: {
    backgroundColor: "#E6E6E6",
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  disabledButtonText: {
    color: "#A2A2A2",
    fontSize: 15,
    fontWeight: "500",
  },
});