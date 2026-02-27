import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pandal, pandalApi } from '../api/pandals';
import { Button } from '../components/Button';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const statusColors: Record<string, string> = {
    approved: COLORS.statusApproved,
    pending: COLORS.statusPending,
    rejected: COLORS.statusRejected,
};

export const PandalDetailScreen = ({ route, navigation }: any) => {
    const pandal: Pandal = route.params.pandal;
    const [approving, setApproving] = useState(false);
    const hasImage = pandal.images && pandal.images.length > 0;
    const statusColor = statusColors[pandal.status];

    const handleApprove = () => {
        Alert.alert('Approve Pandal', `Approve "${pandal.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                onPress: async () => {
                    setApproving(true);
                    try {
                        await pandalApi.approvePandal(pandal.id);
                        Alert.alert('✅ Approved!', 'Your approval has been recorded.', [
                            { text: 'OK', onPress: () => navigation.goBack() },
                        ]);
                    } catch (err: any) {
                        Alert.alert('Error', err?.response?.data?.error || 'Failed to approve pandal.');
                    } finally {
                        setApproving(false);
                    }
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <View style={styles.backBtnInner}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                </View>
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero image */}
                <View style={styles.imageContainer}>
                    {hasImage ? (
                        <Image
                            source={{ uri: pandal.images[0] }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={['#1A1232', '#3B2D6B', '#1A1232']}
                            style={styles.image}
                        >
                            <Text style={styles.placeholderEmoji}>🏛️</Text>
                        </LinearGradient>
                    )}
                    <LinearGradient
                        colors={['transparent', COLORS.bg]}
                        style={styles.imageGradient}
                    />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title and status */}
                    <View style={styles.titleRow}>
                        <Text style={styles.name}>{pandal.name}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {pandal.status.charAt(0).toUpperCase() + pandal.status.slice(1)}
                            </Text>
                        </View>
                    </View>

                    {/* Location */}
                    <View style={styles.infoRow}>
                        <Ionicons name="location" size={16} color={COLORS.primary} />
                        <Text style={styles.infoText}>{pandal.area}</Text>
                    </View>

                    {/* Theme */}
                    {pandal.theme ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="color-palette" size={16} color={COLORS.gold} />
                            <Text style={[styles.infoText, { color: COLORS.gold }]}>{pandal.theme}</Text>
                        </View>
                    ) : null}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Stats grid */}
                    <View style={styles.statsGrid}>
                        <StatCard
                            label="Approvals"
                            value={String(pandal.approvalCount)}
                            icon="thumbs-up"
                            color={COLORS.primary}
                        />
                        {pandal.ratingCount > 0 ? (
                            <StatCard
                                label="Rating"
                                value={`${pandal.ratingAvg.toFixed(1)} ⭐`}
                                icon="star"
                                color={COLORS.gold}
                            />
                        ) : (
                            <StatCard
                                label="Rating"
                                value="No ratings"
                                icon="star-outline"
                                color={COLORS.textMuted}
                            />
                        )}
                        <StatCard
                            label="Submitted"
                            value={new Date(pandal.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                            })}
                            icon="calendar"
                            color={COLORS.info}
                        />
                    </View>

                    {/* Description */}
                    {pandal.description ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.description}>{pandal.description}</Text>
                        </View>
                    ) : null}

                    {/* Coordinates */}
                    {pandal.location?.coordinates?.length === 2 ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            <View style={styles.coordCard}>
                                <Ionicons name="map-outline" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.coordText}>
                                    {pandal.location.coordinates[1].toFixed(4)}°N,{' '}
                                    {pandal.location.coordinates[0].toFixed(4)}°E
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Images list */}
                    {pandal.images && pandal.images.length > 1 ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Gallery</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {pandal.images.slice(1).map((img, i) => (
                                    <Image key={i} source={{ uri: img }} style={styles.galleryImage} />
                                ))}
                            </ScrollView>
                        </View>
                    ) : null}

                    {/* Approve CTA */}
                    {pandal.status === 'pending' && (
                        <Button
                            title="Approve This Pandal"
                            onPress={handleApprove}
                            loading={approving}
                            size="lg"
                            style={styles.approveBtn}
                            icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />}
                        />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const StatCard = ({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: string;
    icon: string;
    color: string;
}) => (
    <View style={[statStyles.card, SHADOWS.card]}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={statStyles.value}>{value}</Text>
        <Text style={statStyles.label}>{label}</Text>
    </View>
);

const statStyles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        alignItems: 'center',
        gap: SPACING.xs,
    },
    value: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    label: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    backBtn: {
        position: 'absolute',
        top: SPACING.xl,
        left: SPACING.lg,
        zIndex: 10,
    },
    backBtnInner: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(15,10,30,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imageContainer: {
        height: 280,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    placeholderEmoji: {
        fontSize: 80,
    },
    content: {
        padding: SPACING.lg,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    name: {
        flex: 1,
        fontSize: FONTS.sizes.xxl,
        fontWeight: '900',
        color: COLORS.textPrimary,
        lineHeight: 30,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    statusText: {
        fontSize: FONTS.sizes.xs,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    infoText: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.lg,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '700',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: FONTS.sizes.md,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    coordCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.bgCardAlt,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    coordText: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        fontFamily: 'monospace',
    },
    galleryImage: {
        width: 120,
        height: 80,
        borderRadius: RADIUS.md,
        marginRight: SPACING.sm,
    },
    approveBtn: {
        marginTop: SPACING.md,
    },
});
