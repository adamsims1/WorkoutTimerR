import { Tabs } from 'expo-router';
import React from 'react';
import { Stack } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider } from '@/ThemeContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.container}>
          <Stack screenOptions={{ headerShown: true, title: 'WorkoutTim' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
        </View>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});