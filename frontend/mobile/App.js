// App.js — BetterLink Mobile Root
// Wraps the entire app in the AuthProvider and SafeAreaProvider

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { SidebarProvider } from './src/context/SidebarContext';
import FollowingSidebar from './src/components/FollowingSidebar';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SidebarProvider>
          <StatusBar style="dark" />
          <AppNavigator />
          <FollowingSidebar />
        </SidebarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
