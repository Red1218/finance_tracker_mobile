# 📊 Finance Tracker Mobile — Visual Module Tree (vtm.md)

> **What is this document?**
> This is a complete end-to-end **Visual AST (Abstract Syntax Tree)** of the entire `finance_tracker_mobile` project. Every single file is catalogued with a brief explanation, its role in the dependency graph, its key exports, and its relationships to other modules. Below the AST, a **phase-by-phase implementation plan** outlines actionable development tasks for the project.

---

## 🗂️ Project Overview

```
finance_tracker_mobile/
├── app/                        ← Expo Router screens (file-based routing)
│   ├── _layout.tsx             ← Root layout (providers, navigation shell)
│   ├── auth.tsx                ← Auth screen (login/signup)
│   ├── modal.tsx               ← Generic modal screen
│   ├── +not-found.tsx          ← 404 fallback screen
│   └── (tabs)/                 ← Tab navigator group
│       ├── _layout.tsx         ← Tab bar setup + auth guard
│       ├── index.tsx           ← Dashboard / Home tab
│       ├── spends.tsx          ← Spends list tab
│       ├── categories.tsx      ← Categories tab
│       ├── finances.tsx        ← Credit cards & borrowings tab
│       ├── savings.tsx         ← Savings tracker tab
│       └── two.tsx             ← Scaffold / placeholder tab
├── contexts/
│   ├── AuthContext.tsx         ← Auth state provider (Supabase auth)
│   └── BudgetContext.tsx       ← Budget data provider (wraps useBudget)
├── hooks/
│   ├── useBudget.ts            ← Core data hook (CRUD + Supabase sync)
│   ├── use-toast.ts            ← Toast/alert utility hook
│   └── use-mobile.tsx          ← Viewport width detection hook (web)
├── integrations/
│   └── supabase/
│       ├── client.ts           ← Supabase client singleton
│       └── types.ts            ← Auto-generated Supabase DB types
├── types/
│   └── budget.ts               ← Domain model types & constants
├── components/
│   ├── Themed.tsx              ← Theme-aware Text/View wrappers
│   ├── EditScreenInfo.tsx      ← Expo boilerplate info component
│   ├── ExternalLink.tsx        ← In-app browser link component
│   ├── StyledText.tsx          ← MonoText (SpaceMono font) wrapper
│   ├── useColorScheme.ts       ← Native color scheme hook
│   ├── useColorScheme.web.ts   ← Web color scheme hook (platform split)
│   ├── useClientOnlyValue.ts   ← SSR-safe value hook (native)
│   └── useClientOnlyValue.web.ts ← SSR-safe value hook (web)
├── constants/
│   └── Colors.ts               ← Light/dark palette tokens
├── lib/
│   └── utils.ts                ← cn() utility (clsx + tailwind-merge)
├── supabase/
│   ├── config.toml             ← Supabase CLI project config
│   └── migrations/             ← SQL migration files (DB schema history)
│       ├── 20251213074626_...sql  ← Initial schema (all tables)
│       ├── 20251215081212_...sql  ← Minor schema patch
│       ├── 20251216230545_...sql  ← Additional columns/indexes
│       └── 20260106125102_...sql  ← Latest migration
├── assets/
│   └── fonts/
│       └── SpaceMono-Regular.ttf ← Custom monospace font
├── docs/
│   └── vtm.md                  ← THIS FILE — Visual AST
├── .env                        ← Env vars (Supabase URL + anon key)
├── app.json                    ← Expo app configuration
├── babel.config.js             ← Babel config (babel-preset-expo)
├── tsconfig.json               ← TypeScript config (path aliases)
├── package.json                ← Dependencies manifest
└── expo-env.d.ts               ← Expo global type declarations
```

---

## 🏗️ Full Visual AST — File by File

---

### ⚙️ CONFIGURATION LAYER

---

#### `package.json`
> **Brief:** The project's dependency manifest. Defines all runtime and dev dependencies, plus npm scripts. Uses `expo-router/entry` as the main entry point — meaning Expo Router automatically handles routing from the `app/` directory.

```
package.json
├── ENTRY: "main" → "expo-router/entry"
├── SCRIPTS
│   ├── start   → expo start
│   ├── android → expo start --android
│   ├── ios     → expo start --ios
│   └── web     → expo start --web
├── DEPENDENCIES (key)
│   ├── expo ~55.0.4
│   ├── expo-router ~55.0.3
│   ├── @supabase/supabase-js ^2.98.0
│   ├── @tanstack/react-query ^5.90.21
│   ├── @react-navigation/native ^7.1.28
│   ├── lucide-react-native ^0.575.0
│   ├── date-fns ^4.1.0
│   ├── expo-secure-store ^55.0.8
│   ├── react-native-reanimated 4.2.1
│   ├── react-native-safe-area-context ~5.6.2
│   ├── react-hook-form ^7.71.2
│   ├── clsx ^2.1.1
│   ├── tailwind-merge ^3.5.0
│   └── zod ^4.3.6
└── DEV DEPENDENCIES
    ├── @types/react ~19.2.2
    └── typescript ~5.9.2
```

---

#### `app.json`
> **Brief:** Expo's app configuration file. Defines the app's name, slug, icon, splash screen, and platform-specific build settings (Android, iOS, web). Configures `expo-router` as the routing plugin.

