import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, Linking } from "react-native";
import { Button, Text, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "@/lib/supabase";

interface ApplicantInterface {
  application_id: number;
  application_status: string;
  seeker_id: string;
  project_id: string;
  project_title: string;
  owner_id: string;
}

interface SeekerInterface {
  seeker_id: string;
  cv: string;
  portfolio: string;
  email: string;
  name: string;
}

export default function ProjectApplicant() {
  const { projectApplicant } = useLocalSearchParams();
  const navigation = useNavigation();
  const [applicant, setApplicant] = useState<ApplicantInterface>();
  const [seeker, setSeeker] = useState<SeekerInterface>();

  const getApplicant = async (projectId: number) => {
    try {
      const { data, error } = await supabase
        .from("Application")
        .select(
          `
                application_id, 
                application_status, 
                seeker_id,
                project_id,
                Project (
                    project_title, 
                    owner_id
                )
            `
        )
        .eq("project_id", projectId)
        .order("application_date", { ascending: false });
      if (error) throw new Error(error.message);
      const app: any = data[0];
      const formattedData = {
        application_id: app.application_id,
        application_status: app.application_status,
        seeker_id: app.seeker_id,
        project_id: app.project_id,
        project_title: app.Project.project_title,
        owner_id: app.Project.owner_id,
      };
      setApplicant(formattedData);
      console.log("Success getting applicants");
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const getSeeker = async (seeker: string) => {
    try {
      const { data, error } = await supabase
        .from("ProjectSeeker")
        .select(
          `
                seeker_id, 
                cv, 
                portfolio,
                User (
                    email, 
                    name
                )
            `
        )
        .eq("seeker_id", seeker);
      if (error) throw new Error(error.message);
      const app: any = data[0];
      const formattedData = {
        seeker_id: app.seeker_id,
        cv: app.cv,
        portfolio: app.portfolio,
        email: app.User.email,
        name: app.User.name,
      };
      setSeeker(formattedData);
      console.log("Success fetching seeker data");
    } catch (error) {
      console.error("Error fetching seeker:", error);
    }
  };

  async function addWorkspace(projectId: number) {
    try {
      const { data, error } = await supabase.from("Workspace").insert([
        {
          workspace_name: applicant?.project_title,
          workspace_type: "project",
          project_id: projectId,
          user_id: applicant?.owner_id,
          seeker_id: applicant?.seeker_id,
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
    getApplicant(Number(projectApplicant));
    if (applicant?.seeker_id) {
      getSeeker(applicant.seeker_id);
    }
  }, [projectApplicant, applicant?.application_status]);

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

  if (applicant && seeker) {
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
          <Pressable onPress={() => openLink(seeker.cv)}>
            <Text style={styles.link}>{seeker.cv}</Text>
          </Pressable>
          <Divider style={styles.divider} />
          <Text style={styles.infoTitle}>Applicant Portfolio</Text>
          <Pressable onPress={() => openLink(seeker.portfolio)}>
            <Text style={styles.link}>{seeker.portfolio}</Text>
          </Pressable>
        </View>
        {applicant.application_status === "in review" && (
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() =>
                updateApplicationStatus(
                  applicant.application_id,
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
                  applicant.application_id,
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
