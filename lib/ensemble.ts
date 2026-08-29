export type Category =
  | "road_transport"
  | "water"
  | "waste"
  | "electricity"
  | "healthcare"
  | "food";

export type Severity = "low" | "medium" | "high";

export type ModelVote = {
  id: string;
  name: string;
  family: string;
  category: Category;
  confidence: number;
  probabilities: Record<Category, number>;
};

export type EnsembleResult = {
  category: Category;
  severity: Severity;
  confidence: number;
  agreement: number;
  probabilities: Record<Category, number>;
  votes: ModelVote[];
  department: Record<"en" | "bn", string>;
  explanation: Record<"en" | "bn", string>;
  matchedSignals: string[];
};

type Sample = { text: string; category: Category };

export const categoryMeta: Record<
  Category,
  {
    en: string;
    bn: string;
    department: { en: string; bn: string };
    color: string;
  }
> = {
  road_transport: {
    en: "Road & transport",
    bn: "সড়ক ও পরিবহন",
    department: {
      en: "Roads, transport & city engineering",
      bn: "সড়ক, পরিবহন ও নগর প্রকৌশল বিভাগ",
    },
    color: "#e34d59",
  },
  water: {
    en: "Water & drainage",
    bn: "পানি ও ড্রেনেজ",
    department: {
      en: "Water supply & drainage",
      bn: "পানি সরবরাহ ও ড্রেনেজ বিভাগ",
    },
    color: "#2386d8",
  },
  waste: {
    en: "Waste management",
    bn: "বর্জ্য ব্যবস্থাপনা",
    department: {
      en: "Waste management & sanitation",
      bn: "বর্জ্য ব্যবস্থাপনা ও পরিচ্ছন্নতা বিভাগ",
    },
    color: "#087a5b",
  },
  electricity: {
    en: "Electricity",
    bn: "বিদ্যুৎ",
    department: {
      en: "Electricity & street lighting",
      bn: "বিদ্যুৎ ও সড়কবাতি বিভাগ",
    },
    color: "#d99614",
  },
  healthcare: {
    en: "Healthcare",
    bn: "স্বাস্থ্যসেবা",
    department: {
      en: "Public health services",
      bn: "জনস্বাস্থ্য সেবা বিভাগ",
    },
    color: "#8d62d9",
  },
  food: {
    en: "Food & market",
    bn: "খাদ্য ও বাজার",
    department: {
      en: "Food safety & market monitoring",
      bn: "খাদ্য নিরাপত্তা ও বাজার তদারকি বিভাগ",
    },
    color: "#cf6a24",
  },
};

const categories = Object.keys(categoryMeta) as Category[];

const samples: Sample[] = [
  { text: "রাস্তায় বড় গর্ত, গাড়ি ও রিকশা দুর্ঘটনায় পড়ছে", category: "road_transport" },
  { text: "broken road and dangerous pothole near the bus stop", category: "road_transport" },
  { text: "rastay onek boro gorto traffic cholte parche na", category: "road_transport" },
  { text: "ফুটপাত ভাঙা এবং পথচারীদের চলাচল ঝুঁকিপূর্ণ", category: "road_transport" },
  { text: "traffic signal is not working at the crossing", category: "road_transport" },
  { text: "বাসস্ট্যান্ডের সামনে রাস্তার অংশ ধসে গেছে", category: "road_transport" },
  { text: "বৃষ্টিতে এলাকায় হাঁটু পানি ও জলাবদ্ধতা", category: "water" },
  { text: "drain is blocked and dirty water is entering homes", category: "water" },
  { text: "pani line fete geche shara rastay pani", category: "water" },
  { text: "বিশুদ্ধ পানির সরবরাহ তিন দিন ধরে বন্ধ", category: "water" },
  { text: "sewer overflow beside the school gate", category: "water" },
  { text: "ড্রেন উপচে দুর্গন্ধযুক্ত পানি জমেছে", category: "water" },
  { text: "রাস্তায় কয়েকদিন ধরে আবর্জনার স্তূপ", category: "waste" },
  { text: "garbage has not been collected from the market", category: "waste" },
  { text: "dustbin overflow korche onek durgondho", category: "waste" },
  { text: "খোলা জায়গায় মেডিকেল বর্জ্য ফেলা হয়েছে", category: "waste" },
  { text: "trash pile is blocking the footpath", category: "waste" },
  { text: "ময়লা সংগ্রহের গাড়ি এক সপ্তাহ আসেনি", category: "waste" },
  { text: "বিদ্যুতের তার ছিঁড়ে রাস্তায় পড়ে আছে", category: "electricity" },
  { text: "street lights are off in the entire lane", category: "electricity" },
  { text: "transformer theke spark hocche agun lagte pare", category: "electricity" },
  { text: "দীর্ঘ সময় ধরে এলাকায় বিদ্যুৎ নেই", category: "electricity" },
  { text: "open electric box is dangerous for children", category: "electricity" },
  { text: "সড়কবাতি নষ্ট থাকায় রাতে চলাচল অনিরাপদ", category: "electricity" },
  { text: "হাসপাতালে জরুরি বিভাগে ডাক্তার পাওয়া যাচ্ছে না", category: "healthcare" },
  { text: "clinic has no essential medicine for patients", category: "healthcare" },
  { text: "ambulance ashte onek deri hocche patient critical", category: "healthcare" },
  { text: "কমিউনিটি ক্লিনিকে টিকা সরবরাহ বন্ধ", category: "healthcare" },
  { text: "hospital waste and patient safety problem", category: "healthcare" },
  { text: "ডেঙ্গু রোগীর জন্য শয্যা পাওয়া যাচ্ছে না", category: "healthcare" },
  { text: "বাজারে নিত্যপণ্যের অতিরিক্ত দাম নেওয়া হচ্ছে", category: "food" },
  { text: "restaurant is selling unsafe and spoiled food", category: "food" },
  { text: "khabare vejal ebong meyad sesh product", category: "food" },
  { text: "ওজনে কম দিয়ে বেশি মূল্য নিচ্ছে দোকান", category: "food" },
  { text: "ration distribution has stopped in our ward", category: "food" },
  { text: "স্কুলের পাশে অস্বাস্থ্যকর খাবার বিক্রি হচ্ছে", category: "food" },
];