```
app.json
├── name: "finance-tracker-mobile"
├── scheme: (deep-link scheme)
├── plugins: ["expo-router"]
├── platforms: [ios, android, web]
├── assets: splash, icon, adaptive-icon
└── web: { bundler: "metro" }
```

---

#### `babel.config.js`
> **Brief:** Babel configuration for the project. Uses the `babel-preset-expo` preset — the only preset needed for Expo projects. This replaces any NativeWind or custom transformer setup.

```
babel.config.js
└── presets: ['babel-preset-expo']
```

---

#### `tsconfig.json`
> **Brief:** TypeScript compiler options. Extends `expo/tsconfig.base` and adds the `@/` path alias that maps to the project root, allowing clean imports like `@/hooks/useBudget`.

```
tsconfig.json
└── paths: { "@/*": ["./*"] }
```

---

#### `.env`
> **Brief:** Environment variables file. Contains the two Supabase secrets needed to initialize the client: the project URL and the anonymous (public) API key. Prefixed with `EXPO_PUBLIC_` so Expo inlines them at build time.

```
.env
├── EXPO_PUBLIC_SUPABASE_URL
└── EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

---

#### `expo-env.d.ts`
> **Brief:** A TypeScript declaration file that tells the TypeScript compiler about globals injected by Expo, such as the `process.env` variable types for `EXPO_PUBLIC_*` keys and other Expo-specific types.

```
expo-env.d.ts
└── /// <reference types="expo/types" />
```

---

### 🗄️ DATABASE LAYER — Supabase

---

#### `supabase/config.toml`
> **Brief:** Supabase CLI project configuration. Links this local project to the remote Supabase project ID, enabling `supabase db push`, `supabase gen types`, and other CLI commands.

```
supabase/config.toml
└── project_id = "<supabase-project-ref>"
```

---

#### `supabase/migrations/` (4 SQL files)
> **Brief:** The chronological database schema history. Each `.sql` file is a migration applied to the Supabase Postgres database in order. Together, they define the full DB schema.

```
migrations/
├── 20251213074626_...sql  ← INITIAL SCHEMA
│   ├── TABLE: categories     (id, user_id, name, created_at)
│   ├── TABLE: credit_cards   (id, user_id, name, credit_limit, is_default)
│   ├── TABLE: spends         (id, user_id, amount, category_id, payment_method,
│   │                          credit_card_id, note, spend_date, created_at)
│   ├── TABLE: borrowings     (id, user_id, type, amount, source, note, created_at)
│   ├── TABLE: budget_settings(id, user_id, month, budget_limit)
│   ├── RLS POLICIES: per-table, user_id = auth.uid()
│   └── TRIGGER: ensure only one default card per user
├── 20251215081212_...sql  ← PATCH: minor schema adjustment
├── 20251216230545_...sql  ← PATCH: additional columns or indexes
└── 20260106125102_...sql  ← LATEST: savings table or new constraint
    └── TABLE: savings        (id, user_id, amount, note, savings_date, created_at)
```

---

#### `integrations/supabase/client.ts`
> **Brief:** The single Supabase client instance used across the entire app. Initializes with `expo-secure-store` as the auth token storage adapter (replacing `localStorage` for React Native). Reads credentials from environment variables. Typed with the auto-generated `Database` type.

```
client.ts
├── IMPORTS
│   ├── react-native-url-polyfill/auto  ← Polyfills URL for RN
│   ├── @supabase/supabase-js → createClient
│   ├── expo-secure-store → SecureStore
│   └── ./types → Database (generated types)
├── ExpoSecureStoreAdapter
│   ├── getItem(key)  → SecureStore.getItemAsync(key)
│   ├── setItem(key)  → SecureStore.setItemAsync(key, value)
│   └── removeItem(key) → SecureStore.deleteItemAsync(key)
└── EXPORT: supabase = createClient<Database>(url, key, { auth: { storage: adapter } })
```

---

#### `integrations/supabase/types.ts`
> **Brief:** Auto-generated TypeScript types that mirror the Supabase Postgres schema exactly. Provides full type-safety for all database queries — every table's row shape, insert shape, and update shape is defined here. Generated via `supabase gen types typescript`.

```
types.ts
├── Database (root type)
│   └── public
│       └── Tables
│           ├── categories        { Row, Insert, Update }
│           ├── credit_cards      { Row, Insert, Update }
│           ├── spends            { Row, Insert, Update }
│           ├── borrowings        { Row, Insert, Update }
│           ├── budget_settings   { Row, Insert, Update }
│           └── savings           { Row, Insert, Update }
└── EXPORT: Database
```

---

### 🧩 DOMAIN TYPES LAYER

---

#### `types/budget.ts`
> **Brief:** The application's domain model types. Defines the clean, app-facing TypeScript interfaces for all entities (separate from the raw DB types). Also contains constants like default categories and label maps used for display.

```
budget.ts
├── INTERFACES
│   ├── Category        { id, name }
│   ├── Spend           { id, dateISO, amount, categoryId, note?, paymentMethod, creditCardId? }
│   ├── Borrowing       { id, type, amount, from, note? }
│   ├── CreditCard      { id, name, limit, isDefault? }
│   ├── Saving          { id, amount, note?, dateISO }
│   └── BudgetData      { categories[], spends[], borrowings[], creditCards[], savings[], budgetLimit }
├── TYPE ALIASES
│   ├── PaymentMethod   = 'cash' | 'upi' | 'debit' | 'credit'
│   └── BorrowingType   = 'personal' | 'loan_app' | 'friend' | 'credit_provider' | 'other'
└── CONSTANTS
    ├── defaultBudgetData
    ├── DEFAULT_CATEGORIES  ['Grocery', 'Electricity', 'Rent', ...]
    ├── paymentMethodLabels { cash: 'Cash', upi: 'UPI', ... }
    └── borrowingTypeLabels { personal: 'Personal Loan', ... }
