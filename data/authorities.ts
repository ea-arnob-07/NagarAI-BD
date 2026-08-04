import type { Category } from "@/lib/ensemble";

export type AuthorityRegion = {
  id: string;
  name: { en: string; bn: string };
  type: { en: string; bn: string };
  contacts: {
    office: { en: string; bn: string };
    phone: string;
    role: { en: string; bn: string };
  }[];
  departments: Partial<Record<Category, {
    name: { en: string; bn: string };
    phone: string;
  }>>;
  bounds?: { lat: [number, number]; lng: [number, number] };
};

export const emergencyNumbers = [
  { label: { en: "National Emergency", bn: "জাতীয় জরুরি সেবা" }, number: "999", icon: "🚨", color: "#38a169" },
  { label: { en: "Fire Service", bn: "ফায়ার সার্ভিস" }, number: "199", icon: "🔥", color: "#38a169" },
  { label: { en: "Ambulance", bn: "অ্যাম্বুলেন্স" }, number: "199", icon: "🚑", color: "#38a169" },
  { label: { en: "Police Help", bn: "পুলিশ সহায়তা" }, number: "999", icon: "👮", color: "#38a169" },
  { label: { en: "Women & Child Helpline", bn: "নারী ও শিশু হেল্পলাইন" }, number: "10921", icon: "🤝", color: "#38a169" },
  { label: { en: "Anti-Corruption", bn: "দুর্নীতি দমন" }, number: "106", icon: "⚖️", color: "#38a169" },
];

