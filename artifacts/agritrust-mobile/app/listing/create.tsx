import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useCreateListing,
  useUpdateListing,
} from "@workspace/api-client-react";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/auth";
import { apiUrl } from "@/utils/api";

const CATEGORIES = [
  "Cattle",
  "Goats",
  "Sheep",
  "Poultry",
  "Crops",
  "Vegetables",
  "Fruit",
  "Other",
];
const UNITS = ["kg", "ton", "head", "bag", "crate", "litre", "each"];
const GRADES = ["", "A", "B", "C"];
const REGIONS = [
  "",
  "Khomas",
  "Erongo",
  "Hardap",
  "Karas",
  "Kavango East",
  "Kavango West",
  "Kunene",
  "Ohangwena",
  "Omaheke",
  "Omusati",
  "Oshana",
  "Oshikoto",
  "Otjozondjupa",
  "Zambezi",
];

const TOTAL_STEPS = 4;
const STEP_TITLES = [
  "Basic Info",
  "Pricing & Quantity",
  "Location & Details",
  "Photo & Review",
];

interface ChipRowProps {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  colors: ReturnType<typeof useColors>;
  emptyLabel?: string;
}

function ChipRow({ options, selected, onSelect, colors, emptyLabel }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((opt) => {
        const isActive = opt === selected;
        const label = opt === "" ? (emptyLabel ?? "None") : opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: isActive ? "#fff" : colors.foreground }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface ReviewRowProps {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}

function ReviewRow({ label, value, colors }: ReviewRowProps) {
  return (
    <View style={styles.reviewRow}>
      <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.reviewValue, { color: colors.foreground }]} numberOfLines={2}>
        {value || "—"}
      </Text>
    </View>
  );
}

