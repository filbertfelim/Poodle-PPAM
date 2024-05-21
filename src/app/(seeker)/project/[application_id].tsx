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

interface ApplicationInfoInterface {
  application_id: number;
  application_status: string;
  application_date: string;
  project_id: number;
  project_title: string;
  project_desc: string;
  project_deadline: Date;
  project_fee: number;
  owner_id: string;
  email: string;
  name: string;
}

export default function ApplicationDetails() {
  const isFocused = useIsFocused();
  const { applicationId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [applicationInfo, setApplicationInfo] =
    useState<ApplicationInfoInterface>();

  const getApplicationInfo = async (applicationId: number) => {
    try {
      const { data, error } = await supabase
        .from("Application")
        .select(
          `
                    application_id,
                    application_status,
                    application_date,
                    project_id,
                    Project (
                        project_title,
                        project_desc,
                        project_deadline,
                        project_fee,
                        owner_id,
                        ProjectOwner (
                          User (
                            email,
                            name
                          )
                        )
                    )

                `
        )
        .eq("application_id", applicationId);
      if (error) throw new Error(error.message);
      const app: any = data[0];
      const formattedData = {
        application_id: app.application_id,
        application_status: app.application_status,
        application_date: app.application_date,
        project_id: app.project_id,
        project_title: app.Project.project_title,
        project_desc: app.Project.project_desc,
        project_deadline: app.Project.project_deadline,
        project_fee: app.Project.project_fee,
        owner_id: app.Project.owner_id,
        email: app.Project.ProjectOwner.User.email,
        name: app.Project.ProjectOwner.User.name,
      };
      setApplicationInfo(formattedData);
      console.log("Success fetching application information");
    } catch (error) {
      console.error("Error fetching application information:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getApplicationInfo(Number(applicationId));
    }
  }, [isFocused]);

  const getStatusStyles = (status: string) => {
    if (status === "approved") {
      return {
        container: styles.statusContainerAvailable,
        text: styles.statusTextAvailable,
        dot: styles.statusDotAvailable,
      };
    } else if (status === "rejected") {
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

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (applicationInfo) {
    const statusStyles = getStatusStyles(applicationInfo.application_status);
    const capitalizedStatus = capitalizeWords(
      applicationInfo.application_status
    );
    const formattedDeadline = new Date(
      applicationInfo.project_deadline
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const formattedApplied = new Date(
      applicationInfo.application_date
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" color="#471D67" size={30} />
          </Pressable>
        </View>
        <View style={styles.bodyContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{applicationInfo.project_title}</Text>
            <Text style={styles.sectionTitle}>Project Description :</Text>
            <Text style={styles.description}>
              {applicationInfo.project_desc}
            </Text>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Application Status :</Text>
            <View style={styles.defaultWrapper}>
              <View style={statusStyles.container}>
                <Text style={statusStyles.text}>{capitalizedStatus}</Text>
                <View style={statusStyles.dot} />
              </View>
              <Icon name="help-circle-outline" color="#777777" size={20} />
            </View>
            <Text style={styles.sectionTitle}>
              Project Estimation Deadline :
            </Text>
            <View style={styles.defaultWrapper}>
              <Text style={styles.defaultLabel}>max.</Text>
              <Text style={styles.defaultText}>{formattedDeadline}</Text>
            </View>
            <Text style={styles.sectionTitle}>Project Fee :</Text>
            <View style={styles.defaultWrapper}>
              <Text style={styles.defaultLabel}>IDR</Text>
              <Text style={styles.defaultText}>
                {applicationInfo.project_fee.toLocaleString("id-ID")}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Contact :</Text>
            <View style={styles.contactWrapper}>
              <View style={styles.contactDetailWrapper}>
                <Text style={styles.contactLabel}>Name</Text>
                <Text style={styles.contactText}>{applicationInfo.name}</Text>
              </View>
              <View style={styles.contactDetailWrapper}>
                <Text style={styles.contactLabel}>Email</Text>
                <Pressable
                  onPress={() => handleEmailPress(applicationInfo.email)}
                >
                  <Text style={styles.contactText}>
                    {applicationInfo.email}
                  </Text>
                </Pressable>
              </View>
              <Text style={styles.note}>
                * feel free to contact the project owner to ask more about the
                detail information regarding the project specification
              </Text>
            </View>
            <Text style={styles.appliedDate}>
              Applied at {formattedApplied}
            </Text>
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
  appliedDate: {
    fontSize: 12,
    textAlign: "right",
    color: "red",
    fontWeight: "bold",
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
