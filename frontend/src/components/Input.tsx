import React, { forwardRef } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

export const Input = forwardRef<TextInput, InputProps>(
    ({ label, error, leftIcon, rightIcon, onRightIconPress, style, ...rest }, ref) => {
        return (
            <View style={styles.container}>
                {label && <Text style={styles.label}>{label}</Text>}
                <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputNormal]}>
                    {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                    <TextInput
                        ref={ref}
                        style={[styles.input, leftIcon ? styles.inputWithLeft : null, style]}
                        placeholderTextColor={COLORS.textMuted}
                        {...rest}
                    />
                    {rightIcon && (
                        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
                            {rightIcon}
                        </TouchableOpacity>
                    )}
                </View>
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.sm,
        fontWeight: '600',
        marginBottom: SPACING.xs,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        backgroundColor: COLORS.bgCardAlt,
        height: 54,
    },
    inputNormal: {
        borderColor: COLORS.border,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    input: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: FONTS.sizes.md,
        paddingHorizontal: SPACING.md,
        height: '100%',
    },
    inputWithLeft: {
        paddingLeft: SPACING.xs,
    },
    leftIcon: {
        paddingLeft: SPACING.md,
    },
    rightIcon: {
        paddingRight: SPACING.md,
        paddingLeft: SPACING.xs,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONTS.sizes.xs,
        marginTop: SPACING.xs,
    },
});
