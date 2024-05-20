import { useAuth } from "@/providers/AuthProvider";
import { View } from "@/components/Themed";
import { FlatList, Pressable, SafeAreaView, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface ApplicationInterface {
  application_id: number;
  application_status: string;
  application_date: string;
  project_id: string;
  project_title: string;
  project_desc: string;
  project_fee: number;
}

export default function SeekerProjects() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [applications, setApplications] = useState<ApplicationInterface[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const getApplications = async (seekerId: string) => {
    setLoading(true);
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
                    project_fee
                )
            `
        )
        .eq("seeker_id", seekerId)
        .order("application_date", { ascending: false });
      if (error) throw new Error(error.message);
      const formattedData = data.map((app: any) => ({
        application_id: app.application_id,
        application_status: app.application_status,
        application_date: app.application_date,
        project_id: app.project_id,
        project_title: app.Project.project_title,
        project_desc: app.Project.project_desc,
        project_fee: app.Project.project_fee,
      }));
      setApplications(formattedData);
      console.log("Success getting applications");
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id && isFocused) {
      getApplications(user.user_id);
    }
  }, [user?.user_id, isFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.user_id) {
      await getApplications(user.user_id);
    }
    setRefreshing(false);
  };

  const formatFee = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const renderItem = ({ item }: { item: ApplicationInterface }) => (
    <Pressable style={styles.projectItem}>
      <Text style={styles.projectTitle}>{item.project_title}</Text>
      <View style={styles.statusWrapper}>
        {item.application_status === "approved" && (
          <View style={styles.statusContainerApproved}>
            <Text style={styles.statusTextApproved}>Approved</Text>
          </View>
        )}
        {item.application_status === "in review" && (
          <View style={styles.statusContainerInReview}>
            <Text style={styles.statusTextInReview}>In Review</Text>
          </View>
        )}
        {item.application_status === "rejected" && (
          <View style={styles.statusContainerRejected}>
            <Text style={styles.statusTextRejected}>Rejected</Text>
          </View>
        )}
      </View>
      <Text style={styles.projectFee}>
        <Text>Fee : </Text>
        <Text style={styles.numberFee}>{formatFee(item.project_fee)}</Text>
      </Text>
      <Text style={styles.projectDesc} numberOfLines={3}>
        {item.project_desc}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#471D67" />
      </View>
    );
  }

  if (applications.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text variant="headlineSmall" style={styles.textHeader}>
            Your Applications
          </Text>
        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={applications}
          keyExtractor={(item) => item.application_id.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text variant="headlineSmall" style={styles.textHeader}>
            Your Applications
          </Text>
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.noProjects}>
            {
              "You haven't applied to any projects.\nLet's start explore available projects!"
            }
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 25,
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
    marginTop: 25,
    marginBottom: 20,
  },
  textHeader: {
    textAlign: "center",
    fontFamily: "Inter",
    fontWeight: "bold",
  },
  projectItem: {
    flexDirection: "column",
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    gap: 6,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  projectFee: {
    fontSize: 13,
  },
  numberFee: {
    color: "#4E833C",
    fontWeight: "bold",
  },
  projectDesc: {
    color: "#777777",
    fontSize: 12,
  },
  bodyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noProjects: {
    textAlign: "center",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "bold",
    color: "#471D67",
  },
  statusWrapper: {
    alignItems: "flex-start",
    marginVertical: 5,
    justifyContent: "space-between",
  },
  statusContainerApproved: {
    alignItems: "center",
    backgroundColor: "#E0ECFD",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    justifyContent: "space-between",
  },
  statusTextApproved: {
    color: "#151970",
    fontWeight: "bold",
    fontSize: 12,
  },
  statusContainerInReview: {
    alignItems: "center",
    backgroundColor: "#FFFCBE",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    justifyContent: "space-between",
  },
  statusTextInReview: {
    color: "#C67243",
    fontWeight: "bold",
    fontSize: 12,
  },
  statusContainerRejected: {
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    justifyContent: "space-between",
  },
  statusTextRejected: {
    color: "#646464",
    fontWeight: "bold",
    fontSize: 12,
  },
});
