import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { LoadingOverlay } from '../components/common';
import { COLORS, FONTS } from '../theme';

// Auth screens
import { LoginScreen, RegisterScreen } from '../screens/AuthScreens';

// App screens
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { FoodScreen } from '../screens/FoodScreen';
import { RouteScreen } from '../screens/RouteScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Sub-screens (stay in Home stack)
import { PandalDetailScreen } from '../screens/PandalDetailScreen';
import { CreatePandalScreen } from '../screens/CreatePandalScreen';

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// Tab configuration: name → icon mapping
type TabConfig = {
    name: string;
    icon: string;         // Ionicons name (unfocused)
    iconFocused: string;  // Ionicons name (focused)
};

const TAB_CONFIGS: TabConfig[] = [
    { name: 'Home', icon: 'home-outline', iconFocused: 'home' },
    { name: 'Map', icon: 'map-outline', iconFocused: 'map' },
    { name: 'Food', icon: 'restaurant-outline', iconFocused: 'restaurant' },
    { name: 'Route', icon: 'navigate-outline', iconFocused: 'navigate' },
    { name: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="HomeList" component={HomeScreen} />
            <HomeStack.Screen name="PandalDetail" component={PandalDetailScreen} />
            <HomeStack.Screen name="CreatePandal" component={CreatePandalScreen} />
        </HomeStack.Navigator>
    );
}

function MainTabs() {
    return (
        <MainTab.Navigator
            screenOptions={({ route }) => {
                const config = TAB_CONFIGS.find(t => t.name === route.name);
                return {
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: COLORS.tabActive,
                    tabBarInactiveTintColor: COLORS.tabInactive,
                    tabBarLabelStyle: styles.tabLabel,
                    tabBarIcon: ({ focused, color, size }) => {
                        const iconName = focused
                            ? (config?.iconFocused ?? 'home')
                            : (config?.icon ?? 'home-outline');
                        return <Ionicons name={iconName as any} size={22} color={color} />;
                    },
                };
            }}
        >
            <MainTab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <MainTab.Screen
                name="Map"
                component={MapScreen}
                options={{ tabBarLabel: 'Map' }}
            />
            <MainTab.Screen
                name="Food"
                component={FoodScreen}
                options={{ tabBarLabel: 'Food' }}
            />
            <MainTab.Screen
                name="Route"
                component={RouteScreen}
                options={{ tabBarLabel: 'Route' }}
            />
            <MainTab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </MainTab.Navigator>
    );
}

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

export const RootNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <LoadingOverlay message="Starting app..." />;

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabs /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: COLORS.bgCard,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        height: Platform.OS === 'ios' ? 84 : 64,
    },
    tabLabel: {
        fontSize: FONTS.sizes.xs,
        fontWeight: '600',
    },
});
