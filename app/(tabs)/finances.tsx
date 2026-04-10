import { useBudgetContext } from '@/contexts/BudgetContext';
import { BorrowingType, borrowingTypeLabels } from '@/types/budget';
import { Check, ChevronDown, CreditCard as CreditCardIcon, HandCoins, PenLine, Plus, Star, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
    bg: '#0a0a0a', card: '#141414', border: '#292929', cardHighlight: '#1a1a1a',
    primary: '#ff3d3d', text: '#fafafa', muted: '#999999', warning: '#eab308',
};

export default function FinancesScreen() {
    const { data, addCreditCard, deleteCreditCard, setDefaultCard, totalBorrowed, addBorrowing, deleteBorrowing } = useBudgetContext();
    const [activeTab, setActiveTab] = useState<'cards' | 'borrowed'>('cards');

    // Card Form State
    const [newCardName, setNewCardName] = useState('');
    const [newCardLimit, setNewCardLimit] = useState('');

    // Borrowing Form State
    const [newBorrowType, setNewBorrowType] = useState<BorrowingType>('personal');
    const [newBorrowFrom, setNewBorrowFrom] = useState('');
    const [newBorrowAmount, setNewBorrowAmount] = useState('');
    const [showTypeModal, setShowTypeModal] = useState(false);

    const handleAddCard = () => {
        if (!newCardName.trim() || !newCardLimit) return;
        addCreditCard({ name: newCardName.trim(), limit: Number(newCardLimit) });
        setNewCardName('');
        setNewCardLimit('');
    };

    const handleAddBorrowing = () => {
        if (!newBorrowType || !newBorrowFrom.trim() || !newBorrowAmount) return;
        addBorrowing({
            type: newBorrowType,
            from: newBorrowFrom.trim(),
            amount: Number(newBorrowAmount),
        });
        // reset fields except type for convenience
        setNewBorrowFrom('');
        setNewBorrowAmount('');
    };

    const creditSpend = data.spends
        .filter(s => s.paymentMethod === 'credit')
        .reduce((sum, s) => sum + s.amount, 0);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.title}>Finances</Text>
                    <Text style={styles.subtitle}>Manage cards & borrowed money</Text>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { borderColor: 'rgba(255, 61, 61, 0.2)' }]}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryLabel}>CREDIT SPEND</Text>
                            <CreditCardIcon size={16} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.summaryAmount, { color: COLORS.primary }]}>₹{creditSpend.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={[styles.summaryCard, { borderColor: 'rgba(234, 179, 8, 0.2)' }]}>
                        <View style={styles.summaryHeader}>
                            <Text style={styles.summaryLabel}>TOTAL BORROWED</Text>
                            <HandCoins size={16} color={COLORS.warning} />
                        </View>
                        <Text style={[styles.summaryAmount, { color: COLORS.warning }]}>₹{totalBorrowed.toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'cards' && styles.activeTab]}
                        onPress={() => setActiveTab('cards')}
                    >
                        <CreditCardIcon size={16} color={activeTab === 'cards' ? COLORS.text : COLORS.muted} />
                        <Text style={[styles.tabText, activeTab === 'cards' && styles.activeTabText]}>Cards</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'borrowed' && styles.activeTab]}
                        onPress={() => setActiveTab('borrowed')}
                    >
                        <HandCoins size={16} color={activeTab === 'borrowed' ? COLORS.text : COLORS.muted} />
                        <Text style={[styles.tabText, activeTab === 'borrowed' && styles.activeTabText]}>Borrowed</Text>
                    </TouchableOpacity>
                </View>

                {/* CARDS TAB */}
                {activeTab === 'cards' && (
                    <>
                        <View style={styles.addCardForm}>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Card name (e.g., HDFC Regalia)"
                                    placeholderTextColor={COLORS.muted}
                                    value={newCardName}
                                    onChangeText={setNewCardName}
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 8 }]}
                                    placeholder="Credit limit"
                                    placeholderTextColor={COLORS.muted}
                                    keyboardType="numeric"
                                    value={newCardLimit}
                                    onChangeText={setNewCardLimit}
                                />
                            </View>
                            <TouchableOpacity style={styles.primaryButtonGhost} onPress={handleAddCard}>
                                <Plus size={18} color="#eb6060" />
                                <Text style={styles.primaryButtonGhostText}>Add Credit Card</Text>
                            </TouchableOpacity>
                        </View>

                        {data?.creditCards?.map((card) => {
                            const cardSpends = data.spends.filter(s => s.creditCardId === card.id);
                            const total = cardSpends.reduce((sum, s) => sum + s.amount, 0);
                            const usage = card.limit > 0 ? (total / card.limit) * 100 : 0;
                            return (
                                <View key={card.id} style={styles.cardItem}>
                                    <View style={styles.cardItemHeader}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            <View style={styles.cardIconBox}>
                                                <CreditCardIcon size={20} color="#fff" />
                                            </View>
                                            <View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                    <Text style={styles.cardItemName}>{card.name}</Text>
                                                    {card.isDefault && (
                                                        <View style={styles.defaultBadge}>
                                                            <Text style={styles.defaultBadgeText}>Default</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.mutedText}>Limit: ₹{card.limit.toLocaleString('en-IN')}</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                            <TouchableOpacity onPress={() => setDefaultCard(card.id)}>
                                                <Star size={18} color={card.isDefault ? COLORS.warning : COLORS.muted} fill={card.isDefault ? COLORS.warning : "transparent"} />
                                            </TouchableOpacity>
                                            <TouchableOpacity>
                                                <PenLine size={18} color={COLORS.muted} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => deleteCreditCard(card.id)}>
                                                <Trash2 size={18} color={COLORS.muted} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{ marginTop: 20 }}>
                                        <View style={styles.cardFooter}>
                                            <Text style={styles.usageText}>Used this month</Text>
                                            <Text style={[styles.amount, { color: COLORS.primary }]}>₹{total.toLocaleString('en-IN')}</Text>
                                        </View>
                                        <View style={styles.progressBg}>
                                            <View style={[styles.progressFill, { width: `${Math.min(Math.max(usage, 2), 100)}%` as any, backgroundColor: COLORS.primary }]} />
                                        </View>
                                        <View style={[styles.cardFooter, { marginTop: 8 }]}>
                                            <Text style={styles.mutedText}>{usage.toFixed(1)}% used</Text>
                                            <Text style={styles.mutedText}>₹{(card.limit - total).toLocaleString('en-IN')} remaining</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}

                {/* BORROWED TAB */}
                {activeTab === 'borrowed' && (
                    <>
                        <View style={styles.addCardForm}>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowTypeModal(true)}
                            >
                                <Text style={[styles.dropdownText, { color: COLORS.text }]}>
                                    {borrowingTypeLabels[newBorrowType]}
                                </Text>
                                <ChevronDown size={20} color={COLORS.muted} />
                            </TouchableOpacity>

                            <View style={[styles.inputRow, { marginTop: 4, marginBottom: 8 }]}>
                                <TextInput
                                    style={[styles.input, { flex: 2 }]}
                                    placeholder="From (Name)"
                                    placeholderTextColor={COLORS.muted}
                                    value={newBorrowFrom}
                                    onChangeText={setNewBorrowFrom}
                                />
                                <TextInput
                                    style={[styles.input, { flex: 1.2 }]}
                                    placeholder="Amount"
                                    placeholderTextColor={COLORS.muted}
                                    keyboardType="numeric"
                                    value={newBorrowAmount}
                                    onChangeText={setNewBorrowAmount}
                                />
                            </View>
                            <TouchableOpacity style={styles.primaryButtonGhostWarning} onPress={handleAddBorrowing}>
                                <Plus size={18} color="#eab308" />
                                <Text style={styles.primaryButtonGhostTextWarning}>Add Borrowed Money</Text>
                            </TouchableOpacity>
                        </View>

                        {data?.borrowings?.map((item) => (
                            <View key={item.id} style={styles.cardItem}>
                                <View style={[styles.cardItemHeader, { marginBottom: 0 }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <Text style={[styles.cardItemName, { color: COLORS.warning, fontSize: 18 }]}>₹{item.amount.toLocaleString('en-IN')}</Text>
                                        <View style={styles.typeBadge}>
                                            <Text style={styles.typeBadgeText}>{borrowingTypeLabels[item.type]}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 16 }}>
                                        <TouchableOpacity>
                                            <PenLine size={16} color={COLORS.text} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => deleteBorrowing(item.id)}>
                                            <Trash2 size={16} color={COLORS.text} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={[styles.mutedText, { marginTop: 12 }]}>From: {item.from}</Text>
                                {item.note ? <Text style={styles.mutedText}>{item.note}</Text> : null}
                            </View>
                        ))}

                        {/* Dropdown Modal for Borrowing Types */}
                        <Modal visible={showTypeModal} transparent animationType="fade">
                            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypeModal(false)}>
                                <View style={styles.pullDownModalWrapper}>
                                    <View style={styles.pullDownModalContent}>
                                        {(Object.keys(borrowingTypeLabels) as BorrowingType[]).map((type, idx) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={styles.modalOption}
                                                onPress={() => { setNewBorrowType(type); setShowTypeModal(false); }}
                                            >
                                                <View style={{ width: 32, alignItems: 'center' }}>
                                                    {newBorrowType === type && <Check size={18} color={COLORS.text} />}
                                                </View>
                                                <Text style={[styles.modalOptionText, newBorrowType === type && styles.modalOptionTextActive]}>
                                                    {borrowingTypeLabels[type]}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { flex: 1, paddingHorizontal: 16 },
    header: { marginVertical: 20 },
    title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: COLORS.muted },

    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    summaryCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    summaryLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 0.5 },
    summaryAmount: { fontSize: 24, fontWeight: '700' },

    tabContainer: { flexDirection: 'row', backgroundColor: COLORS.card, padding: 4, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
    tab: { flex: 1, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, gap: 8 },
    activeTab: { backgroundColor: '#1f1f1f' },
    tabText: { color: COLORS.muted, fontWeight: '600', fontSize: 14 },
    activeTabText: { color: COLORS.text },

    addCardForm: { marginBottom: 24, backgroundColor: COLORS.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    input: { backgroundColor: '#1f1f1f', borderRadius: 8, paddingHorizontal: 16, height: 48, color: COLORS.text, fontSize: 15 },

    dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1f1f1f', borderRadius: 8, paddingHorizontal: 16, height: 48, marginBottom: 12 },
    dropdownText: { color: COLORS.text, fontSize: 15 },

    primaryButtonGhost: { backgroundColor: 'rgba(255, 61, 61, 0.15)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, gap: 8 },
    primaryButtonGhostText: { color: '#eb6060', fontWeight: '600', fontSize: 14 },

    primaryButtonGhostWarning: { backgroundColor: 'rgba(234, 179, 8, 0.15)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, gap: 8 },
    primaryButtonGhostTextWarning: { color: '#eab308', fontWeight: '600', fontSize: 14 },

    cardItem: { backgroundColor: COLORS.card, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
    cardItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardIconBox: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cardItemName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
    defaultBadge: { backgroundColor: 'rgba(255, 61, 61, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    defaultBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    usageText: { fontSize: 13, color: COLORS.muted },
    amount: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    mutedText: { fontSize: 13, color: COLORS.muted },
    progressBg: { height: 6, backgroundColor: '#292929', borderRadius: 99, marginTop: 12, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 99 },

    typeBadge: { backgroundColor: 'rgba(234, 179, 8, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    typeBadgeText: { color: COLORS.warning, fontSize: 12, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    pullDownModalWrapper: { width: '85%', backgroundColor: '#1c1c1c', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333', borderBottomWidth: 3, borderBottomColor: COLORS.primary },
    pullDownModalContent: { paddingVertical: 12 },
    modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
    modalOptionText: { fontSize: 16, color: COLORS.text },
    modalOptionTextActive: { fontWeight: '600' },
});
