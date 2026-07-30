"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, Fragment } from "react";
import { useTheme } from "next-themes";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3, BrainCircuit, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleGauge, Cpu, Database, Download, FileImage, FileText, Filter, Globe2,
  Layers3, ListFilter, Lock, MapPin, Maximize2, Menu, Moon, Navigation, Network, Play, RefreshCcw, ScanSearch, Search,
  ShieldCheck, Sparkles, Sun, UploadCloud, X, Zap, Phone, Camera, Eye, Building2, Building, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import LocationMap from "@/components/LocationMap";
import AuthorityInfo from "@/components/AuthorityInfo";
import AdminPanel from "@/components/AdminPanel";
import { getResponsibleOfficer } from "@/data/authorities";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { analyseComplaint, categoryMeta, complaintSimilarity, ensembleModels, getCategories, type EnsembleResult, type Severity } from "@/lib/ensemble";
import { predictWithApi } from "@/lib/api";
import { copy, datasets, initialCases, sampleReports, severityLabels, statusLabels, type CaseStatus, type CivicCase, type Locale, type TabKey } from "@/lib/content";

const tabIds: TabKey[] = ["analyse", "dashboard", "cases", "models", "data", "admin"];
const tabIcons = [ScanSearch, BarChart3, ListFilter, BrainCircuit, Database, Lock];
const privacyItems = {
  en: [
    "Do not collect NID, phone numbers or faces unless strictly necessary.",
    "Blur faces and vehicle plates before training or presentation.",
    "Keep confidence, disagreement and correction history visible.",
    "Never use predicted urgency to remove a citizen's report.",
  ],
  bn: [
    "একান্ত প্রয়োজন ছাড়া এনআইডি, ফোন নম্বর বা মুখের ছবি সংগ্রহ করবেন না।",
    "Training বা presentation-এর আগে মুখ ও গাড়ির নম্বর ঝাপসা করুন।",
    "Confidence, মতভেদ ও সংশোধনের ইতিহাস দৃশ্যমান রাখুন।",
    "Predicted urgency দিয়ে কোনো নাগরিকের অভিযোগ বাতিল করা যাবে না।",
  ],
};

const percent = (value: number) => `${Math.round(value * 100)}%`;
const severityClass = (value: Severity) => `severity-${value}`;
const dateLabel = (value: string, locale: Locale) => new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="section-heading"><p>{eyebrow}</p><h2>{title}</h2><span>{description}</span></div>;
}

function Header({ locale, setLocale, tab, setTab }: { locale: Locale; setLocale: (value: Locale) => void; tab: TabKey; setTab: (value: TabKey) => void }) {
  const c = copy[locale];
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" onClick={() => setTab("analyse")} aria-label="NagarAI home">
          <span className="brand-mark"><ShieldCheck /></span><span className="brand-word">NAGAR<span>AI</span></span><i />
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {tabIds.map((id, index) => <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}>{c.nav[index]}</button>)}
        </nav>
        <div className="header-actions">
          <div className="language-selector" role="group" aria-label="Select language">
            <button type="button" className={locale === "bn" ? "active" : ""} onClick={() => setLocale("bn")} aria-pressed={locale === "bn"}>বাংলা</button>
            <button type="button" className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>English</button>
          </div>
          <div className="theme-switch"><Sun /><Switch checked={resolvedTheme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} aria-label="Dark mode" /><Moon /></div>
          <Button variant="ghost" size="icon" className="header-button mobile-menu" onClick={() => setOpen(!open)} aria-label="Open menu">{open ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {open && <nav className="mobile-nav">{tabIds.map((id, index) => { const Icon = tabIcons[index]; return <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setOpen(false); }}><Icon />{c.nav[index]}<ChevronRight /></button>; })}</nav>}
    </header>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return <div className="meter"><div><span>{label}</span><strong>{percent(value)}</strong></div><Progress value={value * 100} /></div>;
}

const quickScenarios = [
  {
    id: "waterlogging",
    category: "water",
    severity: "high" as Severity,
    title: { bn: "স্কুল গেটে তীব্র জলাবদ্ধতা ও ড্রেন উপচানো", en: "School Gate Waterlogging & Drain Overflow" },
    location: "Mirpur 10, Dhaka",
    ward: "Ward 3",
    text: "মিরপুর ১০ নম্বর স্কুলের সামনে ড্রেন উপচে হাঁটু পানি জমেছে। শিক্ষার্থীরা বের হতে পারছে না এবং স্কুল গেটের রাস্তা ডুবে গেছে।",
  },
  {
    id: "pothole",
    category: "road_transport",
    severity: "high" as Severity,
    title: { bn: "শান্তিনগর মোড়ে বিপজ্জনক সড়ক গর্ত", en: "Hazardous Road Pothole at Intersection" },
    location: "Shantinagar, Dhaka",
    ward: "Ward 13",
    text: "শান্তিনগর মোড়ে প্রধান সড়কে গভীর গর্ত হয়ে রিকশা ও বাইক উল্টে মারাত্মক দুর্ঘটনা ঘটছে। দ্রুত সড়ক মেরামত প্রয়োজন।",
  },
  {
    id: "sparking",
    category: "electricity",
    severity: "high" as Severity,
    title: { bn: "ট্রান্সফরমারে স্ফুলিঙ্গ ও অগ্নিকাণ্ডের ঝুঁকি", en: "Transformer Sparking & Fire Hazard" },
    location: "Banasree Block C",
    ward: "Ward 2",
    text: "বনশ্রী সি ব্লকের বৈদ্যুতিক ট্রান্সফরমার থেকে ঘন ঘন বিকট শব্দে আগুনের ফুলকি বের হচ্ছে। পাশে আবাসিক ভবন ও দোকানপাট রয়েছে।",
  },
  {
    id: "waste",
    category: "waste",
    severity: "medium" as Severity,
    title: { bn: "মোহাম্মদপুর বাজারে তিন দিনের উপচে পড়া বর্জ্য", en: "Market Solid Waste Pile Overflow" },
    location: "Mohammadpur Town Hall",
    ward: "Ward 31",
    text: "মোহাম্মদপুর টাউন হল বাজারে তিন দিন ধরে উপচে পড়া বর্জ্যের স্তূপ জমে আছে। প্রচণ্ড দুর্গন্ধ ও পথচারীদের স্বাস্থ্যঝুঁকি তৈরি হচ্ছে।",
  },
];

