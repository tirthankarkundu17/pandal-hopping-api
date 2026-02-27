import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../theme';

interface LoadingOverlayProps {
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => (
    <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.text}>{message}</Text>
    </View>
);

export const EmptyState: React.FC<{ title: string; subtitle?: string; emoji?: string }> = ({
    title,
    subtitle,
    emoji = '🏛️',
}) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.emptyTitle}>{title}</Text>
        {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
);

export const ScreenHeader: React.FC<{
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
}> = ({ title, subtitle, rightElement }) => (
    <LinearGradient
        colors={['#1A1232', '#0F0A1E']}
        style={styles.header}
    >
        <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{title}</Text>
                {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement}
        </View>
    </LinearGradient>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bg,
        gap: SPACING.md,
    },
    text: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.md,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        gap: SPACING.md,
    },
    emoji: {
        fontSize: 64,
        marginBottom: SPACING.sm,
    },
    emptyTitle: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    header: {
        paddingTop: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});
