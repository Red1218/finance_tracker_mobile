import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Landmark, Tags, Wallet, Settings as SettingsIcon, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/shared/theme';

export default function MoreNavigationRoute() {
  const router = useRouter();
  const { colors, spacing, radius, typography } = useTheme();

  const menuItems = [
    {
      id: 'accounts',
      title: 'Accounts',
      subtitle: 'Manage linked bank accounts and balances',
      icon: Landmark,
      route: '/accounts' as const,
    },
    {
      id: 'categories',
      title: 'Categories',
      subtitle: 'Customize spending and income categories',
      icon: Tags,
      route: '/categories' as const,
    },
    {
      id: 'finances',
      title: 'Finances & Reports',
      subtitle: 'View detailed financial reporting ledger',
      icon: Wallet,
      route: '/finances' as const,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences, notifications and security',
      icon: SettingsIcon,
      route: '/settings' as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surfacePrimary }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.heading.fontSize }]}>
          More Options
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.surfacePrimary,
                  borderColor: colors.border,
                  borderRadius: radius.large,
                },
              ]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityHint={item.subtitle}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceElevated }]}>
                <ItemIcon size={22} color={colors.brandPrimary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary, fontSize: typography.title.fontSize }]}>
                  {item.title}
                </Text>
                <Text style={[styles.itemSubtitle, { color: colors.textSecondary, fontSize: typography.caption.fontSize }]}>
                  {item.subtitle}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
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