```

---

### 🔌 INTEGRATION / SERVICE LAYER

---

#### `hooks/use-toast.ts`
> **Brief:** A lightweight toast/notification utility. Since React Native doesn't have a built-in toast, this wraps `Alert.alert()` from React Native and exposes a `toast({ title, description, variant })` function. Used throughout `useBudget.ts` to show error/success messages.

```
use-toast.ts
├── IMPORTS: Alert (react-native)
├── EXPORT: toast({ title, description?, variant? }) → Alert.alert(title, description)
└── EXPORT: useToast() → { toast }
```

---

#### `hooks/use-mobile.tsx`
> **Brief:** A web-only viewport detection hook. Checks whether the window width is below 768px (the mobile breakpoint) and reactively updates on resize. This is a leftover from the web version of the app and is not actively used in the native screens.

```
use-mobile.tsx
├── CONST: MOBILE_BREAKPOINT = 768
└── EXPORT: useIsMobile() → boolean
    └── Listens to window.matchMedia for resize events
```

---

### 🧠 CORE LOGIC LAYER

---

#### `hooks/useBudget.ts`  ⭐ (Central Hook — 717 lines)
> **Brief:** The heart of the application. This single hook manages ALL data for the finance tracker: fetching, creating, updating, and deleting every entity in the database. It talks directly to Supabase, transforms raw DB rows into domain types, handles month-scoped queries, seeds default categories, and returns computed aggregates. `BudgetContext` simply wraps this hook to make it globally available.

```
useBudget.ts
├── IMPORTS
│   ├── react → useState, useEffect, useCallback
│   ├── @/types/budget → all domain types + constants
│   ├── date-fns → format, startOfMonth, endOfMonth
│   ├── @/integrations/supabase/client → supabase
│   ├── @/contexts/AuthContext → useAuth
│   └── @/hooks/use-toast → toast
│
├── STATE
│   ├── currentMonth: string (yyyy-MM)
│   ├── data: BudgetData
│   └── loading: boolean
│
├── fetchData() [useCallback, deps: user, currentMonth]
│   ├── Fetches in parallel: categories, credit_cards, spends, borrowings,
│   │   budget_settings, savings
│   ├── Filters spends & savings by [monthStart, monthEnd]
│   ├── Seeds DEFAULT_CATEGORIES if user has 0 categories
│   └── Maps all DB rows → domain types → setData()
│
├── CATEGORY CRUD
│   ├── addCategory(name)
│   └── deleteCategory(id)
│
├── SPEND CRUD
│   ├── addSpend(spend)
│   ├── deleteSpend(id)
│   └── updateSpend(id, spend)
│
├── BORROWING CRUD
│   ├── addBorrowing(borrowing)
│   ├── deleteBorrowing(id)
│   └── updateBorrowing(id, updates)
│
├── CREDIT CARD CRUD
│   ├── addCreditCard(card)
│   ├── deleteCreditCard(id)
│   ├── updateCreditCard(id, updates)
│   └── setDefaultCard(id)
│
├── BUDGET SETTINGS
│   └── setBudgetLimit(limit) — upserts budget_settings by (user_id, month)
│
├── SAVINGS CRUD
│   ├── addSaving(saving)
│   ├── deleteSaving(id)
│   └── updateSaving(id, saving)
│
├── COMPUTED VALUES (derived, not stored)
│   ├── totalSpend       ← sum of all spends this month
│   ├── totalBorrowed    ← sum of all borrowings
│   ├── totalSaved       ← sum of all savings this month
│   ├── spendByCategory  ← [{ category, amount }]
│   ├── spendByCreditCard← [{ card, amount }]
│   └── defaultCard      ← the credit card with isDefault=true
│
└── RETURN: full API surface (all above functions + computed values)
```

---

### 🔐 AUTH LAYER

---

#### `contexts/AuthContext.tsx`
> **Brief:** The authentication state provider. Listens to Supabase auth state changes in real-time using `onAuthStateChange`, also calling `getSession()` on mount to hydrate existing sessions. Exposes `signUp`, `signIn`, `signOut`, `user`, `session`, and `loading` via React Context. All screens that need to know the current user consume `useAuth()`.

```
AuthContext.tsx
├── IMPORTS
│   ├── @/integrations/supabase/client → supabase
│   ├── @supabase/supabase-js → Session, User
│   └── react → createContext, useState, useEffect, useContext, useContext
│
├── INTERFACE: AuthContextType
│   ├── user: User | null
│   ├── session: Session | null
│   ├── loading: boolean
│   ├── signUp(email, password, displayName?) → Promise<{ error }>
│   ├── signIn(email, password) → Promise<{ error }>
│   └── signOut() → Promise<void>
│
├── AuthProvider (component)
│   ├── STATE: user, session, loading
│   ├── EFFECT: supabase.auth.onAuthStateChange → sync state
│   ├── EFFECT: supabase.auth.getSession() on mount
│   ├── signUp → supabase.auth.signUp(email, password, { display_name })
│   ├── signIn → supabase.auth.signInWithPassword(email, password)
│   └── signOut → supabase.auth.signOut()
│
└── EXPORT: AuthProvider, useAuth()
```

---

#### `contexts/BudgetContext.tsx`
> **Brief:** A thin context wrapper around `useBudget`. Instantiates `useBudget()` once at the provider level and distributes its entire return value to all child components via context. Any component can call `useBudgetContext()` to access the full budget API without prop drilling.

```
BudgetContext.tsx
├── IMPORTS
│   ├── react → createContext, useContext
│   └── @/hooks/useBudget → useBudget
│
├── BudgetContextType = ReturnType<typeof useBudget>
│
├── BudgetProvider (component)
│   └── const budget = useBudget()
│       └── <BudgetContext.Provider value={budget}>
│
└── EXPORT: BudgetProvider, useBudgetContext()
```

---

### 🖥️ COMPONENT LAYER

---

#### `components/Themed.tsx`
> **Brief:** Theme-aware wrappers for React Native's `Text` and `View`. Uses `useColorScheme` to detect the current theme and looks up the appropriate color from `Colors.ts`. Supports per-instance `lightColor`/`darkColor` overrides. Used by the boilerplate components (`EditScreenInfo`, `StyledText`, `+not-found.tsx`, `modal.tsx`).

```
Themed.tsx
├── IMPORTS: Colors, useColorScheme
├── EXPORT: useThemeColor(props, colorName) → string
├── EXPORT: Text(props: TextProps) → <DefaultText color={themed} />
└── EXPORT: View(props: ViewProps) → <DefaultView backgroundColor={themed} />
    DEPENDS ON: constants/Colors.ts, components/useColorScheme.ts
