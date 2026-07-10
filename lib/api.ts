import { categoryMeta, ensembleModels, type Category, type EnsembleResult, type Severity } from "@/lib/ensemble";

type ApiVote = {
  model_id: string;
  model_name: string;
  label: string;
  confidence: number;
  probabilities: Record<string, number>;
};

type ApiPrediction = {
  category: {
    label: string;
    confidence: number;
    agreement: number;
    probabilities: Record<string, number>;
    votes: ApiVote[];
  };
  severity: { label: string; confidence: number; agreement: number };
};

export async function predictWithApi(text: string): Promise<EnsembleResult | null> {
  const endpoint = process.env.NEXT_PUBLIC_NAGARAI_API_URL?.replace(/\/$/, "");
  if (!endpoint) return null;
  const response = await fetch(`${endpoint}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error(`NagarAI API returned ${response.status}`);
  const data = (await response.json()) as ApiPrediction;
  const category = data.category.label as Category;
  const severity = data.severity.label as Severity;
  if (!categoryMeta[category] || !["low", "medium", "high"].includes(severity)) {
    throw new Error("NagarAI API returned an unsupported label");
  }
  const agreeing = data.category.votes.filter((vote) => vote.label === category).length;
  return {
    category,
    severity,
    confidence: data.category.confidence,
    agreement: data.category.agreement,
    probabilities: data.category.probabilities as Record<Category, number>,
    votes: data.category.votes.map((vote, index) => ({
      id: vote.model_id,
      name: vote.model_name,
      family: ensembleModels[index]?.family ?? "Supervised",
      category: vote.label as Category,
      confidence: vote.confidence,
      probabilities: vote.probabilities as Record<Category, number>,
    })),
    department: categoryMeta[category].department,
    matchedSignals: [],
    explanation: {
      en: `${agreeing} of 6 trained models agree on ${categoryMeta[category].en}. Priority is ${severity}; a human reviewer owns the final action.`,
      bn: `৬টি trained মডেলের মধ্যে ${agreeing}টি ${categoryMeta[category].bn} বিষয়ে একমত। অগ্রাধিকার ${severity === "high" ? "উচ্চ" : severity === "medium" ? "মাঝারি" : "নিম্ন"}; চূড়ান্ত সিদ্ধান্ত মানব পর্যালোচকের।`,
    },
  };
}
