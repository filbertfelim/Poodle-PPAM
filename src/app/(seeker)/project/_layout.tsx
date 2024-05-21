import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SeekerProfile from "../profile/seeker-profile";
import Workspace from "@/app/(owner)/workspace/owner-workspace";
import SeekerProjects from "../project/seeker-project";

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

export default function SeekerTabs() {
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
      {/* <Tab.Screen
        name="Search"
        component={YourProjectScreen}
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" size={size} color={color} />
          ),
        }}
      />*/}
      <Tab.Screen
        name="SeekerProjects"
        component={SeekerProjects}
        options={{
          tabBarLabel: "Applications",
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
        name="Workspaces"
        component={Workspace}
        options={{
          tabBarLabel: "Workspaces",
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
        name="Profile"
        component={SeekerProfile}
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
