import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { apiUrl } from "@/utils/api";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface FarmerListing {
  id: number;
  title: string;
  category: string;
  price: number;
  unit: string;
  grade: string | null;
  isFeatured: boolean;
  region: string | null;
}

interface FarmerProfile {
  id: number;
  name: string;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  farmName: string | null;
  farmSizeHa: string | null;
  crops: string | null;
  isVerified: boolean;
  farmScoreRating: string | null;
  totalSales: number;
  createdAt: string;
  activeListings: number;
  recentListings: FarmerListing[];
}

function StatRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.statRow, { borderTopColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

export default function FarmerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: farmer,
    isLoading,
    error,
  } = useQuery<FarmerProfile>({
    queryKey: ["farmer", id],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/farmers/${id}`));
      if (!res.ok) throw new Error("Farmer not found");
      return res.json() as Promise<FarmerProfile>;
    },
    enabled: !!id,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !farmer) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Farmer profile not found
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>
            ← Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const initial = farmer.name.charAt(0).toUpperCase();
  const score =
    farmer.farmScoreRating != null
      ? parseInt(farmer.farmScoreRating, 10)
      : null;
  const tier =
    score != null
      ? score >= 780
        ? "Gold"
        : score >= 680
        ? "Silver"
        : "Bronze"
      : null;
  const tierColor =
    tier === "Gold"
      ? "#F5A623"
      : tier === "Silver"
      ? "#9E9E9E"
      : "#CD7F32";

  const cropsList = farmer.crops
    ? farmer.crops
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const joinYear = new Date(farmer.createdAt).getFullYear();

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
      }}
      data={farmer.recentListings}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <>
          {/* Back */}
          <Pressable
            style={[styles.backBtn, { paddingTop: topPad + 8 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
            <Text style={[styles.backText, { color: colors.foreground }]}>
              Marketplace
            </Text>
          </Pressable>

          {/* Hero */}
          <View
            style={[
              styles.hero,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.heroTop}>
              <View
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.avatarText}>{initial}</Text>
              </View>

              {score != null && tier != null ? (
                <View
                  style={[
                    styles.scoreCard,
                    { backgroundColor: colors.muted, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.scoreLabel, { color: colors.mutedForeground }]}
                  >
                    FARMSCORE
                  </Text>
                  <Text style={[styles.scoreNum, { color: tierColor }]}>
                    {score}
                  </Text>
                  <Text style={[styles.scoreTier, { color: tierColor }]}>
                    {tier} Seller
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.nameRow}>
              <Text style={[styles.farmerName, { color: colors.foreground }]}>
                {farmer.name}
              </Text>
              {farmer.isVerified && (
                <View
                  style={[
                    styles.verifiedBadge,
                    { backgroundColor: colors.blue },
                  ]}
                >
                  <Feather name="check" size={10} color="#fff" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              {farmer.farmName != null && (
                <Text
                  style={[styles.farmName, { color: colors.mutedForeground }]}
                >
                  {farmer.farmName}
                </Text>
              )}
              {farmer.region != null && (
                <>
                  <Text
                    style={[styles.dot, { color: colors.mutedForeground }]}
                  >
                    ·
                  </Text>
                  <Feather name="map-pin" size={12} color={colors.accent} />
                  <Text
                    style={[styles.metaText, { color: colors.mutedForeground }]}
                  >
                    {farmer.region}
                  </Text>
                </>
              )}
              <>
                <Text
                  style={[styles.dot, { color: colors.mutedForeground }]}
                >
                  ·
                </Text>
                <Feather
                  name="calendar"
                  size={12}
                  color={colors.mutedForeground}
                />
                <Text
                  style={[styles.metaText, { color: colors.mutedForeground }]}
                >
                  Joined {joinYear}
                </Text>
              </>
            </View>
          </View>

          {/* Bio */}
          {farmer.bio != null && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[styles.sectionTitle, { color: colors.foreground }]}
              >
                About
              </Text>
              <Text style={[styles.bio, { color: colors.mutedForeground }]}>
                {farmer.bio}
              </Text>
            </View>
          )}

          {/* Farm Details */}
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Farm Details
            </Text>

            <StatRow
              label="Active Listings"
              value={String(farmer.activeListings)}
              colors={colors}
            />
            <StatRow
              label="Total Sales"
              value={String(farmer.totalSales)}
              colors={colors}
            />
            {farmer.farmSizeHa != null && (
              <StatRow
                label="Farm Size"
                value={`${Number(farmer.farmSizeHa).toLocaleString()} ha`}
                colors={colors}
              />
            )}

            {cropsList.length > 0 && (
              <View
                style={[styles.cropsRow, { borderTopColor: colors.border }]}
              >
                <Text
                  style={[styles.cropsLabel, { color: colors.mutedForeground }]}
                >
                  CROPS & PRODUCE
                </Text>
                <View style={styles.chipList}>
                  {cropsList.map((c) => (
                    <View
                      key={c}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: colors.secondary,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: colors.primary }]}>
                        {c}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Listings header */}
          {farmer.recentListings.length > 0 && (
            <View style={styles.listingsHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.foreground }]}
              >
                Active Listings
              </Text>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.listingCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
              marginHorizontal: 16,
            },
          ]}
          onPress={() => router.push(`/listing/${item.id}`)}
        >
          <View style={styles.listingTop}>
            <View style={[styles.catPill, { backgroundColor: colors.muted }]}>
              <Text
                style={[styles.catText, { color: colors.mutedForeground }]}
              >
                {item.category}
              </Text>
            </View>
            {item.grade != null && (
              <View
                style={[
                  styles.gradeBadge,
                  {
                    backgroundColor:
                      item.grade === "A" ? colors.primary : colors.blue,
                  },
                ]}
              >
                <Text style={styles.gradeText}>Grade {item.grade}</Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.listingTitle, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <View style={styles.listingBottom}>
            <Text style={[styles.listingPrice, { color: colors.primary }]}>
              N${item.price.toLocaleString()}/{item.unit}
            </Text>
            {item.region != null && (
              <View style={styles.regionRow}>
                <Feather name="map-pin" size={11} color={colors.accent} />
                <Text
                  style={[styles.regionText, { color: colors.mutedForeground }]}
                >
                  {item.region}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListEmptyComponent={null}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  backLink: { fontSize: 15, fontFamily: "Inter_500Medium" },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 30, color: "#fff", fontFamily: "Inter_700Bold" },
  scoreCard: {
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 90,
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  scoreNum: { fontSize: 28, fontFamily: "Inter_700Bold", lineHeight: 32 },
  scoreTier: { fontSize: 11, fontFamily: "Inter_500Medium" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  farmerName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: { fontSize: 10, color: "#fff", fontFamily: "Inter_600SemiBold" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  farmName: { fontSize: 13, fontFamily: "Inter_400Regular" },
  dot: { fontSize: 13 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  bio: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cropsRow: { paddingTop: 10, gap: 6, borderTopWidth: 1 },
  cropsLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  listingsHeader: { paddingHorizontal: 16, marginBottom: 10 },
  listingCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  listingTop: { flexDirection: "row", gap: 6, marginBottom: 6 },
  catPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  gradeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  gradeText: { fontSize: 11, color: "#fff", fontFamily: "Inter_600SemiBold" },
  listingTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  listingBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingPrice: { fontSize: 16, fontFamily: "Inter_700Bold" },
  regionRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  regionText: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