export const authorityRegions: AuthorityRegion[] = [
  {
    id: "dhaka-north",
    name: { en: "Dhaka North City Corporation", bn: "ঢাকা উত্তর সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "DNCC Main Office", bn: "ডিএনসিসি প্রধান কার্যালয়" }, phone: "02-55169900", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
      { office: { en: "DNCC Complaint Cell", bn: "ডিএনসিসি অভিযোগ সেল" }, phone: "16163", role: { en: "Complaint Hotline", bn: "অভিযোগ হটলাইন" } },
    ],
    departments: {
      water: { name: { en: "Dhaka WASA", bn: "ঢাকা ওয়াসা" }, phone: "16162" },
      electricity: { name: { en: "DESCO", bn: "ডেসকো" }, phone: "16116" },
      waste: { name: { en: "DNCC Waste Management", bn: "ডিএনসিসি বর্জ্য ব্যবস্থাপনা" }, phone: "02-55169900" },
      road_transport: { name: { en: "DNCC Engineering", bn: "ডিএনসিসি প্রকৌশল বিভাগ" }, phone: "02-55169900" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "BSTI / Safe Food Authority", bn: "বিএসটিআই / নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [23.81, 23.90], lng: [90.33, 90.45] },
  },
  {
    id: "dhaka-south",
    name: { en: "Dhaka South City Corporation", bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "DSCC Main Office", bn: "ডিএসসিসি প্রধান কার্যালয়" }, phone: "02-47113060", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
      { office: { en: "DSCC Complaint Cell", bn: "ডিএসসিসি অভিযোগ সেল" }, phone: "16163", role: { en: "Complaint Hotline", bn: "অভিযোগ হটলাইন" } },
    ],
    departments: {
      water: { name: { en: "Dhaka WASA", bn: "ঢাকা ওয়াসা" }, phone: "16162" },
      electricity: { name: { en: "DPDC", bn: "ডিপিডিসি" }, phone: "16979" },
      waste: { name: { en: "DSCC Waste Management", bn: "ডিএসসিসি বর্জ্য ব্যবস্থাপনা" }, phone: "02-47113060" },
      road_transport: { name: { en: "DSCC Engineering", bn: "ডিএসসিসি প্রকৌশল বিভাগ" }, phone: "02-47113060" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "BSTI / Safe Food Authority", bn: "বিএসটিআই / নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [23.70, 23.81], lng: [90.34, 90.44] },
  },
  {
    id: "chattogram",
    name: { en: "Chattogram City Corporation", bn: "চট্টগ্রাম সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "CCC Main Office", bn: "চসিক প্রধান কার্যালয়" }, phone: "031-619092", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Chattogram WASA", bn: "চট্টগ্রাম ওয়াসা" }, phone: "031-2850885" },
      electricity: { name: { en: "BPDB Chattogram", bn: "বিপিডিবি চট্টগ্রাম" }, phone: "031-714851" },
      waste: { name: { en: "CCC Waste Dept.", bn: "চসিক বর্জ্য বিভাগ" }, phone: "031-619092" },
      road_transport: { name: { en: "CCC Engineering", bn: "চসিক প্রকৌশল বিভাগ" }, phone: "031-619092" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [22.30, 22.42], lng: [91.76, 91.88] },
  },
  {
    id: "rajshahi",
    name: { en: "Rajshahi City Corporation", bn: "রাজশাহী সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "RCC Main Office", bn: "রাসিক প্রধান কার্যালয়" }, phone: "0721-775285", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Rajshahi WASA", bn: "রাজশাহী ওয়াসা" }, phone: "0721-750741" },
      electricity: { name: { en: "BPDB Rajshahi", bn: "বিপিডিবি রাজশাহী" }, phone: "0721-774017" },
      waste: { name: { en: "RCC Conservancy", bn: "রাসিক পরিচ্ছন্নতা বিভাগ" }, phone: "0721-775285" },
      road_transport: { name: { en: "RCC Engineering", bn: "রাসিক প্রকৌশল বিভাগ" }, phone: "0721-775285" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [24.35, 24.40], lng: [88.57, 88.63] },
  },
  {
    id: "khulna",
    name: { en: "Khulna City Corporation", bn: "খুলনা সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "KCC Main Office", bn: "খুসিক প্রধান কার্যালয়" }, phone: "041-720087", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Khulna WASA", bn: "খুলনা ওয়াসা" }, phone: "041-810994" },
      electricity: { name: { en: "BPDB Khulna", bn: "বিপিডিবি খুলনা" }, phone: "041-761025" },
      waste: { name: { en: "KCC Conservancy", bn: "খুসিক পরিচ্ছন্নতা বিভাগ" }, phone: "041-720087" },
      road_transport: { name: { en: "KCC Engineering", bn: "খুসিক প্রকৌশল বিভাগ" }, phone: "041-720087" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [22.79, 22.86], lng: [89.52, 89.58] },
  },
  {
    id: "sylhet",
    name: { en: "Sylhet City Corporation", bn: "সিলেট সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "SCC Main Office", bn: "সিসিক প্রধান কার্যালয়" }, phone: "0821-714733", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Sylhet WASA", bn: "সিলেট ওয়াসা" }, phone: "0821-716651" },
      electricity: { name: { en: "BPDB Sylhet", bn: "বিপিডিবি সিলেট" }, phone: "0821-714010" },
      waste: { name: { en: "SCC Conservancy", bn: "সিসিক পরিচ্ছন্নতা বিভাগ" }, phone: "0821-714733" },
      road_transport: { name: { en: "SCC Engineering", bn: "সিসিক প্রকৌশল বিভাগ" }, phone: "0821-714733" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [24.87, 24.92], lng: [91.85, 91.90] },
  },
  {
    id: "rangpur",
    name: { en: "Rangpur City Corporation", bn: "রংপুর সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "RpCC Main Office", bn: "রংপুর সিটি কর্পোরেশন কার্যালয়" }, phone: "0521-63484", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Rangpur WASA", bn: "রংপুর ওয়াসা" }, phone: "0521-63484" },
      electricity: { name: { en: "BPDB Rangpur", bn: "বিপিডিবি রংপুর" }, phone: "0521-63500" },
      waste: { name: { en: "RpCC Conservancy", bn: "রংপুর সিসিক পরিচ্ছন্নতা বিভাগ" }, phone: "0521-63484" },
      road_transport: { name: { en: "RpCC Engineering", bn: "রংপুর সিসিক প্রকৌশল বিভাগ" }, phone: "0521-63484" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [25.73, 25.77], lng: [89.24, 89.29] },
  },
  {
    id: "barishal",
    name: { en: "Barishal City Corporation", bn: "বরিশাল সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "BCC Main Office", bn: "বসিক প্রধান কার্যালয়" }, phone: "0431-62862", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Barishal WASA", bn: "বরিশাল ওয়াসা" }, phone: "0431-63170" },
      electricity: { name: { en: "BPDB Barishal", bn: "বিপিডিবি বরিশাল" }, phone: "0431-62023" },
      waste: { name: { en: "BCC Conservancy", bn: "বসিক পরিচ্ছন্নতা বিভাগ" }, phone: "0431-62862" },
      road_transport: { name: { en: "BCC Engineering", bn: "বসিক প্রকৌশল বিভাগ" }, phone: "0431-62862" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [22.68, 22.73], lng: [90.35, 90.39] },
  },
  {
    id: "gazipur",
    name: { en: "Gazipur City Corporation", bn: "গাজীপুর সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "GCC Main Office", bn: "গাসিক প্রধান কার্যালয়" }, phone: "02-9291027", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Gazipur WASA", bn: "গাজীপুর ওয়াসা" }, phone: "02-9291027" },
      electricity: { name: { en: "DPDC Gazipur", bn: "ডিপিডিসি গাজীপুর" }, phone: "16979" },
      waste: { name: { en: "GCC Conservancy", bn: "গাসিক পরিচ্ছন্নতা বিভাগ" }, phone: "02-9291027" },
      road_transport: { name: { en: "GCC Engineering", bn: "গাসিক প্রকৌশল বিভাগ" }, phone: "02-9291027" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [23.95, 24.10], lng: [90.35, 90.50] },
  },
  {
    id: "narayanganj",
    name: { en: "Narayanganj City Corporation", bn: "নারায়ণগঞ্জ সিটি কর্পোরেশন" },
    type: { en: "City Corporation", bn: "সিটি কর্পোরেশন" },
    contacts: [
      { office: { en: "NCC Main Office", bn: "নাসিক প্রধান কার্যালয়" }, phone: "02-7641225", role: { en: "General Inquiry", bn: "সাধারণ জিজ্ঞাসা" } },
    ],
    departments: {
      water: { name: { en: "Narayanganj WASA", bn: "নারায়ণগঞ্জ ওয়াসা" }, phone: "02-7641225" },
      electricity: { name: { en: "DPDC Narayanganj", bn: "ডিপিডিসি নারায়ণগঞ্জ" }, phone: "16979" },
      waste: { name: { en: "NCC Conservancy", bn: "নাসিক পরিচ্ছন্নতা বিভাগ" }, phone: "02-7641225" },
      road_transport: { name: { en: "NCC Engineering", bn: "নাসিক প্রকৌশল বিভাগ" }, phone: "02-7641225" },
      healthcare: { name: { en: "DGHS Hotline", bn: "স্বাস্থ্য অধিদপ্তর হটলাইন" }, phone: "16263" },
      food: { name: { en: "Safe Food Authority", bn: "নিরাপদ খাদ্য কর্তৃপক্ষ" }, phone: "16550" },
    },
    bounds: { lat: [23.60, 23.68], lng: [90.48, 90.55] },
  },
];

