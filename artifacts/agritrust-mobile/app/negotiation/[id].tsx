import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import { useAuth } from "@/context/auth";
import { useColors } from "@/hooks/useColors";
import { apiUrl, errorMessage } from "@/utils/api";

interface Offer {
  id: number;
  negotiationId: number;
  offeredBy: "buyer" | "seller";
  price: string;
  note: string | null;
  createdAt: string;
}

interface NegotiationDetail {
  id: number;
  listingId: number;
  buyerId: number;
  sellerId: number;
  status: string;
  currentPrice: string;
  originalPrice: string;
  quantity: string;
  aiSuggestion: string | null;
  listingTitle: string | null;
  buyerName: string | null;
  sellerName: string | null;
  offers: Offer[];
  createdAt: string;
}

async function fetchNegotiation(
  id: number,
  token: string
): Promise<NegotiationDetail> {
  const res = await fetch(apiUrl(`/api/dealwise/negotiations/${id}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load negotiation");
  return res.json() as Promise<NegotiationDetail>;
}

async function doAccept(id: number, token: string) {
  const res = await fetch(apiUrl(`/api/dealwise/negotiations/${id}/accept`), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to accept");
  return res.json();
}

async function doReject(id: number, token: string) {
  const res = await fetch(apiUrl(`/api/dealwise/negotiations/${id}/reject`), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to decline");
  return res.json();
}

async function doCounter(
  id: number,
  price: number,
  note: string,
  token: string
) {
  const res = await fetch(apiUrl(`/api/dealwise/negotiations/${id}/offer`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ price, note: note || undefined }),
  });
  if (!res.ok) throw new Error("Failed to submit counter offer");
  return res.json();
}

function StatusBadge({ status, colors }: { status: string; colors: ReturnType<typeof useColors> }) {
  const cfg: Record<string, { bg: string; label: string }> = {
    pending: { bg: colors.accent, label: "Pending" },
    countered: { bg: colors.blue, label: "Countered" },
    accepted: { bg: colors.primary, label: "Accepted" },
    rejected: { bg: colors.destructive, label: "Rejected" },
  };
  const c = cfg[status] ?? { bg: colors.mutedForeground, label: status };
  return (
    <View style={[s.badge, { backgroundColor: c.bg }]}>
      <Text style={s.badgeText}>{c.label}</Text>
    </View>
  );
}

export default function NegotiationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const negotiationId = Number(id);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const [showCounter, setShowCounter] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterNote, setCounterNote] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const {
    data: neg,
    isLoading,
    error,
    refetch,
  } = useQuery<NegotiationDetail>({
    queryKey: ["negotiation", negotiationId],
    queryFn: () => fetchNegotiation(negotiationId, token!),
    enabled: !!token && !isNaN(negotiationId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["negotiation", negotiationId] });

  const { mutateAsync: accept, isPending: accepting } = useMutation({
    mutationFn: () => doAccept(negotiationId, token!),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["negotiations"] });
    },
  });

  const { mutateAsync: reject, isPending: rejecting } = useMutation({
    mutationFn: () => doReject(negotiationId, token!),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["negotiations"] });
    },
  });

  const { mutateAsync: counter, isPending: countering } = useMutation({
    mutationFn: () =>
      doCounter(negotiationId, Number(counterPrice), counterNote, token!),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["negotiations"] });
      setShowCounter(false);
      setCounterPrice("");
      setCounterNote("");
    },
  });

  const isBuyer = neg ? neg.buyerId === user?.id : false;
  const canAct =
    neg &&
    (neg.status === "pending" || neg.status === "countered") &&
    user != null;

  if (!token || !user) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <View style={[s.headerRow, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>
            Negotiation
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.center}>
          <Text style={[s.errorText, { color: colors.mutedForeground }]}>
            Sign in to view negotiation details
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <View style={[s.headerRow, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>
            Negotiation
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (error || !neg) {
    return (
      <View style={[s.container, { backgroundColor: colors.background }]}>
        <View style={[s.headerRow, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>
            Negotiation
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.center}>
          <Feather name="wifi-off" size={32} color={colors.mutedForeground} />
          <Text style={[s.errorText, { color: colors.mutedForeground }]}>
            {errorMessage(error) ?? "Could not load negotiation"}
          </Text>
          <Pressable
            style={[s.retryBtn, { borderColor: colors.border }]}
            onPress={() => refetch()}
          >
            <Text style={[s.retryText, { color: colors.primary }]}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const counterparty = isBuyer ? neg.sellerName : neg.buyerName;
  const myLabel = isBuyer ? "You (Buyer)" : "You (Seller)";
  const offers = [...(neg.offers ?? [])].reverse();

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          s.headerRow,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>
          Negotiation
        </Text>
        <StatusBadge status={neg.status} colors={colors} />
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Listing title */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.listingLabel, { color: colors.mutedForeground }]}>
            Listing
          </Text>
          <Text style={[s.listingTitle, { color: colors.foreground }]}>
            {neg.listingTitle ?? `Listing #${neg.listingId}`}
          </Text>
          <Pressable onPress={() => router.push(`/listing/${neg.listingId}`)}>
            <Text style={[s.viewListing, { color: colors.primary }]}>
              View listing →
            </Text>
          </Pressable>
        </View>

        {/* Price summary */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
            Price Summary
          </Text>
          <View style={s.priceRow}>
            <View>
              <Text style={[s.priceLabel, { color: colors.mutedForeground }]}>
                Original
              </Text>
              <Text style={[s.priceValue, { color: colors.mutedForeground }]}>
                N${Number(neg.originalPrice).toLocaleString()}
              </Text>
            </View>
            <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
            <View>
              <Text style={[s.priceLabel, { color: colors.mutedForeground }]}>
                Current
              </Text>
              <Text style={[s.currentPrice, { color: colors.primary }]}>
                N${Number(neg.currentPrice).toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={[s.divider, { backgroundColor: colors.border }]} />
          <View style={s.metaRow}>
            <Feather name="package" size={13} color={colors.mutedForeground} />
            <Text style={[s.metaText, { color: colors.mutedForeground }]}>
              {neg.quantity} kg
            </Text>
          </View>
          <View style={s.metaRow}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={[s.metaText, { color: colors.mutedForeground }]}>
              {myLabel} ↔ {counterparty ?? "Counterparty"}
            </Text>
          </View>
        </View>

        {/* Offer history */}
        {offers.length > 0 && (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
              Offer History
            </Text>
            {offers.map((offer, index) => {
              const isMe =
                (isBuyer && offer.offeredBy === "buyer") ||
                (!isBuyer && offer.offeredBy === "seller");
              return (
                <View
                  key={offer.id}
                  style={[
                    s.offerRow,
                    index < offers.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={s.offerLeft}>
                    <View
                      style={[
                        s.offerDot,
                        { backgroundColor: isMe ? colors.primary : colors.accent },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.offerRole, { color: colors.foreground }]}>
                        {isMe
                          ? "You"
                          : counterparty ?? offer.offeredBy}
                      </Text>
                      {offer.note && (
                        <Text
                          style={[s.offerNote, { color: colors.mutedForeground }]}
                          numberOfLines={2}
                        >
                          "{offer.note}"
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={s.offerRight}>
                    <Text style={[s.offerPrice, { color: colors.primary }]}>
                      N${Number(offer.price).toLocaleString()}
                    </Text>
                    <Text style={[s.offerDate, { color: colors.mutedForeground }]}>
                      {new Date(offer.createdAt).toLocaleDateString("en-NA", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* DealWise AI suggestion */}
        {neg.aiSuggestion && (
          <View
            style={[
              s.card,
              s.aiCard,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <View style={s.aiHeader}>
              <Feather name="zap" size={14} color={colors.primary} />
              <Text style={[s.aiLabel, { color: colors.primary }]}>
                DealWise AI
              </Text>
            </View>
            <Text style={[s.aiText, { color: colors.foreground }]}>
              {neg.aiSuggestion}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        {canAct && (
          <View style={s.actions}>
            <Pressable
              style={[s.acceptBtn, { backgroundColor: colors.primary }]}
              onPress={() =>
                Alert.alert("Accept Deal", "Confirm you want to accept this offer?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Accept",
                    onPress: async () => {
                      try {
                        await accept();
                      } catch (e) {
                        Alert.alert("Error", errorMessage(e));
                      }
                    },
                  },
                ])
              }
              disabled={accepting || rejecting || countering}
            >
              {accepting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={s.actionBtnText}>Accept</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[s.counterBtn, { backgroundColor: colors.blue }]}
              onPress={() => {
                setCounterPrice(neg.currentPrice);
                setCounterNote("");
                setShowCounter(true);
              }}
              disabled={accepting || rejecting || countering}
            >
              <Feather name="repeat" size={16} color="#fff" />
              <Text style={s.actionBtnText}>Counter</Text>
            </Pressable>

            <Pressable
              style={[s.rejectBtn, { borderColor: colors.destructive }]}
              onPress={() =>
                Alert.alert(
                  "Decline Offer",
                  "Are you sure you want to decline this negotiation?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Decline",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await reject();
                        } catch (e) {
                          Alert.alert("Error", errorMessage(e));
                        }
                      },
                    },
                  ]
                )
              }
              disabled={accepting || rejecting || countering}
            >
              {rejecting ? (
                <ActivityIndicator color={colors.destructive} size="small" />
              ) : (
                <>
                  <Feather name="x" size={16} color={colors.destructive} />
                  <Text style={[s.actionBtnText, { color: colors.destructive }]}>
                    Decline
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Counter offer modal */}
      <Modal
        visible={showCounter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCounter(false)}
      >
        <View style={s.modalOverlay}>
          <View
            style={[
              s.modalContent,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[s.modalTitle, { color: colors.foreground }]}>
              Counter Offer
            </Text>
            <Text style={[s.modalLabel, { color: colors.mutedForeground }]}>
              Your price (N$/kg)
            </Text>
            <TextInput
              style={[
                s.input,
                { borderColor: colors.border, color: colors.foreground },
              ]}
              value={counterPrice}
              onChangeText={setCounterPrice}
              keyboardType="numeric"
              placeholder="e.g. 45"
              placeholderTextColor={colors.mutedForeground}
            />
            <Text style={[s.modalLabel, { color: colors.mutedForeground }]}>
              Note (optional)
            </Text>
            <TextInput
              style={[
                s.input,
                s.noteInput,
                { borderColor: colors.border, color: colors.foreground },
              ]}
              value={counterNote}
              onChangeText={setCounterNote}
              placeholder="Add a message..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <View style={s.modalActions}>
              <Pressable
                style={[s.modalCancel, { borderColor: colors.border }]}
                onPress={() => setShowCounter(false)}
              >
                <Text style={[s.modalCancelText, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[s.modalSubmit, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  if (!counterPrice || isNaN(Number(counterPrice))) {
                    Alert.alert("Invalid price", "Enter a valid price.");
                    return;
                  }
                  try {
                    await counter();
                  } catch (e) {
                    Alert.alert("Error", errorMessage(e));
                  }
                }}
                disabled={countering}
              >
                {countering ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.modalSubmitText}>Submit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, color: "#fff", fontFamily: "Inter_600SemiBold" },
  scroll: { padding: 16, gap: 12 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  listingLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  listingTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", lineHeight: 22 },
  viewListing: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingVertical: 4 },
  priceLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  priceValue: { fontSize: 16, fontFamily: "Inter_500Medium", textAlign: "center" },
  currentPrice: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  divider: { height: 1, marginVertical: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  offerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  offerLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  offerDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  offerRole: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  offerNote: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 16 },
  offerRight: { alignItems: "flex-end", gap: 2 },
  offerPrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  offerDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  aiCard: {},
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  aiLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  aiText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  actions: { gap: 10, marginTop: 4 },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  counterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  retryText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  noteInput: { height: 80, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  modalSubmit: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSubmitText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