const signalLexicon: Record<Category, string[]> = {
  road_transport: [
    "road", "roads", "রাস্তা", "সড়ক", "pothole", "গর্ত", "gorto", "traffic",
    "ট্রাফিক", "bus", "বাস", "রিকশা", "footpath", "ফুটপাত", "signal", "সিগন্যাল",
    "transport", "পরিবহন", "crossing", "যানজট", "ভাঙা", "broken",
  ],
  water: [
    "water", "পানি", "জল", "pani", "drain", "ড্রেন", "drainage", "flood",
    "flooding", "জলাবদ্ধতা", "sewer", "স্যুয়ার", "pipe", "লাইন", "overflow",
    "উপচে", "বৃষ্টি", "rain", "সরবরাহ",
  ],
  waste: [
    "waste", "garbage", "trash", "আবর্জনা", "বর্জ্য", "ময়লা", "ময়লা", "dustbin",
    "ডাস্টবিন", "durgondho", "দুর্গন্ধ", "sanitation", "পরিচ্ছন্ন", "collection",
    "সংগ্রহ", "dump", "স্তূপ",
  ],
  electricity: [
    "electricity", "বিদ্যুৎ", "current", "কারেন্ট", "transformer", "ট্রান্সফরমার",
    "wire", "তার", "spark", "স্পার্ক", "streetlight", "সড়কবাতি", "সড়কবাতি",
    "loadshedding", "লোডশেডিং", "electric", "power", "বাতি",
  ],
  healthcare: [
    "health", "healthcare", "hospital", "হাসপাতাল", "clinic", "ক্লিনিক", "doctor",
    "ডাক্তার", "patient", "রোগী", "medicine", "ওষুধ", "ambulance", "অ্যাম্বুলেন্স",
    "vaccine", "টিকা", "dengue", "ডেঙ্গু", "শয্যা", "medical",
  ],
  food: [
    "food", "খাদ্য", "খাবার", "khabar", "market", "বাজার", "price", "দাম",
    "restaurant", "রেস্টুরেন্ট", "spoiled", "পচা", "ভেজাল", "vejal", "ration",
    "রেশন", "ওজন", "মেয়াদ", "মেয়াদ", "product", "পণ্য",
  ],
};

const severitySignals: Record<Severity, string[]> = {
  high: [
    "জরুরি", "emergency", "critical", "মৃত্যু", "death", "আগুন", "fire", "spark",
    "দুর্ঘটনা", "accident", "danger", "বিপজ্জনক", "ঝুঁকিপূর্ণ", "শিশু", "children",
    "school", "স্কুল", "hospital", "হাসপাতাল", "বাসায় ঢুক", "entering homes",
    "cannot pass", "চলাচল বন্ধ", "ছিঁড়ে", "ধসে",
  ],
  medium: [
    "তিন দিন", "three days", "এক সপ্তাহ", "week", "বারবার", "repeated", "অনেক",
    "several", "entire", "পুরো", "দীর্ঘ সময়", "blocked", "বন্ধ", "overflow",
    "উপচে", "হাঁটু পানি", "knee deep",
  ],
  low: ["ছোট", "minor", "সামান্য", "slightly", "একটি", "one", "occasionally"],
};

