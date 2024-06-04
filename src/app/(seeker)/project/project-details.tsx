import React, { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, ScrollView, Linking } from "react-native";
import { Button, Text, Divider } from "react-native-paper";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

interface ProjectInterface {
  project_id: number;
  project_title: string;
  project_desc: string;
  project_deadline: Date;
  project_fee: number;
  project_status: string;
  project_date_created: string;
  owner_id: string;
  email: string;
  name: string;
}

export default function ProjectSearchDetails() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const { projectId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [project, setProject] = useState<ProjectInterface>();

  const getProjectById = async (projectId: number) => {
    try {
      const { data, error } = await supabase
        .from("Project")
        .select(
          `
                  project_id,
                  project_title,
                  project_desc,
                  project_deadline,
                  project_fee,
                  project_status,
                  project_date_created,
                  owner_id,
                  ProjectOwner (
                    User (
                      email,
                      name
                    )
                  )`
        )
        .eq("project_id", projectId);
      if (error) throw new Error(error.message);
      const app: any = data[0];
      const formattedData = {
        project_id: app.project_id,
        project_title: app.project_title,
        project_desc: app.project_desc,
        project_deadline: app.project_deadline,
        project_fee: app.project_fee,
        project_status: app.project_status,
        project_date_created: app.project_date_created,
        owner_id: app.owner_id,
        email: app.ProjectOwner.User.email,
        name: app.ProjectOwner.User.name,
      };
      setProject(formattedData);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  async function applyProject() {
    try {
      const { data, error } = await supabase.from("Application").insert([
        {
          application_status: "in review",
          application_date: new Date(),
          seeker_id: user.user_id,
          project_id: projectId,
        },
      ]);
      if (error) throw new Error(error.message);

      const { error: projectError } = await supabase
        .from("Project")
        .update([
          {
            project_status: "in review",
          },
        ])
        .eq("project_id", projectId);
      if (projectError) throw new Error(projectError.message);
      navigation.goBack();
    } catch (error) {
      console.error("Error applying for project:", error);
    }
  }

  useEffect(() => {
    if (isFocused) {
      getProjectById(Number(projectId));
    }
  }, [isFocused]);

  const capitalizeWords = (sentence: string) => {
    return sentence
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (project) {
    const capitalizedStatus = capitalizeWords(project.project_status);
    const formattedDate = new Date(project.project_deadline).toLocaleDateString(
      "en-GB",
      { day: "2-digit", month: "long", year: "numeric" }
    );

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
            <View style={styles.defaultWrapper}>
              <View style={styles.statusContainerAvailable}>
                <Text style={styles.statusTextAvailable}>
                  {capitalizedStatus}
                </Text>
                <View style={styles.statusDotAvailable} />
              </View>
              <Icon name="help-circle-outline" color="#777777" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              Project Estimation Deadline :
            </Text>
            <View style={styles.defaultWrapper}>
              <Text style={styles.defaultLabel}>max.</Text>
              <Text style={styles.defaultText}>{formattedDate}</Text>
            </View>
            <Text style={styles.sectionTitle}>Project Fee :</Text>
            <View style={styles.defaultWrapper}>
              <Text style={styles.defaultLabel}>IDR</Text>
              <Text style={styles.defaultText}>
                {project.project_fee.toLocaleString("id-ID")}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Contact :</Text>
            <View style={styles.contactWrapper}>
              <View style={styles.contactDetailWrapper}>
                <Text style={styles.contactLabel}>Name</Text>
                <Text style={styles.contactText}>{project.name}</Text>
              </View>
              <View style={styles.contactDetailWrapper}>
                <Text style={styles.contactLabel}>Email</Text>
                <Pressable onPress={() => handleEmailPress(project.email)}>
                  <Text style={styles.contactText}>{project.email}</Text>
                </Pressable>
              </View>
              <Text style={styles.note}>
                * feel free to contact the project owner to ask more about the
                detail information regarding the project specification
              </Text>
            </View>
          </ScrollView>
          <Button
            mode="contained"
            style={styles.button}
            labelStyle={styles.buttonText}
            onPress={applyProject}
          >
            Apply Project
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
  defaultWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  defaultLabel: {
    fontSize: 14,
    color: "#777777",
    fontWeight: "bold",
  },
  defaultText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4E833C",
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
  contactWrapper: {
    flexDirection: "column",
    marginBottom: 25,
  },
  contactDetailWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: "#777777",
  },
  contactText: {
    fontSize: 14,
  },
  note: {
    fontSize: 12,
    color: "#A2A2A2",
    textAlign: "justify",
  },
});
