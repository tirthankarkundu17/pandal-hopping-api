import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    RefreshControl,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pandalApi, Pandal } from '../api/pandals';
import { PandalCard } from '../components/PandalCard';
import { LoadingOverlay, EmptyState, ScreenHeader } from '../components/common';
import { COLORS, FONTS, RADIUS, SPACING } from '../theme';

export const HomeScreen = ({ navigation }: any) => {
    const [pandals, setPandals] = useState<Pandal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchPandals = useCallback(async () => {
        try {
            setError('');
            const data = await pandalApi.listApproved();
            setPandals(data || []);
        } catch (err: any) {
            setError(err?.response?.data?.error || 'Failed to load pandals.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPandals();
    }, [fetchPandals]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPandals();
    };

    if (loading) return <LoadingOverlay message="Loading pandals..." />;

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="🎪 Pandal Hopping"
                subtitle={`${pandals.length} approved pandal${pandals.length !== 1 ? 's' : ''}`}
                rightElement={
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => navigation.navigate('CreatePandal')}
                    >
                        <Ionicons name="add" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                }
            />

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchPandals} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={pandals}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PandalCard
                            pandal={item}
                            onPress={() => navigation.navigate('PandalDetail', { pandal: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            title="No Pandals Yet"
                            subtitle="Be the first to submit a pandal for this year's Durga Puja!"
                            emoji="🏛️"
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
            )}
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
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        gap: SPACING.md,
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONTS.sizes.md,
        textAlign: 'center',
    },
    retryBtn: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.full,
    },
    retryText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: FONTS.sizes.sm,
    },
});