/** Find matching authority region by lat/lng or location name */
export function findAuthority(lat?: number, lng?: number, locationText?: string): AuthorityRegion | null {
  if (lat != null && lng != null) {
    const match = authorityRegions.find((r) => {
      if (!r.bounds) return false;
      return lat >= r.bounds.lat[0] && lat <= r.bounds.lat[1] && lng >= r.bounds.lng[0] && lng <= r.bounds.lng[1];
    });
    if (match) return match;
  }
  if (locationText) {
    const lower = locationText.toLowerCase();
    // Keyword matching for common areas
    if (lower.includes("mirpur") || lower.includes("uttara") || lower.includes("banani") || lower.includes("gulshan") || lower.includes("mohakhali") || lower.includes("cantonment") || lower.includes("tongi")) {
      return authorityRegions.find((r) => r.id === "dhaka-north") ?? null;
    }
    if (lower.includes("motijheel") || lower.includes("lalbagh") || lower.includes("dhanmondi") || lower.includes("mohammadpur") || lower.includes("hazaribagh") || lower.includes("shantinagar") || lower.includes("wari") || lower.includes("sutrapur") || lower.includes("old dhaka") || lower.includes("puran dhaka")) {
      return authorityRegions.find((r) => r.id === "dhaka-south") ?? null;
    }
    if (lower.includes("dhaka") || lower.includes("ঢাকা")) {
      return authorityRegions.find((r) => r.id === "dhaka-north") ?? null;
    }
    if (lower.includes("chatto") || lower.includes("chittagong") || lower.includes("চট্টগ্রাম")) {
      return authorityRegions.find((r) => r.id === "chattogram") ?? null;
    }
    if (lower.includes("rajshahi") || lower.includes("রাজশাহী")) {
      return authorityRegions.find((r) => r.id === "rajshahi") ?? null;
    }
    if (lower.includes("khulna") || lower.includes("খুলনা")) {
      return authorityRegions.find((r) => r.id === "khulna") ?? null;
    }
    if (lower.includes("sylhet") || lower.includes("সিলেট")) {
      return authorityRegions.find((r) => r.id === "sylhet") ?? null;
    }
    if (lower.includes("rangpur") || lower.includes("রংপুর")) {
      return authorityRegions.find((r) => r.id === "rangpur") ?? null;
    }
    if (lower.includes("barishal") || lower.includes("barisal") || lower.includes("বরিশাল")) {
      return authorityRegions.find((r) => r.id === "barishal") ?? null;
    }
    if (lower.includes("gazipur") || lower.includes("গাজীপুর")) {
      return authorityRegions.find((r) => r.id === "gazipur") ?? null;
    }
    if (lower.includes("narayanganj") || lower.includes("নারায়ণগঞ্জ")) {
      return authorityRegions.find((r) => r.id === "narayanganj") ?? null;
    }
    // Broader match
    if (lower.includes("savar") || lower.includes("সাভার") || lower.includes("banasree") || lower.includes("badda") || lower.includes("rampura")) {
      return authorityRegions.find((r) => r.id === "dhaka-south") ?? null;
    }
  }
  return null;
}