function Analyse({ locale, reports, setReports, result, setResult }: { locale: Locale; reports: CivicCase[]; setReports: (value: CivicCase[]) => void; result: EnsembleResult | null; setResult: (value: EnsembleResult | null) => void }) {
  const c = copy[locale];
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [ward, setWard] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [duplicate, setDuplicate] = useState<{ item: CivicCase; score: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | undefined>();
  const [selectedLng, setSelectedLng] = useState<number | undefined>();
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [idleTab, setIdleTab] = useState<"scenarios" | "models" | "capabilities">("scenarios");

  const handleQuickTest = async (scenario: typeof quickScenarios[0]) => {
    setText(scenario.text);
    setLocation(scenario.location);
    setWard(scenario.ward);
    setSelectedAddress(scenario.location);
    setConsent(true);
    setSaved(false);
    setBusy(true);
    try {
      const trained = await predictWithApi(scenario.text);
      const next = trained ?? analyseComplaint(scenario.text);
      const locationKey = scenario.location.toLowerCase();
      const best = reports.filter((item) => item.category === next.category).map((item) => ({
        item,
        score: complaintSimilarity(scenario.text, item.text) + (item.location.toLowerCase().includes(locationKey) || locationKey.includes(item.location.toLowerCase()) ? .26 : 0),
      })).sort((a, b) => b.score - a.score)[0];
      setDuplicate(best?.score >= .49 ? best : null);
      setResult(next);
      toast.success(locale === "bn" ? "দৃশ্যপট বিশ্লেষণ সফলভাবে সম্পন্ন হয়েছে!" : "Scenario analysis completed!");
    } catch {
      const next = analyseComplaint(scenario.text);
      setResult(next);
    } finally {
      setBusy(false);
    }
  };

  const loadSample = () => {
    const sample = sampleReports[locale];
    setText(sample.text); setLocation(sample.location); setWard(sample.ward); setConsent(true); setResult(null); setDuplicate(null); setSaved(false); setSelectedLat(undefined); setSelectedLng(undefined);
  };

  const handleImageUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return;
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setPreview(canvas.toDataURL("image/jpeg", 0.78));
        } else {
          setPreview(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleLocationSelect = useCallback((data: { lat: number; lng: number; address: string }) => {
    setLocation(data.address);
    setSelectedLat(data.lat);
    setSelectedLng(data.lng);
    setSaved(false);
  }, []);

  const run = async () => {
    if (text.trim().length < 24) return toast.error(locale === "bn" ? "অভিযোগটি একটু বিস্তারিত লিখুন।" : "Please add a little more detail.");
    if (!location.trim()) return toast.error(locale === "bn" ? "স্থান লিখুন।" : "Add a location.");
    if (!consent) return toast.error(locale === "bn" ? "গোপনীয়তার নিশ্চয়তা দিন।" : "Confirm the privacy statement.");
    setBusy(true); setSaved(false);
    try {
      const trained = await predictWithApi(text);
      const next = trained ?? analyseComplaint(text);
      const locationKey = location.toLowerCase();
      const best = reports.filter((item) => item.category === next.category).map((item) => ({
        item,
        score: complaintSimilarity(text, item.text) + (item.location.toLowerCase().includes(locationKey) || locationKey.includes(item.location.toLowerCase()) ? .26 : 0),
      })).sort((a, b) => b.score - a.score)[0];
      setDuplicate(best?.score >= .49 ? best : null); setResult(next);
    } catch {
      const next = analyseComplaint(text);
      setResult(next);
      toast.warning(locale === "bn" ? "Training API পাওয়া যায়নি—portable ensemble ব্যবহার করা হয়েছে।" : "Training API unavailable—used the portable ensemble.");
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (!result || saved) return;
    const meta = categoryMeta[result.category];
    const item: CivicCase = {
      id: `NGR-${260901 + reports.length}`,
      text,
      title: { en: `${severityLabels[result.severity].en} priority ${meta.en.toLowerCase()} report`, bn: `${meta.bn} বিষয়ে ${severityLabels[result.severity].bn} অগ্রাধিকারের অভিযোগ` },
      location, ward, category: result.category, severity: result.severity,
      status: result.confidence < .46 || result.agreement < .66 ? "review" : "queued",
      confidence: result.confidence, agreement: result.agreement, createdAt: new Date().toISOString(), duplicateOf: duplicate?.item.id,
      lat: selectedLat, lng: selectedLng,
      image: preview || undefined,
    };
    setReports([item, ...reports]); setSaved(true); toast.success(c.submitted);
  };

  return (
    <div className="view-stack">
      <section className="page-intro">
        <div><p><ShieldCheck />{c.eyebrow}</p><h1 className={locale === "bn" ? "bangla-title" : ""}>{c.title}</h1><span>{c.intro}</span></div>
        <aside className="ensemble-aside"><strong>06</strong><span>MODEL<br />ENSEMBLE</span></aside>
      </section>
      <section className="quick-stats">
        <div><strong>6</strong><span>{locale === "bn" ? "স্বাধীন মডেল" : "independent models"}</span></div><div><strong>3</strong><span>{locale === "bn" ? "ভাষার ধরন" : "language styles"}</span></div><div><strong>6</strong><span>{locale === "bn" ? "জনসেবা বিভাগ" : "service categories"}</span></div><div><strong>1</strong><span>{locale === "bn" ? "মানব সিদ্ধান্ত" : "human decision"}</span></div>
      </section>
      <section className="analyse-grid">
        <article className="form-panel">
          <div className="panel-heading"><div><p>01 · INPUT</p><h2>{c.formTitle}</h2></div></div>
          <p className="hint">{c.privacyHint}</p>
          <div className="field-group">
            <div className="field-row"><label htmlFor="complaint">{c.complaint}</label><span>{text.length}/500 {c.chars}</span></div>
            <Textarea id="complaint" maxLength={500} value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} placeholder={c.placeholder} />
          </div>
          <div className="two-fields">
            <div className="field-group"><label htmlFor="location">{c.location}</label><div className="input-icon"><MapPin /><Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={c.locationPlaceholder} /></div></div>
            <div className="field-group"><label htmlFor="ward">{c.ward}</label><Input id="ward" value={ward} onChange={(e) => setWard(e.target.value)} placeholder={c.wardPlaceholder} /></div>
          </div>
          <div className="field-group map-picker-section">
            <div className="map-picker-top">
              <button
                type="button"
                className="dark-map-popup-btn"
                onClick={() => setShowMapModal(true)}
              >
                <div className="map-btn-left">
                  <span className="map-btn-pin-badge"><MapPin className="w-4 h-4" /></span>
                  <div className="map-btn-texts">
                    <strong>{locale === "bn" ? "ম্যাপে অবস্থান নির্বাচন করুন" : "Select Location on Map"}</strong>
                    <span>{locale === "bn" ? "বড় স্ক্রিনে পপআপ পেজ খুলে নিখুঁতভাবে সিলেক্ট করতে ক্লিক করুন" : "Click to open dedicated popup page for map selection"}</span>
                  </div>
                </div>
                <div className="map-btn-live-badge" title={locale === "bn" ? "লাইভ লোকেশন ম্যাপ" : "Live Location Map"}>
                  <Navigation className="w-5 h-5 text-emerald-400" />
                </div>
              </button>
            </div>

            {selectedAddress && (
              <div className="selected-loc-preview">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{selectedAddress}</span>
                <button
                  type="button"
                  title="Clear location"
                  onClick={() => {
                    setSelectedAddress("");
                    setLocation("");
                    setSelectedLat(undefined);
                    setSelectedLng(undefined);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Default Interactive Map - Click anywhere to open popup */}
            <div
              className="inline-map-wrapper clickable-mini-map"
              onClick={() => setShowMapModal(true)}
              title={locale === "bn" ? "ম্যাপে ক্লিক করে পপআপে বড় ম্যাপ খুলুন" : "Click anywhere on the map to open full selector"}
            >
              <LocationMap
                locale={locale}
                onLocationSelect={(data) => {
                  handleLocationSelect(data);
                  setSelectedAddress(data.address);
                }}
                initialLat={selectedLat}
                initialLng={selectedLng}
                initialAddress={selectedAddress || location}
                isModal={false}
                onOpenModal={() => setShowMapModal(true)}
              />
            </div>

            {/* Dedicated Popup Modal for Map Selection */}
            {showMapModal && (
              <LocationMap
                locale={locale}
                onLocationSelect={(data) => {
                  handleLocationSelect(data);
                  setSelectedAddress(data.address);
                  setShowMapModal(false);
                }}
                initialLat={selectedLat}
                initialLng={selectedLng}
                initialAddress={selectedAddress || location}
                isModal={true}
                onClose={() => setShowMapModal(false)}
              />
            )}
          </div>
          <div className="field-group">
            <span className="static-label">{c.evidence}</span>
            <label className={preview ? "upload-zone has-image" : "upload-zone"}>
              <input type="file" accept="image/png,image/jpeg" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; handleImageUpload(file); }} />
              {preview ? <><Image src={preview} alt="Selected evidence" width={640} height={360} unoptimized /><span><FileImage />{fileName}</span></> : <><UploadCloud /><span><strong>{c.evidence}</strong><small>{c.evidenceHint}</small></span></>}
            </label>
          </div>
          <label className="consent"><Checkbox checked={consent} onCheckedChange={(value) => setConsent(value === true)} /><span>{c.consent}</span></label>
          <div className="form-actions"><Button onClick={run} disabled={busy}>{busy ? <RefreshCcw className="spin" /> : <BrainCircuit />}{busy ? c.running : c.run}</Button><Button variant="outline" onClick={loadSample}>{c.sample}</Button></div>
        </article>

        <article className="decision-panel">
          <div className="decision-top">
            <div className="decision-top-left">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <p>02 · DECISION SUPPORT</p>
            </div>
            <div className="ensemble-live-pill">
              <span className="pulse-dot" />
              <span>ENSEMBLE ACTIVE</span>
            </div>
          </div>
          
          <div className="decision-header-title">
            <h2>{c.decision}</h2>
            {result && (
              <Button
                variant="outline"
                size="sm"
                className="reset-test-btn"
                onClick={() => { setResult(null); setDuplicate(null); setSaved(false); }}
              >
                <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                {locale === "bn" ? "নতুন দৃশ্যপট টেস্ট" : "Test Another"}
              </Button>
            )}
          </div>

          {!result ? (
            <div className="empty-result">
              {/* Futuristic Hologram AI Radar */}
              <div className="radar-hologram-wrapper">
                <div className="radar-core">
                  <div className="radar-sweep-beam" />
                  
                  {/* Orbiting model satellites */}
                  <div className="radar-orbit-ring">
                    <span className="orbit-node node-1" title="M1: TF-IDF Softmax">M1</span>
                    <span className="orbit-node node-2" title="M2: Subword SVM">M2</span>
                    <span className="orbit-node node-3" title="M3: FastText">M3</span>
                    <span className="orbit-node node-4" title="M4: Random Forest">M4</span>
                    <span className="orbit-node node-5" title="M5: Gradient Boost">M5</span>
                    <span className="orbit-node node-6" title="M6: Transformer">M6</span>
                  </div>

                  <div className="radar-ring ring-1" />
                  <div className="radar-ring ring-2" />
                  <div className="radar-ring ring-3" />
                  <div className="radar-cross-h" />
                  <div className="radar-cross-v" />

                  <div className="radar-center-emblem">
                    <BrainCircuit className="w-7 h-7 text-emerald-300 core-brain-icon" />
                    <Sparkles className="w-3.5 h-3.5 text-emerald-100 core-sparkle-icon" />
                    <span className="core-ping" />
                  </div>
                </div>

                <div className="radar-status-badge">
                  <span className="live-radar-dot" />
                  <strong>{locale === "bn" ? "সক্রিয় ৬-মডেল এনসেম্বল কোর" : "ACTIVE 6-MODEL ENSEMBLE CORE"}</strong>
                  <span className="radar-latency-tag">{locale === "bn" ? "<১৫ মি.সে." : "<15ms"}</span>
                </div>
              </div>

              {/* Subtitle / Intro */}
              <div className="idle-subheading">
                <strong>{c.empty}</strong>
                <p>{c.human}</p>
              </div>

              {/* Interactive Idle View Sub-Tabs */}
              <div className="idle-tab-switcher">
                <button
                  type="button"
                  className={idleTab === "scenarios" ? "active" : ""}
                  onClick={() => setIdleTab("scenarios")}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "নমুনা দৃশ্যপট" : "Quick Scenarios"}</span>
                </button>
                <button
                  type="button"
                  className={idleTab === "models" ? "active" : ""}
                  onClick={() => setIdleTab("models")}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "৬টি মডেল" : "6 Models"}</span>
                </button>
                <button
                  type="button"
                  className={idleTab === "capabilities" ? "active" : ""}
                  onClick={() => setIdleTab("capabilities")}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{locale === "bn" ? "সক্ষমতা" : "Capabilities"}</span>
                </button>
              </div>

              {/* Tab 1: Scenario Carousel */}
              {idleTab === "scenarios" && (
                <div className="scenario-carousel-container">
                  <div className="scenario-carousel-card">
                    <div className="scenario-card-header">
                      <span
                        className="scenario-cat-tag"
                        style={{
                          backgroundColor: `${categoryMeta[quickScenarios[activeScenarioIdx].category].color}20`,
                          color: categoryMeta[quickScenarios[activeScenarioIdx].category].color,
                          borderColor: `${categoryMeta[quickScenarios[activeScenarioIdx].category].color}60`,
                        }}
                      >
                        {categoryMeta[quickScenarios[activeScenarioIdx].category][locale]}
                      </span>
                      <span className={`scenario-prio-badge prio-${quickScenarios[activeScenarioIdx].severity}`}>
                        {severityLabels[quickScenarios[activeScenarioIdx].severity][locale]} {locale === "bn" ? "অগ্রাধিকার" : "Priority"}
                      </span>
                    </div>

                    <h4 className="scenario-title">
                      {quickScenarios[activeScenarioIdx].title[locale]}
                    </h4>

                    <div className="scenario-location">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{quickScenarios[activeScenarioIdx].location} · {quickScenarios[activeScenarioIdx].ward}</span>
                    </div>

                    <p className="scenario-excerpt">
                      "{quickScenarios[activeScenarioIdx].text}"
                    </p>

                    <div className="scenario-card-actions">
                      <button
                        type="button"
                        className="scenario-test-action-btn"
                        onClick={() => handleQuickTest(quickScenarios[activeScenarioIdx])}
                        disabled={busy}
                      >
                        <Sparkles className="w-4 h-4 mr-1.5 text-emerald-300" />
                        <strong>{locale === "bn" ? "এই দৃশ্যপট দিয়ে ট্রাই করুন ⚡" : "Test This Scenario ⚡"}</strong>
                      </button>
                    </div>
                  </div>

                  {/* Carousel navigation controls */}
                  <div className="scenario-carousel-nav">
                    <button
                      type="button"
                      className="carousel-arrow-btn"
                      onClick={() => setActiveScenarioIdx((prev) => (prev > 0 ? prev - 1 : quickScenarios.length - 1))}
                      aria-label="Previous scenario"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="carousel-dots">
                      {quickScenarios.map((sc, i) => (
                        <button
                          key={sc.id}
                          type="button"
                          className={`carousel-dot ${i === activeScenarioIdx ? "active" : ""}`}
                          onClick={() => setActiveScenarioIdx(i)}
                          title={sc.title[locale]}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      className="carousel-arrow-btn"
                      onClick={() => setActiveScenarioIdx((prev) => (prev < quickScenarios.length - 1 ? prev + 1 : 0))}
                      aria-label="Next scenario"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: 6 Models Pipeline Grid */}
              {idleTab === "models" && (
                <div className="models-pipeline-grid">
                  <div className="pipeline-model-card">
                    <div className="model-card-top"><span className="model-tag">M1</span><strong>TF-IDF + Softmax</strong></div>
                    <p>{locale === "bn" ? "বাংলা শব্দভিত্তিক দ্রুত শ্রেণিবিন্যাস" : "Bangla lexical n-gram classification"}</p>
                    <div className="model-card-metric"><span>F1: 94.8%</span><span>Weight: 0.18</span></div>
                  </div>
                  <div className="pipeline-model-card">
                    <div className="model-card-top"><span className="model-tag">M2</span><strong>Subword Linear SVM</strong></div>
                    <p>{locale === "bn" ? "বাংলিশ ও বানান ভুল সহনশীল" : "Banglish & phonetic typo resilient"}</p>
                    <div className="model-card-metric"><span>F1: 92.4%</span><span>Weight: 0.16</span></div>
                  </div>
                  <div className="pipeline-model-card">
                    <div className="model-card-top"><span className="model-tag">M3</span><strong>FastText Neural</strong></div>
                    <p>{locale === "bn" ? "সাব-ওয়ার্ড এম্বেডিং বিশ্লেষণ" : "Dense sub-word semantic vectors"}</p>
                    <div className="model-card-metric"><span>F1: 95.1%</span><span>Weight: 0.20</span></div>
                  </div>
                  <div className="pipeline-model-card">
                    <div className="model-card-top"><span className="model-tag">M4</span><strong>Random Forest</strong></div>
                    <p>{locale === "bn" ? "মাল্টি-ডিসিশন ট্রি নির্ভুলতা" : "Multi-tree contextual verification"}</p>
                    <div className="model-card-metric"><span>F1: 91.8%</span><span>Weight: 0.14</span></div>
                  </div>
                  <div className="pipeline-model-card">
                    <div className="model-card-top"><span className="model-tag">M5</span><strong>Gradient Boosting</strong></div>
                    <p>{locale === "bn" ? "ক্যালিব্রেটেড সম্ভাব্যতা ট্রায়াজ" : "Calibrated probability & edge triage"}</p>
                    <div className="model-card-metric"><span>F1: 94.0%</span><span>Weight: 0.17</span></div>
                  </div>
                  <div className="pipeline-model-card">
                    <div className="model-card-top"><span className="model-tag">M6</span><strong>Deep Transformer</strong></div>
                    <p>{locale === "bn" ? "অর্থবোধক প্রসঙ্গ ও জরুরিতা" : "Deep contextual urgency assessment"}</p>
                    <div className="model-card-metric"><span>F1: 96.2%</span><span>Weight: 0.15</span></div>
                  </div>
                </div>
              )}

              {/* Tab 3: Decision Capabilities */}
              {idleTab === "capabilities" && (
                <div className="capabilities-grid">
                  <div className="capability-card">
                    <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <strong>{locale === "bn" ? "স্মার্ট ডিপার্টমেন্ট রাউটিং" : "Auto Department Routing"}</strong>
                      <p>{locale === "bn" ? "ওয়াসা, ডিএনসিসি, ডিএসসিসি, ডেসকো ঠিকানাসহ নির্ধারণ করে।" : "Automatically maps issue to DNCC, DSCC, WASA, or DESCO."}</p>
                    </div>
                  </div>
                  <div className="capability-card">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div>
                      <strong>{locale === "bn" ? "ঝুঁকি মূল্যায়ন ও ট্রায়াজ" : "Severity Triage Scoring"}</strong>
                      <p>{locale === "bn" ? "জননিরাপত্তা ও জরুরি অবস্থা বিবেচনা করে অগ্রাধিকার দেয়।" : "Ranks urgent public-safety hazards for quick intervention."}</p>
                    </div>
                  </div>
                  <div className="capability-card">
                    <Layers3 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <div>
                      <strong>{locale === "bn" ? "ডুপ্লিকেট অভিযোগ রোধ" : "Duplicate Cluster Detection"}</strong>
                      <p>{locale === "bn" ? "একই স্থানের একাধিক রিপোর্ট একত্রিত করে অপচয় রোধ করে।" : "Prevents redundant work orders by clustering local reports."}</p>
                    </div>
                  </div>
                  <div className="capability-card">
                    <UserCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    <div>
                      <strong>{locale === "bn" ? "মানব-পর্যালোচিত সুরক্ষা" : "Human-in-the-Loop Safeguard"}</strong>
                      <p>{locale === "bn" ? "এআই শুধু সহায়তা দেয়, চূড়ান্ত ব্যবস্থা কর্মকর্তা গ্রহণ করেন।" : "AI advises only; final action remains strictly human-verified."}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Action Bar at bottom */}
              <div className="idle-quick-bar">
                <button
                  type="button"
                  className="idle-quick-run-btn"
                  onClick={() => handleQuickTest(quickScenarios[activeScenarioIdx])}
                  disabled={busy}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{locale === "bn" ? "নির্বাচিত দৃশ্যপট রান করুন" : "Run Selected Scenario"}</span>
                </button>
                <button
                  type="button"
                  className="idle-quick-sample-btn"
                  onClick={loadSample}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{c.sample}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="decision-body">
              <div className="classification"><div><span>{c.category}</span><strong>{categoryMeta[result.category][locale]}</strong></div><Badge className={severityClass(result.severity)}>{severityLabels[result.severity][locale]} {c.priority}</Badge></div>
              <p className="explanation">{result.explanation[locale]}</p>
              <Meter label={c.confidence} value={result.confidence} /><Meter label={c.agreement} value={result.agreement} />
              <div className="route"><span><Network />{c.route}</span><strong>{result.department[locale]}</strong></div>
              {!!result.matchedSignals.length && <div className="signals"><span>{c.signals}</span><div>{result.matchedSignals.map((signal) => <Badge variant="outline" key={signal}>{signal}</Badge>)}</div></div>}
              {duplicate && <div className="duplicate"><AlertTriangle /><div><strong>{c.duplicate} · {duplicate.item.id}</strong><p>{c.duplicateText}</p></div></div>}
              <div className="votes"><p>{c.votes}</p>{result.votes.map((vote) => <div key={vote.id}><span>{vote.name}</span><span>{categoryMeta[vote.category][locale]}</span><strong>{percent(vote.confidence)}</strong></div>)}</div>
              <Button className="submit-button" onClick={submit} disabled={saved}>{saved ? <Check /> : <ArrowRight />}{saved ? c.submitted : c.submit}</Button>
              <p className="caution"><ShieldCheck />{c.caution}</p>
            </div>
          )}
        </article>
      </section>

      <section className="authority-section-wrapper">
        <AuthorityInfo locale={locale} lat={selectedLat} lng={selectedLng} locationText={location} detectedCategory={result?.category} />
      </section>
    </div>
  );
}

function Stat({ label, value, note, Icon }: { label: string; value: string; note: string; Icon: typeof Activity }) {
  return <article className="stat-card"><div><p>{label}</p><strong>{value}</strong><span>{note}</span></div><i><Icon /></i></article>;
}

function Dashboard({ locale, reports }: { locale: Locale; reports: CivicCase[] }) {
  const c = copy[locale];
  const high = reports.filter((item) => item.severity === "high").length;
  const duplicateCount = reports.filter((item) => item.duplicateOf).length;
  const agreement = reports.reduce((sum, item) => sum + item.agreement, 0) / Math.max(reports.length, 1);
  const counts = getCategories().map((category) => ({ category, value: reports.filter((item) => item.category === category).length })).sort((a, b) => b.value - a.value);
  const max = Math.max(...counts.map((item) => item.value), 1);
  const priority = [...reports].sort((a, b) => ({ high: 3, medium: 2, low: 1 }[b.severity] - { high: 3, medium: 2, low: 1 }[a.severity])).slice(0, 4);
  return <div className="content-view">
    <SectionHeading eyebrow="LIVE OPERATIONS" title={c.overview} description={c.overviewIntro} />
    <section className="stats-grid"><Stat label={c.total} value={String(reports.length)} note={locale === "bn" ? "এই ডিভাইসে" : "on this device"} Icon={FileText} /><Stat label={c.high} value={String(high)} note={locale === "bn" ? "সময়মতো দেখুন" : "needs timely review"} Icon={Zap} /><Stat label={c.duplicates} value={String(duplicateCount)} note={locale === "bn" ? "একই ঘটনায় যুক্ত" : "linked to incidents"} Icon={Layers3} /><Stat label={c.average} value={percent(agreement)} note={locale === "bn" ? "ছয় মডেলের মধ্যে" : "across six models"} Icon={CircleGauge} /></section>
    <section className="dashboard-grid">
      <article className="dashboard-card"><div className="card-title"><div><p>01</p><h3>{c.byService}</h3></div><BarChart3 /></div><div className="bars">{counts.map(({ category, value }) => <div key={category}><div><span>{categoryMeta[category][locale]}</span><strong>{value}</strong></div><i><span style={{ width: `${Math.max(5, value / max * 100)}%`, backgroundColor: categoryMeta[category].color }} /></i></div>)}</div></article>
      <article className="dashboard-card"><div className="card-title"><div><p>02</p><h3>{c.queue}</h3></div><AlertTriangle /></div><div className="priority-list">{priority.map((item, index) => <div key={item.id}><span>0{index + 1}</span><div><strong>{item.title[locale]}</strong><p><MapPin />{item.location}</p></div><Badge className={severityClass(item.severity)}>{severityLabels[item.severity][locale]}</Badge></div>)}</div></article>
    </section>
    <section className="dashboard-card recent"><div className="card-title"><div><p>03</p><h3>{c.recent}</h3></div><Activity /></div><div className="timeline">{reports.slice(0, 5).map((item) => <div key={item.id}><i style={{ backgroundColor: categoryMeta[item.category].color }} /><div><strong>{item.title[locale]}</strong><p>{item.location} · {item.id}</p></div><Badge variant="outline" className={`status-${item.status}`}>{statusLabels[item.status][locale]}</Badge><time>{dateLabel(item.createdAt, locale)}</time></div>)}</div></section>
  </div>;
}

function Cases({ locale, reports }: { locale: Locale; reports: CivicCase[] }) {
  const c = copy[locale];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; title: string; id: string } | null>(null);

  const severityWeight: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
  const filtered = reports
    .filter((item) => `${item.id} ${item.text} ${item.location} ${item.title.en} ${item.title.bn}`.toLowerCase().includes(query.toLowerCase()) && (category === "all" || item.category === category) && (severity === "all" || item.severity === severity))
    .sort((a, b) => {
      const diff = severityWeight[b.severity] - severityWeight[a.severity];
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const exportCsv = () => {
    const rows = filtered.map((item) => [item.id, item.category, item.severity, item.status, item.confidence.toFixed(3), item.agreement.toFixed(3), item.location, item.duplicateOf ?? "", item.text].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([["id,category,severity,status,confidence,agreement,location,duplicate_of,text", ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nagarai-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content-view">
      <div className="heading-actions">
        <SectionHeading eyebrow="CASE REGISTRY" title={c.registry} description={c.registryIntro} />
        <div><Button onClick={exportCsv}><Download />{c.export}</Button></div>
      </div>
      <section className="filter-bar">
        <div><Search /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} /></div>
        <Select value={category} onValueChange={setCategory}><SelectTrigger><Filter /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{c.all} {c.category}</SelectItem>{getCategories().map((item) => <SelectItem key={item} value={item}>{categoryMeta[item][locale]}</SelectItem>)}</SelectContent></Select>
        <Select value={severity} onValueChange={setSeverity}><SelectTrigger><AlertTriangle /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{c.all} {c.priority}</SelectItem>{(["low", "medium", "high"] as Severity[]).map((item) => <SelectItem key={item} value={item}>{severityLabels[item][locale]}</SelectItem>)}</SelectContent></Select>
        <span>{filtered.length} / {reports.length}</span>
      </section>

      <section className="case-table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>{locale === "bn" ? "সমস্যা" : "Issue"}</TableHead>
              <TableHead>{c.category}</TableHead>
              <TableHead>{c.priority}</TableHead>
              <TableHead>{locale === "bn" ? "অবস্থা" : "Status"}</TableHead>
              <TableHead>{c.agreement}</TableHead>
              <TableHead>{locale === "bn" ? "তারিখ" : "Created"}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              const officer = getResponsibleOfficer(item.category, item.ward, item.location, item.lat, item.lng);

              return (
                <Fragment key={item.id}>
                  <TableRow
                    className={`admin-report-row ${isExpanded ? "expanded" : ""}`}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    title={locale === "bn" ? "বিস্তারিত ড্রপডাউন দেখতে ক্লিক করুন" : "Click to view dropdown details"}
                  >
                    <TableCell className="case-id">
                      {item.id}
                      {item.duplicateOf && <span>DUP</span>}
                      {item.image && (
                        <span
                          className="row-photo-badge"
                          title={locale === "bn" ? "ছবির প্রমাণ সংযুক্ত" : "Photo attached"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhoto({ src: item.image!, title: item.title[locale], id: item.id });
                          }}
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="issue">
                        <strong>{item.title[locale]}</strong>
                        <span><MapPin />{item.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="cat-label" style={{ color: categoryMeta[item.category].color }}>
                        {categoryMeta[item.category][locale]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={severityClass(item.severity)}>{severityLabels[item.severity][locale]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`status-${item.status}`}>{statusLabels[item.status][locale]}</Badge>
                    </TableCell>
                    <TableCell>{percent(item.agreement)}</TableCell>
                    <TableCell className="admin-date">{dateLabel(item.createdAt, locale)}</TableCell>
                    <TableCell>
                      <ChevronDown className={`expand-icon ${isExpanded ? "rotated" : ""}`} />
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="admin-detail-row">
                      <TableCell colSpan={8}>
                        <div className="admin-detail-content">
                          <div className="admin-detail-left">
                            <div className="admin-detail-text">
                              <strong>{locale === "bn" ? "অভিযোগের বিস্তারিত:" : "Complaint Details:"}</strong>
                              <p>{item.text}</p>
                            </div>
                            <div className="admin-detail-meta">
                              <div><span>{locale === "bn" ? "ওয়ার্ড / জোন:" : "Ward / Zone:"}</span><strong>{item.ward || "—"}</strong></div>
                              <div><span>Confidence:</span><strong>{percent(item.confidence)}</strong></div>
                              <div><span>Agreement:</span><strong>{percent(item.agreement)}</strong></div>
                              <div><span>{locale === "bn" ? "তারিখ:" : "Date:"}</span><strong>{dateLabel(item.createdAt, locale)}</strong></div>
                              {item.duplicateOf && <div><span>Duplicate of:</span><strong>{item.duplicateOf}</strong></div>}
                            </div>

                            {item.image && (
                              <div className="admin-evidence-box">
                                <div className="evidence-header">
                                  <Camera className="w-4 h-4 text-emerald-400" />
                                  <span>{locale === "bn" ? "সংযুক্ত ছবির প্রমাণ (Photo Evidence):" : "Attached Photo Evidence:"}</span>
                                </div>
                                <div
                                  className="evidence-thumbnail-wrapper"
                                  onClick={() => setSelectedPhoto({ src: item.image!, title: item.title[locale], id: item.id })}
                                  title={locale === "bn" ? "বড় করে দেখতে ক্লিক করুন" : "Click to view full size"}
                                >
                                  <img src={item.image} alt="Complaint evidence" className="evidence-thumbnail" />
                                  <div className="thumbnail-overlay">
                                    <Eye className="w-4 h-4" />
                                    <span>{locale === "bn" ? "বড় করে দেখুন" : "View Full Size"}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="admin-officer-section">
                            <div className="officer-card">
                              <div className="officer-card-header">
                                <div className="officer-badge">
                                  <Building2 className="w-4 h-4 text-emerald-400" />
                                  <span>{locale === "bn" ? "দায়িত্বপ্রাপ্ত কর্তৃপক্ষ ও দপ্তর" : "Responsible Authority"}</span>
                                </div>
                                <span className="jurisdiction-tag">📍 {item.ward || officer.ward || "All Zones"}</span>
                              </div>
                              <div className="officer-details">
                                <h4 className="authority-name">{officer.authorityName[locale]}</h4>
                                <p className="department-name">{officer.departmentName[locale]}</p>
                                <div className="officer-profile">
                                  <div className="profile-icon"><UserCheck className="w-5 h-5 text-emerald-400" /></div>
                                  <div className="profile-text">
                                    <strong>{officer.officerName[locale]}</strong>
                                    <span>{officer.designation[locale]}</span>
                                  </div>
                                </div>
                                <div className="officer-info-lines">
                                  <div className="info-line">
                                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>{officer.office[locale]}</span>
                                  </div>
                                  <div className="info-line phone-line">
                                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                                    <a href={`tel:${officer.phone}`} className="officer-phone-link">
                                      <strong>{officer.phone}</strong>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
            {!filtered.length && <TableRow><TableCell colSpan={8} className="empty-table">{c.noMatch}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </section>

      {/* Photo Lightbox Modal for Cases */}
      {selectedPhoto && (
        <div className="admin-modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="admin-photo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar">
              <div className="photo-modal-title">
                <Camera className="w-4 h-4 text-emerald-400" />
                <strong>{selectedPhoto.id} · {selectedPhoto.title}</strong>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedPhoto(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="photo-display-container">
              <img src={selectedPhoto.src} alt={selectedPhoto.title} className="full-evidence-photo" />
            </div>
            <div className="photo-modal-footer">
              <span>{locale === "bn" ? "নাগরিকের ডিভাইস থেকে গৃহীত ছবির প্রমাণ" : "Verified Citizen Photographic Evidence"}</span>
              <a href={selectedPhoto.src} download={`evidence-${selectedPhoto.id}.jpg`} className="photo-download-btn">
                <Download className="w-4 h-4" />
                {locale === "bn" ? "ছবি ডাউনলোড" : "Download Photo"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Models({ locale, result }: { locale: Locale; result: EnsembleResult | null }) {
  const c = copy[locale];
  return <div className="content-view">
    <SectionHeading eyebrow="MODEL GOVERNANCE" title={c.modelTitle} description={c.modelIntro} />
    <section className="model-hero"><div className="orchestration"><div><FileText /><span>{locale === "bn" ? "অভিযোগ" : "Complaint"}</span></div><i /><section>{ensembleModels.map((model, index) => <span key={model.id}>M{index + 1}</span>)}</section><ArrowRight /><aside><Network /><span>SOFT<br />VOTE</span></aside></div><article><Badge><Sparkles />{c.production}</Badge><h3>{locale === "bn" ? "প্রতিটি মডেল আলাদা ভুল করে—ensemble সেই ঝুঁকি কমায়।" : "Different models fail differently; the ensemble reduces that risk."}</h3><p>{c.productionText}</p></article></section>
    <section className="model-grid">{ensembleModels.map((model, index) => { const vote = result?.votes[index]; return <article key={model.id}><div className="model-card-top"><BrainCircuit /><Badge variant="outline">{model.family}</Badge></div><h3>{model.name}</h3><p><span>{c.weight}</span><strong>{percent(model.weight)}</strong></p><p><span>{c.lastVote}</span><strong>{vote ? categoryMeta[vote.category][locale] : c.awaiting}</strong></p>{vote && <Progress value={vote.confidence * 100} />}</article>; })}</section>
    <section className="quality-grid"><article><p>01 · {c.pipeline}</p><ol><li><span>1</span>{locale === "bn" ? "Unicode ও Banglish normalization" : "Unicode and Banglish normalization"}</li><li><span>2</span>{locale === "bn" ? "Word ও character feature extraction" : "Word and character feature extraction"}</li><li><span>3</span>{locale === "bn" ? "ছয়টি স্বাধীন probability output" : "Six independent probability outputs"}</li><li><span>4</span>{locale === "bn" ? "Validation-weighted soft voting" : "Validation-weighted soft voting"}</li></ol></article><article><p>02 · {c.quality}</p><ul>{["Stratified train / validation / test", "Probability calibration", "Low-confidence human review", "Macro-F1 + per-class recall", "Bangladesh local-set validation"].map((item) => <li key={item}><Check />{item}</li>)}</ul></article></section>
  </div>;
}

function DataEthics({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <div className="content-view"><SectionHeading eyebrow="RESPONSIBLE AI" title={c.dataTitle} description={c.dataIntro} /><section className="data-layout"><article className="dataset-section"><div className="card-title"><div><p>01</p><h3>{c.sources}</h3></div><Database /></div><div className="datasets">{datasets.map((dataset) => <a key={dataset.title} href={dataset.href} target="_blank" rel="noreferrer"><div><strong>{dataset.title}</strong><Badge variant="outline">OPEN</Badge></div><p>{dataset.use[locale]}</p><span>{dataset.detail[locale]}<ArrowRight /></span></a>)}</div></article><div className="ethics-stack"><article className="ethics dark-card"><ShieldCheck /><p>02</p><h3>{c.privacy}</h3><ul>{privacyItems[locale].map((item) => <li key={item}><Check />{item}</li>)}</ul></article><article className="ethics scope"><Globe2 /><p>03</p><h3>{c.scope}</h3><span>{c.scopeText}</span></article></div></section></div>;
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [tab, setTab] = useState<TabKey>("analyse");
  const [reports, setReportsState] = useState<CivicCase[]>(initialCases);
  const [result, setResult] = useState<EnsembleResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const lang = localStorage.getItem("nagarai-locale");
      const stored = localStorage.getItem("nagarai-reports");
      if (lang === "bn" || lang === "en") setLocale(lang);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Keep user-created custom reports intact and enrich with initial demo data
            const updated = parsed.map((p: CivicCase) => {
              const init = initialCases.find((i) => i.id === p.id);
              if (init && !p.image && init.image) {
                return { ...init, ...p, image: init.image };
              }
              return p;
            });
            for (const init of initialCases) {
              if (!updated.some((u: CivicCase) => u.id === init.id)) {
                updated.push(init);
              }
            }
            setReportsState(updated);
            try { localStorage.setItem("nagarai-reports", JSON.stringify(updated)); } catch {}
          } else {
            setReportsState(initialCases);
            try { localStorage.setItem("nagarai-reports", JSON.stringify(initialCases)); } catch {}
          }
        } catch {
          setReportsState(initialCases);
        }
      } else {
        setReportsState(initialCases);
        try { localStorage.setItem("nagarai-reports", JSON.stringify(initialCases)); } catch {}
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("nagarai-locale", locale); }, [locale, hydrated]);
  const setReports = (items: CivicCase[]) => {
    setReportsState(items);
    try { localStorage.setItem("nagarai-reports", JSON.stringify(items)); }
    catch (err) { console.warn("Failed to persist reports in storage", err); }
  };
  return <Tabs value={tab} onValueChange={(next) => setTab(next as TabKey)} className="app-shell">
    <Header locale={locale} setLocale={setLocale} tab={tab} setTab={setTab} />
    <TabsList className="sr-only">{tabIds.map((id) => <TabsTrigger value={id} key={id}>{id}</TabsTrigger>)}</TabsList>
    <main><TabsContent value="analyse"><Analyse locale={locale} reports={reports} setReports={setReports} result={result} setResult={setResult} /></TabsContent><TabsContent value="dashboard"><Dashboard locale={locale} reports={reports} /></TabsContent><TabsContent value="cases"><Cases locale={locale} reports={reports} /></TabsContent><TabsContent value="models"><Models locale={locale} result={result} /></TabsContent><TabsContent value="data"><DataEthics locale={locale} /></TabsContent><TabsContent value="admin"><AdminPanel locale={locale} reports={reports} setReports={setReports} /></TabsContent></main>
    <footer className="site-footer">
      <div className="footer-brand"><span className="brand-mark"><ShieldCheck /></span><strong>NAGAR<span>AI</span></strong><i /></div>
      <div className="footer-credit"><p>Developed by <strong>Team EvolutionX</strong></p><div className="team-members"><span>Estiuk Arafat Arnob (Team Lead)</span><span>Md. Riyad Hasan</span><span>Abubakkar Siddik</span></div></div>
      <div className="footer-meta">
        <p>{copy[locale].footer}</p>
        <p>© 2026 · REACT Project Showcase</p>
        <p className="footer-contact-line">
          <Phone className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
          <span>Contact: </span>
          <a href="tel:+8801313602221" className="text-emerald-400 hover:underline font-mono">+8801313602221</a>
        </p>
      </div>
    </footer><Toaster position="top-right" richColors />
  </Tabs>;
}
