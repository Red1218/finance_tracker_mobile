import { useBudgetContext } from '@/contexts/BudgetContext';
import { useDrafts } from '@/hooks/useDrafts';
import { PaymentMethod, Spend } from '@/types/budget';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight, Edit2, Plus, Receipt, Trash2, X, MessageSquare } from 'lucide-react-native';
import React, { useRef, useState, useCallback } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

const COLORS = {
    bg: '#0a0a0a', card: '#141414', border: '#292929',
    primary: '#ff3d3d', text: '#fafafa', muted: '#999999',
    success: '#4ade80', warning: '#facc15'
};

const PALETTE = ['#ff3d3d', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

const PAYMENT_METHODS: { id: PaymentMethod, label: string }[] = [
    { id: 'cash', label: 'Cash' },
    { id: 'upi', label: 'UPI' },
    { id: 'debit', label: 'Debit Card' },
    { id: 'credit', label: 'Credit Card' },
];

export default function SpendsScreen() {
    const { data, addSpend, updateSpend, deleteSpend } = useBudgetContext();
    const { drafts, removeDraft, refreshDrafts } = useDrafts();
    const defaultCard = data?.creditCards?.find(c => c.isDefault);
    const scrollRef = useRef<ScrollView>(null);

    useFocusEffect(
        useCallback(() => {
            refreshDrafts();
        }, [])
    );

    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
    const [selectedCreditCardId, setSelectedCreditCardId] = useState<string | null>(null);
    const [note, setNote] = useState('');

    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownType, setDropdownType] = useState<'category' | 'payment' | 'creditCard'>('category');

    const [calendarVisible, setCalendarVisible] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // Multi-select
    const [selectedSpends, setSelectedSpends] = useState<Set<string>>(new Set());
    const isMultiSelect = selectedSpends.size > 0;

    // Delete confirm
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [spendToDelete, setSpendToDelete] = useState<string | null>(null);

    const [expandedDraftGroups, setExpandedDraftGroups] = useState<Set<string>>(new Set());

    const toggleDraftGroup = (source: string) => {
        setExpandedDraftGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(source)) newSet.delete(source);
            else newSet.add(source);
            return newSet;
        });
    };

    const groupedDrafts = drafts.reduce((acc, draft) => {
        const source = draft.note || 'Unknown';
        if (!acc[source]) acc[source] = [];
        acc[source].push(draft);
        return acc;
    }, {} as Record<string, typeof drafts>);

    const handleApproveDraft = (draft: any) => {
        setAmount(String(draft.amount));
        setNote(draft.note);
        setSelectedPaymentMethod(draft.paymentMethod);
        setDate(new Date(draft.dateISO));
        removeDraft(draft.id);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const getCategoryColor = (catId: string) => {
        if (!data?.categories) return '#ff3d3d';
        const index = data.categories.findIndex(c => c.id === catId);
        return PALETTE[Math.max(0, index) % PALETTE.length];
    };

    const handleSelectPaymentMethod = (method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
        setDropdownVisible(false);

        if (method === 'credit') {
            if (defaultCard) {
                setSelectedCreditCardId(defaultCard.id);
            } else if (data?.creditCards?.length === 1) {
                setSelectedCreditCardId(data.creditCards[0].id);
            } else if (data?.creditCards && data.creditCards.length > 1) {
                setTimeout(() => {
                    setDropdownType('creditCard');
                    setDropdownVisible(true);
                }, 300);
            }
        } else {
            setSelectedCreditCardId(null);
        }
    };

    const handleSubmit = () => {
        if (!amount || isNaN(Number(amount)) || !selectedCategory) return;

        const payload = {
            amount: Number(amount),
            categoryId: selectedCategory,
            dateISO: date.toISOString(),
            note: note.trim() || undefined,
            paymentMethod: selectedPaymentMethod,
            creditCardId: selectedPaymentMethod === 'credit' ? (selectedCreditCardId || undefined) : undefined,
        };

        if (isEditing) {
            updateSpend(isEditing, payload);
            setIsEditing(null);
        } else {
            addSpend(payload);
        }

        setAmount('');
        setNote('');
        setSelectedCategory('');
        setSelectedPaymentMethod('cash');
        setSelectedCreditCardId(null);
        setDate(new Date());
    };

    const handleEdit = (spend: Spend) => {
        setIsEditing(spend.id);
        setAmount(String(spend.amount));
        setDate(new Date(spend.dateISO));
        setSelectedCategory(spend.categoryId);
        setSelectedPaymentMethod(spend.paymentMethod);
        setSelectedCreditCardId(spend.creditCardId || null);
        setNote(spend.note || '');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const confirmDelete = (id: string) => {
        setSpendToDelete(id);
        setDeleteModalVisible(true);
    };

    const executeDelete = () => {
        if (spendToDelete) {
            deleteSpend(spendToDelete);
            setSelectedSpends(prev => {
                const newSet = new Set(prev);
                newSet.delete(spendToDelete);
                return newSet;
            });
        } else if (isMultiSelect) {
            Array.from(selectedSpends).forEach(id => deleteSpend(id));
            setSelectedSpends(new Set());
        }
        setDeleteModalVisible(false);
        setSpendToDelete(null);
    };

    const toggleSelectSpend = (id: string) => {
        setSelectedSpends(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    // Calendar logic
    const today = new Date();
    const calendarStart = startOfWeek(startOfMonth(calendarMonth));
    const calendarEnd = endOfWeek(endOfMonth(calendarMonth));
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
        <SafeAreaView style={styles.container}>
            {/* Multi-Select Header Overlay */}
            {isMultiSelect ? (
                <View style={styles.multiSelectHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <TouchableOpacity onPress={() => setSelectedSpends(new Set())}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.multiSelectTitle}>{selectedSpends.size} Selected</Text>
                    </View>
                    <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
                        <Trash2 size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.header}>
                    <Text style={styles.title}>Spends</Text>
                    <Text style={styles.subtitle}>Track your daily expenses</Text>
                </View>
            )}

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} ref={scrollRef}>
                {/* Drafts Section */}
                {drafts && drafts.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                            Pending Payments ({drafts.length})
                        </Text>
                        {Object.entries(groupedDrafts).map(([source, groupDrafts]) => {
                            if (groupDrafts.length === 1) {
                                const draft = groupDrafts[0];
                                return (
                                    <View key={draft.id} style={styles.draftCard}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                                <View style={[styles.itemIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                                    <MessageSquare size={18} color="#3b82f6" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.itemTitle}>{draft.note}</Text>
                                                    <Text style={styles.itemSubtitle}>Detected via SMS</Text>
                                                </View>
                                            </View>
                                            <Text style={[styles.amount, { color: COLORS.text }]}>₹{draft.amount}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                                            <TouchableOpacity onPress={() => removeDraft(draft.id)} style={styles.draftBtnSecondary}>
                                                <Text style={styles.draftBtnTextSecondary}>Discard</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleApproveDraft(draft)} style={styles.draftBtnPrimary}>
                                                <Text style={styles.draftBtnTextPrimary}>Review & Add</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            }

                            // Grouped Drafts
                            const isExpanded = expandedDraftGroups.has(source);
                            return (
                                <View key={source} style={styles.draftCard}>
                                    <TouchableOpacity onPress={() => toggleDraftGroup(source)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                            <View style={[styles.itemIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                                <MessageSquare size={18} color="#3b82f6" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemTitle}>{source}</Text>
                                                <Text style={styles.itemSubtitle}>{groupDrafts.length} Pending Payments</Text>
                                            </View>
                                        </View>
                                        <ChevronDown size={20} color={COLORS.muted} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#1e3a8a', paddingTop: 16 }}>
                                            {groupDrafts.map((draft, idx) => (
                                                <View key={draft.id} style={{ marginBottom: idx < groupDrafts.length - 1 ? 16 : 0 }}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={styles.itemSubtitle}>{format(new Date(draft.dateISO), 'MMM d, h:mm a')}</Text>
                                                        <Text style={[styles.amount, { color: COLORS.text }]}>₹{draft.amount}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                                                        <TouchableOpacity onPress={() => removeDraft(draft.id)} style={styles.draftBtnSecondary}>
                                                            <Text style={styles.draftBtnTextSecondary}>Discard</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleApproveDraft(draft)} style={styles.draftBtnPrimary}>
                                                            <Text style={styles.draftBtnTextPrimary}>Review & Add</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Inline Form */}
                <View style={[styles.formCard, isEditing && { borderColor: COLORS.primary }]}>
                    {isEditing && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Editing Spend</Text>
                            <TouchableOpacity onPress={() => {
                                setIsEditing(null); setAmount(''); setNote(''); setSelectedCategory('');
                            }}>
                                <Text style={{ color: COLORS.muted, fontSize: 13 }}>Cancel Edit</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.formRow}>
                        <TextInput
                            style={[styles.input, { flex: 1.5, marginRight: 12 }]}
                            placeholder="Amount"
                            placeholderTextColor={COLORS.muted}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <TouchableOpacity
                            style={[styles.input, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                            onPress={() => { setCalendarMonth(date); setCalendarVisible(true); }}
                        >
                            <CalendarIcon size={16} color={COLORS.text} style={{ marginRight: 8 }} />
                            <Text style={{ color: COLORS.text, fontWeight: '500' }}>{format(date, 'MMM d, yyyy')}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }]}
                        onPress={() => { setDropdownType('category'); setDropdownVisible(true); }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {selectedCategory && (
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getCategoryColor(selectedCategory) }} />
                            )}
                            <Text style={{ color: selectedCategory ? COLORS.text : COLORS.muted, fontWeight: '500' }}>
                                {data?.categories.find(c => c.id === selectedCategory)?.name || 'Category'}
                            </Text>
                        </View>
                        <ChevronDown size={16} color={COLORS.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }]}
                        onPress={() => { setDropdownType('payment'); setDropdownVisible(true); }}
                    >
                        <Text style={{ color: COLORS.text, fontWeight: '500' }}>
                            {PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.label || 'Cash'}
                        </Text>
                        <ChevronDown size={16} color={COLORS.muted} />
                    </TouchableOpacity>

                    {selectedPaymentMethod === 'credit' && data?.creditCards && data.creditCards.length > 0 && (
                        <TouchableOpacity
                            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, backgroundColor: '#111' }]}
                            onPress={() => { setDropdownType('creditCard'); setDropdownVisible(true); }}
                        >
                            <Text style={{ color: selectedCreditCardId ? COLORS.text : COLORS.warning, fontWeight: '500' }}>
                                {data.creditCards.find(c => c.id === selectedCreditCardId)?.name || 'Select Credit Card'}
                            </Text>
                            <ChevronDown size={16} color={COLORS.muted} />
                        </TouchableOpacity>
                    )}

                    <TextInput
                        style={[styles.input, { marginTop: 12 }]}
                        placeholder="Note (optional)"
                        placeholderTextColor={COLORS.muted}
                        value={note}
                        onChangeText={setNote}
                    />

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        {isEditing ? <Check size={16} color="#e57373" /> : <Plus size={16} color="#e57373" />}
                        <Text style={styles.submitBtnText}>{isEditing ? 'Update Spend' : 'Add Spend'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Spends List or Empty State */}
                {(!data?.spends || data.spends.length === 0) ? (
                    <View style={styles.emptyCard}>
                        <Receipt size={40} color={COLORS.muted} style={{ marginBottom: 12 }} />
                        <Text style={styles.emptyText}>No transactions yet</Text>
                    </View>
                ) : (
                    <View style={{ marginTop: 8, paddingBottom: 40 }}>
                        {data.spends.map((spend) => {
                            const isSelected = selectedSpends.has(spend.id);
                            const catName = data.categories.find(c => c.id === spend.categoryId)?.name || 'Spend';
                            const catColor = getCategoryColor(spend.categoryId);
                            const payMethodLabel = PAYMENT_METHODS.find(p => p.id === spend.paymentMethod)?.label || 'Cash';

                            return (
                                <TouchableOpacity
                                    key={spend.id}
                                    style={[styles.item, isSelected && styles.itemSelected]}
                                    onLongPress={() => toggleSelectSpend(spend.id)}
                                    onPress={() => {
                                        if (isMultiSelect) toggleSelectSpend(spend.id);
                                    }}
                                    delayLongPress={300}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.itemLeft}>
                                        <View style={[styles.itemIcon, { backgroundColor: `${catColor}15` }]}>
                                            <Receipt size={18} color={catColor} />
                                        </View>
                                        <View>
                                            <Text style={styles.itemTitle}>{catName}</Text>
                                            <Text style={styles.itemSubtitle}>
                                                {payMethodLabel} • {format(new Date(spend.dateISO), 'MMM d, h:mm a')}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 12 }}>
                                            {!isMultiSelect && (
                                                <>
                                                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => handleEdit(spend)}>
                                                        <Edit2 size={16} color={COLORS.muted} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={() => confirmDelete(spend.id)}>
                                                        <Trash2 size={16} color={COLORS.muted} />
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                        <Text style={styles.amount}>-₹{spend.amount.toLocaleString('en-IN')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Dropdown Modal */}
            <Modal visible={dropdownVisible} transparent animationType="fade">
                <Pressable style={styles.modalBackdrop} onPress={() => setDropdownVisible(false)}>
                    <View style={styles.dropdownBox}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {dropdownType === 'category' && data?.categories?.map((cat, i) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.dropdownItem, i < data.categories.length - 1 && styles.dropdownBorder]}
                                    onPress={() => { setSelectedCategory(cat.id); setDropdownVisible(false); }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: getCategoryColor(cat.id) }} />
                                        <Text style={styles.dropdownItemText}>{cat.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {dropdownType === 'payment' && PAYMENT_METHODS.map((pay, i) => (
                                <TouchableOpacity
                                    key={pay.id}
                                    style={[styles.dropdownItem, i < PAYMENT_METHODS.length - 1 && styles.dropdownBorder]}
                                    onPress={() => handleSelectPaymentMethod(pay.id)}
                                >
                                    <Text style={styles.dropdownItemText}>{pay.label}</Text>
                                </TouchableOpacity>
                            ))}

                            {dropdownType === 'creditCard' && data?.creditCards?.map((card, i) => (
                                <TouchableOpacity
                                    key={card.id}
                                    style={[styles.dropdownItem, i < data.creditCards.length - 1 && styles.dropdownBorder]}
                                    onPress={() => { setSelectedCreditCardId(card.id); setDropdownVisible(false); }}
                                >
                                    <Text style={styles.dropdownItemText}>{card.name} {card.isDefault ? '(Default)' : ''}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>

            {/* Calendar Modal */}
            <Modal visible={calendarVisible} transparent animationType="fade">
                <Pressable style={styles.modalBackdrop} onPress={() => setCalendarVisible(false)}>
                    <Pressable style={styles.calendarCard} onPress={e => e.stopPropagation()}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={() => setCalendarMonth(subMonths(calendarMonth, 1))} style={{ padding: 8 }}>
                                <ChevronLeft size={20} color={COLORS.muted} />
                            </TouchableOpacity>
                            <Text style={styles.calendarTitle}>{format(calendarMonth, 'MMMM yyyy')}</Text>
                            <TouchableOpacity onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))} style={{ padding: 8 }}>
                                <ChevronRight size={20} color={COLORS.muted} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.calendarGrid}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <Text key={day} style={styles.calendarWeekday}>{day}</Text>
                            ))}
                            {calendarDays.map((day, i) => {
                                const isCurrentMonth = isSameMonth(day, calendarMonth);
                                const isSelected = isSameDay(day, date);
                                const isToday = isSameDay(day, today);

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[
                                            styles.calendarDay,
                                            isSelected && styles.calendarDaySelected,
                                            !isSelected && isToday && styles.calendarDayToday
                                        ]}
                                        onPress={() => { setDate(day); setCalendarVisible(false); }}
                                    >
                                        <Text style={[
                                            styles.calendarDayText,
                                            !isCurrentMonth && { color: '#333' },
                                            isSelected && { color: '#fff', fontWeight: 'bold' }
                                        ]}>{format(day, 'd')}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <Pressable style={styles.modalBackdrop} onPress={() => setDeleteModalVisible(false)}>
                    <Pressable style={styles.confirmBox} onPress={e => e.stopPropagation()}>
                        <Text style={styles.confirmTitle}>Delete Spend{isMultiSelect && !spendToDelete ? 's' : ''}</Text>
                        <Text style={styles.confirmText}>
                            Are you sure you want to delete {isMultiSelect && !spendToDelete ? `these ${selectedSpends.size} spends` : 'this spend'}? This cannot be undone.
                        </Text>
                        <View style={styles.confirmActions}>
                            <TouchableOpacity style={styles.confirmCancel} onPress={() => setDeleteModalVisible(false)}>
                                <Text style={styles.confirmCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmDelete} onPress={executeDelete}>
                                <Text style={styles.confirmDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: '700', color: COLORS.text },
    subtitle: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
    multiSelectHeader: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    multiSelectTitle: { fontSize: 18, color: COLORS.text, fontWeight: '600' },
    scroll: { flex: 1, paddingHorizontal: 16 },
    formCard: { backgroundColor: COLORS.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
    formRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    input: { backgroundColor: '#1a1a1a', height: 48, borderRadius: 8, paddingHorizontal: 16, color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: '#242424' },
    submitBtn: { backgroundColor: '#7f1d1d', flexDirection: 'row', height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 8 },
    submitBtnText: { color: '#e57373', fontWeight: '600', fontSize: 15 },

    emptyCard: { backgroundColor: COLORS.card, paddingVertical: 48, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: COLORS.muted, fontSize: 14, marginTop: 12 },

    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    itemSelected: { borderColor: COLORS.primary, backgroundColor: '#2a1212' },
    itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    itemIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    itemTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    itemSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
    amount: { fontSize: 16, fontWeight: '700', color: COLORS.primary },

    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24, alignItems: 'center' },
    dropdownBox: { backgroundColor: '#1f1f1f', borderRadius: 12, width: '100%', maxHeight: 300, borderWidth: 1, borderColor: '#333' },
    dropdownItem: { paddingVertical: 16, paddingHorizontal: 20 },
    dropdownBorder: { borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
    dropdownItemText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },

    calendarCard: { backgroundColor: '#1f1f1f', borderRadius: 16, width: 320, padding: 20, borderWidth: 1, borderColor: '#333' },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    calendarTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calendarWeekday: { width: '14.28%', textAlign: 'center', color: COLORS.muted, fontSize: 12, marginBottom: 12 },
    calendarDay: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    calendarDaySelected: { backgroundColor: COLORS.primary, borderRadius: 99 },
    calendarDayToday: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: 99 },
    calendarDayText: { color: COLORS.text, fontSize: 14 },

    confirmBox: { backgroundColor: COLORS.card, borderRadius: 16, width: '100%', padding: 24, borderWidth: 1, borderColor: COLORS.border },
    confirmTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
    confirmText: { fontSize: 14, color: COLORS.muted, marginBottom: 24, lineHeight: 20 },
    confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    confirmCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    confirmCancelText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
    confirmDelete: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    confirmDeleteText: { color: '#fff', fontSize: 15, fontWeight: '600' },

    draftCard: { backgroundColor: '#1a2235', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e3a8a', marginBottom: 12 },
    draftBtnSecondary: { paddingVertical: 8, paddingHorizontal: 12 },
    draftBtnTextSecondary: { color: COLORS.muted, fontSize: 13, fontWeight: '600' },
    draftBtnPrimary: { backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
    draftBtnTextPrimary: { color: '#fff', fontSize: 13, fontWeight: '600' }
});
