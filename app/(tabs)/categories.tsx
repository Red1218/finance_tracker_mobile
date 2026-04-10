import { useBudgetContext } from '@/contexts/BudgetContext';
import { Plus, Search, Tag, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    bg: '#0a0a0a', card: '#141414', border: '#292929',
    primary: '#ff3d3d', text: '#fafafa', muted: '#999999',
};

const PALETTE = ['#ff3d3d', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

export default function CategoriesScreen() {
    const { data, addCategory, deleteCategory } = useBudgetContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');

    const filteredCategories = data?.categories?.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleAddCategory = () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;

        if (data?.categories?.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
            return;
        }

        addCategory(trimmed);
        setNewCategoryName('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Categories</Text>
                <Text style={styles.subtitle}>Manage your spending categories</Text>
            </View>

            <View style={styles.actionContainer}>
                {/* Search */}
                <View style={styles.searchBox}>
                    <Search size={18} color={COLORS.muted} style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search categories..."
                        placeholderTextColor={COLORS.muted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Add Category */}
                <View style={styles.addBox}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Category name"
                        placeholderTextColor={COLORS.muted}
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
                        <Plus size={16} color="#fff" />
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scroll}>
                {filteredCategories.map((category, index) => {
                    const color = PALETTE[index % PALETTE.length];

                    return (
                        <View key={category.id} style={styles.item}>
                            <View style={styles.itemLeft}>
                                <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                                    <Tag size={16} color={color} />
                                </View>
                                <Text style={styles.itemTitle}>{category.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => deleteCategory(category.id)} style={{ padding: 8 }}>
                                <Trash2 size={18} color={COLORS.muted} />
                            </TouchableOpacity>
                        </View>
                    );
                })}
                {filteredCategories.length === 0 && (
                    <Text style={styles.empty}>No categories found</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 16 },
    header: { paddingHorizontal: 16, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
    actionContainer: { paddingHorizontal: 16, marginBottom: 16, gap: 12 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 12, height: 48 },
    addBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    input: { flex: 1, color: COLORS.text, fontSize: 15 },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#991b1b', paddingHorizontal: 16, height: 48, borderRadius: 12, gap: 6 },
    addButtonText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
    scroll: { flex: 1, paddingHorizontal: 16 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 99, alignItems: 'center', justifyContent: 'center' },
    itemTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, letterSpacing: 0.2 },
    empty: { color: COLORS.muted, textAlign: 'center', paddingVertical: 48, marginTop: 40 },
});
