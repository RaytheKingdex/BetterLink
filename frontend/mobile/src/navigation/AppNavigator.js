// src/navigation/AppNavigator.js
// BetterLink — Full navigation tree
// Role-aware routing: Student tabs vs Employer tabs vs Auth stack

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { FullScreenLoader } from '../components';
import { Colors, Typography } from '../theme';
import { navigationRef } from './navigationRef';
import UserProfileScreen from '../screens/shared/UserProfileScreen';

// ─── Hamburger / Sidebar Header Button ───────────────────────────────────────
function PeopleButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <TouchableOpacity onPress={toggleSidebar} style={{ paddingHorizontal: 12, justifyContent: 'center', gap: 5 }} hitSlop={8}>
      <View style={{ width: 22, height: 2, backgroundColor: Colors.textPrimary, borderRadius: 1 }} />
      <View style={{ width: 22, height: 2, backgroundColor: Colors.textPrimary, borderRadius: 1 }} />
      <View style={{ width: 22, height: 2, backgroundColor: Colors.textPrimary, borderRadius: 1 }} />
    </TouchableOpacity>
  );
}

// ─── Auth Screens ─────────────────────────────────────────────────────────────
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterStudentScreen from '../screens/auth/RegisterStudentScreen';
import RegisterEmployerScreen from '../screens/auth/RegisterEmployerScreen';

// ─── Shared / Student Screens ─────────────────────────────────────────────────
import FeedScreen from '../screens/shared/FeedScreen';
import JobsScreen from '../screens/student/JobsScreen';
import JobDetailScreen from '../screens/student/JobDetailScreen';
import ApplicationsScreen from '../screens/student/ApplicationsScreen';
import CommunitiesScreen from '../screens/shared/CommunitiesScreen';
import CommunityDetailScreen from '../screens/shared/CommunityDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// ─── Employer Screens ─────────────────────────────────────────────────────────
import PostJobScreen from '../screens/employer/PostJobScreen';
import EmployerMyJobsScreen from '../screens/employer/EmployerMyJobsScreen';
import EmployerJobApplicantsScreen from '../screens/employer/EmployerJobApplicantsScreen';
import EmployerEditJobScreen from '../screens/employer/EmployerEditJobScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Icons (emoji-based, no icon library dep) ─────────────────────────────
function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

// ─── Shared Screen Options ────────────────────────────────────────────────────
const SCREEN_OPTS = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: Typography.semiBold, color: Colors.textPrimary },
  headerShadowVisible: false,
  headerLeft: () => <PeopleButton />,
};

// ─── Jobs Stack (shared: Student + Employer can browse) ───────────────────────
function JobsStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTS}>
      <Stack.Screen
        name="JobsList"
        component={JobsScreen}
        options={{ title: 'Browse Jobs', headerLargeTitle: true }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
    </Stack.Navigator>
  );
}

// ─── Communities Stack ────────────────────────────────────────────────────────
function CommunitiesStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTS}>
      <Stack.Screen
        name="CommunitiesList"
        component={CommunitiesScreen}
        options={{ title: 'Communities' }}
      />
      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={{ title: 'Community' }}
      />
    </Stack.Navigator>
  );
}

// ─── Student Tab Navigator ────────────────────────────────────────────────────
function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 58,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: Typography.medium,
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => {
          const icons = {
            Feed: '📰',
            Jobs: '💼',
            Applications: '📋',
            Communities: '🤝',
            Profile: '👤',
          };
          return <TabIcon emoji={icons[route.name] || '⬜'} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ headerShown: true, ...SCREEN_OPTS, title: 'Feed' }} />
      <Tab.Screen name="Jobs" component={JobsStack} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} options={{
        headerShown: true,
        ...SCREEN_OPTS,
        title: 'My Applications',
      }} />
      <Tab.Screen name="Communities" component={CommunitiesStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        headerShown: true,
        ...SCREEN_OPTS,
        title: 'My Profile',
      }} />
    </Tab.Navigator>
  );
}

// ─── Employer: My Jobs Stack ─────────────────────────────────────────────────
function MyJobsStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPTS}>
      <Stack.Screen
        name="MyJobsList"
        component={EmployerMyJobsScreen}
        options={{ title: 'My Listings' }}
      />
      <Stack.Screen
        name="JobApplicants"
        component={EmployerJobApplicantsScreen}
        options={{ title: 'Applicants' }}
      />
      <Stack.Screen
        name="EditJob"
        component={EmployerEditJobScreen}
        options={{ title: 'Edit Listing' }}
      />
    </Stack.Navigator>
  );
}

// ─── Employer Tab Navigator ───────────────────────────────────────────────────
function EmployerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 58,
        },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: Typography.medium,
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => {
          const icons = {
            Feed: '📰',
            PostJob: '➕',
            MyJobs: '📋',
            Profile: '👤',
          };
          return <TabIcon emoji={icons[route.name] || '⬜'} focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ headerShown: true, ...SCREEN_OPTS, title: 'Feed' }} />
      <Tab.Screen name="PostJob" component={PostJobScreen} options={{
        headerShown: true,
        ...SCREEN_OPTS,
        title: 'Post a Job',
        tabBarLabel: 'Post Job',
      }} />
      <Tab.Screen name="MyJobs" component={MyJobsStack} options={{ tabBarLabel: 'My Jobs' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        headerShown: true,
        ...SCREEN_OPTS,
        title: 'My Profile',
      }} />
    </Tab.Navigator>
  );
}

// ─── Auth Stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...SCREEN_OPTS, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="RegisterStudent"
        component={RegisterStudentScreen}
        options={{ headerShown: true, title: 'Student Registration' }}
      />
      <Stack.Screen
        name="RegisterEmployer"
        component={RegisterEmployerScreen}
        options={{ headerShown: true, title: 'Employer Registration' }}
      />
    </Stack.Navigator>
  );
}

// ─── Root Stack (wraps tabs to allow UserProfile overlay from anywhere) ────────
function RootStack() {
  const { isAuthenticated, isStudent } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : isStudent ? (
        <Stack.Screen name="StudentTabs" component={StudentTabs} />
      ) : (
        <Stack.Screen name="EmployerTabs" component={EmployerTabs} />
      )}
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ headerShown: true, ...SCREEN_OPTS, title: 'Profile', presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { isLoading } = useAuth();

  if (isLoading) return <FullScreenLoader message="Starting BetterLink..." />;

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack />
    </NavigationContainer>
  );
}
