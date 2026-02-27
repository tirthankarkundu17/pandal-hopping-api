import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pandal } from '../api/pandals';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../theme';

interface PandalCardProps {
    pandal: Pandal;
    onPress?: () => void;
    onApprove?: (id: string) => void;
    showApproveButton?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

const statusColors: Record<string, string> = {
    approved: COLORS.statusApproved,
    pending: COLORS.statusPending,
    rejected: COLORS.statusRejected,
};

const statusIcons: Record<string, string> = {
    approved: 'checkmark-circle',
    pending: 'time',
    rejected: 'close-circle',
};

export const PandalCard: React.FC<PandalCardProps> = ({
    pandal,
    onPress,
    onApprove,
    showApproveButton = false,
}) => {
    const hasImage = pandal.images && pandal.images.length > 0;
    const statusColor = statusColors[pandal.status] || COLORS.textMuted;

    return (
        <TouchableOpacity
            style={[styles.card, SHADOWS.card]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Image / Gradient Header */}
            <View style={styles.imageContainer}>
                {hasImage ? (
                    <Image
                        source={{ uri: pandal.images[0] }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={['#1A1232', '#3B2D6B']}
                        style={styles.image}
                    >
                        <Text style={styles.placeholderEmoji}>🏛️</Text>
                    </LinearGradient>
                )}
                <LinearGradient
                    colors={['transparent', 'rgba(15,10,30,0.95)']}
                    style={styles.imageOverlay}
                />
                {/* Status badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                    <Ionicons name={statusIcons[pandal.status] as any} size={12} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {pandal.status.charAt(0).toUpperCase() + pandal.status.slice(1)}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{pandal.name}</Text>

                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.area}>{pandal.area}</Text>
                </View>

                {pandal.theme ? (
                    <View style={styles.themeRow}>
                        <Ionicons name="color-palette-outline" size={13} color={COLORS.gold} />
                        <Text style={styles.theme} numberOfLines={1}>{pandal.theme}</Text>
                    </View>
                ) : null}

                {pandal.description ? (
                    <Text style={styles.description} numberOfLines={2}>{pandal.description}</Text>
                ) : null}

                {/* Footer stats */}
                <View style={styles.footer}>
                    <View style={styles.statGroup}>
                        <Ionicons name="thumbs-up-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.statText}>
                            {pandal.approvalCount} approval{pandal.approvalCount !== 1 ? 's' : ''}
                        </Text>
                    </View>

                    {pandal.ratingCount > 0 && (
                        <View style={styles.statGroup}>
                            <Ionicons name="star" size={14} color={COLORS.gold} />
                            <Text style={styles.statText}>
                                {pandal.ratingAvg.toFixed(1)} ({pandal.ratingCount})
                            </Text>
                        </View>
                    )}

                    {showApproveButton && pandal.status === 'pending' && onApprove && (
                        <TouchableOpacity
                            style={styles.approveBtn}
                            onPress={() => onApprove(pandal.id)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#22C55E', '#16A34A']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.approveBtnGradient}
                            >
                                <Ionicons name="checkmark" size={13} color="#FFF" />
                                <Text style={styles.approveBtnText}>Approve</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imageContainer: {
        height: 160,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderEmoji: {
        fontSize: 48,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    statusBadge: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        gap: 4,
    },
    statusText: {
        fontSize: FONTS.sizes.xs,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    content: {
        padding: SPACING.md,
    },
    name: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        letterSpacing: 0.2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: SPACING.xs,
    },
    area: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.primary,
        fontWeight: '600',
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: SPACING.sm,
    },
    theme: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.gold,
        fontWeight: '500',
        fontStyle: 'italic',
    },
    description: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.md,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        flexWrap: 'wrap',
    },
    statGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    approveBtn: {
        marginLeft: 'auto',
        borderRadius: RADIUS.full,
        overflow: 'hidden',
    },
    approveBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        gap: 4,
    },
    approveBtnText: {
        color: '#FFF',
        fontSize: FONTS.sizes.xs,
        fontWeight: '700',
    },
});