export default function CreateListingScreen() {
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();
  const isEdit = !!listingId;
  const { token } = useAuth();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  // Step state
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<string[]>(["", "", "", ""]);

  // Step 1 — Basic Info
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Cattle");
  const [description, setDescription] = useState("");

  // Step 2 — Pricing & Quantity
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantity, setQuantity] = useState("");

  // Step 3 — Location & Details
  const [region, setRegion] = useState("");
  const [grade, setGrade] = useState("");
  const [certifications, setCertifications] = useState("");

  // Step 4 — Photo
  const [imageUrl, setImageUrl] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load existing listing data for edit mode
  const [loadingExisting, setLoadingExisting] = useState(isEdit);

  useEffect(() => {
    if (!isEdit || !listingId || !token) return;
    fetch(apiUrl(`/api/marketplace/listings/${listingId}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setCategory(data.category ?? "Cattle");
        setDescription(data.description ?? "");
        setPrice(String(data.price ?? ""));
        setUnit(data.unit ?? "kg");
        setQuantity(String(data.quantity ?? ""));
        setRegion(data.region ?? "");
        setGrade(data.grade ?? "");
        setCertifications(data.certifications ?? "");
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          setImageUri(data.imageUrl);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
  }, [isEdit, listingId, token]);

  function setStepError(idx: number, msg: string) {
    setStepErrors((prev) => {
      const next = [...prev];
      next[idx] = msg;
      return next;
    });
  }

  function validateStep(s: number): boolean {
    switch (s) {
      case 0:
        if (!title.trim()) {
          setStepError(0, "Title is required");
          return false;
        }
        setStepError(0, "");
        return true;
      case 1:
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
          setStepError(1, "Enter a valid price greater than 0");
          return false;
        }
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
          setStepError(1, "Enter a valid quantity greater than 0");
          return false;
        }
        setStepError(1, "");
        return true;
      case 2:
        setStepError(2, "");
        return true;
      case 3:
        setStepError(3, "");
        return true;
      default:
        return true;
    }
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handlePickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library to add a listing photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setUploading(true);
    try {
      const res = await fetch(apiUrl("/api/upload/image"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: asset.base64, mimeType: asset.mimeType ?? "image/jpeg" }),
      });
      const json = (await res.json()) as { url?: string };
      if (json.url) setImageUrl(json.url);
      else Alert.alert("Upload failed", "Could not save the image.");
    } catch {
      Alert.alert("Upload failed", "Network error uploading image.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePublish() {
    if (!validateStep(3)) return;
    const body = {
      title: title.trim(),
      category,
      description: description.trim() || undefined,
      price: Number(price),
      unit,
      quantity: Number(quantity),
      region: region || undefined,
      grade: grade || undefined,
      certifications: certifications.trim() || undefined,
      imageUrl: imageUrl || undefined,
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(listingId), data: body });
      } else {
        await createMutation.mutateAsync({ data: body });
      }
      router.back();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save listing. Please try again.";
      setStepError(3, msg);
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const saving = createMutation.isPending || updateMutation.isPending;

  if (loadingExisting) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={step === 0 ? router.back : handleBack} hitSlop={12} style={styles.backBtn}>
          <Feather name={step === 0 ? "x" : "arrow-left"} size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {isEdit ? "Edit Listing" : "New Listing"}
          </Text>
          <Text style={[styles.headerStep, { color: colors.mutedForeground }]}>
            Step {step + 1} of {TOTAL_STEPS} — {STEP_TITLES[step]}
          </Text>
        </View>
        {step === TOTAL_STEPS - 1 ? (
          <Pressable
            onPress={handlePublish}
            disabled={saving || uploading}
            style={[styles.actionBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>{isEdit ? "Update" : "Publish"}</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={handleNext}
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.actionBtnText}>Next</Text>
            <Feather name="arrow-right" size={14} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Step progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Basic Info */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>
              What are you selling?
            </Text>
            <Text style={[styles.stepSubheading, { color: colors.mutedForeground }]}>
              Give your listing a clear title, pick a category, and add a description.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Title *</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="e.g. Premium Brahman Cattle, Grade A Maize"
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 16 }]}>Category *</Text>
            <ChipRow options={CATEGORIES} selected={category} onSelect={setCategory} colors={colors} />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 16 }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Describe breed, quality, feeding method, certifications…"
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Step 2: Pricing & Quantity */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>
              Price and quantity
            </Text>
            <Text style={[styles.stepSubheading, { color: colors.mutedForeground }]}>
              Set your asking price per unit and total quantity available.
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Price (N$) *</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Quantity *</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 16 }]}>Unit *</Text>
            <ChipRow options={UNITS} selected={unit} onSelect={setUnit} colors={colors} />

            {price && quantity && !isNaN(Number(price)) && !isNaN(Number(quantity)) && (
              <View style={[styles.summaryCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                <Text style={[styles.summaryText, { color: colors.primary }]}>
                  Total value: N${(Number(price) * Number(quantity)).toLocaleString()}
                </Text>
                <Text style={[styles.summarySubText, { color: colors.primary + "aa" }]}>
                  {quantity} {unit} @ N${Number(price).toLocaleString()} per {unit}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Location & Details */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>
              Location and details
            </Text>
            <Text style={[styles.stepSubheading, { color: colors.mutedForeground }]}>
              Help buyers find you and understand the quality of your produce.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Region</Text>
            <ChipRow options={REGIONS} selected={region} onSelect={setRegion} colors={colors} emptyLabel="Any" />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 16 }]}>Grade</Text>
            <ChipRow options={GRADES} selected={grade} onSelect={setGrade} colors={colors} emptyLabel="None" />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 16 }]}>Certifications</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="e.g. Organic, Halal, GAP (comma-separated)"
              placeholderTextColor={colors.mutedForeground}
              value={certifications}
              onChangeText={setCertifications}
            />
          </View>
        )}

        {/* Step 4: Photo & Review */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>
              Add a photo and review
            </Text>
            <Text style={[styles.stepSubheading, { color: colors.mutedForeground }]}>
              A photo significantly increases buyer interest. Review your details before publishing.
            </Text>

            {/* Photo picker */}
            <Pressable
              onPress={handlePickImage}
              disabled={uploading}
              style={[styles.photoBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {imageUri ? (
                <>
                  <Image source={{ uri: imageUri }} style={styles.photoImage} />
                  {uploading && (
                    <View style={styles.photoOverlay}>
                      <ActivityIndicator color="#fff" />
                      <Text style={styles.photoOverlayText}>Uploading…</Text>
                    </View>
                  )}
                  <View style={styles.changePhotoChip}>
                    <Feather name="camera" size={12} color="#fff" />
                    <Text style={styles.changePhotoText}>Change photo</Text>
                  </View>
                </>
              ) : (
                <View style={styles.photoPlaceholder}>
                  {uploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Feather name="camera" size={32} color={colors.mutedForeground} />
                      <Text style={[styles.photoPlaceholderText, { color: colors.mutedForeground }]}>
                        Tap to add photo
                      </Text>
                      <Text style={[styles.photoOptionalText, { color: colors.mutedForeground }]}>
                        Optional but recommended
                      </Text>
                    </>
                  )}
                </View>
              )}
            </Pressable>

            {/* Summary review card */}
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewCardTitle, { color: colors.mutedForeground }]}>Review your listing</Text>
              <ReviewRow label="Title" value={title} colors={colors} />
              <ReviewRow label="Category" value={category} colors={colors} />
              <ReviewRow label="Price" value={`N$${Number(price).toLocaleString()} per ${unit}`} colors={colors} />
              <ReviewRow label="Quantity" value={`${quantity} ${unit}`} colors={colors} />
              {region && <ReviewRow label="Region" value={region} colors={colors} />}
              {grade && <ReviewRow label="Grade" value={`Grade ${grade}`} colors={colors} />}
              {certifications && <ReviewRow label="Certifications" value={certifications} colors={colors} />}
              {description && <ReviewRow label="Description" value={description} colors={colors} />}
            </View>
          </View>
        )}

        {/* Step error */}
        {stepErrors[step] ? (
          <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "40" }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{stepErrors[step]}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  headerStep: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 1 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 72,
    justifyContent: "center",
  },
  actionBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressBar: { height: 3, width: "100%" },
  progressFill: { height: 3 },
  scroll: { padding: 20, gap: 0 },
  stepContent: { gap: 0 },
  stepHeading: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  stepSubheading: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 24 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  multiline: { minHeight: 100, paddingTop: 12 },
  row: { flexDirection: "row" },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 2, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryCard: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  summaryText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  summarySubText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  photoBox: {
    height: 200,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  photoImage: { width: "100%", height: "100%", resizeMode: "cover" },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoOverlayText: { color: "#fff", fontSize: 13, fontFamily: "Inter_500Medium" },
  changePhotoChip: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  changePhotoText: { color: "#fff", fontSize: 11, fontFamily: "Inter_500Medium" },
  photoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  photoPlaceholderText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  photoOptionalText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  reviewCardTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  reviewRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  reviewLabel: { fontSize: 13, fontFamily: "Inter_500Medium", width: 100 },
  reviewValue: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
});
