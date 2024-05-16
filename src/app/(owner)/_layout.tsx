import React from "react";
import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useColorScheme } from "@/components/useColorScheme";
import { BottomNavigation } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileStackNavigator from "./profile/_layout";
import ProjectsStackNavigator from "./project/_layout";
import OwnerWorkspace from "./owner-workspace";

interface RouteParams {
  key: string;
  name: string;
  params?: {
    [key: string]: any;
  };
  state?: any;
  title?: string;
}

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          style={{ backgroundColor: "#F8F7F9" }}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key] as any;
            if (options.tabBarIcon) {
              return options.tabBarIcon({
                focused,
                color: focused ? "#471D67" : "#777777",
                size: 24,
              });
            }
            return null;
          }}
          getLabelText={({ route }: { route: RouteParams }) => {
            const { options } = descriptors[route.key] as any;
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.title;

            return label;
          }}
        />
      )}
    >
      <Tab.Screen
        name="your-project"
        component={ProjectsStackNavigator}
        options={{
          tabBarLabel: "Project",
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="file-document-multiple-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="owner-workspace"
        component={OwnerWorkspace}
        options={{
          tabBarLabel: "Workspace",
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="card-account-details-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="owner-profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
