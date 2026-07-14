import { useAuth } from '@/src/features/identity/hooks/useAuth';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { format, subMonths } from 'date-fns';
import { ArrowRight, CreditCard, History, Landmark, Menu, Pencil, Receipt, Settings, Target, TrendingDown, User, Wallet, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0a0a0a',
  card: '#141414',
  border: '#292929',
  primary: '#ff3d3d',
  text: '#fafafa',
  muted: '#999999',
  success: '#4ade80',
  warning: '#facc15',
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const { totalSpend, totalBorrowed, spendByCreditCard, budgetLimit, setBudgetLimit, data, currentMonth, setCurrentMonth } = useBudgetContext();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [tempBudget, setTempBudget] = useState('');
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Category Colors
  const PALETTE = ['#ff3d3d', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

  // Generate last 6 months
  const months = React.useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), i);
      return {
        id: format(d, 'yyyy-MM'),
        label: format(d, 'MMM yyyy'),
      };
    });
  }, []);

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, { toValue: 300, duration: 250, useNativeDriver: true }).start(() => setDrawerVisible(false));
  };

  const handleOpenBudgetModal = () => {
    setTempBudget(budgetLimit > 0 ? String(budgetLimit) : '');
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = () => {
    setBudgetLimit(Number(tempBudget) || 0);
    setBudgetModalVisible(false);
  };

  const totalCreditSpend = spendByCreditCard.reduce((sum, s) => sum + s.amount, 0);
  const totalCreditLimit = data.creditCards.reduce((sum, c) => sum + c.limit, 0) || 1;
  const creditUsage = Math.min((totalCreditSpend / totalCreditLimit) * 100, 100);

  const budgetRemaining = budgetLimit - totalSpend;
  const budgetUsagePercent = budgetLimit > 0 ? Math.min((totalSpend / budgetLimit) * 100, 100) : 0;
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.topNav}>
        <Text style={styles.brandTitle}>Finance<Text style={{ color: '#fff' }}>Flow</Text></Text>
        <TouchableOpacity onPress={openDrawer} style={{ padding: 4 }}>
          <Menu size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeSmall}>Welcome back,</Text>
          <Text style={styles.welcomeName}>{displayName}</Text>
        </View>

        {/* Month Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthPillContainer} contentContainerStyle={{ gap: 8 }}>
          {months.map(m => {
            const isActive = m.id === currentMonth;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.monthPill, isActive && styles.monthPillActive]}
                onPress={() => setCurrentMonth(m.id)}
              >
                <Text style={[styles.monthPillText, isActive && styles.monthPillTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Total Spent Card */}
        <View style={styles.totalCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <TrendingDown size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.totalLabel}>Total Spent</Text>
          </View>
          <Text style={styles.totalAmount}>
            ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.row}>
          <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
            <View style={styles.statHeader}>
              <Wallet size={14} color={COLORS.success} />
              <Text style={styles.statTitle}>BUDGET LEFT</Text>
            </View>
            <Text style={styles.statValue}>
              ₹{Math.max(budgetRemaining, 0).toLocaleString('en-IN')}
            </Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${budgetUsagePercent}%`, backgroundColor: COLORS.success }]} />
            </View>
          </View>
          <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
            <View style={styles.statHeader}>
              <CreditCard size={14} color={COLORS.primary} />
              <Text style={styles.statTitle}>CREDIT CARD</Text>
            </View>
            <Text style={styles.statValue}>₹{totalCreditSpend.toLocaleString('en-IN')}</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${creditUsage}%`, backgroundColor: COLORS.primary }]} />
            </View>
            <Text style={{ fontSize: 10, color: COLORS.muted, textAlign: 'right', marginTop: 4 }}>{creditUsage.toFixed(0)}%</Text>
          </View>
        </View>

        {/* Borrowed Card */}
        <View style={styles.card}>
          <View style={styles.statHeader}>
            <Landmark size={14} color={COLORS.warning} />
            <Text style={styles.statTitle}>BORROWED</Text>
          </View>
          <Text style={styles.statValue}>
            ₹{totalBorrowed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>Due 5 days</Text>
          </View>
        </View>

        {/* Monthly Budget Section */}
        <View style={styles.card}>
          <View style={[styles.statHeader, { justifyContent: 'space-between', marginBottom: 0 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Target size={14} color={COLORS.primary} />
              <Text style={styles.statTitle}>MONTHLY BUDGET</Text>
            </View>
            {budgetLimit > 0 && (
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={handleOpenBudgetModal}>
                <Pencil size={14} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </View>
          {budgetLimit === 0 ? (
            <TouchableOpacity style={styles.outlineButton} onPress={handleOpenBudgetModal}>
              <Text style={styles.outlineButtonText}>Set Monthly Budget</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.statValue, { marginTop: 12 }]}>₹{budgetLimit.toLocaleString('en-IN')}</Text>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={{ marginTop: 20 }}>
          <View style={[styles.row, { marginBottom: 12 }]}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity style={styles.row}>
              <Text style={[styles.primaryText, { marginRight: 4 }]}>View All</Text>
              <ArrowRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {data?.spends && data.spends.length > 0 && (
            <View style={styles.txListContainer}>
              {data.spends.slice(0, 5).map((spend, index, arr) => {
                const category = data.categories.find(c => c.id === spend.categoryId);
                const catName = category?.name || 'Spend';
                const catIndex = data.categories.findIndex(c => c.id === spend.categoryId);
                const color = PALETTE[Math.max(0, catIndex) % PALETTE.length];

                return (
                  <View key={spend.id} style={[styles.txItem, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.txLeft}>
                      <View style={[styles.txIcon, { backgroundColor: `${color}15` }]}>
                        <Receipt size={16} color={color} />
                      </View>
                      <View>
                        <Text style={styles.txTitle}>{catName}</Text>
                        <Text style={styles.txMuted}>
                          {catName} • {format(new Date(spend.dateISO), 'MMM d, h:mm a')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.txAmountNegative}>-₹{spend.amount}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {(!data?.spends || data.spends.length === 0) && (
            <View style={{ alignItems: 'center', backgroundColor: COLORS.card, paddingVertical: 40, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}>
              <Receipt size={40} color={COLORS.muted} style={{ marginBottom: 12 }} />
              <Text style={styles.mutedText}>No transactions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Drawer */}
      <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={closeDrawer}>
        <View style={styles.drawerOverlay}>
          <Pressable style={styles.drawerBackdrop} onPress={closeDrawer} />
          <Animated.View style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity onPress={closeDrawer} style={{ padding: 4 }}>
                <X size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.drawerItem}>
              <History size={20} color={COLORS.text} />
              <Text style={styles.drawerItemText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem}>
              <Settings size={20} color={COLORS.text} />
              <Text style={styles.drawerItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem}>
              <User size={20} color={COLORS.text} />
              <Text style={styles.drawerItemText}>Profile</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={budgetModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setBudgetModalVisible(false)}>
          <Pressable style={styles.budgetModalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Set Monthly Budget</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter budget amount"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              value={tempBudget}
              onChangeText={setTempBudget}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setBudgetModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveBudget}>
                <Text style={styles.modalBtnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 16 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16 },
  brandTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  header: { marginBottom: 16 },
  welcomeSmall: { fontSize: 13, color: COLORS.muted },
  welcomeName: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  monthPillContainer: { marginBottom: 20 },
  monthPill: { backgroundColor: '#1a1a1a', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99 },
  monthPillActive: { backgroundColor: COLORS.primary },
  monthPillText: { color: COLORS.muted, fontSize: 13, fontWeight: '500' },
  monthPillTextActive: { color: '#fff', fontWeight: '600' },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  totalAmount: { fontSize: 36, fontWeight: '700', color: '#fff', marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  statTitle: { fontSize: 12, color: COLORS.muted, fontWeight: '600', marginLeft: 6, letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  cardText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  mutedText: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  primaryText: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressBg: { height: 6, backgroundColor: '#242424', borderRadius: 99, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  drawerOverlay: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  drawerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  drawerContent: { width: 280, backgroundColor: COLORS.bg, height: '100%', padding: 24, paddingTop: 60 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  drawerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 },
  drawerItemText: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  dueBadge: { backgroundColor: '#1c1c1c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, alignSelf: 'flex-start', marginTop: 12 },
  dueBadgeText: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  outlineButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 16, backgroundColor: '#121212' },
  outlineButtonText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

  // Transactions
  txListContainer: { backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  txItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  txIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  txMuted: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  txAmountNegative: { fontSize: 15, fontWeight: '700', color: COLORS.text },

  // Budget Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  budgetModalContent: { backgroundColor: COLORS.card, width: '100%', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  modalInput: { backgroundColor: '#1a1a1a', height: 48, borderRadius: 8, paddingHorizontal: 16, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  modalBtnCancelText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
  modalBtnSave: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalBtnSaveText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
