import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../shared/theme';
import { AppBar, Icon } from '../../../../shared/components';
import { AccountsModule } from '../../../accounts/composition/AccountsModule';
import { useAccounts } from '../../../accounts/presentation/hooks/useAccounts';
import { CategoriesModule } from '../../../categories/composition/CategoriesModule';
import { useCategories } from '../../../categories/presentation/hooks/useCategories';

const accountsModule = new AccountsModule();
const categoriesModule = new CategoriesModule();

// Exported so this screen's actual live-subtitle logic is unit-testable.
// MoreScreen itself can't be rendered or bare-invoked in this project's test
// setup (useAccounts/useCategories use real useState/useEffect internally,
// same constraint as TransactionsScreen - see TransactionsScreen.test.ts).
export function formatAccountsSubtitle(count: number, totalBalance: number, isLoading: boolean): string {
  if (isLoading) return 'Loading…';
  const total = totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `${count} linked · ₹${total} total`;
}

export function formatCategoriesSubtitle(activeCount: number, archivedCount: number, isLoading: boolean): string {
  if (isLoading) return 'Loading…';
  return `${activeCount} active, ${archivedCount} archived`;
}

export interface MoreMenuItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  route: '/accounts' | '/categories' | '/finances' | '/settings';
}

export function MoreScreen() {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();

  const { viewModels: accounts, totalBalance, isLoading: accountsLoading } = useAccounts(accountsModule.controller);
  const { categories, isLoading: categoriesLoading } = useCategories(categoriesModule.listCategoriesUseCase, true);

  const activeCategoryCount = categories.filter((c) => !c.isArchived).length;
  const archivedCategoryCount = categories.filter((c) => c.isArchived).length;

  const menuItems: MoreMenuItem[] = [
    {
      id: 'accounts',
      title: 'Accounts',
      subtitle: formatAccountsSubtitle(accounts.length, totalBalance, accountsLoading),
      iconName: 'Landmark',
      route: '/accounts',
    },
    {
      id: 'categories',
      title: 'Categories',
      subtitle: formatCategoriesSubtitle(activeCategoryCount, archivedCategoryCount, categoriesLoading),
      iconName: 'Tags',
      route: '/categories',
    },
    {
      id: 'finances',
      title: 'Finances & reports',
      subtitle: 'Full ledger and exports',
      iconName: 'Wallet',
      route: '/finances',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Theme, currency, security',
      iconName: 'Settings',
      route: '/settings',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <AppBar title="More" />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.space20 }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.row,
              index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider },
            ]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.subtitle}`}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevatedBadge }]}>
              <Icon name={item.iconName} size={22} color={colors.brandPrimary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.itemTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
                {item.title}
              </Text>
              <Text style={[styles.itemSubtitle, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                {item.subtitle}
              </Text>
            </View>
            <Icon name="ChevronRight" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 64,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {},
});
