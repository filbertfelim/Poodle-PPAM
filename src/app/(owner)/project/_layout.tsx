import { createStackNavigator } from "@react-navigation/stack";
import YourProjectScreen from "./your-project";
import AddProjectScreen from "./add-project";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import ProjectDetails from "./[project_id]";
import ProjectApplicant from "./applicant/[applicant_id]";

const Stack = createStackNavigator();

export default function ProjectsStackNavigator() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="YourProject"
          component={YourProjectScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddProject"
          component={AddProjectScreen}
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="ProjectDetails"
          component={ProjectDetails}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProjectApplicant"
          component={ProjectApplicant}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
