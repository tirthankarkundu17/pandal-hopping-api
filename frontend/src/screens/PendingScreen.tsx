import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    Text,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { pandalApi, Pandal } from '../api/pandals';
import { PandalCard } from '../components/PandalCard';
import { LoadingOverlay, EmptyState, ScreenHeader } from '../components/common';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

export const PendingScreen = ({ navigation }: any) => {
    const [pandals, setPandals] = useState<Pandal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [approving, setApproving] = useState<string | null>(null);

    const fetchPending = useCallback(async () => {
        try {
            const data = await pandalApi.listPending();
            setPandals(data || []);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error || 'Failed to load pending pandals.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPending();
    }, [fetchPending]);

    const handleApprove = async (id: string) => {
        Alert.alert('Approve Pandal', 'Are you sure you want to approve this pandal?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Approve',
                style: 'default',
                onPress: async () => {
                    setApproving(id);
                    try {
                        await pandalApi.approvePandal(id);
                        // Refresh list
                        fetchPending();
                        Alert.alert('✅ Approved!', 'Your approval has been recorded.');
                    } catch (err: any) {
                        const msg = err?.response?.data?.error || 'Failed to approve pandal.';
                        Alert.alert('Error', msg);
                    } finally {
                        setApproving(null);
                    }
                },
            },
        ]);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPending();
    };

    if (loading) return <LoadingOverlay message="Loading pending pandals..." />;

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="⏳ Pending Review"
                subtitle={`${pandals.length} pandal${pandals.length !== 1 ? 's' : ''} awaiting approval`}
            />

            <View style={styles.infoBanner}>
                <Text style={styles.infoText}>
                    🗳️ Each pandal requires multiple approvals to go live. Your vote counts!
                </Text>
            </View>

            <FlatList
                data={pandals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PandalCard
                        pandal={item}
                        onPress={() => navigation.navigate('PandalDetail', { pandal: item })}
                        onApprove={handleApprove}
                        showApproveButton
                    />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <EmptyState
                        title="No Pending Pandals"
                        subtitle="All submitted pandals have been reviewed. Check back later!"
                        emoji="✅"
                    />
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    list: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    infoBanner: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.bgCardAlt,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.gold,
    },
    infoText: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.sm,
        lineHeight: 20,
    },
});
