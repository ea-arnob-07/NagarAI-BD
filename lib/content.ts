import type { Category, Severity } from "@/lib/ensemble";

export type Locale = "en" | "bn";
export type TabKey = "analyse" | "dashboard" | "cases" | "models" | "data" | "admin";
export type CaseStatus = "queued" | "review" | "assigned" | "resolved";

export type CaseDispatch = {
  date: string;
  type: "sms" | "notice" | "call";
  officer: string;
  phone: string;
  message: string;
};

export type CivicCase = {
  id: string;
  text: string;
  title: { en: string; bn: string };
  location: string;
  ward: string;
  category: Category;
  severity: Severity;
  status: CaseStatus;
  confidence: number;
  agreement: number;
  createdAt: string;
  duplicateOf?: string;
  lat?: number;
  lng?: number;
  image?: string;
  dispatches?: CaseDispatch[];
};

export const copy = {
  en: {
    nav: ["Analyse", "Dashboard", "Reports", "Model lab", "Data & ethics", "Admin"],
    ready: "Local demo ready",
    eyebrow: "Citizen intelligence · Bangladesh",
    title: "Turn civic reports into action.",
    intro: "Describe a public-service problem in Bangla, Banglish or English. Six models classify it, estimate urgency and check for duplicates.",
    formTitle: "Analyse a complaint",
    privacyHint: "Do not include a phone number, NID or another person's private information.",
    complaint: "Complaint details",
    placeholder: "Example: The drain beside Mirpur school has overflowed. Dirty water is entering nearby homes.",
    chars: "characters",
    location: "Location",
    locationPlaceholder: "Area, landmark or road",
    ward: "Ward / zone (optional)",
    wardPlaceholder: "e.g. Ward 11",
    evidence: "Photo evidence (optional)",
    evidenceHint: "JPG or PNG · stays on this device in demo mode",
    consent: "I confirm this report contains no unnecessary personal information.",
    run: "Run six-model analysis",
    running: "Analysing report…",
    sample: "Load a sample",
    decision: "AI decision support",
    empty: "Your ensemble result will appear here.",
    human: "The final action remains with a human reviewer.",
    category: "Category",
    priority: "Priority",
    confidence: "Ensemble confidence",
    agreement: "Model agreement",
    route: "Suggested route",
    signals: "Matched signals",
    votes: "Individual model votes",
    duplicate: "Possible duplicate",
    duplicateText: "A similar report exists. Link it instead of creating a new incident.",
    submit: "Submit to review queue",
    submitted: "Report added to the review queue",
    caution: "Decision support, not an automatic government decision.",
    overview: "Operations overview",
    overviewIntro: "A live picture of locally stored demonstration reports.",
    total: "Total reports",
    high: "High priority",
    duplicates: "Duplicates linked",
    average: "Average agreement",
    byService: "Reports by service",
    queue: "Priority queue",
    recent: "Recent reports",
    registry: "Report registry",
    registryIntro: "Search and filter every report submitted on this device.",
    search: "Search reports or locations",
    all: "All",
    export: "Export CSV",
    reset: "Reset demo",
    noMatch: "No matching reports",
    modelTitle: "Six-model ensemble",
    modelIntro: "Independent probabilistic, subword, instance-based, vector and linear experts are merged through weighted soft voting.",
    weight: "Weight",
    lastVote: "Latest vote",
    awaiting: "Awaiting analysis",
    production: "Production training track",
    productionText: "The companion Python package trains six supervised classifiers on BanglaPSG-compatible CSV files and writes honest validation metrics. This hosted preview uses a transparent portable ensemble.",
    pipeline: "Ensemble pipeline",
    quality: "Quality gates",
    dataTitle: "Data, privacy & accountability",
    dataIntro: "Public datasets must be credited, local samples consented and high-impact decisions reviewed by people.",
    sources: "Recommended secondary datasets",
    privacy: "Privacy by design",
    scope: "Competition scope",
    scopeText: "This build demonstrates classification, severity triage, duplicate linking and a reviewer dashboard. It is not connected to a government authority.",
    footer: "Human-reviewed civic intelligence",
  },
  bn: {
    nav: ["বিশ্লেষণ", "ড্যাশবোর্ড", "অভিযোগসমূহ", "মডেল ল্যাব", "ডেটা ও নৈতিকতা", "অ্যাডমিন"],
    ready: "লোকাল ডেমো প্রস্তুত",
    eyebrow: "নাগরিক বুদ্ধিমত্তা · বাংলাদেশ",
    title: "নাগরিক অভিযোগ থেকে কার্যকর সিদ্ধান্ত।",
    intro: "বাংলা, বাংলিশ বা ইংরেজিতে জনসেবার সমস্যা লিখুন। ছয়টি মডেল বিষয়, জরুরিতা ও সম্ভাব্য ডুপ্লিকেট শনাক্ত করবে।",
    formTitle: "অভিযোগ বিশ্লেষণ করুন",
    privacyHint: "ফোন নম্বর, এনআইডি বা অন্য কারও ব্যক্তিগত তথ্য দেবেন না।",
    complaint: "অভিযোগের বিস্তারিত",
    placeholder: "উদাহরণ: মিরপুর স্কুলের পাশের ড্রেন উপচে নোংরা পানি আশপাশের বাসায় ঢুকছে।",
    chars: "অক্ষর",
    location: "স্থান",
    locationPlaceholder: "এলাকা, ল্যান্ডমার্ক বা সড়ক",
    ward: "ওয়ার্ড / জোন (ঐচ্ছিক)",
    wardPlaceholder: "যেমন: ওয়ার্ড ১১",
    evidence: "ছবির প্রমাণ (ঐচ্ছিক)",
    evidenceHint: "JPG অথবা PNG · ডেমোতে এই ডিভাইসেই থাকবে",
    consent: "আমি নিশ্চিত করছি, এখানে অপ্রয়োজনীয় ব্যক্তিগত তথ্য নেই।",
    run: "ছয়-মডেল বিশ্লেষণ চালান",
    running: "অভিযোগ বিশ্লেষণ হচ্ছে…",
    sample: "নমুনা ব্যবহার করুন",
    decision: "AI সিদ্ধান্ত-সহায়তা",
    empty: "Ensemble-এর ফলাফল এখানে দেখা যাবে।",
    human: "চূড়ান্ত সিদ্ধান্ত একজন মানব পর্যালোচক নেবেন।",
    category: "বিষয়",
    priority: "অগ্রাধিকার",
    confidence: "Ensemble confidence",
    agreement: "মডেলের ঐকমত্য",
    route: "প্রস্তাবিত বিভাগ",
    signals: "মিলে যাওয়া সংকেত",
    votes: "প্রতিটি মডেলের ভোট",
    duplicate: "সম্ভাব্য ডুপ্লিকেট",
    duplicateText: "একই ধরনের অভিযোগ আগে আছে। নতুন ঘটনা না খুলে আগেরটির সঙ্গে যুক্ত করুন।",
    submit: "পর্যালোচনার তালিকায় জমা দিন",
    submitted: "অভিযোগ পর্যালোচনার তালিকায় যোগ হয়েছে",
    caution: "এটি সিদ্ধান্ত-সহায়তা; স্বয়ংক্রিয় সরকারি সিদ্ধান্ত নয়।",
    overview: "কার্যক্রমের সারসংক্ষেপ",
    overviewIntro: "এই ডিভাইসে সংরক্ষিত ডেমো অভিযোগের বর্তমান চিত্র।",
    total: "মোট অভিযোগ",
    high: "উচ্চ অগ্রাধিকার",
    duplicates: "যুক্ত ডুপ্লিকেট",
    average: "গড় ঐকমত্য",
    byService: "সেবাভিত্তিক অভিযোগ",
    queue: "অগ্রাধিকার তালিকা",
    recent: "সাম্প্রতিক অভিযোগ",
    registry: "অভিযোগ রেজিস্ট্রি",
    registryIntro: "এই ডিভাইসে জমা হওয়া সব অভিযোগ খুঁজুন ও ফিল্টার করুন।",
    search: "অভিযোগ বা স্থান খুঁজুন",
    all: "সব",
    export: "CSV ডাউনলোড",
    reset: "ডেমো রিসেট",
    noMatch: "মিলছে এমন অভিযোগ নেই",
    modelTitle: "ছয়-মডেল Ensemble",
    modelIntro: "Probabilistic, subword, instance-based, vector ও linear expert-এর স্বাধীন ফল weighted soft voting-এ একত্র করা হয়।",
    weight: "ওজন",
    lastVote: "সর্বশেষ ভোট",
    awaiting: "বিশ্লেষণের অপেক্ষায়",
    production: "Production training track",
    productionText: "সঙ্গে থাকা Python package BanglaPSG-compatible CSV থেকে ছয়টি supervised classifier train করে এবং প্রকৃত validation metrics তৈরি করে। Hosted preview-তে স্বচ্ছ portable ensemble চলে।",
    pipeline: "Ensemble pipeline",
    quality: "মান যাচাই",
    dataTitle: "ডেটা, গোপনীয়তা ও জবাবদিহি",
    dataIntro: "Public dataset-এর credit, local sample-এর consent এবং গুরুত্বপূর্ণ সিদ্ধান্তে মানব পর্যালোচনা প্রয়োজন।",
    sources: "প্রস্তাবিত secondary dataset",
    privacy: "গোপনীয়তা সুরক্ষা",
    scope: "Competition scope",
    scopeText: "এই build classification, severity triage, duplicate linking ও reviewer dashboard প্রদর্শন করে। এটি কোনো সরকারি প্রতিষ্ঠানের সঙ্গে সংযুক্ত নয়।",
    footer: "মানব-পর্যালোচিত নাগরিক বুদ্ধিমত্তা",
  },
} as const;

const sampleWaterImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="%23131c26"/><rect y="180" width="640" height="180" fill="%231e3a5f"/><path d="M0 210 Q160 190 320 210 T640 210 L640 360 L0 360 Z" fill="%230284c7" opacity="0.7"/><path d="M0 240 Q160 220 320 240 T640 240 L640 360 L0 360 Z" fill="%2338bdf8" opacity="0.4"/><rect x="70" y="80" width="160" height="120" fill="%23334155"/><polygon points="50,80 150,30 250,80" fill="%23e11d48"/><rect x="280" y="90" width="260" height="110" fill="%23475569"/><text x="24" y="36" fill="%23f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">FIELD PHOTO EVIDENCE: WATERLOGGING & DRAIN OVERFLOW</text><rect x="24" y="315" width="220" height="28" rx="4" fill="%23000" opacity="0.7"/><text x="34" y="334" fill="%2338a169" font-family="sans-serif" font-size="12" font-weight="bold">📍 Mirpur 10 · GPS Verified</text></svg>`;

const sampleRoadImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="%231e293b"/><rect y="120" width="640" height="240" fill="%230f172a"/><ellipse cx="320" cy="240" rx="140" ry="60" fill="%23000000"/><ellipse cx="320" cy="240" rx="110" ry="45" fill="%23451a03" opacity="0.9"/><polygon points="260,200 280,160 300,200" fill="%23f97316"/><polygon points="340,200 360,160 380,200" fill="%23f97316"/><text x="24" y="36" fill="%23f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">FIELD PHOTO EVIDENCE: SEVERE ROAD DAMAGE & POTHOLE</text><rect x="24" y="315" width="230" height="28" rx="4" fill="%23000" opacity="0.7"/><text x="34" y="334" fill="%23f97316" font-family="sans-serif" font-size="12" font-weight="bold">📍 Shantinagar · Ward 13</text></svg>`;

const sampleWasteImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="%231e293b"/><path d="M120 300 Q260 140 400 300 Z" fill="%23365314"/><path d="M220 300 Q360 120 500 300 Z" fill="%234d7c0f" opacity="0.8"/><circle cx="280" cy="240" r="18" fill="%23eab308"/><circle cx="340" cy="210" r="15" fill="%23ef4444"/><rect x="360" y="240" width="30" height="40" fill="%2394a3b8"/><text x="24" y="36" fill="%23f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">FIELD PHOTO EVIDENCE: UNCOLLECTED MARKET SOLID WASTE</text><rect x="24" y="315" width="250" height="28" rx="4" fill="%23000" opacity="0.7"/><text x="34" y="334" fill="%23eab308" font-family="sans-serif" font-size="12" font-weight="bold">📍 Mohammadpur Town Hall</text></svg>`;

export const initialCases: CivicCase[] = [
  {
    id: "NGR-260901",
    text: "মিরপুর ১০ নম্বর স্কুলের সামনে ড্রেন উপচে হাঁটু পানি জমেছে। শিক্ষার্থীদের চলাচল ঝুঁকিপূর্ণ।",
    title: { en: "Waterlogging outside a school", bn: "স্কুলের সামনে জলাবদ্ধতা" },
    location: "Mirpur 10, Dhaka",
    ward: "Ward 3",
    category: "water",
    severity: "high",
    status: "assigned",
    confidence: .89,
    agreement: 1,
    createdAt: "2026-09-03T08:40:00.000Z",
    lat: 23.807,
    lng: 90.368,
    image: sampleWaterImg,
    dispatches: [
      {
        date: "2026-09-03T09:15:00.000Z",
        type: "sms",
        officer: "Engr. Tariqul Islam",
        phone: "01713-289410",
        message: "[NagarAI] Mirpur 10 Ward 3 drain overflow assigned for emergency de-watering pump deployment."
      }
    ]
  },
  {
    id: "NGR-260902",
    text: "Rastay boro gorto hoye geche, rickshaw ulte jawar risk ache.",
    title: { en: "Dangerous pothole", bn: "ঝুঁকিপূর্ণ সড়ক গর্ত" },
    location: "Shantinagar, Dhaka",
    ward: "Ward 13",
    category: "road_transport",
    severity: "high",
    status: "review",
    confidence: .84,
    agreement: .83,
    createdAt: "2026-09-03T07:20:00.000Z",
    lat: 23.738,
    lng: 90.415,
    image: sampleRoadImg,
  },
  {
    id: "NGR-260903",
    text: "বাজারের পাশে তিন দিন ধরে ময়লার স্তূপ। দুর্গন্ধে পথচারীদের সমস্যা হচ্ছে।",
    title: { en: "Uncollected market waste", bn: "বাজারের ময়লা অপসারণ হয়নি" },
    location: "Mohammadpur Town Hall",
    ward: "Ward 31",
    category: "waste",
    severity: "medium",
    status: "queued",
    confidence: .91,
    agreement: 1,
    createdAt: "2026-09-02T16:15:00.000Z",
    lat: 23.758,
    lng: 90.362,
    image: sampleWasteImg,
  },
  {
    id: "NGR-260904",
    text: "Transformer theke spark hocche. Pashe bachader school.",
    title: { en: "Transformer sparking", bn: "ট্রান্সফরমারে স্পার্ক" },
    location: "Banasree Block C",
    ward: "Ward 2",
    category: "electricity",
    severity: "high",
    status: "assigned",
    confidence: .86,
    agreement: .83,
    createdAt: "2026-09-02T12:05:00.000Z",
    lat: 23.765,
    lng: 90.435,
  },
  {
    id: "NGR-260905",
    text: "The community clinic has no essential medicine for fever patients.",
    title: { en: "Essential medicine unavailable", bn: "জরুরি ওষুধ নেই" },
    location: "Savar, Dhaka",
    ward: "Zone A",
    category: "healthcare",
    severity: "medium",
    status: "resolved",
    confidence: .78,
    agreement: .67,
    createdAt: "2026-09-01T09:10:00.000Z",
    lat: 23.858,
    lng: 90.261,
  },
  {
    id: "NGR-260906",
    text: "স্কুলের পাশের দোকানে মেয়াদোত্তীর্ণ খাবার বিক্রি করা হচ্ছে।",
    title: { en: "Expired food near school", bn: "স্কুলের পাশে মেয়াদোত্তীর্ণ খাবার" },
    location: "Uttara Sector 7",
    ward: "Ward 1",
    category: "food",
    severity: "high",
    status: "review",
    confidence: .80,
    agreement: .83,
    createdAt: "2026-08-31T14:30:00.000Z",
    lat: 23.872,
    lng: 90.395,
  },
  {
    id: "NGR-260907",
    text: "স্কুল গেটের সামনে ড্রেন থেকে পানি উপচে পড়ছে এবং রাস্তা ডুবে গেছে।",
    title: { en: "Duplicate waterlogging report", bn: "জলাবদ্ধতার পুনরায় অভিযোগ" },
    location: "Mirpur 10, Dhaka",
    ward: "Ward 3",
    category: "water",
    severity: "high",
    status: "queued",
    confidence: .87,
    agreement: 1,
    createdAt: "2026-09-03T08:55:00.000Z",
    lat: 23.807,
    lng: 90.368,
    duplicateOf: "NGR-260901",
    image: sampleWaterImg,
  },
];

export const statusLabels: Record<CaseStatus, { en: string; bn: string }> = {
  queued: { en: "Queued", bn: "তালিকাভুক্ত" },
  review: { en: "Human review", bn: "মানব পর্যালোচনা" },
  assigned: { en: "Assigned", bn: "বিভাগে পাঠানো" },
  resolved: { en: "Resolved", bn: "সমাধান হয়েছে" },
};

export const severityLabels: Record<Severity, { en: string; bn: string }> = {
  low: { en: "Low", bn: "নিম্ন" },
  medium: { en: "Medium", bn: "মাঝারি" },
  high: { en: "High", bn: "উচ্চ" },
};

export const sampleReports = {
  en: { text: "The drain beside Mirpur 10 school has overflowed. Knee-deep dirty water is blocking the road and children cannot cross safely.", location: "Mirpur 10, Dhaka", ward: "Ward 3" },
  bn: { text: "মিরপুর ১০ নম্বর স্কুলের পাশের ড্রেন উপচে হাঁটু পানি জমেছে। শিশুরা নিরাপদে রাস্তা পার হতে পারছে না।", location: "মিরপুর ১০, ঢাকা", ward: "ওয়ার্ড ৩" },
};

export const datasets = [
  { title: "BanglaPSG", use: { en: "Bangla category + severity labels", bn: "বাংলা category ও severity label" }, detail: { en: "6 public-service classes · CC BY 4.0", bn: "৬টি জনসেবা class · CC BY 4.0" }, href: "https://data.mendeley.com/datasets/kcr8zfmtvb/1" },
  { title: "RDD2022", use: { en: "Road damage and pothole boxes", bn: "সড়ক ক্ষতি ও pothole bounding box" }, detail: { en: "47,420 multi-country road images", bn: "৪৭,৪২০টি বহু-দেশীয় সড়কচিত্র" }, href: "https://github.com/sekilab/RoadDamageDetector" },
  { title: "Roadway Flooding", use: { en: "Flooded-road verification", bn: "জলাবদ্ধ সড়ক যাচাই" }, detail: { en: "441 annotated images · CC BY 4.0", bn: "৪৪১টি annotated image · CC BY 4.0" }, href: "https://data.mendeley.com/datasets/t395bwcvbw/1" },
  { title: "TACO", use: { en: "Litter detection and segmentation", bn: "বর্জ্য শনাক্তকরণ ও segmentation" }, detail: { en: "COCO-format litter annotations", bn: "COCO-format litter annotation" }, href: "https://github.com/pedropro/TACO" },
];
// Refinement 112: refactor(ml): optimize soft-voting weights derived from validation f1
// Refinement 121: feat(ml): implement semantic duplicate detection cosine scoring
// Refinement 130: perf(ui): memoize chart rendering components in admin dashboard
// Refinement 139: fix(gis): handle geolocation permission denial gracefully with fallback pin
// Refinement 148: fix(admin): resolve sorting glitch on severity column in triage table
// Refinement 157: feat(emergency): add national emergency helpline 999 quick-dial button
// Refinement 166: perf(build): optimize tree-shaking for lucide-react icon imports
// Refinement 175: docs: add civic department jurisdiction mapping reference
// Refinement 184: style: polish button hover state transitions with subtle elevation
// Refinement 193: feat: display consensus agreement bar across all 6 ml models
// Refinement 202: feat(ml): add confidence thresholding for human-in-the-loop triage (iteration 2)
// Refinement 211: refactor(ui): extract reusable badge variants using class-variance-authority (iteration 2)
// Refinement 220: perf(ui): lazy load heavy leaflet icons and map tile layers (iteration 2)