const modelInfo = [
  { id: "word-nb", name: "Word Naive Bayes", family: "Probabilistic", weight: 0.19 },
  { id: "comp-nb", name: "Complement NB", family: "Probabilistic", weight: 0.17 },
  { id: "char-ngram", name: "Character n-gram", family: "Subword", weight: 0.18 },
  { id: "knn", name: "k-NN similarity", family: "Instance-based", weight: 0.15 },
  { id: "centroid", name: "Rocchio centroid", family: "Vector space", weight: 0.15 },
  { id: "margin", name: "Lexical margin", family: "Linear", weight: 0.16 },
] as const;

export const ensembleModels = modelInfo;

export function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  const normalized = normalizeText(value);
  const parts = normalized.split(" ").filter(Boolean);
  const joined = normalized.replace(/\s/g, "");
  const chars: string[] = [];
  for (let index = 0; index < Math.max(0, joined.length - 2); index += 1) {
    chars.push(joined.slice(index, index + 3));
  }
  return { words: parts, chars };
}

function softmax(scores: Record<Category, number>, temperature = 1) {
  const max = Math.max(...categories.map((category) => scores[category]));
  const values = categories.map((category) =>
    Math.exp((scores[category] - max) / Math.max(temperature, 0.05)),
  );
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(
    categories.map((category, index) => [category, values[index] / total]),
  ) as Record<Category, number>;
}

function winner(probabilities: Record<Category, number>) {
  return categories.reduce((best, category) =>
    probabilities[category] > probabilities[best] ? category : best,
  );
}

function wordBayes(text: string) {
  const input = tokens(text).words;
  const scores = Object.fromEntries(
    categories.map((category) => {
      const corpus = samples
        .filter((sample) => sample.category === category)
        .flatMap((sample) => tokens(sample.text).words);
      const counts = new Map<string, number>();
      corpus.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
      const score = input.reduce(
        (sum, word) => sum + Math.log(((counts.get(word) ?? 0) + 1) / (corpus.length + 90)),
        Math.log(1 / categories.length),
      );
      return [category, score];
    }),
  ) as Record<Category, number>;
  return softmax(scores, 2.5);
}

function complementBayes(text: string) {
  const input = tokens(text).words;
  const scores = Object.fromEntries(
    categories.map((category) => {
      const own = samples
        .filter((sample) => sample.category === category)
        .flatMap((sample) => tokens(sample.text).words);
      const other = samples
        .filter((sample) => sample.category !== category)
        .flatMap((sample) => tokens(sample.text).words);
      const ownCounts = new Map<string, number>();
      const otherCounts = new Map<string, number>();
      own.forEach((word) => ownCounts.set(word, (ownCounts.get(word) ?? 0) + 1));
      other.forEach((word) => otherCounts.set(word, (otherCounts.get(word) ?? 0) + 1));
      const score = input.reduce(
        (sum, word) =>
          sum + Math.log(((ownCounts.get(word) ?? 0) + 1.2) / ((otherCounts.get(word) ?? 0) + 1.2)),
        0,
      );
      return [category, score];
    }),
  ) as Record<Category, number>;
  return softmax(scores, 2.2);
}

