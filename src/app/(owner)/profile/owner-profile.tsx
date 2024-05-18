import React, { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Avatar, List, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function OwnerProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const [visible, setVisible] = React.useState(false);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) Alert.alert(error.message);
    else router.replace("/(auth)/sign-in");
  }

  if (!user) {
    return <ActivityIndicator />;
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <Text variant="headlineSmall" style={styles.textHeader}>
          Your Profile
        </Text>
        <ScrollView>
          <View style={styles.avatar}>
            <Avatar.Icon size={110} icon="account" style={styles.avatarIcon} />
          </View>
          <View style={styles.userInfoSection}>
            <List.Item
              title={user.name}
              contentStyle={styles.userInfoSection}
              description={user.email}
              titleStyle={styles.title}
              descriptionStyle={styles.description}
            />
          </View>
          <Divider />
          <List.Section style={styles.actionSection}>
            <List.Item
              style={styles.actionSection}
              titleStyle={styles.description}
              title="Log out"
              left={() => <List.Icon icon="logout" />}
              onPress={showDialog}
            />
          </List.Section>
          <Portal>
            <Dialog
              visible={visible}
              onDismiss={hideDialog}
              style={{ backgroundColor: "#fff" }}
            >
              <Dialog.Icon icon="alert" size={60} color="red" />
              <Dialog.Content style={styles.dialogContent}>
                <Text variant="bodyMedium">
                  Are you sure you would like to log out?
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideDialog}>No</Button>
                <Button
                  style={styles.dialogButton}
                  onPress={() => {
                    hideDialog();
                    handleLogout();
                  }}
                >
                  <Text style={styles.dialogYes}>Yes</Text>
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 25,
  },
  textHeader: {
    textAlign: "center",
    fontFamily: "Inter",
    fontWeight: "bold",
    marginTop: 25,
  },
  avatarIcon: {
    backgroundColor: "#471D67",
  },
  avatar: {
    paddingHorizontal: 0,
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfoSection: {
    paddingHorizontal: 0,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionSection: {
    paddingHorizontal: 10,
    alignItems: "center",
    fontFamily: "Inter",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    marginBottom: 5,
    fontFamily: "Inter",
    fontWeight: "bold",
    alignItems: "center",
  },
  description: {
    fontFamily: "Inter",
    fontSize: 16,
  },
  dialogTitle: {
    fontFamily: "Inter",
    fontSize: 26,
    textAlign: "center",
  },
  dialogContent: {
    marginTop: 20,
  },
  dialogYes: {
    color: "red",
  },
  dialogButton: {
    marginLeft: 5,
    width: "20%",
  },
});
