import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Avatar, List, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function SeekerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();

  const [visible, setVisible] = React.useState(false);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

  const capitalizeWords = (sentence: string) => {
    return sentence
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) Alert.alert(error.message);
    else router.replace("/(auth)/sign-in");
  }

  if (!user) {
    return <ActivityIndicator />;
  } else {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.textHeader}>
          Your Profile
        </Text>
        <ScrollView>
          <View style={styles.avatar}>
            <Avatar.Icon size={90} icon="account" style={styles.avatarIcon} />
          </View>
          <View style={styles.userInfoSection}>
            <List.Item
              title={capitalizeWords(user.name)}
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
              title="CV"
              left={() => <Icon name="file" color="#000" size={30} />}
              right={() => <Icon name="chevron-right" color="#000" size={30} />}
              onPress={() => {
                navigation.navigate("EditCV" as never);
              }}
            />
            <List.Item
              style={styles.actionSection}
              titleStyle={styles.description}
              title="Portfolio"
              left={() => <Icon name="web" color="#000" size={30} />}
              right={() => <Icon name="chevron-right" color="#000" size={30} />}
              onPress={() => {
                navigation.navigate("EditPortfolio" as never);
              }}
            />
            <List.Item
              style={styles.actionSection}
              titleStyle={styles.description}
              title="Log out"
              left={() => <Icon name="logout" color="#000" size={30} />}
              onPress={showDialog}
            />
          </List.Section>
          <Portal>
            <Dialog
              visible={visible}
              onDismiss={hideDialog}
              style={{
                backgroundColor: "#fff",
                width: "75%",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Dialog.Icon icon="alert" size={60} color="red" />
              <Dialog.Title style={styles.dialogTitle}>
                Are you sure?
              </Dialog.Title>
              <Dialog.Content style={styles.dialogContent}>
                <Text style={styles.dialogDesc}>
                  Are you sure you would like to log out?
                </Text>
              </Dialog.Content>
              <Dialog.Actions style={styles.buttonAction}>
                <Button onPress={hideDialog} style={styles.dialogButton}>
                  No
                </Button>
                <Button
                  style={styles.dialogYesButton}
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
  textHeader: {
    textAlign: "left",
    fontFamily: "Inter",
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 20,
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
    paddingLeft: 10,
    alignItems: "center",
    fontFamily: "Inter",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
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
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 0,
  },
  dialogDesc: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: 400,
    textAlign: "center",
    marginBottom: 0,
  },
  dialogContent: {
    marginTop: 10,
  },
  dialogYes: {
    color: "red",
  },
  dialogYesButton: {
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "red",
    width: 60,
  },
  dialogButton: {
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#471D67",
    width: 60,
  },
  buttonAction: {
    gap: 20,
  },
});