```

---

#### `components/EditScreenInfo.tsx`
> **Brief:** A boilerplate Expo info component that displays the current file path and a hint to the developer. Used only in `modal.tsx`. Shows an external link to Expo docs. Not used in any production app feature.

```
EditScreenInfo.tsx
├── IMPORTS: ExternalLink, MonoText, Text/View (Themed), Colors
├── PROPS: { path: string }
└── RENDERS: file path hint + Expo docs link
    DEPENDS ON: ExternalLink.tsx, StyledText.tsx, Themed.tsx, Colors.ts
```

---

#### `components/ExternalLink.tsx`
> **Brief:** A safe external link component. On native platforms, it prevents the default behavior (which would open the system browser) and instead opens links in an in-app browser using `expo-web-browser`. On web, it behaves like a normal `target="_blank"` link.

```
ExternalLink.tsx
├── IMPORTS: expo-router/Link, expo-web-browser, Platform
└── EXPORT: ExternalLink({ href, ...props })
    └── onPress: Platform !== 'web' → WebBrowser.openBrowserAsync(href)
```

---

#### `components/StyledText.tsx`
> **Brief:** A minimal wrapper that applies the `SpaceMono` monospace font to any `Text` element. Used by `EditScreenInfo` to render the file path in monospace. Depends on the font being loaded in the root layout.

```
StyledText.tsx
├── IMPORTS: Text, TextProps from ./Themed
└── EXPORT: MonoText(props) → <Text fontFamily="SpaceMono" />
```

---

#### `components/useColorScheme.ts` + `useColorScheme.web.ts`
> **Brief:** Platform-split hooks for detecting the current color scheme (`'light'` | `'dark'`). The `.ts` version uses React Native's `useColorScheme`. The `.web.ts` version adds hydration safety for server-side rendering. Metro bundler selects the correct file per platform.

```
useColorScheme.ts       → useColorScheme() from 'react-native'
useColorScheme.web.ts   → useColorScheme() + useClientOnlyValue for SSR safety
    DEPENDS ON: useClientOnlyValue.web.ts (web version only)
```

---

#### `components/useClientOnlyValue.ts` + `useClientOnlyValue.web.ts`
> **Brief:** A platform-split utility that prevents hydration mismatches in web builds. The native version always returns the provided value. The web version returns a server-safe default until the client has hydrated, then switches to the real value.

```
useClientOnlyValue.ts      → return value (native: immediate)
useClientOnlyValue.web.ts  → useState(serverValue) → client effect → setValue(value)
```

---

### 🏛️ CONSTANTS LAYER

---

#### `constants/Colors.ts`
> **Brief:** The design token file for the legacy theming system. Defines light and dark color palettes with keys: `text`, `background`, `tint`, `tabIconDefault`, `tabIconSelected`. Used by `Themed.tsx` and `EditScreenInfo.tsx`. Note: the main app screens define their own inline `COLORS` constants instead.

```
Colors.ts
└── EXPORT default
    ├── light: { text: '#000', background: '#fff', tint: '#2f95dc', ... }
    └── dark:  { text: '#fff', background: '#000', tint: '#fff', ... }