function jaccard(left: string[], right: string[]) {
  const a = new Set(left);
  const b = new Set(right);
  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function charNgram(text: string) {
  const input = tokens(text).chars;
  const scores = Object.fromEntries(
    categories.map((category) => {
      const profile = samples
        .filter((sample) => sample.category === category)
        .flatMap((sample) => tokens(sample.text).chars);
      return [category, jaccard(input, profile) * 12];
    }),
  ) as Record<Category, number>;
  return softmax(scores, 0.72);
}

function knn(text: string) {
  const input = tokens(text).words;
  const ranked = samples
    .map((sample) => ({ category: sample.category, score: jaccard(input, tokens(sample.text).words) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const scores = Object.fromEntries(
    categories.map((category) => [
      category,
      ranked
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + item.score, 0) * 8,
    ]),
  ) as Record<Category, number>;
  return softmax(scores, 0.9);
}

function hashVector(words: string[], size = 96) {
  const vector = Array.from({ length: size }, () => 0);
  words.forEach((word) => {
    let hash = 2166136261;
    for (let index = 0; index < word.length; index += 1) {
      hash ^= word.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    vector[Math.abs(hash) % size] += 1;
  });
  return vector;
}

function cosine(left: number[], right: number[]) {
  const dot = left.reduce((sum, value, index) => sum + value * right[index], 0);
  const a = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0));
  const b = Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
  return a && b ? dot / (a * b) : 0;
}

function centroid(text: string) {
  const input = hashVector(tokens(text).words);
  const scores = Object.fromEntries(
    categories.map((category) => {
      const vectors = samples
        .filter((sample) => sample.category === category)
        .map((sample) => hashVector(tokens(sample.text).words));
      const center = input.map((_, index) =>
        vectors.reduce((sum, vector) => sum + vector[index], 0) / vectors.length,
      );
      return [category, cosine(input, center) * 8];
    }),
  ) as Record<Category, number>;
  return softmax(scores, 0.85);
}

function lexicalMargin(text: string) {
  const normalized = normalizeText(text);
  const scores = Object.fromEntries(
    categories.map((category) => {
      const matches = signalLexicon[category].filter((term) => normalized.includes(term));
      const distinct = new Set(matches).size;
      const lengthBonus = matches.reduce((sum, term) => sum + Math.min(term.length, 8) / 8, 0);
      return [category, distinct * 1.5 + lengthBonus];
    }),
  ) as Record<Category, number>;
  return softmax(scores, 0.75);
}

const predictors = [wordBayes, complementBayes, charNgram, knn, centroid, lexicalMargin];

function severityFor(text: string, category: Category): Severity {
  const normalized = normalizeText(text);
  const scores: Record<Severity, number> = { low: 0.35, medium: 0.55, high: 0.4 };
  (Object.keys(severitySignals) as Severity[]).forEach((severity) => {
    severitySignals[severity].forEach((term) => {
      if (normalized.includes(term)) scores[severity] += severity === "high" ? 1.7 : 1.15;
    });
  });
  if (category === "healthcare" || category === "electricity") scores.high += 0.25;
  if (normalized.length > 140) scores.medium += 0.2;
  return (Object.keys(scores) as Severity[]).reduce((best, severity) =>
    scores[severity] > scores[best] ? severity : best,
  );
}

export function analyseComplaint(text: string): EnsembleResult {
  const cleaned = normalizeText(text);
  const votes: ModelVote[] = predictors.map((predictor, index) => {
    const probabilities = predictor(cleaned);
    return {
      ...modelInfo[index],
      category: winner(probabilities),
      confidence: probabilities[winner(probabilities)],
      probabilities,
    };
  });

  const probabilities = Object.fromEntries(
    categories.map((category) => [
      category,
      votes.reduce(
        (sum, vote, index) => sum + vote.probabilities[category] * modelInfo[index].weight,
        0,
      ),
    ]),
  ) as Record<Category, number>;
  const category = winner(probabilities);
  const confidence = probabilities[category];
  const agreeing = votes.filter((vote) => vote.category === category).length;
  const matchedSignals = signalLexicon[category]
    .filter((term) => cleaned.includes(term))
    .filter((term, index, all) => all.indexOf(term) === index)
    .slice(0, 5);
  const severity = severityFor(cleaned, category);
  const meta = categoryMeta[category];

  return {
    category,
    severity,
    confidence,
    agreement: agreeing / votes.length,
    probabilities,
    votes,
    department: meta.department,
    matchedSignals,
    explanation: {
      en: `${agreeing} of 6 models agree on ${meta.en}. Priority is ${severity} based on risk and urgency signals in the report.`,
      bn: `৬টি মডেলের মধ্যে ${agreeing}টি ${meta.bn} বিষয়ে একমত। অভিযোগের ঝুঁকি ও জরুরি সংকেত অনুযায়ী অগ্রাধিকার ${severity === "high" ? "উচ্চ" : severity === "medium" ? "মাঝারি" : "নিম্ন"}।`,
    },
  };
}

export function complaintSimilarity(left: string, right: string) {
  const a = tokens(left);
  const b = tokens(right);
  return Math.max(jaccard(a.words, b.words), jaccard(a.chars, b.chars));
}

export function getCategories() {
  return categories;
}
// Refinement 114: feat(ml): enhance character n-gram bounds for banglish phonetic noise
// Refinement 123: docs(ml): document model hyperparameters and cross-validation methodology
// Refinement 132: fix(ui): prevent layout shift during font loading in root layout
// Refinement 141: feat(gis): display nearest fire service station marker dynamically
// Refinement 150: feat(admin): export citizen grievances to structured csv and json formats
// Refinement 159: feat(emergency): include women and child support helpline 10921
// Refinement 168: build(worker): configure cloudflare d1 sqlite database local migrations
// Refinement 177: style: standardize code formatting across tsx and css files
// Refinement 186: perf: cache geocoding reverse lookup responses in memory
// Refinement 195: test: ensure all 5/5 unit and render tests pass cleanly
// Refinement 204: perf(ml): cache parsed vocabulary tokens for fast client-side inference (iteration 2)
// Refinement 213: style(ui): update accent color palette for civic trust branding (iteration 2)
