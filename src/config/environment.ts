type PublicEnvironment = Readonly<{
  supabaseUrl: string;
  supabasePublishableKey: string;
}>;

function requirePublicEnvironmentValue(name: string, value: string | undefined): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(`Missing required public environment variable: ${name}`);
  }

  return normalizedValue;
}

export const environment: PublicEnvironment = Object.freeze({
  supabaseUrl: requirePublicEnvironmentValue(
    'EXPO_PUBLIC_SUPABASE_URL',
    process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  supabasePublishableKey: requirePublicEnvironmentValue(
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
});
