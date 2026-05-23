import {
  Listing,
  NegotiationInput,
  useCreateNegotiation,
  useGetListing,
} from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/auth";
import { errorMessage } from "@/utils/api";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const CATEGORY_ICONS: Record<string, FeatherName> = {
  Cattle: "activity",
  Crops: "sun",
  Vegetables: "wind",
  Goats: "circle",
  "Seeds & Inputs": "droplet",
  Equipment: "tool",
  Poultry: "feather",
  Processed: "package",
  Sheep: "layers",
};

function DetailRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: FeatherName;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
      <Feather name={icon} size={14} color={colors.mutedForeground} />
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const { data: listing, isLoading, error } = useGetListing(Number(id));
  const { mutateAsync: createNegotiation, isPending } = useCreateNegotiation();

  const [showOffer, setShowOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("1");

  async function handleNegotiate() {
    if (!user) {
      Alert.alert(
        "Sign in required",
        "Please sign in to start a negotiation.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => router.push("/(tabs)/account"),
          },
        ]
      );
      return;
    }
    setShowOffer(true);
    setOfferPrice(String(listing?.price ?? ""));
    setOfferQty("1");
  }

  async function submitOffer() {
    if (!listing) return;
    const payload: NegotiationInput = {
      listingId: listing.id,
      offeredPrice: Number(offerPrice),
      quantity: Math.max(1, Number(offerQty)),
    };
    try {
      await createNegotiation({ data: payload });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowOffer(false);
      Alert.alert(
        "Negotiation Started!",
        "Your offer has been sent. Check DealWise for updates.",
        [
          {
            text: "View Deals",
            onPress: () => router.push("/(tabs)/dealwise"),
          },
        ]
      );
    } catch (e: unknown) {
      Alert.alert("Error", errorMessage(e));
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Listing not found
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>
            ← Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const icon: FeatherName = CATEGORY_ICONS[listing.category] ?? "tag";
  const certs = listing.certifications
    ? listing.certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 8, paddingBottom: 120 },
        ]}
      >
        {/* Back */}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>

        {/* Header */}
        <View style={styles.heroSection}>
          <View
            style={[styles.categoryIcon, { backgroundColor: colors.muted }]}
          >
            <Feather name={icon} size={32} color={colors.primary} />
          </View>

          <View style={styles.badges}>
            {listing.isFeatured && (
              <View
                style={[styles.badge, { backgroundColor: colors.accent }]}
              >
                <Feather name="star" size={11} color="#fff" />
                <Text style={styles.badgeText}>Featured</Text>
              </View>
            )}
            {listing.grade && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      listing.grade === "A" ? colors.primary : colors.blue,
                  },
                ]}
              >
                <Text style={styles.badgeText}>Grade {listing.grade}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            {listing.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              N${listing.price.toLocaleString()}
            </Text>
            <Text style={[styles.unit, { color: colors.mutedForeground }]}>
              / {listing.unit}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Details
          </Text>

          {listing.description && (
            <Text
              style={[styles.description, { color: colors.mutedForeground }]}
            >
              {listing.description}
            </Text>
          )}

          <DetailRow
            icon="map-pin"
            label="Region"
            value={listing.region ?? "Namibia"}
            colors={colors}
          />
          <DetailRow
            icon="tag"
            label="Category"
            value={listing.category}
            colors={colors}
          />
          <DetailRow
            icon="box"
            label="Available"
            value={`${listing.quantity} ${listing.unit}`}
            colors={colors}
          />

          {certs.length > 0 && (
            <View style={styles.certsWrap}>
              <Text style={[styles.certsLabel, { color: colors.mutedForeground }]}>
                Certifications
              </Text>
              <View style={styles.certsList}>
                {certs.map((c) => (
                  <View
                    key={c}
                    style={[
                      styles.certChip,
                      {
                        backgroundColor: colors.secondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.certText, { color: colors.primary }]}>
                      {c}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Seller */}
        <Pressable
          style={[
            styles.section,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.push(`/farmer/${listing.sellerId}`)}
        >
          <View style={styles.sellerRow}>
            <View
              style={[styles.sellerAvatar, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.sellerInitial}>
                {listing.sellerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: colors.foreground }]}>
                {listing.sellerName}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
            />
          </View>
          <Text style={[styles.viewProfile, { color: colors.primary }]}>
            View Farmer Profile
          </Text>
        </Pressable>
      </ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.ctaBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom:
              Platform.OS === "web" ? 34 : insets.bottom + 8,
          },
        ]}
      >
        <Pressable
          testID="negotiate-btn"
          style={({ pressed }) => [
            styles.negotiateBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed || isPending ? 0.8 : 1,
            },
          ]}
          onPress={handleNegotiate}
          disabled={isPending}
        >
          <Feather name="zap" size={18} color="#fff" />
          <Text style={styles.negotiateBtnText}>
            {user ? "Start Negotiation" : "Sign In to Negotiate"}
          </Text>
        </Pressable>
      </View>

      {/* Offer Modal */}
      <Modal
        visible={showOffer}
        animationType="slide"
        presentationStyle="formSheet"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Make an Offer
            </Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Asking price: N${listing.price.toLocaleString()}/{listing.unit}
            </Text>

            <View
              style={[
                styles.offerInput,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currency, { color: colors.mutedForeground }]}>
                N$
              </Text>
              <TextInput
                testID="offer-input"
                style={[styles.input, { color: colors.foreground }]}
                value={offerPrice}
                onChangeText={setOfferPrice}
                keyboardType="numeric"
                placeholder="Your price"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.perUnit, { color: colors.mutedForeground }]}>
                /{listing.unit}
              </Text>
            </View>

            <View
              style={[
                styles.offerInput,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currency, { color: colors.mutedForeground }]}>
                Qty
              </Text>
              <TextInput
                testID="offer-qty-input"
                style={[styles.input, { color: colors.foreground }]}
                value={offerQty}
                onChangeText={setOfferQty}
                keyboardType="numeric"
                placeholder="Quantity"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.perUnit, { color: colors.mutedForeground }]}>
                {listing.unit}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowOffer(false)}
              >
                <Text
                  style={[styles.cancelText, { color: colors.mutedForeground }]}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                onPress={submitOffer}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.sendText}>Send Offer</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  backLink: { fontSize: 15, fontFamily: "Inter_500Medium" },
  scroll: { paddingHorizontal: 16 },
  backBtn: { marginBottom: 16 },
  heroSection: { alignItems: "flex-start", gap: 10, marginBottom: 16 },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badges: { flexDirection: "row", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, color: "#fff", fontFamily: "Inter_600SemiBold" },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  price: { fontSize: 28, fontFamily: "Inter_700Bold" },
  unit: { fontSize: 15, fontFamily: "Inter_400Regular" },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  detailLabel: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  detailValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  certsWrap: { paddingTop: 10, gap: 8 },
  certsLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  certsList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  certChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  certText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerInitial: { fontSize: 20, color: "#fff", fontFamily: "Inter_700Bold" },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  viewProfile: { fontSize: 13, fontFamily: "Inter_500Medium" },
  ctaBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  negotiateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  negotiateBtnText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  offerInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  currency: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  input: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    padding: 0,
  },
  perUnit: { fontSize: 14, fontFamily: "Inter_400Regular" },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  sendBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { fontSize: 15, color: "#fff", fontFamily: "Inter_600SemiBold" },
});
