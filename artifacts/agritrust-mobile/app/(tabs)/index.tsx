import { Listing, useListListings } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface Category {
  label: string;
  icon: FeatherName;
}

const CATEGORIES: Category[] = [
  { label: "All", icon: "grid" },
  { label: "Cattle", icon: "activity" },
  { label: "Crops", icon: "sun" },
  { label: "Vegetables", icon: "wind" },
  { label: "Goats", icon: "circle" },
  { label: "Seeds & Inputs", icon: "droplet" },
  { label: "Equipment", icon: "tool" },
  { label: "Poultry", icon: "feather" },
  { label: "Processed", icon: "package" },
  { label: "Sheep", icon: "layers" },
];

function GradeBadge({
  grade,
  colors,
}: {
  grade: string | null | undefined;
  colors: ReturnType<typeof useColors>;
}) {
  if (!grade) return null;
  const bg =
    grade === "A"
      ? colors.primary
      : grade === "B"
      ? colors.blue
      : colors.mutedForeground;
  return (
    <View style={[styles.gradeBadge, { backgroundColor: bg }]}>
      <Text style={styles.gradeBadgeText}>{grade}</Text>
    </View>
  );
}

function ListingCard({ item }: { item: Listing }) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Pressable
      testID={`listing-card-${item.id}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
      onPress={() => router.push(`/listing/${item.id}`)}
    >
      {item.isFeatured && (
        <View style={[styles.featuredBadge, { backgroundColor: colors.accent }]}>
          <Feather name="star" size={10} color="#fff" />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}

      <View style={styles.cardTop}>
        <View style={[styles.categoryPill, { backgroundColor: colors.muted }]}>
          <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>
            {item.category}
          </Text>
        </View>
        <GradeBadge grade={item.grade} colors={colors} />
      </View>

      <Text
        style={[styles.cardTitle, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: colors.primary }]}>
          N${item.price.toLocaleString()}
        </Text>
        <Text style={[styles.unit, { color: colors.mutedForeground }]}>
          /{item.unit}
        </Text>
      </View>

      <View style={styles.cardMeta}>
        {item.region != null && (
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={12} color={colors.accent} />
            <Text
              style={[styles.metaText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {item.region}
            </Text>
          </View>
        )}
        <Pressable
          style={styles.metaItem}
          onPress={() => router.push(`/farmer/${item.sellerId}`)}
        >
          <Feather name="user" size={12} color={colors.blue} />
          <Text
            style={[styles.metaText, { color: colors.blue }]}
            numberOfLines={1}
          >
            {item.sellerName}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.quantity, { color: colors.mutedForeground }]}>
        {item.quantity} {item.unit} available
      </Text>
    </Pressable>
  );
}

export default function MarketplaceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const params = {
    ...(selectedCategory !== "All" ? { category: selectedCategory } : {}),
    ...(search.length > 1 ? { search } : {}),
    page: 1,
    limit: 20 * page,
  };

  const { data, isLoading, error, refetch } = useListListings(
    { query: { queryKey: ["listings", params] } },
    params
  );

  const listings = data?.items ?? [];
  const hasMore = data ? data.page * data.limit < data.total : false;

  function handleRefresh() {
    setRefreshing(true);
    setPage(1);
    refetch().finally(() => setRefreshing(false));
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Marketplace
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {data?.total ?? "…"} Namibian listings
            </Text>
          </View>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Feather name="trending-up" size={18} color="#fff" />
          </View>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            testID="search-input"
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search listings, breeds, regions…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              setPage(1);
            }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pills}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.label;
            return (
              <Pressable
                key={cat.label}
                testID={`category-${cat.label}`}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(cat.label);
                  setPage(1);
                }}
              >
                <Feather
                  name={cat.icon}
                  size={13}
                  color={active ? "#fff" : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.pillText,
                    { color: active ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Listings */}
      {isLoading && listings.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Could not load listings
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
          data={listings}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.list,
            {
              paddingBottom:
                Platform.OS === "web" ? 34 + 84 : insets.bottom + 80,
            },
          ]}
          renderItem={({ item }) => <ListingCard item={item} />}
          scrollEnabled={listings.length > 0}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No listings found
              </Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <Pressable
                style={[
                  styles.loadMore,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setPage((p) => p + 1)}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                    Load More
                  </Text>
                )}
              </Pressable>
            ) : null
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
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  pills: { gap: 8, paddingBottom: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 12, paddingTop: 12 },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredText: {
    fontSize: 10,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  gradeBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  cardTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 6,
  },
  price: { fontSize: 17, fontFamily: "Inter_700Bold" },
  unit: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardMeta: { gap: 3, marginBottom: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  quantity: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  retryText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  loadMore: {
    marginTop: 8,
    marginHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
