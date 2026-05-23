import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useDeleteListing } from "@workspace/api-client-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth, AuthUser } from "@/context/auth";
import { apiUrl, errorMessage } from "@/utils/api";

function AuthForm() {
  const colors = useColors();
  const { login, register } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"farmer" | "buyer">("farmer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        await register(name.trim(), email.trim(), password, role);
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      setError(errorMessage(e));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.authScroll, { paddingTop: topPad + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <Feather name="shield" size={28} color="#fff" />
        </View>
        <Text style={[styles.brand, { color: colors.foreground }]}>
          AgriTRUST
        </Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Namibia's agricultural marketplace
        </Text>

        {/* Toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
          {(["login", "register"] as const).map((m) => (
            <Pressable
              key={m}
              style={[
                styles.toggleOption,
                mode === m && {
                  backgroundColor: colors.card,
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                },
              ]}
              onPress={() => setMode(m)}
            >
              <Text
                style={[
                  styles.toggleText,
                  {
                    color:
                      mode === m ? colors.foreground : colors.mutedForeground,
                  },
                ]}
              >
                {m === "login" ? "Sign In" : "Register"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === "register" && (
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name="user" size={16} color={colors.mutedForeground} />
              <TextInput
                testID="name-input"
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Full name"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <TextInput
              testID="email-input"
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              testID="password-input"
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {mode === "register" && (
            <View>
              <Text style={[styles.roleLabel, { color: colors.mutedForeground }]}>
                I am a…
              </Text>
              <View style={styles.roleRow}>
                {(["farmer", "buyer"] as const).map((r) => (
                  <Pressable
                    key={r}
                    testID={`role-${r}`}
                    style={[
                      styles.roleOption,
                      {
                        borderColor:
                          role === r ? colors.primary : colors.border,
                        backgroundColor:
                          role === r ? colors.secondary : colors.card,
                      },
                    ]}
                    onPress={() => setRole(r)}
                  >
                    <Feather
                      name={r === "farmer" ? "sun" : "shopping-bag"}
                      size={18}
                      color={role === r ? colors.primary : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.roleOptionText,
                        {
                          color:
                            role === r
                              ? colors.primary
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {r === "farmer" ? "Farmer / Seller" : "Buyer / Trader"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {error ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
              ]}
            >
              <Feather
                name="alert-circle"
                size={14}
                color={colors.destructive}
              />
              <Text
                style={[styles.errorText, { color: colors.destructive }]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            testID="auth-submit"
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed || loading ? 0.8 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitText}>
                {mode === "login" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </Pressable>

          {mode === "login" && (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Demo: demo@agritrust.na / demo123
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

interface NotifPrefs {
  newOffers: boolean;
  counterOffers: boolean;
  dealAccepted: boolean;
  dealRejected: boolean;
}

function NotificationPrefsSection({
  token,
  colors,
}: {
  token: string;
  colors: ReturnType<typeof useColors>;
}) {
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/auth/notification-prefs"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json() as Promise<NotifPrefs>)
      .then(setPrefs)
      .catch(() => {});
  }, [token]);

  async function toggle(key: keyof NotifPrefs, value: boolean) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await fetch(apiUrl("/api/auth/notification-prefs"), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      setPrefs(prefs); // revert on error
    }
  }

  if (!prefs) return null;

  const items: Array<{ key: keyof NotifPrefs; label: string }> = [
    { key: "newOffers", label: "New offer on my listing" },
    { key: "counterOffers", label: "Counter-offer received" },
    { key: "dealAccepted", label: "Deal accepted" },
    { key: "dealRejected", label: "Negotiation declined" },
  ];

  return (
    <View
      style={[
        styles.prefsCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.prefsHeader}>
        <Feather name="bell" size={14} color={colors.mutedForeground} />
        <Text style={[styles.prefsTitle, { color: colors.mutedForeground }]}>
          Push Notifications
        </Text>
      </View>
      {items.map(({ key, label }, idx) => (
        <View
          key={key}
          style={[
            styles.prefsRow,
            idx < items.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.prefsLabel, { color: colors.foreground }]}>
            {label}
          </Text>
          <Switch
            value={prefs[key]}
            onValueChange={(v) => toggle(key, v)}
            trackColor={{ true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      ))}
    </View>
  );
}

interface MyListing {
  id: number;
  title: string;
  price: string;
  unit: string;
  status: string;
  category: string;
}

function MyListingsSection({
  token,
  colors,
}: {
  token: string;
  colors: ReturnType<typeof useColors>;
}) {
  const router = useRouter();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const deleteMutation = useDeleteListing();

  const loadListings = useCallback(() => {
    setLoading(true);
    fetch(apiUrl("/api/marketplace/my-listings"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<unknown>;
      })
      .then((data) => setListings(Array.isArray(data) ? (data as MyListing[]) : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [token]);

  // Re-fetch whenever the Account tab/screen comes into focus (fires after
  // returning from create/edit screen — no timeout guessing required)
  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  async function handleDelete(id: number, title: string) {
    Alert.alert(
      "Delete Listing",
      `Remove "${title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMutation.mutateAsync({ id });
            loadListings();
          },
        },
      ]
    );
  }

  return (
    <View
      style={[
        styles.myListingsCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.myListingsHeader}>
        <View style={styles.myListingsTitle}>
          <Feather name="list" size={14} color={colors.mutedForeground} />
          <Text
            style={[styles.myListingsLabel, { color: colors.mutedForeground }]}
          >
            MY LISTINGS
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/listing/create")}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={14} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginVertical: 16 }}
        />
      ) : listings.length === 0 ? (
        <View style={styles.emptyListings}>
          <Feather name="package" size={28} color={colors.mutedForeground} />
          <Text
            style={[styles.emptyText, { color: colors.mutedForeground }]}
          >
            No listings yet. Tap + New to post your first one.
          </Text>
        </View>
      ) : (
        listings.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.listingRow,
              idx < listings.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.listingTitle, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View style={styles.listingMeta}>
                <Text
                  style={[
                    styles.listingPrice,
                    { color: colors.primary },
                  ]}
                >
                  N${Number(item.price).toLocaleString()}/{item.unit}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "active"
                          ? colors.primary + "20"
                          : colors.mutedForeground + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === "active"
                            ? colors.primary
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.listingActions}>
              <Pressable
                onPress={() => router.push(`/listing/create?listingId=${item.id}`)}
                hitSlop={8}
                style={[
                  styles.actionBtn,
                  { borderColor: colors.border },
                ]}
              >
                <Feather
                  name="edit-2"
                  size={14}
                  color={colors.foreground}
                />
              </Pressable>
              <Pressable
                onPress={() => handleDelete(item.id, item.title)}
                hitSlop={8}
                style={[
                  styles.actionBtn,
                  { borderColor: colors.destructive + "40" },
                ]}
              >
                <Feather name="trash-2" size={14} color={colors.destructive} />
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function ProfileView() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token, logout } = useAuth();

  async function handleLogout() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) return null;

  const initial = user.name.charAt(0).toUpperCase();
  const scoreNum = user.farmScoreRating
    ? parseInt(user.farmScoreRating, 10)
    : null;
  const tier =
    scoreNum != null
      ? scoreNum >= 780
        ? "Gold"
        : scoreNum >= 680
        ? "Silver"
        : "Bronze"
      : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.profileScroll,
        {
          paddingTop: topPad + 12,
          paddingBottom:
            Platform.OS === "web" ? 34 + 84 : insets.bottom + 80,
        },
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user.name}
          </Text>
          {user.isVerified && (
            <View
              style={[styles.verifiedBadge, { backgroundColor: colors.blue }]}
            >
              <Feather name="check" size={10} color="#fff" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <Text style={[styles.userRole, { color: colors.mutedForeground }]}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Text>
      </View>

      {/* Info card */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {user.farmName && (
          <InfoRow
            icon="home"
            label="Farm"
            value={user.farmName}
            colors={colors}
          />
        )}
        {user.region && (
          <InfoRow
            icon="map-pin"
            label="Region"
            value={user.region}
            colors={colors}
          />
        )}
        <InfoRow
          icon="mail"
          label="Email"
          value={user.email}
          colors={colors}
        />
        {scoreNum != null && tier != null && (
          <InfoRow
            icon="award"
            label={`FarmScore (${tier})`}
            value={String(scoreNum)}
            colors={colors}
          />
        )}
      </View>

      {/* My Listings (farmers only) */}
      {token && user?.role === "farmer" && (
        <MyListingsSection token={token} colors={colors} />
      )}

      {/* Notification preferences */}
      {token && (
        <NotificationPrefsSection token={token} colors={colors} />
      )}

      {/* Logout */}
      <Pressable
        testID="logout-btn"
        style={({ pressed }) => [
          styles.logoutBtn,
          { borderColor: colors.destructive, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

export default function AccountScreen() {
  const { user, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return user ? <ProfileView /> : <AuthForm />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  authScroll: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
    gap: 12,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  brand: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 8 },
  toggle: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    width: "100%",
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  form: { width: "100%", gap: 12 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  roleLabel: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 10 },
  roleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  roleOptionText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  profileScroll: { paddingHorizontal: 16, gap: 16 },
  avatarSection: { alignItems: "center", paddingVertical: 20, gap: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 32, color: "#fff", fontFamily: "Inter_700Bold" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 11, color: "#fff", fontFamily: "Inter_600SemiBold" },
  userRole: { fontSize: 14, fontFamily: "Inter_400Regular" },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 2 },
  infoValue: { fontSize: 14, fontFamily: "Inter_500Medium" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  prefsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  prefsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  prefsTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, textTransform: "uppercase" },
  prefsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  prefsLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, marginRight: 12 },
  myListingsCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  myListingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myListingsTitle: { flexDirection: "row", alignItems: "center", gap: 6 },
  myListingsLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyListings: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  listingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  listingTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  listingMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  listingPrice: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  listingActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
