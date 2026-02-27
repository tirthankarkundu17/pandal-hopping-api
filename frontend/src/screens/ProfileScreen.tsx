import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

export const ProfileScreen = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#1A1232', '#0F0A1E']} style={styles.header}>
                <View style={styles.avatarContainer}>
                    <LinearGradient colors={['#F97316', '#DC2626']} style={styles.avatar}>
                        <Text style={styles.avatarText}>🪔</Text>
                    </LinearGradient>
                </View>
                <Text style={styles.username}>Festival Goer</Text>
                <Text style={styles.userSubtitle}>Pandal Explorer</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Info cards */}
                <Text style={styles.sectionTitle}>About the App</Text>

                <InfoItem
                    icon="map-outline"
                    label="Discover Pandals"
                    description="Browse all approved Durga Puja pandals curated by the community."
                />
                <InfoItem
                    icon="time-outline"
                    label="Community Review"
                    description="Every pandal is reviewed and approved by multiple community members."
                />
                <InfoItem
                    icon="add-circle-outline"
                    label="Submit Pandals"
                    description="Know a great pandal? Submit it and let the world know!"
                />

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>API Info</Text>
                <View style={styles.apiCard}>
                    <Text style={styles.apiLabel}>Base URL</Text>
                    <Text style={styles.apiValue}>http://localhost:8080/api/v1</Text>

                    <View style={styles.apiDivider} />

                    <Text style={styles.apiLabel}>Auth</Text>
                    <Text style={styles.apiValue}>JWT Bearer Token</Text>

                    <View style={styles.apiDivider} />

                    <Text style={styles.apiLabel}>Version</Text>
                    <Text style={styles.apiValue}>v1</Text>
                </View>

                <Button
                    title="Sign Out"
                    onPress={handleLogout}
                    variant="danger"
                    size="lg"
                    style={styles.logoutBtn}
                    icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />}
                />
            </ScrollView>
        </View>
    );
};

const InfoItem = ({
    icon,
    label,
    description,
}: {
    icon: string;
    label: string;
    description: string;
}) => (
    <View style={infoStyles.container}>
        <View style={infoStyles.iconContainer}>
            <Ionicons name={icon as any} size={22} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={infoStyles.label}>{label}</Text>
            <Text style={infoStyles.description}>{description}</Text>
        </View>
    </View>
);

const infoStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.bgCardAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: FONTS.sizes.md,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    description: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        lineHeight: 19,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        alignItems: 'center',
        paddingTop: SPACING.xxl,
        paddingBottom: SPACING.xl,
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    avatar: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 42,
    },
    username: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    userSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.primary,
        marginTop: 4,
        fontWeight: '500',
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    sectionTitle: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.lg,
    },
    apiCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    apiLabel: {
        fontSize: FONTS.sizes.xs,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    apiValue: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
        marginBottom: SPACING.sm,
    },
    apiDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginBottom: SPACING.sm,
    },
    logoutBtn: {
        marginTop: SPACING.md,
    },
});