```

---

### 🛠️ UTILITIES LAYER

---

#### `lib/utils.ts`
> **Brief:** A single utility function `cn()` that merges Tailwind CSS class names with conflict resolution. Combines `clsx` (conditional class joining) and `tailwind-merge` (intelligent deduplication). This is a web-era utility carried over from the original web app — not actively used in the current RN StyleSheet-based screens.

```
utils.ts
├── IMPORTS: clsx, tailwind-merge
└── EXPORT: cn(...inputs: ClassValue[]) → string
```

---

### 📱 SCREEN LAYER (Expo Router)

---

#### `app/_layout.tsx` — Root Layout
> **Brief:** The root of the entire app's component tree. Wraps everything in three providers: `QueryClientProvider` (React Query), `AuthProvider` (auth state), and `BudgetProvider` (budget data + CRUD). Loads the `SpaceMono` font via `useFonts`, prevents the splash screen from hiding until fonts are ready, and sets up the `Stack` navigator with two screens: the tabs group and the modal.

```
app/_layout.tsx
├── IMPORTS
│   ├── @react-navigation/native → DarkTheme, DefaultTheme, ThemeProvider
│   ├── @tanstack/react-query → QueryClient, QueryClientProvider
│   ├── expo-font → useFonts
│   ├── expo-router → Stack
│   ├── expo-splash-screen → SplashScreen
│   ├── @/components/useColorScheme → useColorScheme
│   ├── @/contexts/AuthContext → AuthProvider
│   └── @/contexts/BudgetContext → BudgetProvider
│
├── QueryClient instance
├── SplashScreen.preventAutoHideAsync()
│
├── RootLayout() [DEFAULT EXPORT]
│   ├── useFonts({ SpaceMono })
│   ├── useEffect: if loaded → SplashScreen.hideAsync()
│   └── RENDERS:
│       └── <QueryClientProvider>
│           └── <AuthProvider>
│               └── <BudgetProvider>
│                   └── <RootLayoutNav>
│
└── RootLayoutNav()
    └── <ThemeProvider (light|dark)>
        └── <Stack>
            ├── Screen: "(tabs)" headerShown=false
            └── Screen: "modal" presentation='modal'
```

---

#### `app/(tabs)/_layout.tsx` — Tab Navigator
> **Brief:** The tab bar layout. The primary navigation scaffold of the app. Guards access using `useAuth()` — if there's no user, it immediately redirects to `/auth`. Once authenticated, renders a 5-tab `<Tabs>` navigator with a dark theme (`#0a0a0a` background, `#ff3d3d` active tint) using Lucide icons.

```
app/(tabs)/_layout.tsx
├── IMPORTS
│   ├── @/contexts/AuthContext → useAuth
│   ├── expo-router → Redirect, Tabs
│   └── lucide-react-native → Home, Info, Landmark, List, PieChart
│
├── AUTH GUARD: !user → <Redirect href="/auth" />
│
└── RENDERS: <Tabs>
    ├── Tab: "index"      → Home icon       → DashboardScreen
    ├── Tab: "spends"     → List icon       → SpendsScreen
    ├── Tab: "categories" → PieChart icon   → CategoriesScreen
    ├── Tab: "finances"   → Landmark icon   → FinancesScreen
    └── Tab: "savings"    → Info icon       → SavingsScreen
```

---

#### `app/auth.tsx` — Auth Screen
> **Brief:** The login and registration screen. A single screen that toggles between Sign In and Sign Up modes using local state. On submit, calls `signIn()` or `signUp()` from `useAuth()`. Redirects to `/` if the user is already authenticated. Features a branded header with a `₹` logo, email/password inputs, and keyboard-avoiding behavior for iOS.

```
app/auth.tsx
├── IMPORTS
│   ├── @/contexts/AuthContext → useAuth
│   ├── expo-router → Redirect
│   └── react-native → Alert, KeyboardAvoidingView, TextInput, ...
│
├── STATE: email, password, isSignUp, loading
│
├── GUARD: user → <Redirect href="/" />
│
├── handleAuth()
│   ├── isSignUp=true  → signUp(email, password)
│   └── isSignUp=false → signIn(email, password)
│
└── RENDERS
    ├── Logo (₹ symbol)
    ├── TextInput: email
    ├── TextInput: password (secureTextEntry)
    ├── Button: "Sign In" / "Sign Up"
    └── Toggle: switch between sign-in / sign-up modes
```

---

#### `app/(tabs)/index.tsx` — Dashboard Screen
> **Brief:** The main home/dashboard tab. Shows a personalized welcome header, a large "Total Spent" card in red, quick stat cards (Budget Left, Credit Spent), a conditional borrowed amount banner, and a recent activity list showing the 5 most recent spends. All data comes from `useBudgetContext()`.

```
app/(tabs)/index.tsx
├── IMPORTS
│   ├── @/contexts/AuthContext → useAuth
│   ├── @/contexts/BudgetContext → useBudgetContext
│   └── lucide-react-native → ArrowRight, CreditCard, Landmark, Wallet
│
├── CONSUMES: user, totalSpend, totalBorrowed, spendByCreditCard, budgetLimit, data
│
├── COMPUTED: totalCreditSpend, budgetRemaining, displayName
│
└── RENDERS
    ├── Header: "Welcome back, {displayName}"
    ├── Card: Total Spent (₹{totalSpend}) — red gradient card
    ├── Row: [Budget Left] | [Credit Spent] — stat cards
    ├── Card: Borrowed ₹{totalBorrowed} — shows if totalBorrowed > 0
    └── List: Recent Activity → data.spends.slice(0,5)
              each item: note, date, amount
```

