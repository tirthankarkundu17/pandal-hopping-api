import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    SafeAreaView,
    Dimensions,
    RefreshControl,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../theme';
import dataService from '../services';
import { Pandal, District } from '../api/pandals';
import { FoodStop } from '../api/food';
import { Route } from '../api/routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Static Data ──────────────────────────────────────────────────────────────

// To be updated with API calls later
const HIGHLIGHTS = [
    { id: '1', label: 'Award-Winning', icon: 'trophy-outline', lib: 'ion', grad: ['#F97316', '#EA580C'] as [string, string] },
    { id: '2', label: 'Theme Pujas', icon: 'color-palette-outline', lib: 'ion', grad: ['#EC4899', '#BE185D'] as [string, string] },
    { id: '3', label: 'North Kolkata', icon: 'location-outline', lib: 'ion', grad: ['#3B82F6', '#1D4ED8'] as [string, string] },
    { id: '4', label: 'South Kolkata', icon: 'location-outline', lib: 'ion', grad: ['#F59E0B', '#D97706'] as [string, string] },
];





// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

/** Horizontal scrollable gradient pill for highlights */
const HighlightPill = ({ item }: { item: typeof HIGHLIGHTS[0] }) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.highlightPill}>
        <LinearGradient colors={item.grad} style={styles.pillIconBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {item.lib === 'mci' ? (
                <MaterialCommunityIcons name={item.icon as any} size={22} color="#FFF" />
            ) : (
                <Ionicons name={item.icon as any} size={22} color="#FFF" />
            )}
        </LinearGradient>
        <Text style={styles.pillLabel}>{item.label}</Text>
    </TouchableOpacity>
);

