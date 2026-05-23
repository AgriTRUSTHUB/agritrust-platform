import { Negotiation, useListNegotiations } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/auth";

function StatusBadge({
  status,
  colors,
}: {
  status: string;
  colors: ReturnType<typeof useColors>;
}) {
  const config: Record<string, { bg: string; label: string }> = {
    pending: { bg: colors.accent, label: "Pending" },
    accepted: { bg: colors.primary, label: "Accepted" },
    rejected: { bg: colors.destructive, label: "Rejected" },
    countered: { bg: colors.blue, label: "Counter" },
  };
  const c = config[status] ?? { bg: colors.mutedForeground, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={styles.badgeText}>{c.label}</Text>
    </View>
  );
}

function NegotiationCard({
  item,
  userId,
}: {
  item: Negotiation;
  userId: number;
}) {
  const colors = useColors();
  const router = useRouter();
  const isBuyer = item.buyerId === userId;
  const counterparty = isBuyer ? item.sellerName : item.buyerName;
  const role = isBuyer ? "Buying" : "Selling";

  return (
    <Pressable
      testID={`negotiation-${item.id}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={() => router.push(`/negotiation/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.roleTag,
            {
              backgroundColor: isBuyer ? colors.muted : colors.secondary,
            },
          ]}
        >
          <Text
            style={[
              styles.roleText,
              {
                color: isBuyer ? colors.mutedForeground : colors.primary,
              },
            ]}
          >
            {role}
          </Text>
        </View>
        <StatusBadge status={item.status} colors={colors} />
      </View>

      <Text
        style={[styles.title, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {item.listingTitle ?? `Listing #${item.listingId}`}
      </Text>

      <View style={styles.row}>
        <Feather name="user" size={13} color={colors.mutedForeground} />
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {counterparty ?? "Unknown"}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.row}>
          <Feather name="dollar-sign" size={13} color={colors.primary} />
          <Text style={[styles.offer, { color: colors.primary }]}>
            N${item.currentPrice.toLocaleString()}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {new Date(item.createdAt).toLocaleDateString("en-NA", {
            day: "numeric",
            month: "short",
          })}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DealWiseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useListNegotiations({
    query: { enabled: !!token, queryKey: ["negotiations"] },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.authGate, { paddingTop: topPad + 40 }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
            <Feather name="zap" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>
            DealWise
          </Text>
          <Text style={[styles.gateSub, { color: colors.mutedForeground }]}>
            AI-powered negotiation for{"\n"}Namibian farmers and buyers
          </Text>
          <Pressable
            testID="login-to-negotiate"
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/account")}
          >
            <Text style={styles.loginBtnText}>Sign in to view deals</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const negotiations = Array.isArray(data) ? (data as Negotiation[]) : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          DealWise
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {negotiations.length} active negotiation
          {negotiations.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Could not load negotiations
          </Text>
          <Pressable
            style={[styles.retryBtn, { borderColor: colors.border }]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={negotiations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                Platform.OS === "web" ? 34 + 84 : insets.bottom + 80,
            },
          ]}
          scrollEnabled={negotiations.length > 0}
          renderItem={({ item }) => (
            <NegotiationCard item={item} userId={user.id} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather
                name="message-circle"
                size={40}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No negotiations yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Browse the marketplace and{"\n"}tap "Negotiate" on a listing to
                start
              </Text>
              <Pressable
                style={[
                  styles.loginBtn,
                  { backgroundColor: colors.primary, marginTop: 8 },
                ]}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.loginBtnText}>Browse Marketplace</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  authGate: { flex: 1, alignItems: "center", paddingHorizontal: 32, gap: 12 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gateTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  gateSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  loginBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  list: { padding: 16, gap: 10 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, color: "#fff", fontFamily: "Inter_600SemiBold" },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 5 },
  meta: { fontSize: 13, fontFamily: "Inter_400Regular" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  offer: { fontSize: 17, fontFamily: "Inter_700Bold" },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
