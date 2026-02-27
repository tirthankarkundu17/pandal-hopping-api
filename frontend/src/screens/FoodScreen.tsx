import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../theme';

export function FoodScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <Ionicons name="restaurant" size={64} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Food</Text>
            <Text style={styles.subtitle}>Discover food stalls near pandals</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