/** Journey ticket style route card */
const RouteCard = ({ item, index }: { item: Route; index: number }) => (
    <TouchableOpacity style={styles.routeTicket} activeOpacity={0.8}>
        {/* Left accent bar */}
        <LinearGradient
            colors={['#F97316', '#EA580C']}
            style={styles.ticketAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        />
        <View style={styles.ticketBody}>
            <View style={styles.ticketHeader}>
                <Text style={styles.ticketNumber}>Route {String(index + 1).padStart(2, '0')}</Text>
                <View style={styles.ticketBadge}>
                    <Ionicons name="flag-outline" size={10} color={COLORS.primary} />
                    <Text style={styles.ticketBadgeText}>{item.stopCount ?? item.stops?.length ?? 0} stops</Text>
                </View>
            </View>
            <Text style={styles.routeTitle}>{item.title}</Text>
            <Text style={styles.routeDesc}>{item.description}</Text>
            {/* Dashed divider */}
            <View style={styles.ticketDash} />
            <View style={styles.ticketFooter}>
                <View style={styles.routeMeta}>
                    <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.routeDuration}>{item.duration}</Text>
                </View>
                <View style={styles.ticketArrow}>
                    <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

/** Mosaic district layout: 1 tall featured + 2 stacked small */
const DistrictMosaic = ({ data }: { data: District[] }) => {
    // We map over data to ensure fallback images exist if API doesn't provide them
    const enrichedData = data.map((d) => {
        return {
            ...d,
            landmark: `${d.pandalCount || 0} Pandals`,
            image: d.image || 'https://placehold.co/600x400/1E0A3C/FFFFFF?text=' + encodeURIComponent(d.name),
        };
    });

    if (!enrichedData || enrichedData.length === 0) return null;

    const featured = enrichedData[0];
    const rest = enrichedData.slice(1, 3);

    return (
        <View style={styles.mosaicRow}>
            {/* Left: featured tall card */}
            <TouchableOpacity style={styles.mosaicFeatured} activeOpacity={0.85}>
                <Image source={{ uri: featured.image }} style={styles.mosaicImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.mosaicGrad} />
                <View style={styles.mosaicInfo}>
                    <View style={styles.mosaicTag}>
                        <Text style={styles.mosaicTagText}>Featured</Text>
                    </View>
                    <Text style={styles.mosaicName}>{featured.name}</Text>
                    <Text style={styles.mosaicLandmark}>{featured.landmark}</Text>
                </View>
            </TouchableOpacity>
            {/* Right: stacked smaller cards */}
            <View style={styles.mosaicStack}>
                {rest.map((d: any, i: number) => (
                    <TouchableOpacity key={d.id || i} style={styles.mosaicSmall} activeOpacity={0.85}>
                        <Image source={{ uri: d.image }} style={styles.mosaicImage} />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.82)']} style={styles.mosaicGrad} />
                        <View style={styles.mosaicInfo}>
                            <Text style={styles.mosaicNameSm}>{d.name}</Text>
                            <Text style={styles.mosaicLandmarkSm}>{d.landmark}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

/** Food card: full-bleed image with gradient text overlay */
const FoodCard = ({ item }: { item: FoodStop }) => (
    <TouchableOpacity style={styles.foodCard} activeOpacity={0.85}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.88)']}
            style={styles.foodGrad}
        />
        <View style={styles.foodInfo}>
            <View style={styles.foodTypeBadge}>
                <Text style={styles.foodTypeBadgeText}>{item.type}</Text>
            </View>
            <Text style={styles.foodName}>{item.name}</Text>
        </View>
    </TouchableOpacity>
);

// ─── Section Header with optional "See all" ───────────────────────────────────
const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {onSeeAll && (
            <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all</Text>
                <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
            </TouchableOpacity>
        )}
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const HomeScreen = ({ navigation }: any) => {
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // API Data
    const [apiRoutes, setApiRoutes] = useState<Route[]>([]);
    const [apiFood, setApiFood] = useState<FoodStop[]>([]);
    const [apiDistricts, setApiDistricts] = useState<District[]>([]);
    // If you want to use pandals, say for a new "Popular Pandals" map or slider:
    // const [pandals, setPandals] = useState<Pandal[]>([]);

    const loadData = useCallback(async () => {
        try {
            const [fetchedRoutes, fetchedFood, fetchedDistricts] = await Promise.all([
                dataService.getRoutes(),
                dataService.getFoodStops(),
                dataService.getDistricts(),
            ]);
            setApiRoutes(fetchedRoutes);
            setApiFood(fetchedFood);
            setApiDistricts(fetchedDistricts);
        } catch (error) {
            console.error('Error fetching home data:', error);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
            >
                {/* ── Greeting Header ── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()} 🪔</Text>
                        <Text style={styles.headerTitle}>Explore Durga Puja</Text>
                    </View>
                    <TouchableOpacity style={styles.profileBtn} activeOpacity={0.8}>
                        <Ionicons name="person-outline" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* ── Search Bar ── */}
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search pandals, districts, areas..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* ── AI Route Planner Banner ── */}
                <TouchableOpacity activeOpacity={0.9} style={styles.bannerWrapper}>
                    <LinearGradient
                        colors={['#1E0A3C', '#2D1060']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    >
                        {/* left content */}
                        <View style={styles.bannerLeft}>
                            <View style={styles.bannerAiBadge}>
                                <Text style={styles.bannerAiText}>✦ AI Powered</Text>
                            </View>
                            <Text style={styles.bannerTitle}>Plan Your{'\n'}Pandal Hopping</Text>
                            <Text style={styles.bannerSubtitle}>Smart routes crafted just for you</Text>
                            <View style={styles.bannerCta}>
                                <Text style={styles.bannerCtaText}>Try Route Planner</Text>
                                <Ionicons name="arrow-forward" size={14} color="#FFF" />
                            </View>
                        </View>
                        {/* right decorative */}
                        <View style={styles.bannerRight}>
                            <LinearGradient
                                colors={['#F97316', '#EA580C']}
                                style={styles.bannerOrb}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="map-outline" size={28} color="#FFF" />
                            </LinearGradient>
                            <Text style={styles.bannerDecor1}>✦</Text>
                            <Text style={styles.bannerDecor2}>✦</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* ── Pujo Highlights ── */}
                <View style={styles.section}>
                    <SectionHeader title="Pujo Highlights" />
                    <FlatList
                        data={HIGHLIGHTS}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <HighlightPill item={item} />}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.pillList}
                    />
                </View>

                {/* ── Curated Pujo Routes ── */}
                <View style={styles.section}>
                    <SectionHeader title="Curated Pujo Routes" onSeeAll={() => navigation.getParent()?.navigate('Route')} />
                    <FlatList
                        data={apiRoutes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => <RouteCard item={item} index={index} />}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                </View>

                {/* ── Explore by District ── */}
                <View style={styles.section}>
                    <SectionHeader title="Explore by District" onSeeAll={() => { }} />
                    <View style={styles.mosaicWrapper}>
                        <DistrictMosaic data={apiDistricts} />
                    </View>
                </View>

                {/* ── Food Stops Near You ── */}
                <View style={[styles.section, { marginBottom: 32 }]}>
                    <SectionHeader title="Food Stops Near You" onSeeAll={() => navigation.getParent()?.navigate('Food')} />
                    <FlatList
                        data={apiFood}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <FoodCard item={item} />}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 16 },

    // ── Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingTop: Platform.OS === 'android' ? 20 : 12,
        paddingBottom: SPACING.sm,
    },
    greeting: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: FONTS.sizes.xxl,
        fontWeight: '800',
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Search
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        paddingHorizontal: 14,
        paddingVertical: 11,
        ...SHADOWS.card,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: FONTS.sizes.sm,
        color: COLORS.textPrimary,
        paddingVertical: 0,
    },

    // ── Banner
    bannerWrapper: {
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#3B2D6B',
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.xl,
    },
    bannerLeft: { flex: 1 },
    bannerAiBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(249,115,22,0.18)',
        borderRadius: RADIUS.full,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.35)',
    },
    bannerAiText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.primary,
        fontWeight: '600',
        letterSpacing: 0.4,
    },
    bannerTitle: {
        fontSize: FONTS.sizes.xl,
        fontWeight: '800',
        color: COLORS.textPrimary,
        lineHeight: 26,
        marginBottom: 4,
    },
    bannerSubtitle: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        marginBottom: 14,
    },
    bannerCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: COLORS.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: RADIUS.full,
    },
    bannerCtaText: {
        fontSize: FONTS.sizes.xs,
        color: '#FFF',
        fontWeight: '700',
    },
    bannerRight: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    bannerOrb: {
        width: 58,
        height: 58,
        borderRadius: RADIUS.full,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.button,
    },
    bannerDecor1: {
        position: 'absolute',
        top: -8,
        right: 4,
        fontSize: 14,
        color: COLORS.primary,
        opacity: 0.7,
    },
    bannerDecor2: {
        position: 'absolute',
        bottom: -4,
        left: 6,
        fontSize: 9,
        color: '#8B5CF6',
        opacity: 0.9,
    },

    // ── Section
    section: { marginBottom: SPACING.md },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: SPACING.md,
        marginBottom: 12,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionAccent: {
        width: 3,
        height: 18,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary,
    },
    sectionTitle: {
        fontSize: FONTS.sizes.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // ── Highlight Pills
    pillList: {
        paddingHorizontal: SPACING.md,
        gap: 10,
    },
    highlightPill: {
        alignItems: 'center',
        gap: 8,
        width: 76,
    },
    pillIconBg: {
        width: 56,
        height: 56,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.textSecondary,
        textAlign: 'center',
    },

    // ── Route Tickets
    horizontalList: {
        paddingHorizontal: SPACING.md,
        gap: 12,
    },
    routeTicket: {
        width: SCREEN_WIDTH * 0.68,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    ticketAccent: {
        width: 4,
    },
    ticketBody: {
        flex: 1,
        padding: 14,
    },
    ticketHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    ticketNumber: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    ticketBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: 'rgba(249,115,22,0.12)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.25)',
    },
    ticketBadgeText: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: '600',
    },
    routeTitle: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '700',
        color: COLORS.textPrimary,
        lineHeight: 19,
        marginBottom: 4,
    },
    routeDesc: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
    ticketDash: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        borderStyle: 'dashed',
        marginVertical: 10,
    },
    ticketFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    routeMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    routeDuration: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.primary,
        fontWeight: '600',
    },
    ticketArrow: {
        width: 26,
        height: 26,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(249,115,22,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.25)',
    },

    // ── District Mosaic
    mosaicWrapper: {
        paddingHorizontal: SPACING.md,
    },
    mosaicRow: {
        flexDirection: 'row',
        gap: 8,
        height: 220,
    },
    mosaicFeatured: {
        flex: 1.1,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    mosaicStack: {
        flex: 0.9,
        gap: 8,
    },
    mosaicSmall: {
        flex: 1,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        position: 'relative',
    },
    mosaicImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    mosaicGrad: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65%',
    },
    mosaicInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    mosaicTag: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        marginBottom: 4,
    },
    mosaicTagText: {
        fontSize: 9,
        color: '#FFF',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    mosaicName: {
        color: COLORS.textOnPrimary,
        fontSize: FONTS.sizes.md,
        fontWeight: '800',
    },
    mosaicLandmark: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: FONTS.sizes.xs,
        marginTop: 1,
    },
    mosaicNameSm: {
        color: COLORS.textOnPrimary,
        fontSize: FONTS.sizes.sm,
        fontWeight: '700',
    },
    mosaicLandmarkSm: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        marginTop: 1,
    },

    // ── Food Cards (overlay style)
    foodCard: {
        width: SCREEN_WIDTH * 0.52,
        height: 180,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    foodImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    foodGrad: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
    },
    foodInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
    },
    foodTypeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(249,115,22,0.85)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        marginBottom: 5,
    },
    foodTypeBadgeText: {
        fontSize: 9,
        color: '#FFF',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    foodName: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '700',
        color: COLORS.textOnPrimary,
    },
});
