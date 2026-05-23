export type Category =
  | "Grains"
  | "Vegetables"
  | "Fruit"
  | "Livestock"
  | "Dairy & Eggs"
  | "Honey & Organic"
  | "Inputs & Supplies"
  | "Processed Foods"
  | "LandShare"
  | "Energy";

export interface MarketplaceListing {
  id: number;
  name: string;
  category: Category;
  price: number;
  unit: string;
  quantity: number;
  quantityUnit: string;
  seller: string;
  region: string;
  organic: boolean;
  featured: boolean;
  image: string;
}

const img = (file: string) => `/marketplace/${file}`;

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  // ── GRAINS (1–15) ──────────────────────────────────────────────
  { id: 1,  name: "Premium White Maize",       category: "Grains",          price: 8.50,    unit: "kg",    quantity: 2500,  quantityUnit: "kg",    seller: "Johannes Nghifinda",       region: "Oshikoto",       organic: false, featured: true,  image: img("maize-white.png") },
  { id: 2,  name: "Pearl Millet (Mahangu)",    category: "Grains",          price: 7.20,    unit: "kg",    quantity: 1800,  quantityUnit: "kg",    seller: "Maria Kahumba",            region: "Kavango East",   organic: true,  featured: true,  image: img("millet-mahangu.png") },
  { id: 3,  name: "Sorghum",                   category: "Grains",          price: 6.80,    unit: "kg",    quantity: 3000,  quantityUnit: "kg",    seller: "Petrus Haimbodi",          region: "Hardap",         organic: false, featured: true,  image: img("sorghum.png") },
  { id: 4,  name: "White Sorghum",             category: "Grains",          price: 7.00,    unit: "kg",    quantity: 2200,  quantityUnit: "kg",    seller: "Anna Tjikuua",             region: "Omaheke",        organic: false, featured: true,  image: img("sesame-seeds.png") },
  { id: 5,  name: "Yellow Maize",              category: "Grains",          price: 7.90,    unit: "kg",    quantity: 4000,  quantityUnit: "kg",    seller: "Simon Nangula",            region: "Ohangwena",      organic: false, featured: true,  image: img("maize-white.png") },
  { id: 6,  name: "Wheat Grain",               category: "Grains",          price: 9.20,    unit: "kg",    quantity: 1500,  quantityUnit: "kg",    seller: "Dina Shihepo",             region: "Hardap",         organic: false, featured: true,  image: img("millet-mahangu.png") },
  { id: 7,  name: "Barley",                    category: "Grains",          price: 10.50,   unit: "kg",    quantity: 800,   quantityUnit: "kg",    seller: "Thomas Haufiku",           region: "Khomas",         organic: false, featured: false, image: img("sorghum.png") },
  { id: 8,  name: "Sunflower Seeds",           category: "Grains",          price: 12.00,   unit: "kg",    quantity: 900,   quantityUnit: "kg",    seller: "Rachel Nghifikepunye",     region: "Otjozondjupa",   organic: false, featured: false, image: img("sunflower-seeds.png") },
  { id: 9,  name: "Sesame Seeds",              category: "Grains",          price: 18.50,   unit: "kg",    quantity: 600,   quantityUnit: "kg",    seller: "Festus Namwandi",          region: "Kavango West",   organic: true,  featured: false, image: img("sesame-seeds.png") },
  { id: 10, name: "Groundnuts",                category: "Grains",          price: 14.00,   unit: "kg",    quantity: 1200,  quantityUnit: "kg",    seller: "Elizabeth Amunyela",       region: "Ohangwena",      organic: false, featured: false, image: img("groundnuts.png") },
  { id: 11, name: "Cowpeas",                   category: "Grains",          price: 11.00,   unit: "kg",    quantity: 700,   quantityUnit: "kg",    seller: "David Shikongo",           region: "Oshikoto",       organic: false, featured: false, image: img("groundnuts.png") },
  { id: 12, name: "Dry Beans",                 category: "Grains",          price: 15.00,   unit: "kg",    quantity: 500,   quantityUnit: "kg",    seller: "Martha Tjituka",           region: "Omaheke",        organic: false, featured: false, image: img("millet-mahangu.png") },
  { id: 13, name: "Mung Beans",                category: "Grains",          price: 16.50,   unit: "kg",    quantity: 400,   quantityUnit: "kg",    seller: "Jacob Mutjavikua",         region: "Kavango East",   organic: true,  featured: false, image: img("sesame-seeds.png") },
  { id: 14, name: "Soya Beans",                category: "Grains",          price: 13.00,   unit: "kg",    quantity: 1100,  quantityUnit: "kg",    seller: "Frieda Tjiuezuua",         region: "Hardap",         organic: false, featured: false, image: img("groundnuts.png") },
  { id: 15, name: "Finger Millet",             category: "Grains",          price: 9.80,    unit: "kg",    quantity: 850,   quantityUnit: "kg",    seller: "Andreas Kamati",           region: "Kavango West",   organic: false, featured: false, image: img("millet-mahangu.png") },

  // ── VEGETABLES (16–35) ─────────────────────────────────────────
  { id: 16, name: "Organic Mixed Vegetables Box", category: "Vegetables",   price: 145.00,  unit: "box",   quantity: 50,    quantityUnit: "boxes", seller: "Maria Kahumba",            region: "Khomas",         organic: true,  featured: false, image: img("vegetables-mixed.png") },
  { id: 17, name: "Tomatoes Grade A",           category: "Vegetables",     price: 18.00,   unit: "kg",    quantity: 800,   quantityUnit: "kg",    seller: "Jan Botha",                region: "Hardap",         organic: false, featured: false, image: img("tomatoes.png") },
  { id: 18, name: "Baby Tomatoes",              category: "Vegetables",     price: 32.00,   unit: "kg",    quantity: 200,   quantityUnit: "kg",    seller: "Sarah Jacobs",             region: "Khomas",         organic: true,  featured: false, image: img("tomatoes.png") },
  { id: 19, name: "Red Onions",                 category: "Vegetables",     price: 12.50,   unit: "kg",    quantity: 2000,  quantityUnit: "kg",    seller: "Gottlieb Uarivi",          region: "Omaheke",        organic: false, featured: false, image: img("red-onions.png") },
  { id: 20, name: "Brown Onions",               category: "Vegetables",     price: 10.00,   unit: "kg",    quantity: 3500,  quantityUnit: "kg",    seller: "Nelago Shikongo",          region: "Hardap",         organic: false, featured: false, image: img("red-onions.png") },
  { id: 21, name: "Potatoes",                   category: "Vegetables",     price: 9.50,    unit: "kg",    quantity: 5000,  quantityUnit: "kg",    seller: "Piet Coetzee",             region: "Hardap",         organic: false, featured: false, image: img("potatoes.png") },
  { id: 22, name: "Sweet Potatoes",             category: "Vegetables",     price: 11.00,   unit: "kg",    quantity: 1500,  quantityUnit: "kg",    seller: "Ndapewa Hauwanga",         region: "Kavango East",   organic: true,  featured: false, image: img("sweet-potatoes.png") },
  { id: 23, name: "Butternut Squash",           category: "Vegetables",     price: 8.00,    unit: "kg",    quantity: 2800,  quantityUnit: "kg",    seller: "Annelene Du Plessis",      region: "Karas",          organic: false, featured: false, image: img("butternut.png") },
  { id: 24, name: "Pumpkin",                    category: "Vegetables",     price: 6.50,    unit: "kg",    quantity: 1800,  quantityUnit: "kg",    seller: "Paulina Nangombe",         region: "Oshana",         organic: false, featured: false, image: img("butternut.png") },
  { id: 25, name: "Cabbage",                    category: "Vegetables",     price: 15.00,   unit: "head",  quantity: 300,   quantityUnit: "heads", seller: "Jacobus Swartz",           region: "Khomas",         organic: false, featured: false, image: img("cabbage.png") },
  { id: 26, name: "Spinach Bunches",            category: "Vegetables",     price: 12.00,   unit: "bunch", quantity: 500,   quantityUnit: "bunches", seller: "Grace Shaanika",         region: "Khomas",         organic: true,  featured: false, image: img("spinach-kale.png") },
  { id: 27, name: "Kale",                       category: "Vegetables",     price: 14.00,   unit: "bunch", quantity: 200,   quantityUnit: "bunches", seller: "Titus Nghikembua",       region: "Khomas",         organic: true,  featured: false, image: img("spinach-kale.png") },
  { id: 28, name: "Swiss Chard",                category: "Vegetables",     price: 10.00,   unit: "bunch", quantity: 350,   quantityUnit: "bunches", seller: "Loini Hamunyela",        region: "Khomas",         organic: false, featured: false, image: img("spinach-kale.png") },
  { id: 29, name: "Green Peppers",              category: "Vegetables",     price: 22.00,   unit: "kg",    quantity: 400,   quantityUnit: "kg",    seller: "Hendrik Swanepoel",        region: "Hardap",         organic: false, featured: false, image: img("peppers.png") },
  { id: 30, name: "Red Peppers",                category: "Vegetables",     price: 28.00,   unit: "kg",    quantity: 250,   quantityUnit: "kg",    seller: "Suzan Nambahu",            region: "Hardap",         organic: false, featured: false, image: img("peppers.png") },
  { id: 31, name: "Chilli Peppers",             category: "Vegetables",     price: 35.00,   unit: "kg",    quantity: 150,   quantityUnit: "kg",    seller: "Victor Mwandingi",         region: "Oshana",         organic: false, featured: false, image: img("peppers.png") },
  { id: 32, name: "Garlic",                     category: "Vegetables",     price: 45.00,   unit: "kg",    quantity: 300,   quantityUnit: "kg",    seller: "Rosalia Kakuva",           region: "Hardap",         organic: true,  featured: false, image: img("garlic.png") },
  { id: 33, name: "Carrots",                    category: "Vegetables",     price: 13.00,   unit: "kg",    quantity: 1200,  quantityUnit: "kg",    seller: "Bernhard Diergaardt",      region: "Hardap",         organic: false, featured: false, image: img("carrots.png") },
  { id: 34, name: "Beetroot",                   category: "Vegetables",     price: 16.00,   unit: "kg",    quantity: 600,   quantityUnit: "kg",    seller: "Emilia Amunime",           region: "Khomas",         organic: false, featured: false, image: img("carrots.png") },
  { id: 35, name: "Broccoli",                   category: "Vegetables",     price: 28.00,   unit: "kg",    quantity: 180,   quantityUnit: "kg",    seller: "Selma Ilonga",             region: "Khomas",         organic: true,  featured: false, image: img("cabbage.png") },

  // ── FRUIT (36–45) ──────────────────────────────────────────────
  { id: 36, name: "Watermelon",                 category: "Fruit",          price: 22.00,   unit: "unit",  quantity: 500,   quantityUnit: "units", seller: "Danie Visser",             region: "Hardap",         organic: false, featured: false, image: img("watermelon.png") },
  { id: 37, name: "Cantaloupe Melon",           category: "Fruit",          price: 35.00,   unit: "unit",  quantity: 200,   quantityUnit: "units", seller: "Frieda Beukes",            region: "Hardap",         organic: false, featured: false, image: img("watermelon.png") },
  { id: 38, name: "Mangoes",                    category: "Fruit",          price: 8.00,    unit: "kg",    quantity: 2000,  quantityUnit: "kg",    seller: "Alfons Simasiku",          region: "Kavango East",   organic: false, featured: false, image: img("mangoes.png") },
  { id: 39, name: "Guavas",                     category: "Fruit",          price: 12.00,   unit: "kg",    quantity: 800,   quantityUnit: "kg",    seller: "Josephine Mwiya",          region: "Zambezi",        organic: true,  featured: false, image: img("mangoes.png") },
  { id: 40, name: "Papaya",                     category: "Fruit",          price: 15.00,   unit: "unit",  quantity: 400,   quantityUnit: "units", seller: "Fredrick Nghipangelwa",    region: "Oshana",         organic: false, featured: false, image: img("papaya.png") },
  { id: 41, name: "Bananas",                    category: "Fruit",          price: 18.00,   unit: "bunch", quantity: 300,   quantityUnit: "bunches", seller: "Adelaide Kavekotora",    region: "Kavango East",   organic: false, featured: false, image: img("bananas.png") },
  { id: 42, name: "Lemons",                     category: "Fruit",          price: 20.00,   unit: "kg",    quantity: 600,   quantityUnit: "kg",    seller: "Pieter Liebenberg",        region: "Hardap",         organic: false, featured: false, image: img("mangoes.png") },
  { id: 43, name: "Marula Fruit",               category: "Fruit",          price: 25.00,   unit: "kg",    quantity: 400,   quantityUnit: "kg",    seller: "Veronica Tjiueza",         region: "Otjozondjupa",   organic: true,  featured: false, image: img("papaya.png") },
  { id: 44, name: "Wild Figs",                  category: "Fruit",          price: 30.00,   unit: "kg",    quantity: 200,   quantityUnit: "kg",    seller: "Gottfried Kavari",         region: "Kavango West",   organic: true,  featured: false, image: img("bananas.png") },
  { id: 45, name: "Dates",                      category: "Fruit",          price: 55.00,   unit: "kg",    quantity: 150,   quantityUnit: "kg",    seller: "Johanna Witbooi",          region: "Karas",          organic: false, featured: false, image: img("mangoes.png") },

  // ── LIVESTOCK (46–65) ──────────────────────────────────────────
  { id: 46, name: "Brahman Bull",               category: "Livestock",      price: 18500,   unit: "head",  quantity: 3,     quantityUnit: "head",  seller: "Samuel Tjirare",           region: "Otjozondjupa",   organic: false, featured: false, image: img("brahman-bull.png") },
  { id: 47, name: "Afrikaner Breeding Cow",     category: "Livestock",      price: 12000,   unit: "head",  quantity: 8,     quantityUnit: "head",  seller: "Pieter Van Zyl",           region: "Omaheke",        organic: false, featured: false, image: img("nguni-cattle.png") },
  { id: 48, name: "Boer Goats Wethers",         category: "Livestock",      price: 1800,    unit: "head",  quantity: 25,    quantityUnit: "head",  seller: "Gert Kooper",              region: "Hardap",         organic: false, featured: false, image: img("boer-goats.png") },
  { id: 49, name: "Damara Goats",               category: "Livestock",      price: 1500,    unit: "head",  quantity: 40,    quantityUnit: "head",  seller: "Titus Uahuuwa",            region: "Kunene",         organic: false, featured: false, image: img("boer-goats.png") },
  { id: 50, name: "Dorper Sheep",               category: "Livestock",      price: 2200,    unit: "head",  quantity: 15,    quantityUnit: "head",  seller: "Louisa Beukes",            region: "Karas",          organic: false, featured: false, image: img("dorper-sheep.png") },
  { id: 51, name: "Karakul Sheep",              category: "Livestock",      price: 1950,    unit: "head",  quantity: 20,    quantityUnit: "head",  seller: "Abraham Swartz",           region: "Karas",          organic: false, featured: false, image: img("dorper-sheep.png") },
  { id: 52, name: "Nguni Cattle Mixed",         category: "Livestock",      price: 9800,    unit: "head",  quantity: 12,    quantityUnit: "head",  seller: "Elias Katjimune",          region: "Omaheke",        organic: false, featured: false, image: img("nguni-cattle.png") },
  { id: 53, name: "Simmentaler Hereford Cross", category: "Livestock",      price: 14200,   unit: "head",  quantity: 6,     quantityUnit: "head",  seller: "Roelf Cronje",             region: "Otjozondjupa",   organic: false, featured: false, image: img("brahman-bull.png") },
  { id: 54, name: "Village Chickens Layers",    category: "Livestock",      price: 85,      unit: "bird",  quantity: 200,   quantityUnit: "birds", seller: "Hileni Nghifikepunye",     region: "Oshana",         organic: false, featured: false, image: img("chickens.png") },
  { id: 55, name: "Broiler Chickens Live",      category: "Livestock",      price: 120,     unit: "bird",  quantity: 500,   quantityUnit: "birds", seller: "Thomas Angula",            region: "Khomas",         organic: false, featured: false, image: img("chickens.png") },
  { id: 56, name: "Turkeys",                    category: "Livestock",      price: 350,     unit: "bird",  quantity: 50,    quantityUnit: "birds", seller: "Magda Van Niekerk",        region: "Khomas",         organic: false, featured: false, image: img("chickens.png") },
  { id: 57, name: "Muscovy Ducks",              category: "Livestock",      price: 150,     unit: "bird",  quantity: 80,    quantityUnit: "birds", seller: "Tobias Mwandingi",         region: "Kavango East",   organic: false, featured: false, image: img("chickens.png") },
  { id: 58, name: "Pigs Weaners",               category: "Livestock",      price: 1200,    unit: "head",  quantity: 30,    quantityUnit: "head",  seller: "Kobus Louw",               region: "Hardap",         organic: false, featured: false, image: img("nguni-cattle.png") },
  { id: 59, name: "Breeding Sow",               category: "Livestock",      price: 4500,    unit: "head",  quantity: 5,     quantityUnit: "head",  seller: "Christo Beukes",           region: "Hardap",         organic: false, featured: false, image: img("nguni-cattle.png") },
  { id: 60, name: "Tilapia Fish Live",          category: "Livestock",      price: 45,      unit: "kg",    quantity: 500,   quantityUnit: "kg",    seller: "Petrus Munyukwa",          region: "Kavango East",   organic: false, featured: false, image: img("tilapia.png") },
  { id: 61, name: "Catfish Live",               category: "Livestock",      price: 52,      unit: "kg",    quantity: 300,   quantityUnit: "kg",    seller: "Solomon Simasiku",         region: "Zambezi",        organic: false, featured: false, image: img("tilapia.png") },
  { id: 62, name: "Rabbits Breeding Pairs",     category: "Livestock",      price: 280,     unit: "pair",  quantity: 25,    quantityUnit: "pairs", seller: "Ester Hamunyela",          region: "Khomas",         organic: false, featured: false, image: img("chickens.png") },
  { id: 63, name: "Angora Goats",               category: "Livestock",      price: 2800,    unit: "head",  quantity: 10,    quantityUnit: "head",  seller: "Dirk Visser",              region: "Karas",          organic: false, featured: false, image: img("boer-goats.png") },
  { id: 64, name: "Watusi Cattle",              category: "Livestock",      price: 22000,   unit: "head",  quantity: 4,     quantityUnit: "head",  seller: "Uatjiua Tjirare",          region: "Kunene",         organic: false, featured: false, image: img("brahman-bull.png") },
  { id: 65, name: "Ostrich Slaughter Age",      category: "Livestock",      price: 3500,    unit: "bird",  quantity: 12,    quantityUnit: "birds", seller: "Leon Joubert",             region: "Hardap",         organic: false, featured: false, image: img("chickens.png") },

  // ── DAIRY & EGGS (66–70) ───────────────────────────────────────
  { id: 66, name: "Fresh Farm Eggs Trays",      category: "Dairy & Eggs",   price: 65,      unit: "tray",  quantity: 200,   quantityUnit: "trays", seller: "Grace Shaanika",           region: "Khomas",         organic: false, featured: false, image: img("eggs.png") },
  { id: 67, name: "Pasteurised Goat Milk",      category: "Dairy & Eggs",   price: 35,      unit: "litre", quantity: 150,   quantityUnit: "litres/week", seller: "Hannelie Beukes",   region: "Hardap",         organic: true,  featured: false, image: img("goat-milk.png") },
  { id: 68, name: "Cultured Amasi Fermented Milk", category: "Dairy & Eggs", price: 28,     unit: "litre", quantity: 300,   quantityUnit: "litres", seller: "Hileni Nangombe",         region: "Oshana",         organic: false, featured: false, image: img("goat-milk.png") },
  { id: 69, name: "Butter Farm Made",           category: "Dairy & Eggs",   price: 95,      unit: "250g",  quantity: 80,    quantityUnit: "units", seller: "Emilia Swartz",            region: "Khomas",         organic: false, featured: false, image: img("eggs.png") },
  { id: 70, name: "Fresh Cow Milk",             category: "Dairy & Eggs",   price: 18,      unit: "litre", quantity: 500,   quantityUnit: "litres/week", seller: "Andries Du Toit",   region: "Otjozondjupa",   organic: false, featured: false, image: img("goat-milk.png") },

  // ── HONEY & ORGANIC (71–75) ────────────────────────────────────
  { id: 71, name: "Raw Wild Honey",             category: "Honey & Organic", price: 120,    unit: "kg",    quantity: 200,   quantityUnit: "kg",    seller: "Ndapewa Mushasho",         region: "Kavango East",   organic: true,  featured: false, image: img("honey.png") },
  { id: 72, name: "Marula Oil",                 category: "Honey & Organic", price: 280,    unit: "250ml", quantity: 60,    quantityUnit: "units", seller: "Veronica Tjikuua",         region: "Otjozondjupa",   organic: true,  featured: false, image: img("marula-oil.png") },
  { id: 73, name: "Moringa Powder",             category: "Honey & Organic", price: 95,     unit: "kg",    quantity: 150,   quantityUnit: "kg",    seller: "Saima Amunyela",           region: "Oshana",         organic: true,  featured: false, image: img("moringa.png") },
  { id: 74, name: "Baobab Powder",              category: "Honey & Organic", price: 110,    unit: "kg",    quantity: 120,   quantityUnit: "kg",    seller: "Petrus Kamuhanga",         region: "Otjozondjupa",   organic: true,  featured: false, image: img("moringa.png") },
  { id: 75, name: "Aloe Vera Gel Farm Pressed", category: "Honey & Organic", price: 85,     unit: "litre", quantity: 100,   quantityUnit: "litres", seller: "Suzel Diergaardt",        region: "Hardap",         organic: true,  featured: false, image: img("marula-oil.png") },

  // ── INPUTS & SUPPLIES (76–85) ──────────────────────────────────
  { id: 76, name: "Compost Bulk Bags",          category: "Inputs & Supplies", price: 45,   unit: "bag",   quantity: 500,   quantityUnit: "bags",  seller: "Thomas Nghifikepunye",     region: "Khomas",         organic: true,  featured: false, image: img("compost.png") },
  { id: 77, name: "Kraal Manure",               category: "Inputs & Supplies", price: 30,   unit: "bag",   quantity: 800,   quantityUnit: "bags",  seller: "Elias Kazarura",           region: "Omaheke",        organic: false, featured: false, image: img("compost.png") },
  { id: 78, name: "Worm Castings",              category: "Inputs & Supplies", price: 75,   unit: "bag",   quantity: 200,   quantityUnit: "bags",  seller: "Sarah Beukes",             region: "Khomas",         organic: true,  featured: false, image: img("compost.png") },
  { id: 79, name: "Drought-Resistant Maize Seed", category: "Inputs & Supplies", price: 120, unit: "kg",  quantity: 1000,  quantityUnit: "kg",    seller: "AgriSeed Namibia",         region: "Otjozondjupa",   organic: false, featured: false, image: img("maize-white.png") },
  { id: 80, name: "Vegetable Seedling Mixed Tray", category: "Inputs & Supplies", price: 85, unit: "tray", quantity: 300, quantityUnit: "trays", seller: "Green Roots Nursery",       region: "Khomas",         organic: false, featured: false, image: img("vegetables-mixed.png") },
  { id: 81, name: "Tomato Seedlings",           category: "Inputs & Supplies", price: 3.50, unit: "plant", quantity: 5000, quantityUnit: "plants", seller: "Pieter Coetzee",          region: "Hardap",         organic: false, featured: false, image: img("tomatoes.png") },
  { id: 82, name: "Animal Feed Layers Mash",    category: "Inputs & Supplies", price: 18,   unit: "kg",    quantity: 5000,  quantityUnit: "kg",    seller: "FeedMill Namibia",         region: "Khomas",         organic: false, featured: false, image: img("animal-feed.png") },
  { id: 83, name: "Lucerne Hay Bales",          category: "Inputs & Supplies", price: 95,   unit: "bale",  quantity: 400,   quantityUnit: "bales", seller: "Hardap Hay Supply",        region: "Hardap",         organic: false, featured: false, image: img("hay-bales.png") },
  { id: 84, name: "Maize Silage",               category: "Inputs & Supplies", price: 1800, unit: "ton",   quantity: 20,    quantityUnit: "tons",  seller: "Cronje Farm",              region: "Otjozondjupa",   organic: false, featured: false, image: img("hay-bales.png") },
  { id: 85, name: "Organic Fertilizer Pellets", category: "Inputs & Supplies", price: 65,   unit: "kg",    quantity: 2000,  quantityUnit: "kg",    seller: "NamOrganic Inputs",        region: "Khomas",         organic: true,  featured: false, image: img("compost.png") },

  // ── PROCESSED FOODS (86–95) ────────────────────────────────────
  { id: 86, name: "Dried Mopane Worms",         category: "Processed Foods", price: 180,    unit: "kg",    quantity: 100,   quantityUnit: "kg",    seller: "Lahja Shikongo",           region: "Oshana",         organic: false, featured: false, image: img("mopane-worms.png") },
  { id: 87, name: "Biltong Game Meat",          category: "Processed Foods", price: 320,    unit: "kg",    quantity: 50,    quantityUnit: "kg",    seller: "Cronje Game Farm",         region: "Otjozondjupa",   organic: false, featured: false, image: img("biltong.png") },
  { id: 88, name: "Droëwors",                   category: "Processed Foods", price: 280,    unit: "kg",    quantity: 40,    quantityUnit: "kg",    seller: "Roelf Cronje",             region: "Otjozondjupa",   organic: false, featured: false, image: img("biltong.png") },
  { id: 89, name: "Mixed Fruit Jam",            category: "Processed Foods", price: 55,     unit: "jar",   quantity: 150,   quantityUnit: "jars",  seller: "Kavango Community Kitchen", region: "Kavango East",  organic: true,  featured: false, image: img("fruit-jam.png") },
  { id: 90, name: "Dried Mango Slices",         category: "Processed Foods", price: 95,     unit: "kg",    quantity: 80,    quantityUnit: "kg",    seller: "Alfons Simasiku",          region: "Kavango East",   organic: true,  featured: false, image: img("mangoes.png") },
  { id: 91, name: "Tomato Sauce Bottled",       category: "Processed Foods", price: 42,     unit: "bottle", quantity: 200, quantityUnit: "bottles", seller: "Hardap Produce Coop",    region: "Hardap",         organic: false, featured: false, image: img("tomatoes.png") },
  { id: 92, name: "Groundnut Paste",            category: "Processed Foods", price: 68,     unit: "kg",    quantity: 120,   quantityUnit: "kg",    seller: "Elizabeth Amunyela",       region: "Ohangwena",      organic: true,  featured: false, image: img("groundnuts.png") },
  { id: 93, name: "Sun-Dried Tomatoes",         category: "Processed Foods", price: 145,    unit: "kg",    quantity: 60,    quantityUnit: "kg",    seller: "Suzan Nambahu",            region: "Hardap",         organic: false, featured: false, image: img("tomatoes.png") },
  { id: 94, name: "Chilli Sauce",               category: "Processed Foods", price: 55,     unit: "bottle", quantity: 250, quantityUnit: "bottles", seller: "Victor Mwandingi",        region: "Oshana",         organic: false, featured: false, image: img("peppers.png") },
  { id: 95, name: "Marula Jam",                 category: "Processed Foods", price: 75,     unit: "jar",   quantity: 100,   quantityUnit: "jars",  seller: "Veronica Tjiueza",         region: "Otjozondjupa",   organic: true,  featured: false, image: img("fruit-jam.png") },

  // ── LANDSHARE (96–97) ──────────────────────────────────────────
  { id: 96, name: "LandShare — 5 Hectares Hardap", category: "LandShare",   price: 0,       unit: "20% harvest share", quantity: 1, quantityUnit: "plots", seller: "Danie Visser",  region: "Hardap",         organic: false, featured: false, image: img("farmland-aerial.png") },
  { id: 97, name: "LandShare — 12 Hectares Omaheke", category: "LandShare", price: 800,     unit: "month", quantity: 1,     quantityUnit: "plots", seller: "Kazarura Family",          region: "Omaheke",        organic: false, featured: false, image: img("farmland-aerial.png") },

  // ── ENERGY (98–100) ────────────────────────────────────────────
  { id: 98, name: "Solar Irrigation System",    category: "Energy",          price: 8500,    unit: "unit",  quantity: 1,     quantityUnit: "units", seller: "Thomas Haufiku",           region: "Khomas",         organic: false, featured: false, image: img("solar-irrigation.png") },
  { id: 99, name: "Drip Irrigation Kit 1 Ha",   category: "Energy",          price: 4200,    unit: "kit",   quantity: 10,    quantityUnit: "kits",  seller: "AquaFarm Supplies",        region: "Hardap",         organic: false, featured: false, image: img("solar-irrigation.png") },
  { id: 100, name: "5,000L Water Tank",         category: "Energy",          price: 3800,    unit: "unit",  quantity: 8,     quantityUnit: "units", seller: "Mwandingi Holdings",       region: "Oshana",         organic: false, featured: false, image: img("farmland-aerial.png") },
];
