import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { authModule } from '../../composition/AuthModule';

export const LoginScreen: React.FC = () => {
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
      className="flex-1 bg-gray-950 justify-center items-center p-6"
    >
      <View className="w-full max-w-sm bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
        <View className="mb-6 items-center">
          <Text className="text-3xl font-extrabold text-white tracking-tight mb-1">
            Finance<Text className="text-red-500">Tracker</Text>
          </Text>
          <Text className="text-gray-400 text-sm">Sign in to manage your money</Text>
        </View>

        {displayError ? (
          <View className="bg-red-950/80 border border-red-800 p-3 rounded-xl mb-4">
            <Text className="text-red-300 text-xs font-semibold">{displayError}</Text>
          </View>
        ) : null}

        {viewModel.isAuthenticated ? (
          <View className="bg-emerald-950/80 border border-emerald-800 p-4 rounded-xl mb-4 items-center">
            <Text className="text-emerald-300 text-sm font-semibold mb-1">Signed in as</Text>
            <Text className="text-white text-base font-bold">{viewModel.userEmail}</Text>
          </View>
        ) : (
          <>
            <View className="mb-4">
              <Text className="text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</Text>
              <TextInput
                className="bg-gray-800 border border-gray-700 text-white rounded-xl p-3.5 text-base focus:border-red-500"
                placeholder="name@example.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                accessibilityLabel="Email input"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-300 text-xs font-semibold mb-2 uppercase tracking-wider">Password</Text>
              <TextInput
                className="bg-gray-800 border border-gray-700 text-white rounded-xl p-3.5 text-base focus:border-red-500"
                placeholder="••••••••"
                placeholderTextColor="#6B7280"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                accessibilityLabel="Password input"
              />
            </View>

            <TouchableOpacity
              className={`bg-red-600 py-3.5 rounded-xl items-center shadow-lg ${isLoading ? 'opacity-50' : 'active:bg-red-700'}`}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityLabel="Sign In button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-base">Sign In</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
