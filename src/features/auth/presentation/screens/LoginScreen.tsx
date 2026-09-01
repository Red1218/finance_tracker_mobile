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
import { Button, Icon } from '../../../../shared/components';
import { useAuth } from '../hooks/useAuth';
import { authModule } from '../../composition/AuthModule';

// The controller passes through the raw auth-provider exception message
// (see AuthController: `error: e.message || 'Login failed...'`), which can
// be a network error, a Supabase-specific string, or anything else - there
// is no structured error code to reliably tell "wrong password" apart from
// other failures. Rather than guess at a diagnosis that might be wrong (and
// actively misleading if the real cause was, say, no network), this is a
// generic but actionable replacement, not a copy of the mockup's
// password-specific text.
const GENERIC_LOGIN_ERROR = "That didn't work. Double-check your email and password, then try again.";

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

  const displayError = localValidation || (error ? GENERIC_LOGIN_ERROR : null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Branding */}
          <View style={styles.header}>
            <View style={[styles.brandIcon, { borderColor: colors.brandPrimary }]}>
              <Icon name="IndianRupee" size={24} color={colors.brandPrimary} />
            </View>
            {viewModel.isAuthenticated ? null : (
              <>
                <Text style={[styles.title, { color: colors.textPrimary, fontSize: typography.display.fontSize }]}>
                  Welcome back
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.body.fontSize }]}>
                  Sign in to pick up where you left off.
                </Text>
              </>
            )}
          </View>

          {viewModel.isAuthenticated ? (
            <View
              style={[
                styles.signedInCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.success,
                  borderRadius: radius.medium,
                  padding: spacing.space16,
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
                  <Text
                    style={[typography.caption, { color: colors.textMuted }]}
                    accessibilityLabel="Forgot password, not yet available"
                  >
                    Forgot password?
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
                  aria-describedby={displayError ? 'login-error' : undefined}
                />
              </View>

              {/* Error Banner - bound to the field by aria-describedby, not
                  color alone, per the spec's a11y note. */}
              {displayError ? (
                <View
                  nativeID="login-error"
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

              {/* Primary Sign In Button */}
              <Button
                variant="outline"
                title="Sign in"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                accessibilityLabel="Sign In button"
              />

              {/* Deferred Sign Up */}
              <View style={styles.footer}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  New here?{' '}
                  <Text
                    style={{ color: colors.brandPrimary, fontWeight: '600' }}
                    accessibilityLabel="Create an account, not yet available"
                  >
                    Create an account
                  </Text>
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
    justifyContent: 'flex-end',
    padding: 24,
  },
  content: {
    width: '100%',
  },
  header: {
    marginBottom: 32,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '400',
    marginBottom: 6,
  },
  subtitle: {},
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
  input: {
    borderWidth: 1,
    minHeight: 44,
  },
  errorCard: {
    borderWidth: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
