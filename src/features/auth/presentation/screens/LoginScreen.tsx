import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../../shared/theme';
import { Button } from '../../../../shared/components/Button/Button';
import { useAuth } from '../hooks/useAuth';
import { authModule } from '../../composition/AuthModule';

export const LoginScreen: React.FC = () => {
  const { colors, spacing, radius, typography } = useTheme();
  const { viewModel, isLoading, error, login } = useAuth(authModule.authController);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalValidation(null);
    if (!email.trim() || !password.trim()) {
      setLocalValidation('Email and password are required.');
      return;
    }

    await login({
      email: email.trim(),
      password: password.trim(),
    });
  };

  const displayError = localValidation || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfacePrimary,
              borderColor: colors.border,
              borderRadius: radius.large,
              padding: spacing.space24,
            },
          ]}
        >
          {/* Header Branding */}
          <View style={styles.header}>
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
              Finance<Text style={{ color: colors.brandPrimary }}>Tracker</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to manage your money
            </Text>
          </View>

          {/* Error Banner */}
          {displayError ? (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.error,
                  borderRadius: radius.medium,
                  padding: spacing.space12,
                  marginBottom: spacing.space16,
                },
              ]}
            >
              <Text style={[{ color: colors.error }, typography.caption]}>
                {displayError}
              </Text>
            </View>
          ) : null}

          {viewModel.isAuthenticated ? (
            <View
              style={[
                styles.signedInCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.success,
                  borderRadius: radius.medium,
                  padding: spacing.space16,
                  marginBottom: spacing.space16,
                },
              ]}
            >
              <Text style={[{ color: colors.success }, typography.caption]}>
                Signed in as
              </Text>
              <Text style={[{ color: colors.textPrimary }, typography.title]}>
                {viewModel.userEmail}
              </Text>
            </View>
          ) : (
            <>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    { color: colors.textSecondary, marginBottom: spacing.space8 },
                    typography.caption,
                  ]}
                >
                  EMAIL ADDRESS
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      borderRadius: radius.medium,
                      paddingHorizontal: spacing.space12,
                      paddingVertical: spacing.space12,
                    },
                    typography.body,
                  ]}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  accessibilityLabel="Email input"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordHeader}>
                  <Text
                    style={[
                      styles.inputLabel,
                      { color: colors.textSecondary, marginBottom: spacing.space8 },
                      typography.caption,
                    ]}
                  >
                    PASSWORD
                  </Text>
                  <Text style={[styles.deferredText, { color: colors.textMuted }, typography.caption]}>
                    Forgot Password? (Coming soon)
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundPrimary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      borderRadius: radius.medium,
                      paddingHorizontal: spacing.space12,
                      paddingVertical: spacing.space12,
                    },
                    typography.body,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  accessibilityLabel="Password input"
                />
              </View>

              {/* Primary Sign In Button */}
              <Button
                variant="primary"
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                accessibilityLabel="Sign In button"
                style={{ marginTop: spacing.space8 }}
              />

              {/* Deferred Sign Up Notice */}
              <View style={[styles.footer, { marginTop: spacing.space20 }]}>
                <Text style={[{ color: colors.textMuted, textAlign: 'center' }, typography.caption]}>
                  Don't have an account? Sign Up (Coming soon)
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  errorCard: {
    borderWidth: 1,
  },
  signedInCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deferredText: {
    fontStyle: 'italic',
    fontSize: 11,
  },
  input: {
    borderWidth: 1,
    minHeight: 44,
  },
  footer: {
    alignItems: 'center',
  },
});