---

#### `app/(tabs)/spends.tsx` — Spends Screen
> **Brief:** A scrollable list of all spending transactions for the current month. Each item shows the spend note, payment method chip (e.g. "UPI"), date, and amount. Has a floating `+` button (rendered but not yet wired to a form). Empty state shown when no spends exist.

```
app/(tabs)/spends.tsx
├── IMPORTS: useBudgetContext, lucide-react-native/Plus, react-native
├── CONSUMES: data.spends[]
└── RENDERS
    ├── Top bar: "Spends" + FAB (+)
    └── ScrollView: data.spends.map → item card
        ├── note / 'Spend'
        ├── Chip: paymentMethod.toUpperCase()
        ├── date
        └── amount ₹
```

---

#### `app/(tabs)/categories.tsx` — Categories Screen
> **Brief:** A list of all spending categories for the user. For each category, computes the total amount spent from `data.spends` filtered by `categoryId`, and displays a colored dot (cycling through a 7-color palette), category name, transaction count, and total spend amount. FAB button is rendered but not yet wired.

```
app/(tabs)/categories.tsx
├── IMPORTS: useBudgetContext, lucide-react-native/Plus, react-native
├── CONST: PALETTE (7 distinct colors)
├── CONSUMES: data.categories[], data.spends[]
├── COMPUTED per category: catSpends[], total
└── RENDERS
    ├── Top bar: "Categories" + FAB (+)
    └── ScrollView: data.categories.map → item
        ├── Colored dot (PALETTE[index % 7])
        ├── category.name
        ├── "{count} transactions"
        └── ₹{total}
```

---

#### `app/(tabs)/finances.tsx` — Finances Screen
> **Brief:** Two-section screen covering financial liabilities. Section 1 lists credit cards with usage bars — shows card name, amount spent on that card, credit limit, usage percentage, and an animated progress bar. Section 2 lists all borrowings with source and amount. Data is live from `useBudgetContext()`.

```
app/(tabs)/finances.tsx
├── IMPORTS: useBudgetContext, lucide-react-native (CreditCard, Landmark)
├── CONSUMES: data.creditCards[], data.spends[], data.borrowings[]
│
├── RENDERS Section 1 — Credit Cards
│   └── data.creditCards.map → card
│       ├── Card name + CreditCard icon
│       ├── ₹{total spent on this card}
│       ├── Limit: ₹{limit}  |  {usage}% used
│       └── Progress bar (filled to usage%)
│
└── RENDERS Section 2 — Borrowed
    └── data.borrowings.map → item
        ├── Landmark icon + item.from
        ├── ₹{item.amount}
        └── item.note (if present)
```

---

#### `app/(tabs)/savings.tsx` — Savings Screen
> **Brief:** Track monthly savings deposits. Shows a prominent summary card with the total saved this month (in green). Below it, a scrollable list of individual saving entries with note, date, and green-highlighted amount. FAB button for adding new savings is rendered but not yet wired.

```
app/(tabs)/savings.tsx
├── IMPORTS: useBudgetContext, lucide-react-native/Plus
├── CONSUMES: data.savings[]
├── COMPUTED: totalSaved = sum of all savings amounts
└── RENDERS
    ├── Top bar: "Savings" + FAB (+)
    ├── Summary card: "Total Saved This Month" ₹{totalSaved} (green)
    └── ScrollView: data.savings.map → item
        ├── saving.note / 'Saving'
        ├── date
        └── +₹{amount} (success/green color)
```

---

#### `app/(tabs)/two.tsx`
> **Brief:** An empty scaffold tab left over from the Expo boilerplate (`create-expo-app --template tabs`). It contains just a styled title. Not yet integrated into the main tab navigator (was removed from `_layout.tsx` tabs list) — serves as a placeholder for a future feature tab.

```
two.tsx
└── RENDERS: basic View with "Two" title text (scaffold/placeholder)
```

---

#### `app/modal.tsx` — Modal Screen
> **Brief:** A generic modal screen registered in the root stack navigator. Currently shows boilerplate content (`EditScreenInfo`) and a "Modal" title using the themed `Text`/`View` components. Accessed via `router.push('/modal')`. Can be repurposed for any overlay form (e.g., Add Spend form).

```
app/modal.tsx
├── IMPORTS: expo-status-bar, EditScreenInfo, Themed (Text, View)
└── RENDERS
    ├── title: "Modal"
    ├── <EditScreenInfo path="app/modal.tsx" />
    └── <StatusBar style="light" /> (iOS)
```

---

#### `app/+not-found.tsx` — 404 Screen
> **Brief:** The catch-all not-found screen rendered when Expo Router cannot match a URL to any screen. Shows a friendly "This screen doesn't exist" message and a navigation link back to the home screen. Uses the themed `Text`/`View` components.

```
+not-found.tsx
├── IMPORTS: expo-router (Link, Stack), Themed (Text, View)
└── RENDERS
    ├── Stack.Screen title: "Oops!"
    ├── "This screen doesn't exist."
    └── Link href="/" → "Go to home screen!"
```

---