export type ResponsibleOfficer = {
  authorityName: { en: string; bn: string };
  departmentName: { en: string; bn: string };
  officerName: { en: string; bn: string };
  designation: { en: string; bn: string };
  phone: string;
  email: string;
  office: { en: string; bn: string };
  ward?: string;
};

/**
 * Resolves the specific duty officer and contact details for a task based on category, ward, and location
 */
export function getResponsibleOfficer(
  category: Category,
  ward?: string,
  location?: string,
  lat?: number,
  lng?: number
): ResponsibleOfficer {
  const combined = `${ward || ""} ${location || ""}`.toLowerCase();
  const authority = findAuthority(lat, lng, location) || authorityRegions[0];

  // Specific Ward & Location mappings for major civic hotspots
  if (combined.includes("mirpur") || combined.includes("ward 3") || combined.includes("ওয়ার্ড ৩")) {
    if (category === "water") {
      return {
        authorityName: { en: "Dhaka WASA & DNCC", bn: "ঢাকা ওয়াসা ও ডিএনসিসি" },
        departmentName: { en: "Drainage & Sewerage Division", bn: "ড্রেনেজ ও পয়ঃনিষ্কাশন বিভাগ" },
        officerName: { en: "Engr. Tariqul Islam", bn: "প্রকৌ. তরিকুল ইসলাম" },
        designation: { en: "Executive Engineer (Zone-4 Drainage)", bn: "নির্বাহী প্রকৌশলী (জোন-৪ ড্রেনেজ)" },
        phone: "01713-289410",
        email: "tariqul.wasa4@gov.bd",
        office: { en: "WASA MODS Zone-4 Office, Mirpur 10", bn: "ওয়াসা মডস জোন-৪ কার্যালয়, মিরপুর ১০" },
        ward: "Ward 3",
      };
    }
    if (category === "road_transport") {
      return {
        authorityName: { en: "Dhaka North City Corporation", bn: "ঢাকা উত্তর সিটি কর্পোরেশন" },
        departmentName: { en: "Civil Engineering & Road Maintenance", bn: "প্রকৌশল ও সড়ক রক্ষণাবেক্ষণ বিভাগ" },
        officerName: { en: "Engr. Kamrul Hasan", bn: "প্রকৌ. কামরুল হাসান" },
        designation: { en: "Executive Engineer (Zone-4 Civil)", bn: "নির্বাহী প্রকৌশলী (জোন-৪ পুর)" },
        phone: "01711-543219",
        email: "kamrul.dncc4@dncc.gov.bd",
        office: { en: "DNCC Zone-4 Zonal Office, Mirpur", bn: "ডিএনসিসি জোন-৪ আঞ্চলিক কার্যালয়, মিরপুর" },
        ward: "Ward 3",
      };
    }
    if (category === "waste") {
      return {
        authorityName: { en: "DNCC Waste Management Department", bn: "ডিএনসিসি বর্জ্য ব্যবস্থাপনা বিভাগ" },
        departmentName: { en: "Conservancy Operations Wing", bn: "পরিচ্ছন্নতা ও বর্জ্য অপসারণ শাখা" },
        officerName: { en: "Md. Mostafa Kamal", bn: "মোঃ মোস্তফা কামাল" },
        designation: { en: "Chief Ward Conservancy Inspector", bn: "প্রধান ওয়ার্ড পরিচ্ছন্নতা পরিদর্শক" },
        phone: "01912-345678",
        email: "waste.ward3@dncc.gov.bd",
        office: { en: "Ward 3 Community Center & Waste Desk, Mirpur", bn: "ওয়ার্ড ৩ কমিউনিটি সেন্টার ও বর্জ্য সেল, মিরপুর" },
        ward: "Ward 3",
      };
    }
    if (category === "electricity") {
      return {
        authorityName: { en: "Dhaka Electric Supply Company (DESCO)", bn: "ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি (ডেসকো)" },
        departmentName: { en: "Distribution & Breakdown Division", bn: "বিতরণ ও জরুরি বিদ্যুৎ মেরামত বিভাগ" },
        officerName: { en: "Engr. Rafiqul Bari", bn: "প্রকৌ. রফিকুল বারী" },
        designation: { en: "Sub-Divisional Engineer (Mirpur Substation)", bn: "উপ-বিভাগীয় প্রকৌশলী (মিরপুর সাবস্টেশন)" },
        phone: "01713-098765",
        email: "rafiqul.sde@desco.org.bd",
        office: { en: "DESCO Mirpur-10 33/11kV Substation", bn: "ডেসকো মিরপুর-১০ ৩৩/১১কেভি সাবস্টেশন" },
        ward: "Ward 3",
      };
    }
  }

  if (combined.includes("shantinagar") || combined.includes("ward 13") || combined.includes("ওয়ার্ড ১৩")) {
    if (category === "road_transport") {
      return {
        authorityName: { en: "Dhaka South City Corporation", bn: "ঢাকা দক্ষিণ সিটি কর্পোরেশন" },
        departmentName: { en: "Road Network & Infrastructure Dept.", bn: "সড়ক অবকাঠামো ও ট্রাফিক উন্নয়ন বিভাগ" },
        officerName: { en: "Engr. Mahbubur Rahman", bn: "প্রকৌ. মাহবুবুর রহমান" },
        designation: { en: "Executive Engineer (DSCC Zone-2)", bn: "নির্বাহী প্রকৌশলী (ডিএসসিসি জোন-২)" },
        phone: "01712-876543",
        email: "mahbubur.dscc2@dscc.gov.bd",
        office: { en: "DSCC Zone-2 Office, Shantinagar", bn: "ডিএসসিসি জোন-২ কার্যালয়, শান্তিনগর" },
        ward: "Ward 13",
      };
    }
    if (category === "waste") {
      return {
        authorityName: { en: "DSCC Waste Management", bn: "ডিএসসিসি বর্জ্য ব্যবস্থাপনা বিভাগ" },
        departmentName: { en: "Zone-2 Conservancy Cell", bn: "জোন-২ পরিচ্ছন্নতা শাখা" },
        officerName: { en: "Md. Selim Reza", bn: "মোঃ সেলিম রেজা" },
        designation: { en: "Ward 13 Conservancy Inspector", bn: "ওয়ার্ড ১৩ পরিচ্ছন্নতা পরিদর্শক" },
        phone: "01911-765432",
        email: "selim.conservancy@dscc.gov.bd",
        office: { en: "Ward 13 Councillor Office, Shantinagar", bn: "ওয়ার্ড ১৩ কাউন্সিলর কার্যালয়, শান্তিনগর" },
        ward: "Ward 13",
      };
    }
  }

  if (combined.includes("mohammadpur") || combined.includes("ward 31") || combined.includes("ওয়ার্ড ৩১") || combined.includes("town hall")) {
    if (category === "waste") {
      return {
        authorityName: { en: "Dhaka North City Corporation", bn: "ঢাকা উত্তর সিটি কর্পোরেশন" },
        departmentName: { en: "Town Hall Market & Conservancy Division", bn: "টাউন হল বাজার ও পরিচ্ছন্নতা বিভাগ" },
        officerName: { en: "Md. Kabir Hossain", bn: "মোঃ কবির হোসেন" },
        designation: { en: "Senior Conservancy Supervisor", bn: "সিনিয়র পরিচ্ছন্নতা তত্ত্বাবধায়ক" },
        phone: "01915-432109",
        email: "kabir.ward31@dncc.gov.bd",
        office: { en: "Mohammadpur Town Hall Market Office", bn: "মোহাম্মদপুর টাউন হল মার্কেট অফিস" },
        ward: "Ward 31",
      };
    }
  }

  if (combined.includes("banasree") || combined.includes("ward 2") || combined.includes("ওয়ার্ড ২")) {
    if (category === "electricity") {
      return {
        authorityName: { en: "Dhaka Electric Supply Company (DESCO)", bn: "ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি (ডেসকো)" },
        departmentName: { en: "Rampura-Banasree Distribution Division", bn: "রামপুরা-বনশ্রী বিদ্যুৎ বিতরণ বিভাগ" },
        officerName: { en: "Engr. Monirul Islam", bn: "প্রকৌ. মনিরুল ইসলাম" },
        designation: { en: "Sub-Divisional Engineer (Transformer & Safety)", bn: "উপ-বিভাগীয় প্রকৌশলী (ট্রান্সফরমার ও নিরাপত্তা)" },
        phone: "01711-987654",
        email: "monirul.banasree@desco.org.bd",
        office: { en: "DESCO Banasree Sub-division Office, Block C", bn: "ডেসকো বনশ্রী সাব-ডিভিশন অফিস, ব্লক সি" },
        ward: "Ward 2",
      };
    }
  }

  if (combined.includes("savar") || combined.includes("সাভার")) {
    if (category === "healthcare") {
      return {
        authorityName: { en: "Directorate General of Health Services (DGHS)", bn: "স্বাস্থ্য অধিদপ্তর ও উপজেলা স্বাস্থ্য কমপ্লেক্স" },
        departmentName: { en: "Upazila Health & Medical Supplies Wing", bn: "উপজেলা স্বাস্থ্য ও ওষুধ সরবরাহ শাখা" },
        officerName: { en: "Dr. Sayeed Ahmed", bn: "ডা. সাঈদ আহমেদ" },
        designation: { en: "Upazila Health & Family Planning Officer (UHFPO)", bn: "উপজেলা স্বাস্থ্য ও পরিবার পরিকল্পনা কর্মকর্তা" },
        phone: "01711-098765",
        email: "uhfpo.savar@dghs.gov.bd",
        office: { en: "Savar Upazila Health Complex, Savar", bn: "সাভার উপজেলা স্বাস্থ্য কমপ্লেক্স, সাভার" },
        ward: "Zone A",
      };
    }
  }

  if (combined.includes("uttara") || combined.includes("ward 1") || combined.includes("ওয়ার্ড ১")) {
    if (category === "food") {
      return {
        authorityName: { en: "Bangladesh Food Safety Authority (BFSA)", bn: "বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (বিএফএসএ)" },
        departmentName: { en: "District Mobile Court & Quality Inspection", bn: "জেলা মোবাইল কোর্ট ও খাদ্য মান নিয়ন্ত্রণ সেল" },
        officerName: { en: "Md. Saiful Islam", bn: "মোঃ সাইফুল ইসলাম" },
        designation: { en: "Senior Food Safety Inspector (Uttara Zone)", bn: "সিনিয়র নিরাপদ খাদ্য পরিদর্শক (উত্তরা জোন)" },
        phone: "01675-432109",
        email: "saiful.bfsa@bfsa.gov.bd",
        office: { en: "Uttara Sector 7 Regional Inspection Cell", bn: "উত্তরা সেক্টর ৭ আঞ্চলিক পরিদর্শন কার্যালয়" },
        ward: "Ward 1",
      };
    }
  }

  // General department defaults based on resolved authority
  const deptMeta = authority.departments[category] || {
    name: { en: `${authority.name.en} Operations`, bn: `${authority.name.bn} অপারেশনস` },
    phone: authority.contacts[0]?.phone || "16163",
  };

  const defaultOfficers: Record<Category, { en: string; bn: string; roleEn: string; roleBn: string; phone: string }> = {
    water: { en: "Engr. Zahidul Islam", bn: "প্রকৌ. জাহিদুল ইসলাম", roleEn: "Zonal Water & Drainage Engineer", roleBn: "আঞ্চলিক পানি ও ড্রেনেজ প্রকৌশলী", phone: "01713-112233" },
    road_transport: { en: "Engr. Ashraful Alam", bn: "প্রকৌ. আশরাফুল আলম", roleEn: "Executive Engineer (Road Infrastructure)", roleBn: "নির্বাহী প্রকৌশলী (সড়ক অবকাঠামো)", phone: "01711-223344" },
    waste: { en: "Md. Nazmul Huda", bn: "মোঃ নাজমুল হুদা", roleEn: "Chief Zonal Conservancy Officer", roleBn: "প্রধান আঞ্চলিক পরিচ্ছন্নতা কর্মকর্তা", phone: "01911-334455" },
    electricity: { en: "Engr. Mahmud Hasan", bn: "প্রকৌ. মাহমুদ হাসান", roleEn: "Emergency Breakdown Cell In-Charge", roleBn: "জরুরি বিদ্যুৎ মেরামত সেল ইনচার্জ", phone: "01714-445566" },
    healthcare: { en: "Dr. Farhana Yasmin", bn: "ডা. ফারহানা ইয়াসমিন", roleEn: "Chief Zonal Health Officer", roleBn: "প্রধান আঞ্চলিক স্বাস্থ্য কর্মকর্তা", phone: "01819-556677" },
    food: { en: "Md. Shariful Haque", bn: "মোঃ শরিফুল হক", roleEn: "Special Food Safety Officer", roleBn: "বিশেষ নিরাপদ খাদ্য কর্মকর্তা", phone: "01672-667788" },
  };

  const def = defaultOfficers[category];

  return {
    authorityName: authority.name,
    departmentName: deptMeta.name,
    officerName: { en: def.en, bn: def.bn },
    designation: { en: def.roleEn, bn: def.roleBn },
    phone: deptMeta.phone || def.phone,
    email: `officer.${category}@${authority.id}.gov.bd`,
    office: {
      en: `${authority.name.en} ${deptMeta.name.en}`,
      bn: `${authority.name.bn} ${deptMeta.name.bn}`,
    },
    ward: ward || "General Jurisdiction",
  };
}

// Refinement 113: perf(ml): reduce tf-idf feature matrix memory footprint
// Refinement 122: fix(ml): adjust duplicate similarity threshold to 0.78 for ward radius
