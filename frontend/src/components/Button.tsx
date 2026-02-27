import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    size = 'md',
    style,
    textStyle,
    icon,
}) => {
    const isDisabled = disabled || loading;

    const heights = { sm: 40, md: 52, lg: 60 };
    const fontSizes = { sm: FONTS.sizes.sm, md: FONTS.sizes.md, lg: FONTS.sizes.lg };

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.85}
                style={[styles.wrapper, { height: heights[size], opacity: isDisabled ? 0.5 : 1 }, style]}
            >
                <LinearGradient
                    colors={['#F97316', '#EA580C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradient, SHADOWS.button]}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <View style={styles.row}>
                            {icon && <View style={styles.iconWrap}>{icon}</View>}
                            <Text style={[styles.text, { fontSize: fontSizes[size] }, textStyle]}>{title}</Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (variant === 'secondary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[
                    styles.wrapper,
                    styles.secondary,
                    { height: heights[size], opacity: isDisabled ? 0.5 : 1 },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.primary} />
                ) : (
                    <View style={styles.row}>
                        {icon && <View style={styles.iconWrap}>{icon}</View>}
                        <Text style={[styles.secondaryText, { fontSize: fontSizes[size] }, textStyle]}>
                            {title}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    if (variant === 'danger') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[
                    styles.wrapper,
                    styles.danger,
                    { height: heights[size], opacity: isDisabled ? 0.5 : 1 },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={[styles.text, { fontSize: fontSizes[size] }, textStyle]}>{title}</Text>
                )}
            </TouchableOpacity>
        );
    }

    // ghost
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[{ opacity: isDisabled ? 0.5 : 1, paddingVertical: SPACING.sm }, style]}
        >
            <Text style={[styles.ghostText, { fontSize: fontSizes[size] }, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.lg,
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    secondary: {
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.lg,
    },
    secondaryText: {
        color: COLORS.primary,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    danger: {
        backgroundColor: COLORS.error,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.lg,
    },
    ghostText: {
        color: COLORS.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        marginRight: SPACING.sm,
    },
});