## 🔗 Full Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                       ENTRY POINT                               │
│                  expo-router/entry                              │
│                         │                                       │
│                  app/_layout.tsx                                │
│          ┌──────────────┼──────────────┐                       │
│  QueryClientProvider  AuthProvider  BudgetProvider             │
│                │             │             │                    │
│         @tanstack/       AuthContext   BudgetContext            │
│         react-query          │               │                  │
│                        supabase/client   useBudget.ts           │
│                              │               │                  │
│                         supabase/types   types/budget.ts        │
│                              │               │                  │
│                         .env (keys)      date-fns               │
│                                               │                 │
│                                          use-toast.ts           │
└─────────────────────────────────────────────────────────────────┘

SCREENS (all under app/(tabs)/_layout.tsx auth guard)
┌───────────────────────────────────────────────────┐
│  index.tsx ──────── useAuth + useBudgetContext    │
│  spends.tsx ──────────────── useBudgetContext     │
│  categories.tsx ──────────── useBudgetContext     │
│  finances.tsx ────────────── useBudgetContext     │
│  savings.tsx ─────────────── useBudgetContext     │
│                                                   │
│  auth.tsx ────────────────── useAuth              │
│  modal.tsx ─── EditScreenInfo ─── ExternalLink    │
│                     └──── Themed ─── Colors.ts    │
│  +not-found.tsx ──────────── Themed               │
└───────────────────────────────────────────────────┘
```

---

## 📋 Phase-by-Phase Implementation Plan

---

### Phase 1 — Foundation & Architecture ✅ (Completed)

> Establish core infrastructure, authentication, and type-safe database integration.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 1.1 | Initialize Expo project with `expo-router` and TypeScript | `package.json`, `app.json`, `tsconfig.json` | ✅ Done |
| 1.2 | Configure Babel with `babel-preset-expo` | `babel.config.js` | ✅ Done |
| 1.3 | Set up Supabase project and environment variables | `.env`, `supabase/config.toml` | ✅ Done |
| 1.4 | Create Supabase client with `expo-secure-store` adapter | `integrations/supabase/client.ts` | ✅ Done |
| 1.5 | Define database schema via SQL migrations | `supabase/migrations/*.sql` | ✅ Done |
| 1.6 | Generate Supabase TypeScript types | `integrations/supabase/types.ts` | ✅ Done |
| 1.7 | Define domain model types and constants | `types/budget.ts` | ✅ Done |
| 1.8 | Implement `AuthContext` with Supabase auth listeners | `contexts/AuthContext.tsx` | ✅ Done |
| 1.9 | Set up root layout with provider tree | `app/_layout.tsx` | ✅ Done |

---

### Phase 2 — Core Data Layer ✅ (Completed)

> Build the central data hook and context for budget management.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 2.1 | Implement `useBudget` hook — `fetchData` with month scoping | `hooks/useBudget.ts` | ✅ Done |
| 2.2 | Implement Category CRUD (`add`, `delete`) | `hooks/useBudget.ts` | ✅ Done |
| 2.3 | Implement Spend CRUD (`add`, `delete`, `update`) | `hooks/useBudget.ts` | ✅ Done |
| 2.4 | Implement Borrowing CRUD (`add`, `delete`, `update`) | `hooks/useBudget.ts` | ✅ Done |
| 2.5 | Implement Credit Card CRUD + `setDefaultCard` | `hooks/useBudget.ts` | ✅ Done |
| 2.6 | Implement Budget Limit upsert (`setBudgetLimit`) | `hooks/useBudget.ts` | ✅ Done |
| 2.7 | Implement Savings CRUD (`add`, `delete`, `update`) | `hooks/useBudget.ts` | ✅ Done |
| 2.8 | Add computed aggregates (`totalSpend`, `spendByCategory`, etc.) | `hooks/useBudget.ts` | ✅ Done |
| 2.9 | Wrap `useBudget` in `BudgetContext` for global availability | `contexts/BudgetContext.tsx` | ✅ Done |
| 2.10 | Implement `use-toast` as `Alert.alert` wrapper | `hooks/use-toast.ts` | ✅ Done |

---

### Phase 3 — Screen Layer ✅ (Completed)

> Create all navigation screens and UI for the five core tabs.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 3.1 | Implement Auth screen (login/signup toggle) | `app/auth.tsx` | ✅ Done |
| 3.2 | Implement Tab layout with auth guard + 5 tabs | `app/(tabs)/_layout.tsx` | ✅ Done |
| 3.3 | Build Dashboard (Home) screen with stats + recent activity | `app/(tabs)/index.tsx` | ✅ Done |
| 3.4 | Build Spends list screen | `app/(tabs)/spends.tsx` | ✅ Done |
| 3.5 | Build Categories screen with per-category spend totals | `app/(tabs)/categories.tsx` | ✅ Done |
| 3.6 | Build Finances screen (credit cards + borrowings) | `app/(tabs)/finances.tsx` | ✅ Done |
| 3.7 | Build Savings screen with monthly total summary | `app/(tabs)/savings.tsx` | ✅ Done |

---

### Phase 4 — CRUD Forms & Interactions 🔲 (Pending)

> Wire the FAB buttons to forms for creating new data entries. Currently, all FAB `+` buttons on Spends, Categories, and Savings screens are rendered but non-functional.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 4.1 | Create `AddSpendForm` modal/sheet with fields: amount, category, payment method, date, note | `app/modal.tsx` or new `app/(tabs)/add-spend.tsx` | 🔲 Pending |
| 4.2 | Wire Spends FAB → `AddSpendForm` → `addSpend()` | `app/(tabs)/spends.tsx` | 🔲 Pending |
| 4.3 | Create `AddCategoryForm` — simple text input + confirm | `components/AddCategoryForm.tsx` | 🔲 Pending |
| 4.4 | Wire Categories FAB → `AddCategoryForm` → `addCategory()` | `app/(tabs)/categories.tsx` | 🔲 Pending |
| 4.5 | Create `AddSavingForm` — amount, note, date | `components/AddSavingForm.tsx` | 🔲 Pending |
| 4.6 | Wire Savings FAB → `AddSavingForm` → `addSaving()` | `app/(tabs)/savings.tsx` | 🔲 Pending |
| 4.7 | Create `AddBorrowingForm` — type, amount, source, note | `components/AddBorrowingForm.tsx` | 🔲 Pending |
| 4.8 | Create `AddCreditCardForm` — name, credit limit | `components/AddCreditCardForm.tsx` | 🔲 Pending |
| 4.9 | Wire Finances screen + forms → `addBorrowing()`, `addCreditCard()` | `app/(tabs)/finances.tsx` | 🔲 Pending |
| 4.10 | Add swipe-to-delete or long-press delete for spend, saving, borrowing items | All list screens | 🔲 Pending |
| 4.11 | Add edit functionality for spend/saving/borrowing via modal | All list screens | 🔲 Pending |

---

### Phase 5 — Budget Settings & Month Navigation 🔲 (Pending)

> Allow users to configure their monthly budget limit and navigate between months.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 5.1 | Add a "Set Budget Limit" input to Dashboard or a Settings screen | `app/(tabs)/index.tsx` or new settings screen | 🔲 Pending |
| 5.2 | Wire budget limit input → `setBudgetLimit()` | `hooks/useBudget.ts` (already implemented) | 🔲 Pending |
| 5.3 | Add month picker/arrows to navigate `currentMonth` | Dashboard or top-level component | 🔲 Pending |
| 5.4 | Wire month change → `setCurrentMonth()` → automatic `fetchData` re-run | `hooks/useBudget.ts` (already implemented) | 🔲 Pending |

---

### Phase 6 — Analytics & Visualizations 🔲 (Pending)

> Add charts and visual insights to the dashboard and categories screen.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 6.1 | Install or use `react-native-svg` (already in deps) for charts | `package.json` (done) | 🟡 Dep ready |
| 6.2 | Create a donut/pie chart for `spendByCategory` on Dashboard | `app/(tabs)/index.tsx` | 🔲 Pending |
| 6.3 | Create a bar chart for spend trends over the week/month | `app/(tabs)/index.tsx` | 🔲 Pending |
| 6.4 | Add spending trend line chart to Spends screen | `app/(tabs)/spends.tsx` | 🔲 Pending |
| 6.5 | Add "top category" highlight and budget vs actual comparison | Dashboard | 🔲 Pending |

---

### Phase 7 — Polish & UX Enhancements 🔲 (Pending)

> Improve usability, loading states, empty states, and overall polish.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 7.1 | Add loading skeletons/spinners while `useBudget` fetches data | All tab screens | 🔲 Pending |
| 7.2 | Improve empty state illustrations and copy | All list screens | 🔲 Pending |
| 7.3 | Add pull-to-refresh on all list screens (`RefreshControl`) | All tab screens | 🔲 Pending |
| 7.4 | Add haptic feedback on FAB taps and confirmations | Form components | 🔲 Pending |
| 7.5 | Move `COLORS` constants to a shared theme file | `constants/colors.ts` (new) | 🔲 Pending |
| 7.6 | Implement a Settings screen (display name, sign out, delete account) | `app/settings.tsx` (new) | 🔲 Pending |
| 7.7 | Add form validation using `react-hook-form` + `zod` (already in deps) | Form components | 🔲 Pending |
| 7.8 | Add keyboard-dismiss on scroll for list screens | All tab screens | 🔲 Pending |

---

### Phase 8 — Production Readiness 🔲 (Pending)

> Harden the app for real-world usage and eventual store submission.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| 8.1 | Add proper app icons and splash screen for Android + iOS | `assets/`, `app.json` | 🔲 Pending |
| 8.2 | Configure EAS Build (`eas.json`) for APK/AAB generation | `eas.json` (new) | 🔲 Pending |
| 8.3 | Set up production Supabase environment variables | `.env.production` | 🔲 Pending |
| 8.4 | Add Supabase RLS policy audit and review | `supabase/migrations/` | 🔲 Pending |
| 8.5 | Set up error boundaries for each tab screen | All tab screens | 🔲 Pending |
| 8.6 | Implement deep linking for auth redirects (password reset) | `app.json`, `app/_layout.tsx` | 🔲 Pending |
| 8.7 | Add offline detection and graceful degradation | `hooks/useBudget.ts` | 🔲 Pending |
| 8.8 | Write unit tests for `useBudget` hook CRUD operations | `__tests__/useBudget.test.ts` | 🔲 Pending |

---

*Generated by Antigravity AI — Visual Module Tree (VTM) for `finance_tracker_mobile`*
*Last updated: 2026-03-01*
