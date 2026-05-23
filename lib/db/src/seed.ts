import crypto from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import {
  usersTable, listingsTable,
  barterItemsTable, barterTradesTable,
  landListingsTable,
  loanApplicationsTable,
  communityPostsTable,
  impactActivitiesTable,
  theftAlertsTable,
  disputesTable,
  mentorsTable, mentorSessionsTable,
  farmScoresTable,
  coursesTable, enrollmentsTable,
  transactionsTable,
  qualityScansTable,
} from "./schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const PASSWORD = hashPassword("farmer123");

const REGIONS = [
  "Khomas","Erongo","Hardap","//Kharas","Omaheke","Otjozondjupa",
  "Oshikoto","Oshana","Ohangwena","Omusati","Kavango East","Kavango West","Zambezi","Kunene",
];

function rng(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ── TIER HELPERS ──────────────────────────────────────────────────────────────
// Distribution: Platinum 8 | Gold 18 | Silver 32 | Bronze 30
// Users are ordered: indices 0-7 PLATINUM, 8-25 GOLD, 26-57 SILVER, 58-87 BRONZE
function tierForIndex(i: number): "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" {
  if (i < 8) return "PLATINUM";
  if (i < 26) return "GOLD";
  if (i < 58) return "SILVER";
  return "BRONZE";
}
const TIER_SCORE: Record<string, string> = {
  PLATINUM: "96", GOLD: "84", SILVER: "68", BRONZE: "45",
};
const TIER_VERIFIED: Record<string, boolean> = {
  PLATINUM: true, GOLD: true, SILVER: true, BRONZE: false,
};

// ── USER DEFINITIONS (88 total) ───────────────────────────────────────────────
// [0-1]   ADMIN 2 (pinned: Loide + Paulus)
// [2-31]  FARMER 30   [32-40] BUYER 9   [41-48] LANDOWNER 8
// [49-53] TRANSPORTER 5
// [54-57] VET 4   [58-61] AGRO 4   [62-65] COOP 4   [66-69] INPUT 4
// [70-73] EXPORTER 4   [74-76] PROCESSOR 3
// [77-79] MENTOR 3
// [80-81] LENDER 2   [82-83] INSURANCE_PARTNER 2   [84-85] AGENT 2
// [86]    NGO 1   [87] TRAINER 1
// = 2+30+9+8+5+4+4+4+4+4+3+3+2+2+2+1+1 = 88  ✓
// Tier: Platinum 8 (idx 0-7) | Gold 18 (8-25) | Silver 32 (26-57) | Bronze 30 (58-87)

type UDef = {
  name: string; email: string; role: string; region: string;
  bio?: string; farmName?: string; crops?: string; farmSizeHa?: string;
  scoreOverride?: string; // explicit farmScoreRating (bypasses tier default)
};

const USERS: UDef[] = [
  // ── [0-1] ADMIN 2 (pinned) ───────────────────────────────────────────────
  { name:"Loide Dawid",          email:"loide.dawid@agritrust.com",    role:"admin", region:"Khomas", bio:"CEO & Co-Founder of AgriTRUST.", scoreOverride:"99" },
  { name:"Paulus Indongo",       email:"paulus.indongo@agritrust.com", role:"admin", region:"Khomas", bio:"CTO & Co-Founder of AgriTRUST.", scoreOverride:"99" },

  // ── [2-31] FARMER 30 ─────────────────────────────────────────────────────
  { name:"Johannes Nghifindaka", email:"johannes@agritrust.na",           role:"farmer", region:"Oshikoto",    farmName:"Nghifindaka Grain Farm",   farmSizeHa:"850",  crops:"Maize, Cattle" },
  { name:"David Mwetupunga",     email:"david@agritrust.na",              role:"farmer", region:"Hardap",      farmName:"Mwetupunga Beef Ranch",    farmSizeHa:"2400", crops:"Cattle" },
  { name:"Petrus Haimbodi",      email:"petrus@agritrust.na",             role:"farmer", region:"Erongo",      farmName:"Haimbodi Mixed Farm",      farmSizeHa:"560",  crops:"Cattle, Goats" },
  { name:"Heinrich Mouton",      email:"heinrich.mouton@agritrust.na",    role:"farmer", region:"Khomas",      farmName:"Mouton Dairy",             farmSizeHa:"180",  crops:"Dairy Cattle, Garlic" },
  { name:"Anna Shipanga",        email:"anna@agritrust.na",               role:"farmer", region:"Ohangwena",   farmName:"Shipanga Smallholder",     farmSizeHa:"45",   crops:"Mahango, Vegetables" },
  { name:"Maria Kahumba",        email:"maria@agritrust.na",              role:"farmer", region:"Omaheke",     farmName:"Kahumba Livestock Farm",   farmSizeHa:"1100", crops:"Cattle, Goats" },
  { name:"Petrus Hamutenya",     email:"petrus.hamutenya@agritrust.na",   role:"farmer", region:"Otjozondjupa",farmName:"Hamutenya Ranch",          farmSizeHa:"1200", crops:"Cattle, Poultry" },
  { name:"Abraham Tjiramba",     email:"abraham.tjiramba@agritrust.na",   role:"farmer", region:"Kavango East",farmName:"Tjiramba Family Farm",     farmSizeHa:"450",  crops:"Vegetables, Cattle" },
  { name:"Grietjie Mouton",      email:"grietjie.mouton@agritrust.na",    role:"farmer", region:"//Kharas",    farmName:"Mouton Kleinvee",          farmSizeHa:"3200", crops:"Goats, Sheep" },
  { name:"Kobus van Zyl",        email:"kobus.vanzyl@agritrust.na",       role:"farmer", region:"Hardap",      farmName:"Van Zyl Ostrich & Sheep",  farmSizeHa:"4500", crops:"Ostrich, Sheep" },
  { name:"Erastus Nangolo",      email:"erastus.nangolo@agritrust.na",    role:"farmer", region:"Omaheke",     farmName:"Nangolo Beef Ranch",       farmSizeHa:"3800", crops:"Cattle" },
  { name:"Pieter Swarts",        email:"pieter.swarts@agritrust.na",      role:"farmer", region:"Hardap",      farmName:"Swarts Karakul Stud",      farmSizeHa:"5200", crops:"Karakul Sheep, Onions" },
  { name:"Willem Olivier",       email:"willem.olivier@agritrust.na",     role:"farmer", region:"Hardap",      farmName:"Olivier Irrigation Farm",  farmSizeHa:"450",  crops:"Grapes, Table Grapes" },
  { name:"Selma Nghidinwa",      email:"selma.nghidinwa@agritrust.na",    role:"farmer", region:"Ohangwena",   farmName:"Nghidinwa Communal Farm",  farmSizeHa:"80",   crops:"Mahango, Groundnuts" },
  { name:"Daniel Swartbooi",     email:"daniel.swartbooi@agritrust.na",   role:"farmer", region:"Hardap",      farmName:"Swartbooi Boerbok Farm",   farmSizeHa:"890",  crops:"Goats" },
  { name:"Ndapewa Mwinga",       email:"ndapewa.mwinga@agritrust.na",     role:"farmer", region:"Kavango West", farmName:"Mwinga Organic Produce",  farmSizeHa:"120",  crops:"Moringa, Baobab" },
  { name:"Gideon Isaaks",        email:"gideon.isaaks@agritrust.na",      role:"farmer", region:"Omaheke",     farmName:"Isaaks Kleinvee",          farmSizeHa:"2100", crops:"Goats, Watermelons" },
  { name:"Frieda Kauaria",       email:"frieda.kauaria@agritrust.na",     role:"farmer", region:"Khomas",      farmName:"Kauaria Poultry & Dairy",  farmSizeHa:"35",   crops:"Poultry, Vegetables" },
  { name:"Festus Amupanda",      email:"festus.amupanda@agritrust.na",    role:"farmer", region:"Oshana",      farmName:"Amupanda Grain Farm",      farmSizeHa:"600",  crops:"Sorghum, Maize" },
  { name:"Hilma Nangolo",        email:"hilma.nangolo@agritrust.na",      role:"farmer", region:"Erongo",      farmName:"Nangolo Mixed Farm",       farmSizeHa:"280",  crops:"Cattle, Vegetables" },
  { name:"Joseph Haipinge",      email:"joseph.haipinge@agritrust.na",    role:"farmer", region:"Zambezi",     farmName:"Haipinge Fish & Farm",     farmSizeHa:"95",   crops:"Fish, Beans, Cattle" },
  { name:"Lukas Shikongo",       email:"lukas.shikongo@agritrust.na",     role:"farmer", region:"Khomas",      farmName:"Shikongo Beef",            farmSizeHa:"900",  crops:"Slaughter Cattle" },
  { name:"Magdalena Amunyela",   email:"magdalena.amunyela@agritrust.na", role:"farmer", region:"Khomas",      farmName:"Amunyela Horticulture",    farmSizeHa:"22",   crops:"Vegetables, Seedlings" },
  { name:"Sakeus Haikali",       email:"sakeus.haikali@agritrust.na",     role:"farmer", region:"Oshana",      farmName:"Haikali Grain Farm",       farmSizeHa:"320",  crops:"Sorghum, Pearl Millet" },
  { name:"Frans Booysen",        email:"frans.booysen@agritrust.na",      role:"farmer", region:"//Kharas",    farmName:"Booysen Sheep & Goat",     farmSizeHa:"1800", crops:"Dorper Sheep, Goats" },
  { name:"Naomi Tjipuka",        email:"naomi.tjipuka@agritrust.na",      role:"farmer", region:"Erongo",      farmName:"Tjipuka Smallholder",      farmSizeHa:"60",   crops:"Goats, Poultry" },
  { name:"Veronica Nekwaya",     email:"veronica.nekwaya@agritrust.na",   role:"farmer", region:"Omusati",     farmName:"Nekwaya Small Farm",       farmSizeHa:"55",   crops:"Mahango, Spinach" },
  { name:"Hileni Nghipandulwa",  email:"hileni.nghipandulwa@agritrust.na",role:"farmer", region:"Omusati",     farmName:"Nghipandulwa Communal",    farmSizeHa:"30",   crops:"Mahango, Pearl Millet" },
  { name:"Rauna Iilonga",        email:"rauna.iilonga@agritrust.na",      role:"farmer", region:"Oshikoto",    farmName:"Iilonga Mixed Farm",       farmSizeHa:"75",   crops:"Cattle, Maize" },
  { name:"Hafeni Shapumba",      email:"hafeni.shapumba@agritrust.na",    role:"farmer", region:"Ohangwena",   farmName:"Shapumba Communal Farm",   farmSizeHa:"40",   crops:"Mahango, Sweet Potato" },

  // ── [32-40] BUYER 9 ──────────────────────────────────────────────────────
  { name:"Neo Dlamini",           email:"neo.dlamini@agritrust.na",           role:"buyer", region:"Khomas",      bio:"Restaurant owner and wholesale food buyer." },
  { name:"Riaan Esterhuyse",      email:"riaan.esterhuyse@agritrust.na",      role:"buyer", region:"Erongo",      bio:"Abattoir operator, Swakopmund." },
  { name:"Miriam Kavita",         email:"miriam.kavita@agritrust.na",         role:"buyer", region:"Khomas",      bio:"Supermarket chain procurement officer." },
  { name:"Danie du Plessis",      email:"danie.duplessis@agritrust.na",       role:"buyer", region:"Omaheke",     bio:"Feedlot operator, Gobabis region." },
  { name:"Desmond Nakanyala",     email:"desmond.nakanyala@agritrust.na",     role:"buyer", region:"Oshana",      bio:"Grain miller and animal feed manufacturer." },
  { name:"Sofie Botha",           email:"sofie.botha@agritrust.na",           role:"buyer", region:"Hardap",      bio:"Livestock trader and auction house agent." },
  { name:"Kambafwile Simasiku",   email:"kambafwile.simasiku@agritrust.na",   role:"buyer", region:"Zambezi",     bio:"Fish processing plant buyer." },
  { name:"Ruben Beukes",          email:"ruben.beukes@agritrust.na",          role:"buyer", region:"//Kharas",    bio:"Export trader specialising in small livestock." },
  { name:"Petronella Uushona",    email:"petronella.uushona@agritrust.na",    role:"buyer", region:"Omusati",     bio:"Informal market trader, bulk buyer." },

  // ── [44-51] LANDOWNER 8 ──────────────────────────────────────────────────
  { name:"Koos Swanepoel",        email:"koos.swanepoel@agritrust.na",        role:"landowner", region:"Hardap",       bio:"Commercial farm owner with irrigable land to share." },
  { name:"Bert van der Merwe",    email:"bert.vandermerwe@agritrust.na",      role:"landowner", region:"Otjozondjupa", bio:"Ranch owner seeking grazing partners." },
  { name:"Teckla Shilamba",       email:"teckla.shilamba@agritrust.na",       role:"landowner", region:"Oshikoto",     bio:"Communal land leader offering seasonal lease agreements." },
  { name:"Ndeshihafela Amwele",   email:"ndeshihafela.amwele@agritrust.na",   role:"landowner", region:"Omusati",      bio:"Communal land holder, arable plots available." },
  { name:"Sandra Mouton",         email:"sandra.mouton@agritrust.na",         role:"landowner", region:"//Kharas",     bio:"Karst farm with deep borehole water, ideal for cattle." },
  { name:"Sakaria Kashava",       email:"sakaria.kashava@agritrust.na",       role:"landowner", region:"Omaheke",      bio:"Bushveld farm, grazing lease on offer." },
  { name:"Abisai Kahimbi",        email:"abisai.kahimbi@agritrust.na",        role:"landowner", region:"Kavango West", bio:"Floodplain land holder, ideal for horticulture." },
  { name:"Nande Katjimune",       email:"nande.katjimune@agritrust.na",       role:"landowner", region:"Erongo",       bio:"Coastal plot owner near Swakopmund." },

  // ── [52-56] TRANSPORTER 5 ────────────────────────────────────────────────
  { name:"Francois Kruger",       email:"francois.kruger@agritrust.na",       role:"transporter", region:"Hardap",      bio:"Refrigerated transport, fresh produce country-wide." },
  { name:"Moses Hangula",         email:"moses.hangula@agritrust.na",         role:"transporter", region:"Khomas",      bio:"Livestock transport specialist, 3-axle trucks." },
  { name:"Tobias Nghifikwa",      email:"tobias.nghifikwa@agritrust.na",      role:"transporter", region:"Kavango East",bio:"Cross-border transporter, Angola routes." },
  { name:"Johan Bosman",          email:"johan.bosman@agritrust.na",          role:"transporter", region:"//Kharas",    bio:"Long-haul livestock transport, southern Namibia." },
  { name:"Selma Amukwa",          email:"selma.amukwa@agritrust.na",          role:"transporter", region:"Oshana",      bio:"Small delivery vehicle operator, north Namibia." },

  // ── [57-60] VETERINARIAN 4 ───────────────────────────────────────────────
  { name:"Dr. Hilma Ndjamba",     email:"hilma.ndjamba@agritrust.na",         role:"veterinarian", region:"Khomas",       bio:"State veterinarian, livestock disease surveillance." },
  { name:"Dr. Anton Viljoen",     email:"anton.viljoen@agritrust.na",         role:"veterinarian", region:"Hardap",       bio:"Private large-animal vet, Mariental." },
  { name:"Dr. Loini Amukwaya",    email:"loini.amukwaya@agritrust.na",        role:"veterinarian", region:"Oshana",       bio:"Mobile vet clinic, northern communal areas." },
  { name:"Dr. Samuel Uusiku",     email:"samuel.uusiku@agritrust.na",         role:"veterinarian", region:"Kavango East", bio:"Large-animal vet, Kavango East district." },

  // ── [61-64] AGRONOMIST 4 ─────────────────────────────────────────────────
  { name:"Elifas Shivute",        email:"elifas.shivute@agritrust.na",        role:"agronomist", region:"Oshikoto",    bio:"Millet and sorghum specialist, communal farming." },
  { name:"Christiaan Barnard",    email:"christiaan.barnard@agritrust.na",    role:"agronomist", region:"Hardap",      bio:"Irrigation agronomist, Hardap region." },
  { name:"Ndeshi Kanime",         email:"ndeshi.kanime@agritrust.na",         role:"agronomist", region:"Ohangwena",   bio:"Sustainable land management advisor." },
  { name:"Tuuliki Hambira",       email:"tuuliki.hambira@agritrust.na",       role:"agronomist", region:"Omusati",     bio:"Dry-land crops specialist focusing on sorghum varieties." },

  // ── [65-68] COOPERATIVE 4 ────────────────────────────────────────────────
  { name:"Oshana Grain Co-op",        email:"oshana.coop@agritrust.na",       role:"cooperative", region:"Oshana",       bio:"Grain storage and collective marketing, 200 members." },
  { name:"Kavango Farmers Union",     email:"kavango.union@agritrust.na",     role:"cooperative", region:"Kavango East", bio:"Community vegetable growers collective." },
  { name:"Hardap Livestock Co-op",    email:"hardap.coop@agritrust.na",       role:"cooperative", region:"Hardap",       bio:"Livestock auction and transport pool co-operative." },
  { name:"Zambezi River Producers",   email:"zrpcoop@agritrust.na",           role:"cooperative", region:"Zambezi",      bio:"Floodplain smallholders co-op, 180+ members." },

  // ── [69-72] INPUT_SUPPLIER 4 ─────────────────────────────────────────────
  { name:"AgroNam Supplies",      email:"agronam@agritrust.na",               role:"input_supplier", region:"Khomas",  bio:"National agrochemical and seed distributor." },
  { name:"Northern Seeds Co.",    email:"northernseeds@agritrust.na",         role:"input_supplier", region:"Oshana",  bio:"Open-pollinated and certified seed supplier." },
  { name:"Desert Rose Feeds",     email:"desertrose.feeds@agritrust.na",      role:"input_supplier", region:"Erongo",  bio:"Animal feed formulator, poultry and livestock." },
  { name:"Kunene Agro Supplies",  email:"kunene.agro@agritrust.na",           role:"input_supplier", region:"Kunene", bio:"Agro-input dealer supplying seeds, fertilisers and small tools." },

  // ── [73-76] EXPORTER 4 ───────────────────────────────────────────────────
  { name:"Namibia Beef Exports",  email:"nbe@agritrust.na",                   role:"exporter", region:"Khomas",       bio:"EU-certified live cattle exporter." },
  { name:"Desert Gold Produce",   email:"desertgold@agritrust.na",            role:"exporter", region:"Hardap",       bio:"Premium table grapes and fresh produce exporter." },
  { name:"KavangoHerbs Ltd.",     email:"kavango.herbs@agritrust.na",         role:"exporter", region:"Kavango West", bio:"Wild-harvested moringa and baobab exporter." },
  { name:"Southern Cross Exports",email:"southerncross@agritrust.na",         role:"exporter", region:"//Kharas",    bio:"Processed Namibian agricultural products to the EU." },

  // ── [77-79] PROCESSOR 3 ──────────────────────────────────────────────────
  { name:"Namibia Milling Co.",   email:"namibia.milling@agritrust.na",       role:"processor", region:"Khomas",      bio:"Maize and millet milling, 50t capacity per day." },
  { name:"Swakop Smoke House",    email:"swakop.smokehouse@agritrust.na",     role:"processor", region:"Erongo",      bio:"Value-added fish and meat processing." },
  { name:"Hardap Valley Packers", email:"hardapvalley@agritrust.na",          role:"processor", region:"Hardap",      bio:"Meat processing and cold-chain facility, Hardap region." },

  // ── [80-82] MENTOR 3 ─────────────────────────────────────────────────────
  { name:"Uazeua Katjimune",      email:"uazeua.katjimune@agritrust.na",      role:"mentor", region:"Otjozondjupa",   bio:"30 years cattle farming experience across Southern Africa." },
  { name:"Elise Fourie",          email:"elise.fourie@agritrust.na",          role:"mentor", region:"Hardap",         bio:"Sheep and goat enterprise mentor, MBA Agriculture." },
  { name:"Titus Nambili",         email:"titus.nambili@agritrust.na",         role:"mentor", region:"Oshikoto",       bio:"Smallholder development specialist, FAO-trained." },

  // ── LENDER 2 ─────────────────────────────────────────────────────────────
  { name:"Agri Bank Namibia",     email:"agribank@agritrust.na",              role:"lender", region:"Khomas",         bio:"State agricultural development bank." },
  { name:"Micro Agri Finance",    email:"microagri.finance@agritrust.na",     role:"lender", region:"Oshana",          bio:"Microfinance lender serving smallholder farmers." },

  // ── INSURANCE_PARTNER 2 ───────────────────────────────────────────────────
  { name:"NamAgri Insurance",     email:"namagri.insurance@agritrust.na",     role:"insurance_partner", region:"Khomas",  bio:"Livestock and crop insurance specialist." },
  { name:"Sanlam Agri Cover",     email:"sanlam.agri@agritrust.na",           role:"insurance_partner", region:"Erongo",  bio:"Drought and livestock mortality cover provider." },

  // ── AGENT 2 ──────────────────────────────────────────────────────────────
  { name:"Ndumba Hamunyela",      email:"ndumba.hamunyela@agritrust.na",      role:"agent", region:"Oshana",          bio:"Field agent, farmer onboarding and verification." },
  { name:"Petrina Shilongo",      email:"petrina.shilongo@agritrust.na",      role:"agent", region:"Kavango West",    bio:"Rural outreach agent, cooperative linkages." },

  // ── NGO 1 ────────────────────────────────────────────────────────────────
  { name:"Namibia Food Security Trust", email:"nfst@agritrust.na",            role:"ngo", region:"Khomas",            bio:"NGO supporting food security and rural farmer development." },

  // ── TRAINER 1 ────────────────────────────────────────────────────────────
  { name:"Emilia Nghipandulwa",   email:"emilia.nghipandulwa@agritrust.na",   role:"trainer", region:"Omusati",       bio:"AgriAcademy certified trainer, digital skills for farmers." },

];

// ── LISTINGS (180 total, assigned to farmers by name) ─────────────────────────
type LIn = {
  title: string; description: string; category: string; price: string;
  unit: string; quantity: string; availableQty: string; region: string;
  grade?: string; certifications?: string; isFeatured: boolean; sellerName: string;
};

function L(sellerName: string, title: string, description: string, category: string,
           price: string, unit: string, qty: string, region: string,
           featured: boolean, grade = "B+", certs = "Verified Seller"): LIn {
  return { title, description, category, price, unit, quantity: qty, availableQty: qty,
           region, grade, certifications: certs, isFeatured: featured, sellerName };
}

function pickImage(title: string, category: string): string {
  const t = title.toLowerCase();
  const base = "/marketplace/";
  // Livestock categories
  if (category === "Cattle") {
    if (t.includes("nguni")) return base + "nguni-cattle.png";
    return base + "brahman-bull.png";
  }
  if (category === "Goats") {
    if (t.includes("milk") || t.includes("dairy") || t.includes("cheese")) return base + "goat-milk.png";
    return base + "boer-goats.png";
  }
  if (category === "Sheep") return base + "dorper-sheep.png";
  if (category === "Poultry") {
    if (t.includes("egg")) return base + "eggs.png";
    return base + "chickens.png";
  }
  // Product keyword matching (most specific first)
  if (t.includes("sweet potato")) return base + "sweet-potatoes.png";
  if (t.includes("biltong")) return base + "biltong.png";
  if (t.includes("honey")) return base + "honey.png";
  if (t.includes("moringa")) return base + "moringa.png";
  if (t.includes("mango")) return base + "mangoes.png";
  if (t.includes("groundnut") || t.includes("peanut")) return base + "groundnuts.png";
  if (t.includes("watermelon") || t.includes("tsamma")) return base + "watermelon.png";
  if (t.includes("tomato")) return base + "tomatoes.png";
  if (t.includes("cabbage")) return base + "cabbage.png";
  if (t.includes("carrot")) return base + "carrots.png";
  if (t.includes("spinach") || t.includes("kale") || t.includes("pumpkin lea") || t.includes("sweet potato lea")) return base + "spinach-kale.png";
  if (t.includes("garlic")) return base + "garlic.png";
  if (t.includes("pepper") || t.includes("chilli")) return base + "peppers.png";
  if (t.includes("butternut") || t.includes("squash") || t.includes("pumpkin") || t.includes("gem squash")) return base + "butternut.png";
  if (t.includes("onion")) return base + "red-onions.png";
  if (t.includes("maize") || t.includes("corn")) return base + "maize-white.png";
  if (t.includes("sorghum")) return base + "sorghum.png";
  if (t.includes("millet") || t.includes("mahango") || t.includes("oshifima") || t.includes("oshikundu") || t.includes("mahewu")) return base + "millet-mahangu.png";
  if (t.includes("hay") || t.includes("bale") || t.includes("lucerne") || t.includes("teff") || t.includes("silage")) return base + "hay-bales.png";
  if (t.includes("potato")) return base + "potatoes.png";
  if (t.includes("banana")) return base + "bananas.png";
  if (t.includes("papaya")) return base + "papaya.png";
  if (t.includes("fish") || t.includes("kapenta") || t.includes("bream") || t.includes("tilapia")) return base + "tilapia.png";
  if (t.includes("egg")) return base + "eggs.png";
  if (t.includes("milk") || t.includes("cheese") || t.includes("dairy") || t.includes("cream")) return base + "goat-milk.png";
  if (t.includes("jam")) return base + "fruit-jam.png";
  if (t.includes("oil") || t.includes("baobab") || t.includes("marula")) return base + "marula-oil.png";
  if (t.includes("mopane")) return base + "mopane-worms.png";
  if (t.includes("sesame")) return base + "sesame-seeds.png";
  if (t.includes("sunflower")) return base + "sunflower-seeds.png";
  if (t.includes("bean") || t.includes("cowpea")) return base + "sesame-seeds.png";
  if (t.includes("compost") || t.includes("manure") || t.includes("kraal")) return base + "compost.png";
  if (t.includes("solar") || t.includes("irrigation") || t.includes("drip") || t.includes("pump") || t.includes("borehole")) return base + "solar-irrigation.png";
  if (t.includes("feed") || t.includes("mineral") || t.includes("lick") || t.includes("vaccine") || t.includes("drench") || t.includes("mash")) return base + "animal-feed.png";
  // Category fallbacks
  if (category === "Vegetables") return base + "vegetables-mixed.png";
  if (category === "Crops") return base + "vegetables-mixed.png";
  if (category === "Seeds & Inputs") return base + "compost.png";
  if (category === "Equipment") return base + "farmland-aerial.png";
  if (category === "Processed") return base + "biltong.png";
  return base + "vegetables-mixed.png";
}

const LISTINGS: LIn[] = [
  // ═════ CATTLE ═══════
  L("Petrus Hamutenya","Brahman Bull — Stud Quality","Premium Brahman stud bull, 36 months, 680kg. Vaccinated, dewormed, FMD certified.","Cattle","18500","head","1","Otjozondjupa",true,"A","FMD Certified, Verified Seller"),
  L("David Mwetupunga","Bonsmara Heifers — Breeding Stock","Bonsmara heifers, 18 months, 320kg average. Fully vaccinated, pregnancy tested negative.","Cattle","8200","head","12","Hardap",true,"A","Verified Seller"),
  L("Abraham Tjiramba","Nguni Cattle — Indigenous Breed","Authentic Nguni cattle, 24 months, 380kg. Tick-free, dewormed, Brucellosis tested.","Cattle","6800","head","8","Kavango East",false,"A","Brucellosis Tested, Verified Seller"),
  L("Johannes Nghifindaka","Simmentaler Bull — Commercial Grade","Massive Simmentaler bull, 48 months, 820kg. Export ready. Gold verified seller.","Cattle","22000","head","1","Khomas",true,"A","Export Ready, Gold Verified"),
  L("Pieter Swarts","Afrikaner Cows — Breeding Herd","Afrikaner breeding cows, 3–5 years, 420kg. In-calf heifers included. Hardy breed.","Cattle","7500","head","25","//Kharas",false,"B+","Verified Seller"),
  L("Erastus Nangolo","Brahman Cross Steers — Feedlot Ready","Brahman cross steers, 420kg average, 20 months. Ready for feedlot or direct slaughter.","Cattle","9800","head","40","Omaheke",false,"B+","Verified Seller"),
  L("Maria Kahumba","Limousin Cross Heifers","Limousin-cross heifers, 16 months. Good frame, fast-growing. Suitable for breeding.","Cattle","7200","head","6","Otjozondjupa",false,"B+","Verified Seller"),
  L("Daniel Swartbooi","Bonsmara Bull — Young Stud","Young Bonsmara stud bull, 28 months, 580kg. EBV tested, fertility checked.","Cattle","14500","head","1","Hardap",true,"A","EBV Tested, Verified Seller"),
  L("Hilma Nangolo","Commercial Cows with Calves — Pairs","Mother-calf pairs, calves 2–4 months old. Mixed commercial breeds, good milking ability.","Cattle","11200","pair","18","Erongo",false,"B+","Verified Seller"),
  L("Petrus Hamutenya","Brahman Heifers — Replacement Stock","Quality Brahman heifers, 14 months, vaccinated. From high-performing dam lines.","Cattle","7800","head","15","Otjozondjupa",false,"A","Verified Seller"),
  L("Lukas Shikongo","Slaughter Steers — A-Grade","A-grade slaughter steers, 520kg+. Abattoir ready, ideal for high-end butcheries.","Cattle","12000","head","30","Khomas",true,"A","A-Grade Certified, Verified Seller"),
  L("Erastus Nangolo","Tuli Cross Heifers","Heat-tolerant Tuli cross heifers. Exceptional tick resistance, hardy Namibian conditions.","Cattle","6500","head","9","Omaheke",false,"B","Verified Seller"),
  L("Heinrich Mouton","Holstein Dairy Cows — High Production","Peak-production Holstein dairy cows. 18–22 litres per day. Ideal for commercial dairy.","Cattle","16000","head","5","Khomas",true,"A","Dairy Certified, Verified Seller"),
  L("Joseph Haipinge","Boran Bulls — Tick Resistant","Boran bulls adapted to northern Namibia. Naturally tick-resistant, excellent fertility.","Cattle","13500","head","2","Kavango East",false,"A","Verified Seller"),
  L("Ndapewa Mwinga","Ankole-Watusi Cattle — Heritage Breed","Rare long-horned Ankole-Watusi heritage cattle. Cultural significance, growing demand.","Cattle","9500","head","4","Kavango West",false,"B+","Heritage Breed"),
  L("Rauna Iilonga","Brahman Cross Calves — Weaners","Brahman cross weaner calves, 6 months, 180kg. Vaccinated, good growth potential.","Cattle","3200","head","8","Oshikoto",false,"B","Verified Seller"),
  L("Abraham Tjiramba","Droughtmaster Bull — Northern Namibia","Composite Droughtmaster bull, 38 months, 640kg. Adapted to high-humidity north.","Cattle","15800","head","1","Kavango East",false,"A","FMD Certified, Verified Seller"),
  L("Pieter Swarts","Hereford Cross Steers — Grass Fed","Hereford cross steers, 480kg, grass-fed on Hardap natural pasture. No hormones.","Cattle","10500","head","20","Hardap",false,"A","Hormone Free, Verified Seller"),
  L("Joseph Haipinge","Waterbuck Shorthorn Cross Heifers","Shorthorn cross heifers, 22 months. Excellent for Zambezi floodplain conditions.","Cattle","6900","head","7","Zambezi",false,"B+","Verified Seller"),
  L("Festus Amupanda","Sanga Cattle — Cultural Heritage","Traditional Sanga long-horn cattle. Important cultural breed in communal areas.","Cattle","7200","head","6","Oshana",false,"B+","Heritage Breed, Indigenous"),
  L("Petrus Hamutenya","Brahman Cows — In-Calf, First Calf","Brahman first-calf cows confirmed in-calf, 5–6 months. Easy calving genetics.","Cattle","9200","head","10","Otjozondjupa",false,"A","Pregnancy Tested, Verified Seller"),

  // ═════ GOATS ═══════
  L("Daniel Swartbooi","Boer Goat Rams — Stud Quality","Premium Boer stud rams, 18 months, 95kg. High fertility. Award-winning bloodlines.","Goats","3500","head","4","Hardap",true,"A","Stud Registered, Verified Seller"),
  L("Grietjie Mouton","Kalahari Red Does — Breeding","Kalahari Red does, 2–3 years. Renowned for meat quality and heat tolerance.","Goats","1800","head","20","//Kharas",false,"A","Verified Seller"),
  L("Daniel Swartbooi","Boer Goat Does — Commercial Herd","Commercial Boer goat does, pregnant, due in 6 weeks. 35 head available.","Goats","1500","head","35","Hardap",false,"B+","Verified Seller"),
  L("Petrus Hamutenya","Savanna White Goats — Fast Growing","All-white Savanna breed goats, fast-growing meat breed. Excellent carcass quality.","Goats","2200","head","12","Otjozondjupa",false,"A","Verified Seller"),
  L("Selma Nghidinwa","Indigenous Ovambo Goats","Hardy indigenous Ovambo goats. Well-adapted to northern Namibia. 50 head.","Goats","900","head","50","Ohangwena",false,"B","Indigenous Breed"),
  L("Kobus van Zyl","Angora Goats — Mohair Producers","Quality Angora goats, shearing due next month. Producing premium mohair fibre.","Goats","2800","head","8","//Kharas",true,"A","Mohair Export, Verified Seller"),
  L("Grietjie Mouton","Boer Cross Kids — Weaner","Boer cross weaner kids, 3–4 months old. Ideal for buyers to finish for market.","Goats","650","head","60","Hardap",false,"B","Verified Seller"),
  L("Frieda Kauaria","Dairy Goats — Saanen Cross","Saanen-cross dairy goats, 3–4 litres per day. Ideal for artisan cheese businesses.","Goats","2500","head","6","Khomas",false,"A","Dairy Certified, Verified Seller"),
  L("Gideon Isaaks","Kalahari Red Rams — Breeding","Fertile Kalahari Red rams, multiple-breed tested. Strong libido, good conformation.","Goats","2800","head","3","Omaheke",false,"A","Stud Tested, Verified Seller"),
  L("Naomi Tjipuka","Mixed Boer Goat Herd","Complete Boer herd: 30 does, 2 rams. Established breeding group, good genetics.","Goats","1200","head","32","Erongo",false,"B+","Verified Seller"),
  L("Frans Booysen","Boer × Kalahari Cross Does","Boer-Kalahari cross does, excellent meat conformation, 2 years, 65kg average.","Goats","1650","head","18","//Kharas",false,"B+","Verified Seller"),

  // ═════ SHEEP ═══════
  L("Pieter Swarts","Karakul Ewes — Persian Wool","Traditional Namibian Karakul ewes. Heritage breed with cultural and commercial value.","Sheep","1200","head","40","Hardap",true,"B+","Swakara Certified, Verified Seller"),
  L("Kobus van Zyl","Dorper Rams — Stud Quality","Stud Dorper rams, 110kg. From registered bloodlines with high growth rate EBVs.","Sheep","4500","head","3","//Kharas",true,"A","Stud Registered, Verified Seller"),
  L("Hilma Nangolo","Damara Sheep — Indigenous Breed","Authentic Damara sheep, heat and drought-tolerant. Thrives on low-quality pasture.","Sheep","950","head","25","Erongo",false,"B+","Indigenous Breed, Verified Seller"),
  L("Kobus van Zyl","Merino Sheep — Fine Wool","Fine-wool Merino sheep, shearing due in 8 weeks. High-micron wool, export demand.","Sheep","1800","head","18","//Kharas",false,"A","Wool Export, Verified Seller"),
  L("Grietjie Mouton","Dorper Ewes — Commercial Flock","Commercial Dorper ewes, proven mothers. Twins common, good milk production.","Sheep","1400","head","30","Hardap",false,"B+","Verified Seller"),
  L("Daniel Swartbooi","Van Rooy Sheep — Fat-Tailed Breed","Van Rooy fat-tailed sheep, excellent meat quality. Adapted to semi-arid Hardap.","Sheep","1100","head","15","Hardap",false,"B+","Verified Seller"),
  L("Pieter Swarts","Slaughter Lambs — Eid & Festive","Eid-ready slaughter lambs, 35–40kg. Halal compliant. 45 head available.","Sheep","1600","head","45","Khomas",true,"A","Halal Ready, Verified Seller"),
  L("Frans Booysen","Dorper × Damara Cross Ewes","Hardy cross-breed ewes combining Dorper growth and Damara drought tolerance.","Sheep","1250","head","22","//Kharas",false,"B+","Verified Seller"),

  // ═════ POULTRY ═══════
  L("Frieda Kauaria","Ross Broilers — 6 Weeks, Market Ready","Ross 308 broilers, 6 weeks, 2.2kg average. Vaccinated against Newcastle and Marek's.","Poultry","65","bird","500","Khomas",true,"A","Vaccinated, Verified Seller"),
  L("Selma Nghidinwa","Free-Range Village Chickens","Indigenous free-range chickens, naturally raised. High-demand premium product.","Poultry","85","bird","200","Ohangwena",false,"A","Free Range, Organic"),
  L("Hilma Nangolo","Laying Hens — Peak Production","Lohmann Brown laying hens, 28 weeks. 24–26 eggs per month. Ideal for egg farming.","Poultry","120","bird","150","Erongo",false,"A","Vaccinated, Verified Seller"),
  L("Frieda Kauaria","Day-Old Chicks — Broiler Batch","Vaccinated, heat-treated day-old broiler chicks. From top-performing parent stock.","Poultry","18","chick","1000","Khomas",false,"A","Vaccinated, Verified Seller"),
  L("Petrus Hamutenya","Helmeted Guinea Fowl — Free Range","Free-range indigenous guinea fowl, raised naturally in Otjozondjupa bush.","Poultry","95","bird","80","Otjozondjupa",false,"A","Free Range, Indigenous"),
  L("Abraham Tjiramba","Muscovy Ducks — Breeding Pairs","Muscovy duck breeding pairs. Excellent foragers, disease resistant. 1 drake + 1 hen.","Poultry","180","pair","20","Kavango East",false,"B+","Verified Seller"),
  L("Kobus van Zyl","Ostrich Chicks — 3 Months","Three-month-old ostrich chicks for leather and meat production. High-performing stock.","Poultry","850","chick","12","Hardap",true,"A","Verified Seller"),
  L("Naomi Tjipuka","Bronze Turkeys — Christmas Orders","Bronze breed turkeys, 8–10kg. Christmas and festive season orders welcome.","Poultry","350","bird","25","Erongo",false,"B+","Verified Seller"),
  L("Hafeni Shapumba","Indigenous Guinea Fowl — Ohangwena","Wild-raised guinea fowl chicks, hardened for communal farm conditions.","Poultry","75","bird","60","Ohangwena",false,"B","Indigenous Breed"),

  // ═════ CROPS ═══════
  L("Selma Nghidinwa","Pearl Millet — Mahango Grade A","Certified organic mahango, harvested 2026. Stone-ground ready. Northern Namibia staple.","Crops","8.50","kg","5000","Ohangwena",true,"A","Organic, QualityScan Grade A"),
  L("Johannes Nghifindaka","White Maize — Premium Grade","Premium white maize, 12,000kg. Moisture 12.5%, protein 9.2%. Suitable for milling.","Crops","6.20","kg","12000","Oshikoto",true,"A","QualityScan Grade A, Verified Seller"),
  L("Magdalena Amunyela","Butternut Squash — Export Grade","Export-ready butternut squash, 3,500kg. Uniform size. Packed to EU standards.","Crops","9.00","kg","3500","Khomas",false,"A","Export Ready, QualityScan Grade A"),
  L("Abraham Tjiramba","Roma Tomatoes — Restaurant Grade","Firm Roma tomatoes, 14-day shelf life. Grown in Kavango East's fertile floodplains.","Crops","12.50","kg","800","Kavango East",false,"A","QualityScan Grade A"),
  L("Pieter Swarts","Brown Onions — 6-Month Storage","Premium brown onions, 4,200kg. Cured for 6-month storage. Wholesale welcome.","Crops","7.80","kg","4200","Hardap",false,"A","QualityScan Grade A, Verified Seller"),
  L("Selma Nghidinwa","Groundnuts — Organic Roasting Grade","Certified organic groundnuts, 8% moisture. Hand-sorted roasting grade. 800kg.","Crops","18.50","kg","800","Ohangwena",false,"A","Organic, Verified Seller"),
  L("Ndapewa Mwinga","Sweet Potatoes — Orange Flesh","Nutrition-rich orange-flesh sweet potatoes from Kavango West. Hotel and school supply.","Crops","11.00","kg","1200","Kavango West",false,"A","QualityScan Grade A"),
  L("Gideon Isaaks","Sugar Baby Watermelons","Sweet Sugar Baby watermelons, 6–8kg each. Barter exchange also available.","Crops","25.00","each","400","Hardap",false,"B+","Barter Available"),
  L("Frieda Kauaria","Green Cabbage — Restaurant Supply","Large-head green cabbages for restaurant and hotel supply. 600 heads available.","Crops","14.00","each","600","Khomas",false,"A","QualityScan Grade A"),
  L("Magdalena Amunyela","Baby Spinach — Hotel Supply","Pre-washed packed baby spinach for hotel and catering. 150kg. Harvested to order.","Crops","35.00","kg","150","Khomas",true,"A","Premium Grade, Verified Seller"),
  L("Festus Amupanda","White Sorghum — Processing Grade","White sorghum, 8,000kg. Suitable for Chibuku brewing and grain processing.","Crops","7.50","kg","8000","Oshana",false,"B+","Processing Grade, Verified Seller"),
  L("Selma Nghidinwa","Dried Cowpeas — Organic","Certified organic dried cowpeas, high protein, 500kg. Traditional Namibian ingredient.","Crops","22.00","kg","500","Ohangwena",false,"A","Organic, QualityScan Grade A"),
  L("Gideon Isaaks","Boer Pumpkin — Traditional Variety","Traditional Namibian Boer pumpkins. Long shelf-life, excellent flavour. 400 units.","Crops","18.00","each","400","Hardap",false,"B+","Traditional Variety"),
  L("Abraham Tjiramba","Bird's Eye Chilli Peppers","Fiery Bird's Eye chillies, 80kg. Dried also available. Specialty restaurant crop.","Crops","45.00","kg","80","Kavango East",false,"A","Specialty Crop"),
  L("Joseph Haipinge","Sugar Beans — Protein Rich","High-protein sugar beans from Zambezi region. 350kg. Popular as meat alternative.","Crops","28.00","kg","350","Zambezi",false,"A","QualityScan Grade A"),
  L("Hilma Nangolo","Fresh Sweet Corn — Yellow","Fresh yellow sweet corn ears. 2,000 ears from Kavango East. Restaurant supply.","Crops","8.50","each","2000","Kavango East",false,"A","Verified Seller"),
  L("Ndapewa Mwinga","Dried Moringa Leaves — Superfood","Certified organic dried moringa leaves, 25kg. EU wellness market interest.","Crops","180.00","kg","25","Kavango East",true,"A","Organic, Export Ready"),
  L("Heinrich Mouton","Locally Grown Garlic","Import-substitute locally grown garlic, 60kg. Naturally dried, full bulbs.","Crops","95.00","kg","60","Hardap",false,"A","QualityScan Grade A"),
  L("Magdalena Amunyela","Bunched Carrots — Hotel Supply","Fresh bunched carrots, 300 bunches. Cleaned for hotel supply. Same-week delivery.","Crops","18.00","bunch","300","Khomas",false,"A","Premium Grade"),
  L("Abraham Tjiramba","Green Bell Peppers — Restaurant Grade","Fresh green bell peppers, 200kg. Uniform size, restaurant grade. Year-round supply.","Crops","32.00","kg","200","Kavango East",false,"A","QualityScan Grade A"),
  L("Sakeus Haikali","Pearl Millet — Bulk Processing","Bulk pearl millet from Oshana, 6,000kg. Low moisture, storage grade.","Crops","7.20","kg","6000","Oshana",false,"B+","Processing Grade"),
  L("Sakeus Haikali","White Sorghum — Direct Harvest","Freshly harvested white sorghum, 4,500kg. Traditional mahewu and brewing grade.","Crops","7.00","kg","4500","Oshana",false,"B+","Verified Seller"),
  L("Veronica Nekwaya","Fresh Mahango — Communal Grade","Communal mahango harvest, 800kg. Traditional milling grade from Omusati.","Crops","6.50","kg","800","Omusati",false,"B","Communal Certified"),
  L("Veronica Nekwaya","Baby Spinach — Organic Omusati","Freshly harvested baby spinach, 120kg. Naturally grown without agrochemicals.","Crops","28.00","kg","120","Omusati",false,"B+","Organic"),
  L("Hileni Nghipandulwa","Pearl Millet Seed — Communal Saved","Open-pollinated pearl millet seed from Omusati communal land. Drought-resistant.","Crops","12.00","kg","150","Omusati",false,"B","Communal Certified"),
  L("Hafeni Shapumba","Mahango — Small Holder Harvest","Traditional mahango from communal farm. Stone-grinding potential. 600kg available.","Crops","6.80","kg","600","Ohangwena",false,"B","Communal Certified"),
  L("Hafeni Shapumba","Sweet Potato — Orange & White","Mixed orange and white sweet potato variety, 450kg. Nutritious communal crop.","Crops","10.00","kg","450","Ohangwena",false,"B+","Communal Certified"),
  L("Rauna Iilonga","Maize — Oshikoto Dryland","Dryland maize, 3,000kg. Adapted Oshikoto variety, medium protein content.","Crops","5.80","kg","3000","Oshikoto",false,"B+","Verified Seller"),

  // ═════ SEEDS & INPUTS ═══════
  L("Johannes Nghifindaka","Drought-Resistant Maize Seed SC403","Certified SC403 maize seed, treated. 105-day variety, excellent drought tolerance.","Seeds & Inputs","285","5kg bag","200","Khomas",true,"A","InputGuard Verified, Certified Seed"),
  L("Festus Amupanda","Pearl Millet Seed — Okashana 2","MAWLR-certified Okashana 2 millet seed. Namibian-developed, outstanding drought performance.","Seeds & Inputs","120","2kg bag","500","Oshana",false,"A","MAWLR Certified, InputGuard Verified"),
  L("Johannes Nghifindaka","NPK Fertilizer 2:3:2 (22) — Bags","High-quality NPK 2:3:2 (22) fertilizer for maize and vegetables. 50kg bags.","Seeds & Inputs","890","50kg bag","300","Khomas",false,"A","InputGuard Verified, Agra Certified"),
  L("Johannes Nghifindaka","Urea 46% Nitrogen — Topdressing","Urea 46% nitrogen for crop topdressing. Apply at 6-leaf stage for maize.","Seeds & Inputs","1100","50kg bag","150","Khomas",false,"A","InputGuard Verified"),
  L("Gideon Isaaks","Watermelon Seeds — Charleston Grey","High-yield disease-resistant Charleston Grey watermelon seeds. 100 seeds per pack.","Seeds & Inputs","85","pack","400","Hardap",false,"A","Certified Seed, InputGuard Verified"),
  L("David Mwetupunga","Cattle Vaccine — Lumpy Skin Disease","Lumpy Skin Disease vaccine, 50-dose vial. Cold-chain maintained. Expires 2027.","Seeds & Inputs","450","vial","100","Khomas",false,"A","Cold Chain Verified, InputGuard Verified"),
  L("Magdalena Amunyela","Roma F1 Tomato Seedlings","Four-week-old Roma F1 tomato seedlings ready to transplant. 500 available.","Seeds & Inputs","3.50","seedling","500","Khomas",false,"A","Certified Seedlings"),
  L("Selma Nghidinwa","Kraal Manure Compost — Organic","Certified organic kraal manure compost, 20 cubic metres. Perfect soil amendment.","Seeds & Inputs","180","cubic metre","20","Ohangwena",false,"A","Organic Certified"),
  L("David Mwetupunga","Drip Irrigation Kit — 1 Hectare","Complete 1-hectare drip irrigation kit. Pipes, emitters, filter, and timer.","Seeds & Inputs","8500","kit","15","Khomas",true,"A","InputGuard Verified, Agriway Certified"),
  L("David Mwetupunga","Solar Water Pump — 0.5HP","0.5HP solar-powered borehole pump. 3,000 litres/day from 30m depth.","Seeds & Inputs","6200","unit","10","Khomas",true,"A","InputGuard Verified, Solar Certified"),

  // ═════ EQUIPMENT ═══════
  L("Petrus Hamutenya","John Deere 5055E Tractor — 2019","John Deere 5055E, 55HP, 2019, 1,240 hours. Excellent condition, full service history.","Equipment","285000","unit","1","Otjozondjupa",true,"A","Service History, Verified Seller"),
  L("Pieter Swarts","3-Furrow Disc Plough","Heavy-duty 3-furrow disc plough. Fits 50–80HP tractors. Good working condition.","Equipment","18500","unit","1","Hardap",false,"B+","Verified Seller"),
  L("Johannes Nghifindaka","Grundfos SP5 Borehole Pump","Grundfos SP5 3-phase borehole pump. 40m head, 5m³/hour capacity.","Equipment","12800","unit","1","Khomas",false,"A","Verified Seller"),
  L("Selma Nghidinwa","Manual Maize Sheller","Heavy-duty manual maize sheller. 500kg per hour capacity. Robust construction.","Equipment","2200","unit","3","Ohangwena",false,"B+","Verified Seller"),
  L("David Mwetupunga","Digital Platform Livestock Scale","Digital platform scale, 2,000kg capacity for livestock weighing. Digital display.","Equipment","8500","unit","2","Khomas",false,"A","Calibrated, Verified Seller"),
  L("Hilma Nangolo","5,000L Poly Water Tank","UV-resistant food-grade 5,000L poly tank for irrigation storage and livestock water.","Equipment","4800","unit","5","Erongo",false,"A","Food Grade Certified"),
  L("Frieda Kauaria","Heavy Duty Farm Wheelbarrow","200L capacity pneumatic-tyre farm wheelbarrow. Galvanised tray, heavy-duty frame.","Equipment","850","unit","3","Khomas",false,"B","Verified Seller"),
  L("Gideon Isaaks","Electric Fence Energiser — 12 Joule","12-Joule electric fence energiser. Powers up to 100km of fence. Mains or battery.","Equipment","3200","unit","4","Hardap",false,"A","Verified Seller"),
  L("Maria Kahumba","15L Knapsack Spray Pump","Stainless steel 15L knapsack sprayer with adjustable nozzle. 5 units available.","Equipment","480","unit","5","Khomas",false,"B+","Verified Seller"),
  L("Frieda Kauaria","Chicken Drinkers & Feeders Set","Complete poultry feeding set: 5L drinker + 5kg feeder. 50 sets available.","Equipment","85","set","50","Khomas",false,"B+","Verified Seller"),
  L("Sakeus Haikali","Hand-Operated Grain Winnower","Traditional fan-assisted grain winnower for millet and sorghum. 3 units available.","Equipment","1800","unit","3","Oshana",false,"B","Verified Seller"),
  L("Willem Olivier","Drip Line Irrigation Spares","Spare drip emitters, connectors and poly pipe for 2-hectare drip irrigation system.","Equipment","3400","kit","8","Hardap",false,"B+","Verified Seller"),

  // ═════ PROCESSED PRODUCTS ═══════
  L("Petrus Hamutenya","Biltong — Kudu & Beef Mix","Artisan biltong, Kudu and beef mix. Wet or dry cut, vacuum packed. HACCP certified.","Processed","280","kg","50","Otjozondjupa",true,"A","HACCP Certified, Verified Seller"),
  L("Selma Nghidinwa","Mahango Porridge Meal — Stone Ground","Stone-ground mahango meal, 5kg bags. No additives. Organic certified from Ohangwena.","Processed","45","5kg bag","200","Ohangwena",false,"A","Organic, Verified Seller"),
  L("Abraham Tjiramba","Wild Flower Honey — Unfiltered","Unfiltered wild bush honey, 500g jars. Kavango East floral sources. Raw, 60 jars.","Processed","120","500g jar","60","Kavango East",true,"A","Organic, Unfiltered"),
  L("Ndapewa Mwinga","Moringa Powder — EU Export Grade","Certified organic moringa powder, 250g packs. EU export grade, high nutrient density.","Processed","350","250g pack","30","Kavango East",false,"A","Organic, Export Ready"),
  L("Joseph Haipinge","Dried Kapenta Fish — Sun Dried","Sun-dried Kapenta from Zambezi River. No preservatives, traditional drying method.","Processed","95","kg","200","Zambezi",false,"B+","Traditional Process, Verified Seller"),
  L("Grietjie Mouton","Goat Milk Soap — Handmade","Artisan goat milk soap, lavender and oatmeal variety. 120 bars from Hardap.","Processed","65","bar","120","Hardap",false,"A","Handmade, Natural Ingredients"),
  L("Ndapewa Mwinga","Baobab Fruit Powder","Pure baobab fruit powder, rich in Vitamin C. 15kg from Kavango West. Export ready.","Processed","280","kg","15","Kavango West",true,"A","Organic, Export Ready"),
  L("Abraham Tjiramba","Kavango Fire Chilli Sauce","Artisan Kavango Fire chilli sauce, 300ml bottles. 80 bottles available.","Processed","85","bottle","80","Kavango East",false,"A","Artisan Made, Natural Ingredients"),
  L("Hileni Nghipandulwa","Oshikwiila Traditional Porridge","Hand-ground traditional millet porridge mix, 2kg bags. Authentic communal recipe.","Processed","38","2kg bag","80","Omusati",false,"B+","Traditional Recipe"),
  L("Hafeni Shapumba","Dried Sweet Potato Slices","Sun-dried sweet potato slices, 5kg packs. Nutritious snack and porridge ingredient.","Processed","55","5kg pack","40","Ohangwena",false,"B+","Natural Process"),

  // ═════ VEGETABLES ═══════
  L("Magdalena Amunyela","Vine Tomatoes — Hydroponic Grade","Premium hydroponic vine tomatoes, 500kg. Brix 7.5+, 18-day shelf life.","Vegetables","28.00","kg","500","Khomas",true,"A","QualityScan Grade A, Verified Seller"),
  L("Magdalena Amunyela","Baby Carrots — Restaurant Pack","Pre-peeled baby carrots in 1kg restaurant packs. 120 packs available. Khomas grown.","Vegetables","32.00","kg","120","Khomas",false,"A","Premium Grade, Verified Seller"),
  L("Abraham Tjiramba","Green Beans — Fine Cut","Fine-cut green beans, 200kg. Hand-picked and graded. Ideal for hotel buffets.","Vegetables","26.00","kg","200","Kavango East",false,"A","QualityScan Grade A"),
  L("Frieda Kauaria","Mixed Salad Leaves — Hotel Blend","Mixed salad blend: rocket, lettuce, red chard, spinach. 80kg. Cut and washed daily.","Vegetables","48.00","kg","80","Khomas",false,"A","Premium Grade, Verified Seller"),
  L("Hilma Nangolo","Broccoli Heads — Florets & Whole","Fresh broccoli heads, 150kg. Tight dark-green heads. Ideal for freezing or market.","Vegetables","38.00","kg","150","Erongo",false,"A","QualityScan Grade A"),
  L("Abraham Tjiramba","Cucumber — Seedless Long","Seedless long cucumbers, 300kg. Crisp flesh, thin skin. Year-round Kavango supply.","Vegetables","18.00","kg","300","Kavango East",false,"B+","Verified Seller"),
  L("Magdalena Amunyela","Leeks — Shaft & Blue Varieties","Thick-shaft leeks, 120kg. Cleaned, trimmed, bunched. Gourmet cooking grade.","Vegetables","42.00","kg","120","Khomas",false,"A","QualityScan Grade A"),
  L("Selma Nghidinwa","Beetroot — Bunch & Loose","Fresh Ohangwena beetroot, 250kg. Bright red flesh, earthy flavour.","Vegetables","14.00","kg","250","Ohangwena",true,"A","Organic, QualityScan Grade A"),
  L("Magdalena Amunyela","Butterhead Lettuce — Living Plants","Living butterhead lettuce in pots. 200 units for home delivery and farm markets.","Vegetables","22.00","plant","200","Khomas",false,"A","Organic, Verified Seller"),
  L("Abraham Tjiramba","Sweet Peppers — Traffic Light Mix","Mixed red, yellow and green sweet peppers, 180kg. Export caliber under shade net.","Vegetables","55.00","kg","180","Kavango East",false,"A","Export Ready, QualityScan Grade A"),
  L("Veronica Nekwaya","Moringa Leaves — Fresh Bundle","Fresh moringa bundles, 50kg. Harvested weekly from Omusati communal plots.","Vegetables","22.00","kg","50","Omusati",false,"B+","Organic"),
  L("Rauna Iilonga","Pumpkin Leaves — Communal Harvest","Fresh pumpkin leaves (ombidi), 30kg. Traditional Oshikoto communal harvest.","Vegetables","12.00","kg","30","Oshikoto",false,"B","Communal Certified"),
  L("Willem Olivier","Table Grapes — Early Sweet","Early Sweet table grapes, 800kg. Premium Hardap grapes. Retail and export quality.","Vegetables","85.00","kg","800","Hardap",true,"A","Export Ready, QualityScan Grade A"),
  L("Willem Olivier","Dried Raisins — Sun Dried","Sun-dried Hardap raisins, 200kg. No preservatives, natural sulphur-free drying.","Vegetables","145.00","kg","200","Hardap",false,"A","Natural Process, Verified Seller"),

  // ═════ ADDITIONAL CATTLE ═══════
  L("Maria Kahumba","Simmentaler Cross Heifers","Simmentaler cross heifers, 16 months, 340kg. Great growth rates on veld. 8 available.","Cattle","7600","head","8","Omaheke",false,"B+","Verified Seller"),
  L("Petrus Haimbodi","Brahman Cross Cows — Dry","Dry Brahman cross cows, 4–6 years. Ready to go back in calf. Hardy, low-input.","Cattle","6400","head","14","Erongo",false,"B","Verified Seller"),
  L("Heinrich Mouton","Holstein × Jersey Bull","Dual-purpose Holstein-Jersey bull, 30 months, 620kg. Excellent conception rate.","Cattle","16500","head","1","Khomas",false,"A","Verified Seller"),
  L("Hilma Nangolo","Weaner Calves — Mixed Breed","Mixed-breed weaner calves, 5–6 months, 160–200kg. Good nutrition history.","Cattle","2800","head","12","Erongo",false,"B+","Verified Seller"),

  // ═════ ADDITIONAL GOATS ═══════
  L("Gideon Isaaks","Boer Does — Fat and Ready","Boer does, 3–4 years, in condition. Ready for immediate slaughter or breeding.","Goats","1700","head","25","Omaheke",false,"B+","Verified Seller"),
  L("Selma Nghidinwa","Indigenous Goat Weaners","Traditional Ohangwena small goats, 3 months. Ideal for communal herd rebuilding.","Goats","550","head","30","Ohangwena",false,"B","Indigenous Breed"),
  L("Naomi Tjipuka","Boer × Indigenous Does","Boer-indigenous cross does, good meat frame, hardy, 18 months. 14 head.","Goats","1150","head","14","Erongo",false,"B+","Verified Seller"),
  L("Frans Booysen","Boer × Damara Does — Breeding","Fertile Boer-Damara cross does, excellent mothering ability, hardy for //Kharas.","Goats","1400","head","28","//Kharas",false,"B+","Verified Seller"),
  L("Frans Booysen","Boer Stud Rams — Registered","Two registered Boer stud rams, 24 months. High libido, full health certificates.","Goats","3800","head","2","//Kharas",true,"A","Stud Registered, Verified Seller"),

  // ═════ ADDITIONAL SHEEP ═══════
  L("Pieter Swarts","Karakul Rams — Breeding Stock","Karakul breeding rams, 2 years. Traditional Swakara-producing blood lines. 5 available.","Sheep","2200","head","5","Hardap",false,"A","Swakara Certified"),
  L("Kobus van Zyl","Dorper × Damara Ewes","Hardy Dorper-Damara cross ewes, excellent survivability on dry veld. 22 head.","Sheep","1350","head","22","//Kharas",false,"B+","Verified Seller"),
  L("Grietjie Mouton","Slaughter Lambs — Eid Ready","Ready-to-slaughter Dorper lambs, 35–40kg. Halal-compliant. 80 head available.","Sheep","1650","head","80","Hardap",true,"A","Halal Ready, Verified Seller"),
  L("Daniel Swartbooi","Van Rooy Rams — Breeding","Three Van Rooy fat-tailed rams, 18 months. Premium Hardap fat-tail bloodlines.","Sheep","3200","head","3","Hardap",false,"A","Stud Tested, Verified Seller"),
  L("Frans Booysen","Dorper Ewes — Breeding Flock","Established Dorper breeding ewes, 2–4 years. Proven producers. 35 head.","Sheep","1500","head","35","//Kharas",false,"B+","Verified Seller"),

  // ═════ ADDITIONAL POULTRY ═══════
  L("Frieda Kauaria","Spent Hens — Bulk","End-of-lay Lohmann Brown hens, 18 months. Suitable for soup and stewing. 300 birds.","Poultry","25","bird","300","Khomas",false,"B","Verified Seller"),
  L("Abraham Tjiramba","Helmeted Guineafowl Eggs","Free-range guineafowl eggs for hatching or eating. 200 eggs per batch fortnightly.","Poultry","8","egg","200","Kavango East",false,"A","Free Range"),
  L("Hileni Nghipandulwa","Indigenous Chicken Eggs","Free-range indigenous chicken eggs, Omusati. Naturally hatched, no hormones.","Poultry","6","egg","500","Omusati",false,"B+","Free Range, Organic"),
  L("Hafeni Shapumba","Village Chickens — Free Range","Indigenous village chickens, 4–6 months. Free-range Ohangwena raised. 80 birds.","Poultry","90","bird","80","Ohangwena",false,"B","Indigenous Breed"),

  // ═════ ADDITIONAL CROPS ═══════
  L("Sakeus Haikali","Sorghum Grain — Feed Grade","Feed-grade red sorghum, 3,800kg. Suitable for poultry and livestock formulation.","Crops","6.80","kg","3800","Oshana",false,"B","Feed Grade"),
  L("Festus Amupanda","Yellow Maize — Feed Grade","Bulk yellow maize, 5,500kg, feed grade. 14% moisture, clean harvest.","Crops","5.50","kg","5500","Oshana",false,"B+","Verified Seller"),
  L("Johannes Nghifindaka","Maize Silage — Pit Fermented","Well-fermented maize silage, 8,000kg. Ready to feed. Tested 65% moisture.","Crops","4.50","kg","8000","Oshikoto",false,"B+","Quality Tested"),
  L("Erastus Nangolo","Teff Hay Bales — Premium","Premium teff hay, 400 round bales, 200kg each. Ideal for dairy and horses.","Crops","380","bale","400","Omaheke",true,"A","Premium Grade, Verified Seller"),
  L("Pieter Swarts","Lucerne Bales — Irrigated","Irrigated lucerne hay bales, 180kg. High protein, 3rd cut. Livestock and dairy.","Crops","420","bale","120","Hardap",false,"A","Irrigated Lucerne, Verified Seller"),
  L("David Mwetupunga","Veld Hay Bales — Natural Pasture","Natural veld grass hay, 250 bales. Good roughage for cattle. Hardap veld cut.","Crops","280","bale","250","Hardap",false,"B+","Verified Seller"),
  L("Veronica Nekwaya","Dried Pumpkin Seeds","Sun-dried pumpkin seeds, 80kg. Omusati traditional food crop by-product.","Crops","45.00","kg","80","Omusati",false,"B+","Natural Dried"),
  L("Hileni Nghipandulwa","Oshikundu Millet Base","Traditional oshikundu fermented millet base, 50kg. Pre-prepared for brewing.","Crops","18.00","kg","50","Omusati",false,"B","Traditional Recipe"),
  L("Rauna Iilonga","Maize Cobs — Seed Grade","Open-pollinated maize cobs saved for planting seed. Oshikoto-adapted variety.","Crops","22.00","kg","200","Oshikoto",false,"B+","Open Pollinated"),
  L("Selma Nghidinwa","Dried Beans — Small Brown","Traditional small brown beans, 300kg. High protein. Grown in Ohangwena.","Crops","30.00","kg","300","Ohangwena",false,"A","Organic, Verified Seller"),
  L("Festus Amupanda","Pearl Millet — Communal Harvest","Pearl millet, 2,500kg communal Oshana harvest. Traditional mahewu grade.","Crops","7.80","kg","2500","Oshana",false,"B","Verified Seller"),

  // ═════ ADDITIONAL SEEDS & INPUTS ═══════
  L("Gideon Isaaks","Sweet Melon Seeds — Spanish Type","Spanish-type sweet melon seeds, high Brix, 100 seeds per pack. 300 packs.","Seeds & Inputs","75","pack","300","Omaheke",false,"A","Certified Seed"),
  L("Selma Nghidinwa","Open-Pollinated Sorghum Seed","Saved sorghum seed, Ohangwena drought-adapted variety. 120kg available.","Seeds & Inputs","15","kg","120","Ohangwena",false,"B+","Communal Adapted"),
  L("Frieda Kauaria","Broiler Starter Feed — 50kg","Broiler starter crumbles, 50kg bags. Balanced nutrition for 0–21 day chicks.","Seeds & Inputs","850","50kg bag","80","Khomas",false,"A","Verified Supplier"),
  L("Hilma Nangolo","Layer Mash — 50kg Bag","Layer mash with 16% protein, 50kg bags. For laying hens 18–70 weeks.","Seeds & Inputs","780","50kg bag","60","Erongo",false,"A","Verified Supplier"),
  L("Rauna Iilonga","Cattle Mineral Lick Blocks","Loose mineral lick blocks for cattle, selenium-enriched. 25kg blocks, 40 available.","Seeds & Inputs","220","block","40","Oshikoto",false,"B+","InputGuard Verified"),
  L("Maria Kahumba","Anthelmintic Drench — Cattle","Broad-spectrum anthelmintic drench for cattle, 5L containers. Veterinary approved.","Seeds & Inputs","680","5L container","25","Omaheke",false,"A","Veterinary Approved, InputGuard Verified"),

  // ═════ ADDITIONAL EQUIPMENT ═══════
  L("Erastus Nangolo","Round Baler — Pull-Type","Pull-type round baler, Claas Rollant 250, 2017. Good working condition. 1 unit.","Equipment","85000","unit","1","Omaheke",false,"A","Service History, Verified Seller"),
  L("Kobus van Zyl","Wool Press — Manual Hydraulic","Manual hydraulic wool press. Packs fleeces into standard export bales. 1 unit.","Equipment","12500","unit","1","//Kharas",false,"B+","Verified Seller"),
  L("Pieter Swarts","Livestock Loading Ramp — Steel","Heavy-duty steel loading ramp for cattle trucks. Portable, adjustable height. 2 units.","Equipment","8500","unit","2","Hardap",false,"B+","Verified Seller"),
  L("Heinrich Mouton","Milk Churn — 50L Stainless","Stainless steel 50L milk churns. 10 available. Ideal for small dairy operations.","Equipment","950","unit","10","Khomas",false,"A","Food Grade Certified"),
  L("Petrus Haimbodi","Solar Fence Energiser — 4 Joule","4-Joule solar fence energiser, 40km fence capacity. Complete kit with battery.","Equipment","1850","unit","5","Erongo",false,"A","InputGuard Verified, Solar Certified"),
  L("Abraham Tjiramba","Harvesting Knife Set — Stainless","Professional stainless harvesting knife sets for vegetables and fruit. 20 sets.","Equipment","185","set","20","Kavango East",false,"B+","Verified Seller"),
  L("Festus Amupanda","Grain Storage Bags — 100kg","Heavy-duty woven polypropylene grain storage bags, 100kg capacity. 500 bags.","Equipment","18","bag","500","Oshana",false,"B","Verified Seller"),

  // ═════ ADDITIONAL PROCESSED ═══════
  L("Heinrich Mouton","Fresh Full-Cream Milk — Daily","Farm-fresh full-cream milk, pasteurised. 200 litres daily from Khomas dairy.","Processed","18.00","litre","200","Khomas",true,"A","Pasteurised, Dairy Certified"),
  L("Frieda Kauaria","Eggs — Free-Range Dozen","Free-range eggs from Khomas farm. 6-pack and dozen packs. Weekly harvest.","Processed","65.00","dozen","200","Khomas",false,"A","Free Range, Verified Seller"),
  L("Joseph Haipinge","Smoked Bream — Zambezi Catch","Traditional wood-smoked Zambezi bream, 50kg. No artificial smoke flavour.","Processed","185.00","kg","50","Zambezi",false,"A","Traditional Process"),
  L("Grietjie Mouton","Chèvre-Style Goat Cheese","Fresh chèvre-style cheese from Hardap dairy goats. 2kg rounds. 20 available.","Processed","180.00","kg","40","Hardap",true,"A","Artisan Made, Dairy Certified"),
  L("Abraham Tjiramba","Dried Mango Strips — Kavango","Naturally dried mango strips from Kavango East. No preservatives. 30kg available.","Processed","320.00","kg","30","Kavango East",false,"A","Organic, Natural Dried"),
  L("Ndapewa Mwinga","Baobab Seed Oil — Cold Pressed","Cold-pressed baobab seed oil, 250ml bottles. Premium cosmetic and culinary grade.","Processed","420.00","250ml","25","Kavango West",false,"A","Cold Pressed, Organic"),
  L("Selma Nghidinwa","Oshifima Porridge Mix — Traditional","Traditional oshifima porridge mix, mahango-based, 1kg packs. No additives. 150 packs.","Processed","28.00","1kg pack","150","Ohangwena",false,"A","Organic, Traditional Recipe"),
  L("Hafeni Shapumba","Morogo Dried Greens — Mixed","Sun-dried mixed wild greens (morogo) from Ohangwena, 5kg bags. Traditional food.","Processed","55.00","5kg bag","30","Ohangwena",false,"B+","Traditional Harvest"),

  // ═════ ADDITIONAL VEGETABLES ═══════
  L("Magdalena Amunyela","Cherry Tomatoes — Punnet","Cherry tomatoes in 250g punnets. Sweet Heirlooms variety from Khomas greenhouse.","Vegetables","48.00","punnet","300","Khomas",true,"A","QualityScan Grade A, Premium"),
  L("Frieda Kauaria","Spring Onions — Bunched","Fresh spring onions, 500 bunches. Washed and ready for hotel and retail supply.","Vegetables","12.00","bunch","500","Khomas",false,"A","Verified Seller"),
  L("Hilma Nangolo","Gem Squash — Hotel Pack","Green gem squash, 6-pack crates for hotel supply. 80 crates available from Erongo.","Vegetables","95.00","crate","80","Erongo",false,"A","Hotel Grade, Verified Seller"),
  L("Abraham Tjiramba","Okra — Fresh and Dried","Fresh okra pods, 120kg. Dried also available. Kavango favourite for oshithima stew.","Vegetables","22.00","kg","120","Kavango East",false,"A","QualityScan Grade A"),
  L("Veronica Nekwaya","Pumpkin — Traditional Oshanas","Large traditional oshanas pumpkins, 200 units. Omusati communal, long shelf life.","Vegetables","18.00","each","200","Omusati",false,"B+","Traditional Variety"),
  L("Sakeus Haikali","Wild Watermelon — Tsamma","Indigenous tsamma watermelon, 150 units. Drought-adapted, traditional livestock feed.","Vegetables","15.00","each","150","Oshana",false,"B","Indigenous Variety"),
  L("Rauna Iilonga","Sweet Potato Leaves — Fresh","Fresh sweet potato leaves, 60kg. Highly nutritious traditional leafy vegetable.","Vegetables","10.00","kg","60","Oshikoto",false,"B+","Communal Certified"),
];

// ── COURSES ───────────────────────────────────────────────────────────────────
const COURSES = [
  { title:"Modern Livestock Management", description:"Comprehensive cattle, goat and sheep husbandry for the Namibian farmer.", category:"Livestock", level:"beginner", durationHours:"8", instructorName:"Uazeua Katjimune", isFree:true, modules:[{title:"Breed Selection",lessonCount:4},{title:"Health & Vaccination",lessonCount:5},{title:"Feed Management",lessonCount:4}] },
  { title:"AgriTRUST Marketplace Masterclass", description:"How to list, price and negotiate on the AgriTRUST platform.", category:"Business", level:"beginner", durationHours:"3", instructorName:"Paulus Indongo", isFree:true, modules:[{title:"Creating Your First Listing",lessonCount:3},{title:"DealWise Negotiation",lessonCount:3}] },
  { title:"Drip Irrigation for Smallholders", description:"Install and manage low-cost drip irrigation systems on smallholder plots.", category:"Irrigation", level:"intermediate", durationHours:"6", instructorName:"Christiaan Barnard", isFree:true, modules:[{title:"System Design",lessonCount:3},{title:"Installation",lessonCount:4},{title:"Maintenance",lessonCount:3}] },
  { title:"Organic Mahango Farming", description:"Certified organic mahango production from land preparation to harvest.", category:"Crops", level:"beginner", durationHours:"5", instructorName:"Elifas Shivute", isFree:true, modules:[{title:"Soil Health",lessonCount:4},{title:"Planting & Weeding",lessonCount:3},{title:"Harvest & Storage",lessonCount:3}] },
  { title:"FarmScore & Harvest Finance Basics", description:"Understand your FarmScore and how to qualify for Harvest Finance loans.", category:"Finance", level:"beginner", durationHours:"2", instructorName:"Agri Bank Namibia", isFree:true, modules:[{title:"Your FarmScore",lessonCount:3},{title:"Loan Application",lessonCount:3}] },
  { title:"Poultry Enterprise for Rural Farmers", description:"Set up a profitable broiler or layer operation on a communal plot.", category:"Poultry", level:"beginner", durationHours:"6", instructorName:"Emilia Nghipandulwa", isFree:true, modules:[{title:"Housing & Equipment",lessonCount:3},{title:"Feed & Health",lessonCount:4},{title:"Market & Sales",lessonCount:3}] },
  { title:"ImpactLedger: Track Your Green Credits", description:"How to log tree planting, water conservation and earn green rewards.", category:"Sustainability", level:"beginner", durationHours:"2", instructorName:"Loide Dawid", isFree:true, modules:[{title:"Logging Activities",lessonCount:2},{title:"Green Credits",lessonCount:2}] },
  { title:"Goat & Sheep Value Chain", description:"From breeding herd selection to auction and direct market sales.", category:"Livestock", level:"intermediate", durationHours:"7", instructorName:"Elise Fourie", isFree:true, modules:[{title:"Breeding Strategy",lessonCount:4},{title:"Health Management",lessonCount:3},{title:"Auction Readiness",lessonCount:3}] },
  { title:"Vegetable Production for Hotels & Restaurants", description:"High-value market gardening targeting the hospitality sector.", category:"Horticulture", level:"intermediate", durationHours:"6", instructorName:"Titus Nambili", isFree:false, modules:[{title:"Crop Planning",lessonCount:3},{title:"Growing Practices",lessonCount:4},{title:"Post-Harvest Handling",lessonCount:3}] },
  { title:"Digital Farmer: Phone-First AgriTools", description:"Use your smartphone to manage listings, loans, and market prices.", category:"Digital Skills", level:"beginner", durationHours:"3", instructorName:"Emilia Nghipandulwa", isFree:true, modules:[{title:"AgriTRUST App",lessonCount:3},{title:"Digital Payments",lessonCount:2}] },
];

// ── RESET ─────────────────────────────────────────────────────────────────────
async function resetAll() {
  console.log("🗑  --reset: Wiping all tables (CASCADE)...");
  await db.execute(sql`
    TRUNCATE TABLE
      offers, negotiations,
      enrollments, barter_trades, post_likes, comments,
      mentor_sessions, quality_scans, shipments, notifications,
      disputes, theft_alerts, impact_activities, community_posts,
      transactions, loan_applications, land_listings, barter_items,
      farm_scores, mentors, listings, courses, users
    RESTART IDENTITY CASCADE
  `);
  console.log("   Done.\n");
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const reset = process.argv.includes("--reset");
  console.log("🌱 AgriTRUST Seed — Starting...\n");

  if (reset) await resetAll();

  // ── preflight: warn if legacy users exist and --reset was not used ─────────
  if (!reset) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    if (count > 0 && count !== USERS.length) {
      console.warn(`⚠️  Database has ${count} existing user(s). Run with --reset for a clean seed; role-count assertion may fail on legacy data.\n`);
    }
  }

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  console.log(`👤 Inserting ${USERS.length} users...`);
  const userIds: number[] = [];

  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];
    const tier = tierForIndex(i);
    const [ex] = await db.select({ id: usersTable.id }).from(usersTable)
      .where(sql`email = ${u.email}`);
    if (ex) {
      userIds.push(ex.id);
    } else {
      const [ins] = await db.insert(usersTable).values({
        name: u.name, email: u.email, passwordHash: PASSWORD,
        role: u.role, region: u.region, bio: u.bio ?? null,
        farmName: u.farmName ?? null, farmSizeHa: u.farmSizeHa ?? null,
        crops: u.crops ?? null, isVerified: TIER_VERIFIED[tier],
        farmScoreRating: u.scoreOverride ?? TIER_SCORE[tier],
      }).returning({ id: usersTable.id });
      userIds.push(ins.id);
    }
  }
  console.log(`   ✓ ${userIds.length} users ready\n`);

  const paulusId = userIds[1];
  // Derive IDs by role rather than brittle numeric slices
  const roleMap = new Map<string, number[]>();
  USERS.forEach((u, i) => {
    if (!roleMap.has(u.role)) roleMap.set(u.role, []);
    roleMap.get(u.role)!.push(userIds[i]);
  });
  const farmerIds     = roleMap.get("farmer")      ?? [];
  const buyerIds      = roleMap.get("buyer")       ?? [];
  const landOwnerIds  = roleMap.get("landowner")   ?? [];
  const mentorUserIds = roleMap.get("mentor")      ?? [];

  // helper: pick by cycling through an array
  const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];

  // ── 2. FARM SCORES (FarmPassport for every FARMER) ─────────────────────
  console.log("🌾 Inserting farm scores (FarmPassport)...");
  for (let i = 0; i < farmerIds.length; i++) {
    const uid = farmerIds[i];
    const [ex] = await db.select({ id: farmScoresTable.id }).from(farmScoresTable)
      .where(sql`user_id = ${uid}`);
    if (!ex) {
      const base = 60 + (i % 35);
      await db.insert(farmScoresTable).values({
        userId: uid, score: String(base + 20),
        salesHistory: String(base), paymentHistory: String(base + 5),
        profileCompleteness: String(base + 10), communityReputation: String(base + 8),
        sustainabilityScore: String(base + 3),
      });
    }
  }
  // Paulus (admin, idx 1) gets a farmScore record with score 98 as per spec
  const paulusFsEx = await db.select({ id: farmScoresTable.id }).from(farmScoresTable)
    .where(sql`user_id = ${paulusId}`);
  if (!paulusFsEx.length) {
    await db.insert(farmScoresTable).values({
      userId: paulusId, score: "98",
      salesHistory: "95", paymentHistory: "98",
      profileCompleteness: "100", communityReputation: "97",
      sustainabilityScore: "94",
    });
  }
  console.log(`   ✓ FarmPassport records for ${farmerIds.length} farmers + Paulus (score 98)\n`);

  // ── 3. LISTINGS (180) ─────────────────────────────────────────────────
  console.log("📦 Inserting listings...");
  // Build a name→id map for sellers
  const nameToId: Record<string, number> = {};
  for (let i = 0; i < USERS.length; i++) {
    nameToId[USERS[i].name] = userIds[i];
  }
  await db.delete(listingsTable);
  let listingCount = 0;
  for (const l of LISTINGS) {
    const sellerId = nameToId[l.sellerName];
    if (!sellerId) { console.warn(`  ⚠ No seller for "${l.title}"`); continue; }
    const { sellerName: _, ...rest } = l;
    await db.insert(listingsTable).values({ ...rest, sellerId, imageUrl: pickImage(l.title, l.category) });
    listingCount++;
  }
  if (listingCount < 175) throw new Error(`Listing count validation failed: expected >=175, got ${listingCount}`);
  console.log(`   ✓ ${listingCount} listings inserted\n`);

  // ── 4. BARTER ITEMS (45) ──────────────────────────────────────────────
  console.log("🔄 Inserting barter items (45)...");
  await db.delete(barterTradesTable);
  await db.delete(barterItemsTable);
  const barterCategories = ["Cattle","Goats","Crops","Equipment","Processed","Seeds & Inputs"];
  const barterItems: { title: string; description: string; category: string; quantity: string; unit: string; wantedFor: string; userId: number }[] = [];
  for (let i = 0; i < 45; i++) {
    const uid = pick(farmerIds, i);
    const cat = pick(barterCategories, i);
    barterItems.push({
      title: `Barter: ${cat} lot #${i + 1}`,
      description: `Quality ${cat.toLowerCase()} available for barter exchange. Seeking fair trade in kind.`,
      category: cat, quantity: String(10 + (i % 40)), unit: "units",
      wantedFor: `${pick(barterCategories, i + 2)} or equivalent value`,
      userId: uid,
    });
  }
  const insertedBarterItems = await db.insert(barterItemsTable).values(barterItems).returning({ id: barterItemsTable.id });
  // Create 15 barter trades
  const btrades = [];
  for (let i = 0; i < 15; i++) {
    const a = insertedBarterItems[i * 2];
    const b = insertedBarterItems[i * 2 + 1];
    if (!a || !b) break;
    btrades.push({
      offeredItemId: a.id, requestedItemId: b.id,
      proposerId: pick(farmerIds, i),
      status: i < 5 ? "accepted" : i < 10 ? "proposed" : "declined",
      message: "Fair trade proposal between neighbouring farms.",
    });
  }
  if (btrades.length) await db.insert(barterTradesTable).values(btrades);
  console.log(`   ✓ ${barterItems.length} barter items, ${btrades.length} trades\n`);

  // ── 5. LAND LISTINGS (22) ─────────────────────────────────────────────
  await db.delete(landListingsTable);
  console.log("🗺  Inserting land listings (22)...");
  const landData: [string, string, string, string, string, string, boolean, string][] = [
    ["Hardap Irrigation Block A","Irrigation farming plot, 45ha, borehole water access. Ideal for vegetables.","Hardap","45","280","Sandy loam",true,"Mixed Vegetables"],
    ["Otjozondjupa Grazing Farm","700ha grazing farm, Hardap grass pasture. Bush-cleared, water points installed.","Otjozondjupa","700","120","Kalahari sand",false,"Cattle Grazing"],
    ["Khomas Peri-Urban Garden Plot","5ha plot near Windhoek, borehole + municipal water. Ideal for market gardening.","Khomas","5","1800","Decomposed granite",true,"Vegetables, Herbs"],
    ["Ohangwena Communal Arable","Communal arable land, 12ha, flooding-irrigated in rainy season. Mahango-suitable.","Ohangwena","12","80","Alluvial",true,"Mahango, Sorghum"],
    ["Erongo Coastal Plot","3ha coastal plot near Swakopmund, fog irrigation potential. Restaurant supply.","Erongo","3","2200","Sandy",false,"Vegetables"],
    ["Kavango East Floodplain","25ha Kavango floodplain, annual flood deposit. Highly fertile, year-round crops.","Kavango East","25","150","Alluvial clay",true,"Vegetables, Rice"],
    ["Hardap Grape Farm Block","12ha established Hardap vineyards, drip-irrigated. Wine and table grape history.","Hardap","12","3500","Alluvial river sand",true,"Table Grapes"],
    ["Omaheke Bushveld","1,200ha Omaheke bushveld farm. Perennial water source. Suitable for extensive cattle.","Omaheke","1200","85","Red Kalahari sand",false,"Extensive Cattle"],
    ["Oshana Communal Plot","8ha communal plot, Oshana region. Seasonal stream irrigation. Smallholder-suitable.","Oshana","8","90","Alluvial",true,"Pearl Millet"],
    ["//Kharas Karakul Farm","800ha Namib-edge Karakul farm. Sparse vegetation, Karakul-adapted. Water from dam.","//Kharas","800","110","Rocky Namib",false,"Karakul Sheep"],
    ["Zambezi Riverfront","6ha Zambezi riverfront with permanent water. Excellent for horticulture.","Zambezi","6","420","Alluvial river",true,"Mixed Vegetables"],
    ["Kunene Highlands Farm","300ha Kunene highland farm, spring-fed water. High elevation, cooler climate.","Kunene","300","175","Rocky clay",false,"Goats, Small Grain"],
    ["Kavango West Forest Farm","18ha Kavango forest clearing. Moringa and baobab wild-harvest zone included.","Kavango West","18","200","Sandy clay",false,"Moringa, Baobab"],
    ["Erongo Sheep Block","450ha Erongo sheep farm, semi-arid. Borehole equipped, good fencing.","Erongo","450","155","Schist gravel",false,"Dorper Sheep"],
    ["Omusati Communal Arable","15ha arable communal plot, Omusati. Rainy season mahango production historically.","Omusati","15","75","Sandy loam",false,"Mahango"],
    ["Hardap Poultry Zone","2ha fenced poultry zone, existing biosecure broiler house footprint.","Hardap","2","950","Sandy",false,"Broiler Poultry"],
    ["Khomas Highland Nursery","1ha highland nursery plot, existing irrigation, shade structures in place.","Khomas","1","2800","Loam",true,"Seedlings, Herbs"],
    ["Oshikoto Cattle Post","600ha cattle post, Oshikoto. Three borehole pump stations. Electric fence.","Oshikoto","600","140","Kalahari sand",false,"Cattle"],
    ["Otjozondjupa Game Farm","2,500ha game farm block. Fenced, natural bush. Possible agri-tourism lease.","Otjozondjupa","2500","95","Sandy clay",false,"Game, Cattle"],
    ["Hardap Vineyard Expansion","8ha bare land adjoining established vineyard. Ready for vine planting.","Hardap","8","2800","Sandy alluvial",true,"Table Grapes"],
    ["Kavango East Communal Bloc","40ha communal farming bloc, crop history mahango and beans. Seasonal flooding.","Kavango East","40","100","Alluvial clay",true,"Mixed Crops"],
    ["Erongo Smallholder Plot","2ha smallholder plot, Erongo. Municipal water connection, school garden potential.","Erongo","2","600","Sandy loam",true,"Vegetables"],
  ];
  const landRows = landData.map((d, i) => ({
    title: d[0], description: d[1], region: d[2], hectares: d[3],
    pricePerHaPerYear: d[4], soilType: d[5], waterAccess: Boolean(d[6]),
    cropHistory: d[7], status: "available" as const, ownerId: pick(landOwnerIds, i),
  }));
  await db.insert(landListingsTable).values(landRows);
  console.log(`   ✓ ${landRows.length} land listings\n`);

  // ── 6. HARVEST LOANS (15) ─────────────────────────────────────────────
  await db.delete(loanApplicationsTable);
  console.log("💰 Inserting harvest loans (15)...");
  const loanPurposes = ["Cattle purchase","Irrigation equipment","Crop inputs","Fence construction","Vehicle purchase","Storage facility","Land lease payment","Seed purchase","Tractor hire","Borehole drilling"];
  const loanRows = Array.from({ length: 15 }, (_, i) => ({
    userId: pick(farmerIds, i), amount: String(5000 + i * 3200),
    purpose: pick(loanPurposes, i), status: i < 6 ? "approved" : i < 10 ? "disbursed" : "pending",
    interestRate: "12", term: 12 + (i % 24),
    collateral: "Farm assets and livestock",
    farmScoreAtApplication: String(680 + (i % 120)),
  }));
  await db.insert(loanApplicationsTable).values(loanRows);
  console.log(`   ✓ 15 loan applications\n`);

  // ── 7. TRANSACTIONS (200) ─────────────────────────────────────────────
  await db.delete(transactionsTable);
  console.log("💳 Inserting transactions (200)...");
  const txTypes = ["income","expense","income","income","expense"];
  const txCategories = ["Livestock Sales","Crop Sales","Equipment Purchase","Loan Repayment","Input Purchase","Service Income","Transport Cost","Market Fee"];
  const txRows = [];

  // Paulus: income transactions summing to ~45,800
  const paulusTx = [
    { amount:"12500", category:"Platform Services", description:"AI platform licensing revenue" },
    { amount:"8400",  category:"Consulting",        description:"AgriTech consulting fee" },
    { amount:"9800",  category:"Platform Services", description:"Marketplace transaction fees collected" },
    { amount:"7200",  category:"Consulting",        description:"Training programme delivery" },
    { amount:"5600",  category:"Platform Services", description:"Premium listing subscription revenue" },
    { amount:"2300",  category:"Consulting",        description:"Field agent onboarding workshop" },
  ]; // total: 45,800
  for (const t of paulusTx) {
    txRows.push({ userId: paulusId, type: "income", amount: t.amount, category: t.category, description: t.description, date: "2026-01-15", referenceId: `PAY-${crypto.randomBytes(4).toString("hex").toUpperCase()}` });
  }

  // Remaining 194 transactions for all users
  for (let i = 0; i < 194; i++) {
    const uid = pick(userIds, i + 5);
    txRows.push({
      userId: uid,
      type: pick(txTypes, i),
      amount: String(500 + (i * 317) % 25000),
      category: pick(txCategories, i),
      description: `${pick(txCategories, i)} transaction #${i + 1}`,
      date: `2026-0${1 + (i % 4)}-${String(1 + (i % 28)).padStart(2,"0")}`,
      referenceId: `TXN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    });
  }
  await db.insert(transactionsTable).values(txRows);
  console.log(`   ✓ ${txRows.length} transactions (Paulus income: NAD 45,800)\n`);

  // ── 8. COMMUNITY POSTS (40) ───────────────────────────────────────────
  await db.delete(communityPostsTable);
  console.log("💬 Inserting community posts (40)...");
  const postData = [
    ["Rain forecast Oshikoto region","Heavy rain forecast for Oshikoto this week — great planting window opening up. Who else is planning to plant mahango early?","general"],
    ["Lumpy Skin Disease alert Hardap","Confirmed LSD outbreak near Mariental. All cattle farmers in Hardap should vaccinate immediately. Contact MAWLR for free vaccine.","alert"],
    ["Drip irrigation success story","Installed a 1-hectare drip system on my plot in Khomas — tomato yield tripled. Happy to share installation tips!","success"],
    ["Where to sell moringa bulk?","I have 50kg dried moringa from Kavango West. Any buyers or exporters interested? Looking for fair long-term contract.","marketplace"],
    ["Boer goat prices rising","Seen a 15% price increase for Boer goats at Mariental auctions this month. Good time to sell. Anyone else seeing this?","market"],
    ["FarmScore — how to improve?","My FarmScore is 645. What's the fastest way to improve it? I need to qualify for Harvest Finance.","finance"],
    ["Mahango recipe idea — business","I'm processing stone-ground mahango meal into branded 2kg packs. Selling to Shoprite. How to get health certificate?","business"],
    ["QualityScan — tried it yet?","Used QualityScan on my maize batch — graded A, helped me negotiate a better price. Highly recommend to everyone.","technology"],
    ["Kavango East flooding update","The Kavango River is flooding earlier than expected. Riverside farmers should move livestock to higher ground now.","alert"],
    ["Solar pump vs diesel pump?","Thinking of replacing diesel pump with solar. Is the NAD 6,200 solar pump on AgriTRUST worth it? Any experience?","question"],
    ["First sale on AgriTRUST!","Just completed my first cattle sale on AgriTRUST — Brahman heifer, quick process, funds received same day. Thank you!","success"],
    ["Veterinarian in Kavango needed","Does anyone know a registered vet serving Kavango East? Need vaccination certificate for export shipment.","question"],
    ["Ostrich market — any interest?","I have 12 three-month ostrich chicks in Hardap. Any processors or farmers interested in adding ostrich to their operation?","marketplace"],
    ["Mahango storage best practice","After harvesting, I store mahango in sealed 25kg bags in a cool room. Any better methods to prevent weevils?","farming"],
    ["AgriAcademy livestock course","Just completed the Livestock Management course — really excellent. Improved my feeding regime significantly.","education"],
    ["Barter exchange — goats for maize","I have 10 Boer goat weaners and need 1,500kg of maize. Anyone up for a straight barter in the Hardap area?","barter"],
    ["Land lease question","Looking for irrigable land to lease in Hardap for 3 years. Budget NAD 250 per ha per year. Any offers?","landshare"],
    ["Community water point funding","Our communal area is applying for a borehole grant. Anyone know the MAWLR process? Need a project champion.","community"],
    ["Kapenta fish season — Zambezi","Kapenta season just opened on Zambezi. Fresh and dried stock available. Contact me for bulk orders.","marketplace"],
    ["Crop insurance — worth it?","Has anyone tried NamAgri Insurance for crop cover? Is it actually useful for small-scale communal farmers?","finance"],
    ["Organic certification process","How long does organic certification take in Namibia? I want to brand my mahango as certified organic.","farming"],
    ["Drought-tolerant sorghum varieties","Which sorghum varieties performed best in the 2025 dry season? I want to switch from maize in Oshana.","farming"],
    ["Market day — Gobabis","Monthly livestock market in Gobabis this Friday. Good turnout expected. Anyone transporting from Omaheke?","community"],
    ["New to AgriTRUST — greetings","Just joined AgriTRUST from Omusati. Still learning the platform. Any experienced farmers willing to mentor me?","introduction"],
    ["Garlic harvest — surplus supply","40kg locally grown garlic available from Hardap. Quality superior to imported. Looking for bulk buyer.","marketplace"],
    ["Chicken litter — free to collect","100 bags of broiler litter available free to collect from my farm in Khomas. Great organic fertiliser.","free"],
    ["Transport needed — Kavango to Windhoek","Need refrigerated transport for 300kg tomatoes from Kavango East to Windhoek this weekend. Anyone available?","logistics"],
    ["AgriTRUST mobile app review","The AgriTRUST app works great even on 3G in Ohangwena. Listed my mahango and got an enquiry within an hour!","feedback"],
    ["Bull rental opportunity","Bonsmara bull available for seasonal rental in Hardap. 60 days service, reasonable rate. DM for details.","livestock"],
    ["Greenhouse tunnel planning","Planning a 500m² polytunnel in Khomas for tomato and pepper production. Any local suppliers of tunnel structures?","farming"],
    ["Cattle TB testing required?","Do I need TB testing before selling cattle at auction in Namibia? What's the legal requirement?","question"],
    ["Poultry feed price increase","Broiler feed prices increased 12% this month. Is anyone mixing their own feed? Looking for alternatives.","market"],
    ["Impact credits — trees planted","Just logged 5 tree plantings on ImpactLedger and earned green credits. Easy to do, encourages sustainability.","sustainability"],
    ["Soil test results — Khomas","My Khomas plot showed nitrogen deficiency. Applying urea next week. Any tips on application rate for tomatoes?","farming"],
    ["Annual AgriTRUST meeting","AgriTRUST hosting its first community webinar for platform members. Date TBD — watch for announcements.","community"],
    ["Mushroom farming opportunity","Anyone tried oyster mushroom cultivation in Namibia? I have a cool storage facility and want to diversify.","farming"],
    ["Fair trade goat export deal","Secured a direct export deal for Boer goats to Dubai — avoiding middlemen through AgriTRUST. Life-changing!","success"],
    ["Crop rotation advice","What's the best rotation after maize in Oshikoto? Looking to improve soil and break pest cycles.","farming"],
    ["Harvest Finance repayment","Just made my final loan repayment to Harvest Finance on time. FarmScore went up 15 points!","finance"],
    ["AgriTRUST support — very helpful","The support team helped me resolve a listing dispute quickly and fairly. Great platform, great people.","feedback"],
  ];
  const postRows = postData.map(([title, content, category], i) => ({
    title, content, category: category as string,
    authorId: pick(userIds, i), likeCount: rng(0, 45), commentCount: rng(0, 12),
    isPinned: i === 0 || i === 1,
  }));
  await db.insert(communityPostsTable).values(postRows);
  console.log(`   ✓ 40 community posts\n`);

  // ── 9. THEFT ALERTS (8) ───────────────────────────────────────────────
  await db.delete(theftAlertsTable);
  console.log("🚨 Inserting theft alerts (8)...");
  const alertRows = [
    { title:"3 Brahman Heifers Stolen — Otjozondjupa",        description:"Three branded Brahman heifers stolen from Petrus Hamutenya farm on N1 roadside paddock. Brand: PH-21.",    region:"Otjozondjupa",  itemType:"Cattle",    status:"open",     rewardOffered:"2000",  reporterId: pick(farmerIds, 0) },
    { title:"Generator Theft — Hardap Farm",                  description:"Honda 5kVA generator stolen from locked equipment shed. Serial EG5000-NA1234.",                              region:"Hardap",        itemType:"Equipment", status:"open",     rewardOffered:"500",   reporterId: pick(farmerIds, 3) },
    { title:"15 Boer Goats Missing — //Kharas",               description:"15 Boer does missing from Kobus van Zyl farm overnight. Suspected stock theft, broken fence found.",        region:"//Kharas",      itemType:"Goats",     status:"resolved", rewardOffered:"1000",  reporterId: pick(farmerIds, 9) },
    { title:"Irrigation Pump Stolen — Kavango East",          description:"Grundfos SP3 pump stolen from unattended borehole. Pump serial GS-001KAV. NAD 8,500 value.",               region:"Kavango East",  itemType:"Equipment", status:"open",     rewardOffered:"800",   reporterId: pick(farmerIds, 6) },
    { title:"Vehicle Theft — Oshana Farm Road",               description:"White Toyota Hilux single cab stolen from Festus Amupanda farm. Registration N 12345 NA.",                 region:"Oshana",        itemType:"Vehicle",   status:"resolved", rewardOffered:"3000",  reporterId: pick(farmerIds, 14) },
    { title:"20 Dorper Ewes Stolen — Omaheke",                description:"20 Dorper ewes removed from Gideon Isaaks farm pen. Sheep have ear tag GI-2024. Night theft.",             region:"Omaheke",       itemType:"Sheep",     status:"open",     rewardOffered:"1500",  reporterId: pick(farmerIds, 13) },
    { title:"Crop Theft — Mahango Harvest, Ohangwena",        description:"Approx 500kg mahango stolen from communal storage in Oshikango village overnight.",                         region:"Ohangwena",     itemType:"Crops",     status:"open",     rewardOffered:"300",   reporterId: pick(farmerIds, 3) },
    { title:"Cattle Brand Tampering — Hardap",                description:"Two cattle found with tampered brands suggesting recent theft and re-branding. Report to police ref 2026-H.", region:"Hardap",        itemType:"Cattle",    status:"resolved", rewardOffered:"1000",  reporterId: pick(farmerIds, 20) },
  ];
  await db.insert(theftAlertsTable).values(alertRows);
  console.log(`   ✓ 8 theft alerts\n`);

  // ── 10. DISPUTES (5 resolved) ─────────────────────────────────────────
  await db.delete(disputesTable);
  console.log("⚖️  Inserting disputes (5 resolved)...");
  const disputeRows = [
    { title:"Listing Misrepresentation — Cattle Grade",    description:"Buyer received B-grade cattle described as A-grade in listing.", type:"listing",     status:"resolved", resolution:"Seller refunded price difference NAD 2,500. Listing corrected.", complainantId:buyerIds[0], respondentId:farmerIds[0] },
    { title:"Payment Not Received — Goat Sale",            description:"Seller claims payment for 20 Boer goats not received after delivery.", type:"payment",     status:"resolved", resolution:"AgriTRUST escrow confirmed payment pending bank processing delay. Released after 2 days.", complainantId:farmerIds[2], respondentId:buyerIds[2] },
    { title:"Delivery Dispute — Vegetable Order",          description:"300kg tomato order delivered underweight by 40kg according to buyer scales.", type:"delivery",    status:"resolved", resolution:"Third-party scale reweigh confirmed 28kg shortfall. Seller credited partial refund.", complainantId:buyerIds[1], respondentId:farmerIds[10] },
    { title:"Quality Dispute — Maize Moisture Content",    description:"Maize delivered at 16% moisture vs 12% stated in listing. Buyer rejected batch.", type:"quality",     status:"resolved", resolution:"QualityScan analysis confirmed elevated moisture. Full refund issued, listing suspended pending improvement.", complainantId:buyerIds[3], respondentId:farmerIds[5] },
    { title:"Land Lease Non-Payment — Hardap",             description:"Tenant farmer failed to pay first quarter land lease payment on time.", type:"contract",    status:"resolved", resolution:"Mediation agreed 30-day payment plan. Payment received. Contract reinstated with penalty clause.", complainantId:landOwnerIds[0], respondentId:farmerIds[8] },
  ];
  await db.insert(disputesTable).values(disputeRows);
  console.log(`   ✓ 5 resolved disputes\n`);

  // ── 11. COURSES + ENROLLMENTS (120) ───────────────────────────────────
  await db.delete(enrollmentsTable);
  await db.delete(coursesTable);
  console.log("🎓 Inserting courses and enrollments (120)...");
  const insertedCourses = await db.insert(coursesTable).values(COURSES).returning({ id: coursesTable.id });
  const courseIds = insertedCourses.map(c => c.id);
  const enrollRows = Array.from({ length: 120 }, (_, i) => ({
    courseId: pick(courseIds, i),
    userId: pick(userIds, i * 3),
    status: i < 80 ? "active" : "completed",
    progressPercent: i < 80 ? String(rng(10, 95)) : "100",
  }));
  await db.insert(enrollmentsTable).values(enrollRows);
  console.log(`   ✓ ${courseIds.length} courses, 120 enrollments\n`);

  // ── 12. QUALITY SCANS (160 — listing quality reviews) ────────────────
  await db.delete(qualityScansTable);
  console.log("⭐ Inserting quality scans / reviews (160)...");
  const cropTypes  = ["Maize","Cattle","Tomatoes","Sunflower","Mahango","Sorghum","Goats","Peppers","Wheat","Grapes"];
  const grades     = ["A","A","A","B","B","B","B","C","A","B"];
  const qualityRows = Array.from({ length: 160 }, (_, i) => ({
    cropType: pick(cropTypes, i),
    grade: pick(grades, i),
    score: String(55 + (i * 31) % 45),
    moisture: String(10 + (i % 8)),
    protein: String(12 + (i % 5)),
    defects: i % 5 === 0 ? "Minor surface blemishes only" : null,
    recommendations: i % 3 === 0 ? "Maintain current drying process for optimal grade." : "Consider additional drying time to reduce moisture.",
    status: "complete",
    userId: pick(farmerIds, i),
  }));
  await db.insert(qualityScansTable).values(qualityRows);
  console.log(`   ✓ 160 quality scans (reviews)\n`);

  // ── 13. IMPACT RECORDS (88, exactly 1 per user) ───────────────────────
  await db.delete(impactActivitiesTable);
  console.log("🌍 Inserting impact records (88)...");
  const impactTypes = ["tree_planting","water_conservation","soil_restoration","renewable_energy","waste_reduction","biodiversity","carbon_sequestration"];
  const impactUnits = ["trees","litres_saved","hectares","kwh","kg_waste","species_protected","kg_co2"];
  const impactRows = userIds.map((uid, i) => ({
    userId: uid,
    type: pick(impactTypes, i),
    description: `${pick(impactTypes, i).replace(/_/g," ")} activity recorded on farm or property.`,
    impactValue: String(1 + (i * 7) % 50),
    unit: pick(impactUnits, i),
    verifiedAt: i % 3 === 0 ? new Date() : null,
  }));
  await db.insert(impactActivitiesTable).values(impactRows);
  console.log(`   ✓ ${impactRows.length} impact records (1 per user)\n`);

  // ── 13. MENTORS + SESSIONS (12) ───────────────────────────────────────
  console.log("🤝 Inserting mentors and sessions (12)...");
  const mentorSpecialties = ["Cattle farming","Sheep & goat enterprise","Smallholder development"];
  // mentorUsers: lookup UDef by role so bio comes from the actual mentor record
  const mentorUserDefs = USERS.filter(u => u.role === "mentor");
  const mentorIds: number[] = [];
  for (let i = 0; i < mentorUserIds.length; i++) {
    const uid = mentorUserIds[i];
    const [ex] = await db.select({ id: mentorsTable.id }).from(mentorsTable)
      .where(sql`user_id = ${uid}`);
    if (ex) {
      mentorIds.push(ex.id);
    } else {
      const [ins] = await db.insert(mentorsTable).values({
        userId: uid, specialty: mentorSpecialties[i % mentorSpecialties.length],
        bio: mentorUserDefs[i]?.bio ?? "Experienced agricultural mentor.",
        rating: String(4.5 + i * 0.1),
        sessionsCompleted: 4 + i, hourlyRateNAD: String(200 + i * 50),
        isAvailable: true,
      }).returning({ id: mentorsTable.id });
      mentorIds.push(ins.id);
    }
  }

  await db.delete(mentorSessionsTable);
  const sessionTopics = ["Cattle health management","Breeding herd selection","Goat market preparation","Feed cost reduction","Smallholder business plan","Water point management","Soil and pasture improvement","Export certification process","Digital tools for farmers","FarmScore optimisation","Livestock auction strategy","Succession planning on family farm"];
  const sessionRows = Array.from({ length: 12 }, (_, i) => ({
    mentorId: pick(mentorIds, i),
    menteeId: pick(farmerIds, i + 5),
    topic: sessionTopics[i],
    status: i < 8 ? "completed" : "scheduled",
    scheduledAt: new Date(Date.now() + (i - 4) * 7 * 24 * 60 * 60 * 1000),
    notes: i < 8 ? "Session completed. Farmer showed good progress on recommended actions." : null,
  }));
  await db.insert(mentorSessionsTable).values(sessionRows);
  console.log(`   ✓ ${mentorIds.length} mentors, 12 mentor sessions\n`);

  // ── ROLE-COUNT ASSERTION ──────────────────────────────────────────────
  {
    // Exact breakdown: 88 users, all spec-mandated roles at target count
    const EXPECTED: Record<string, number> = {
      admin: 2, farmer: 30, buyer: 9, landowner: 8, transporter: 5,
      veterinarian: 4, agronomist: 4, cooperative: 4, input_supplier: 4, exporter: 4,
      processor: 3, mentor: 3, lender: 2, insurance_partner: 2,
      agent: 2, ngo: 1, trainer: 1,
    };
    const EXPECTED_TOTAL = Object.values(EXPECTED).reduce((a, b) => a + b, 0); // = 88
    const rows = await db.select({ role: usersTable.role }).from(usersTable);
    const actual: Record<string, number> = {};
    for (const { role } of rows) actual[role] = (actual[role] ?? 0) + 1;
    const total = rows.length;
    if (total !== EXPECTED_TOTAL) throw new Error(`Role assertion failed: expected ${EXPECTED_TOTAL} users, got ${total}`);
    for (const [role, count] of Object.entries(EXPECTED)) {
      if ((actual[role] ?? 0) !== count)
        throw new Error(`Role assertion failed: ${role} expected ${count}, got ${actual[role] ?? 0}`);
    }
    console.log(`   ✓ Role counts verified: ${EXPECTED_TOTAL} users across ${Object.keys(EXPECTED).length} roles\n`);
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────
  console.log("✅ AgriTRUST seeded: 88 users, 180 listings, 200 transactions, 88 impact records. Ready.");
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
