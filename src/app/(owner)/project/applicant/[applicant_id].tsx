import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Linking,
  InteractionManager,
} from "react-native";
import { Button, Text, Divider } from "react-native-paper";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "@/lib/supabase";

interface ApplicationInterface {
  application_id: number;
  application_status: string;
  seeker_id: string;
}

interface ApplicantInterface {
  seeker_id: string;
  cv: string;
  portfolio: string;
}

interface SeekerInterface {
  user_id: string;
  email: string;
  name: string;
}

interface ProjectInterface {
  project_id: number;
  project_title: string;
  owner_id: string;
}

export default function ProjectApplicant() {
  const { projectApplicant } = useLocalSearchParams();
  const navigation = useNavigation();
  const [application, setApplication] = useState<ApplicationInterface>();
  const [applicant, setApplicant] = useState<ApplicantInterface>();
  const [seeker, setSeeker] = useState<SeekerInterface>();
  const [project, setProject] = useState<ProjectInterface>();

  const getApplication = async (projectApplicant: number) => {
    try {
      const { data, error } = await supabase
        .from("Application")
        .select("application_id, application_status, seeker_id")
        .eq("project_id", projectApplicant)
        .order("application_date", { ascending: false });
      if (error) throw new Error(error.message);
      setApplication(data[0]);
      console.log("Success fetching application data");
    } catch (error) {
      console.error("Error fetching application:", error);
    }
  };

  const getApplicant = async (applicant: string) => {
    try {
      const { data, error } = await supabase
        .from("ProjectSeeker")
        .select("*")
        .eq("seeker_id", applicant);
      if (error) throw new Error(error.message);
      setApplicant(data[0]);
      console.log("Success fetching applicant data");
    } catch (error) {
      console.error("Error fetching applicant:", error);
    }
  };

  const getSeeker = async (seeker: string) => {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("user_id, email, name")
        .eq("user_id", seeker);
      if (error) throw new Error(error.message);
      setSeeker(data[0]);
      console.log("Success fetching seeker data");
    } catch (error) {
      console.error("Error fetching seeker:", error);
    }
  };

  const getProjectById = async (projectId: number) => {
    try {
      const { data, error } = await supabase
        .from("Project")
        .select("project_id, project_title, owner_id")
        .eq("project_id", projectId);
      if (error) throw new Error(error.message);
      setProject(data[0]);
      console.log("Success fetching project data");
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  async function addWorkspace(projectId: number) {
    try {
      const { data, error } = await supabase.from("Workspace").insert([
        {
          workspace_name: project?.project_title,
          workspace_type: "project",
          project_id: projectId,
          user_id: project?.owner_id,
          seeker_id: application?.seeker_id,
        },
      ]);
      if (error) {
        const errorMessage = error.message;
        throw new Error(`Error adding workspace: ${errorMessage}`);
      }
      console.log("Workspace added successfully:", data);
    } catch (error) {
      console.error("Failed to add workspace:", error);
      throw error;
    }
  }

  const updateApplicationStatus = async (
    applicationId: number,
    status: string,
    projectId: number
  ) => {
    try {
      const { error } = await supabase
        .from("Application")
        .update({ application_status: status })
        .eq("application_id", applicationId);
      console.log("Success updating application status");
      if (status === "rejected") {
        const { error } = await supabase
          .from("Project")
          .update({ project_status: "available" })
          .eq("project_id", projectId);
        console.log("Success updating project status");
      } else {
        addWorkspace(projectId);
        const { error } = await supabase
          .from("Project")
          .update({ project_status: "unavailable" })
          .eq("project_id", projectId);
        console.log("Success updating project status");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  useEffect(() => {
    getApplication(Number(projectApplicant));
    getProjectById(Number(projectApplicant));
    if (application?.seeker_id) {
      getApplicant(application.seeker_id);
      getSeeker(application.seeker_id);
    }
  });

  const capitalizeWords = (sentence: string) => {
    return sentence
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Error opening link:", err)
    );
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (application && applicant && seeker) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Icon name="chevron-left" color="#471D67" size={30} />
          </Pressable>
          <Text variant="headlineSmall" style={styles.header}>
            Applicants Info
          </Text>
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.infoTitle}>Applicant Name</Text>
          <Text>{capitalizeWords(seeker.name)}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.infoTitle}>Applicant Email</Text>
          <Pressable onPress={() => handleEmailPress(seeker.email)}>
            <Text>{seeker.email}</Text>
          </Pressable>
          <Divider style={styles.divider} />
          <Text style={styles.infoTitle}>Applicant CV</Text>
          <Pressable onPress={() => openLink(applicant.cv)}>
            <Text style={styles.link}>{applicant.cv}</Text>
          </Pressable>
          <Divider style={styles.divider} />
          <Text style={styles.infoTitle}>Applicant Portfolio</Text>
          <Pressable onPress={() => openLink(applicant.portfolio)}>
            <Text style={styles.link}>{applicant.portfolio}</Text>
          </Pressable>
        </View>
        {application.application_status === "in review" && (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() =>
                updateApplicationStatus(
                  application.application_id,
                  "approved",
                  Number(projectApplicant)
                )
              }
              style={styles.buttonApprove}
            >
              <Text style={styles.buttonApproveText}>Approve</Text>
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                updateApplicationStatus(
                  application.application_id,
                  "rejected",
                  Number(projectApplicant)
                )
              }
              style={styles.buttonReject}
            >
              <Text style={styles.buttonRejectText}>Reject</Text>
            </Button>
          </View>
        )}
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
    marginBottom: 20,
  },
  header: {
    marginLeft: 15,
    fontWeight: "bold",
    flex: 1,
  },
  bodyContainer: {
    padding: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#A2A2A2",
    marginBottom: 7,
  },
  divider: {
    marginVertical: 18,
    paddingHorizontal: 25,
    height: 1,
  },
  link: {
    textDecorationLine: "underline",
    lineHeight: 20,
  },
  buttonContainer: {
    flex: 1,
    marginBottom: 10,
    gap: 18,
    justifyContent: "flex-end",
  },
  buttonApprove: {
    borderRadius: 20,
    backgroundColor: "#471D67",
    paddingVertical: 2,
  },
  buttonApproveText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonReject: {
    borderRadius: 20,
    borderColor: "#471D67",
    paddingVertical: 2,
  },
  buttonRejectText: {
    color: "#471D67",
    fontSize: 15,
    fontWeight: "bold",
  },
});
