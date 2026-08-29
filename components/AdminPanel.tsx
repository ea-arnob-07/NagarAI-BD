"use client";

import { useState } from "react";
import {
  Activity, AlertTriangle, BarChart3, Building2, Check, ChevronDown, Download,
  FileText, Filter, Lock, LogOut, MapPin, Search, ShieldCheck, Zap, Eye, EyeOff,
  CircleGauge, Layers3, User, Phone, Send, Printer, Camera, X, MessageSquare,
  Clock, CheckCircle2, AlertCircle, Building, UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { categoryMeta, getCategories, type Category, type Severity } from "@/lib/ensemble";
import { severityLabels, statusLabels, type CaseStatus, type CivicCase, type Locale, type CaseDispatch } from "@/lib/content";
import { getResponsibleOfficer, type ResponsibleOfficer } from "@/data/authorities";

const ADMIN_EMAIL = "eaarnob178@gmail.com";
const ADMIN_PASSWORD = "nagarai123";

type AdminPanelProps = {
  locale: Locale;
  reports: CivicCase[];
  setReports: (items: CivicCase[]) => void;
};

const percent = (value: number) => `${Math.round(value * 100)}%`;
const severityClass = (value: Severity) => `severity-${value}`;
const dateLabel = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

function AdminLogin({ locale, onLogin }: { locale: Locale; onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem("nagarai-admin", "true");
        onLogin();
        toast.success(locale === "bn" ? "অ্যাডমিন প্যানেলে স্বাগতম!" : "Welcome to Admin Panel!");
      } else {
        setError(locale === "bn" ? "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে" : "Invalid email or password");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="admin-login-wrapper">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-header">
          <div className="admin-login-icon"><Lock /></div>
          <h2>{locale === "bn" ? "অ্যাডমিন লগইন" : "Admin Login"}</h2>
          <p>{locale === "bn" ? "অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার credentials দিন" : "Enter your credentials to access the admin panel"}</p>
        </div>
        {error && <div className="admin-login-error"><AlertTriangle />{error}</div>}
        <div className="admin-field">
          <label>{locale === "bn" ? "ইমেইল" : "Email"}</label>
          <div className="admin-input-icon"><User /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@nagarai.bd" required /></div>
        </div>
        <div className="admin-field">
          <label>{locale === "bn" ? "পাসওয়ার্ড" : "Password"}</label>
          <div className="admin-input-icon"><Lock /><Input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /><button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff /> : <Eye />}</button></div>
        </div>
        <Button type="submit" disabled={loading} className="admin-login-btn">{loading ? <span className="spin-inline">⏳</span> : <ShieldCheck />}{locale === "bn" ? "প্রবেশ করুন" : "Sign In"}</Button>
      </form>
    </div>
  );
}

function StatCard({ label, value, note, Icon, color }: { label: string; value: string; note: string; Icon: typeof Activity; color?: string }) {
  return (
    <article className="admin-stat-card" style={color ? { borderTopColor: color } : {}}>
      <div><p>{label}</p><strong>{value}</strong><span>{note}</span></div>
      <i><Icon /></i>
    </article>
  );
}

export default function AdminPanel({ locale, reports, setReports }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("nagarai-admin") === "true";
    return false;
  });
  const [view, setView] = useState<"overview" | "category" | "location" | "status">("overview");
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterSev, setFilterSev] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  // Modals state
  const [selectedNoticeCase, setSelectedNoticeCase] = useState<CivicCase | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; title: string; id: string } | null>(null);
  const [selectedPrintCase, setSelectedPrintCase] = useState<CivicCase | null>(null);

  const logout = () => {
    localStorage.removeItem("nagarai-admin");
    setIsLoggedIn(false);
    toast.info(locale === "bn" ? "লগআউট সফল" : "Logged out");
  };

  if (!isLoggedIn) return <AdminLogin locale={locale} onLogin={() => setIsLoggedIn(true)} />;

  const severityWeight: Record<Severity, number> = { high: 3, medium: 2, low: 1 };
  const filtered = reports
    .filter((item) =>
      `${item.id} ${item.text} ${item.location} ${item.title.en} ${item.title.bn}`.toLowerCase().includes(query.toLowerCase()) &&
      (filterCat === "all" || item.category === filterCat) &&
      (filterSev === "all" || item.severity === filterSev) &&
      (filterStatus === "all" || item.status === filterStatus)
    )
    .sort((a, b) => {
      const diff = severityWeight[b.severity] - severityWeight[a.severity];
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const high = reports.filter((r) => r.severity === "high").length;
  const duplicateCount = reports.filter((r) => r.duplicateOf).length;
  const avgAgreement = reports.reduce((s, r) => s + r.agreement, 0) / Math.max(reports.length, 1);
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const pending = reports.filter((r) => r.status === "review" || r.status === "queued").length;

  // Category groups
  const categoryGroups = getCategories().map((cat) => {
    const items = filtered.filter((r) => r.category === cat);
    return { category: cat, items, count: items.length };
  }).filter((g) => g.count > 0);

  // Location groups
  const locationMap = new Map<string, CivicCase[]>();
  filtered.forEach((r) => {
    const key = r.location || "Unknown";
    const existing = locationMap.get(key) || [];
    existing.push(r);
    locationMap.set(key, existing);
  });
  const locationGroups = Array.from(locationMap.entries())
    .map(([location, items]) => ({ location, items, count: items.length }))
    .sort((a, b) => b.count - a.count);

  // Status groups
  const statusList: CaseStatus[] = ["queued", "review", "assigned", "resolved"];
  const statusGroups = statusList.map((st) => {
    const items = filtered.filter((r) => r.status === st);
    return { status: st, items, count: items.length };
  }).filter((g) => g.count > 0);

  const updateStatus = (id: string, newStatus: CaseStatus) => {
    const updated = reports.map((r) => r.id === id ? { ...r, status: newStatus } : r);
    setReports(updated);
    toast.success(locale === "bn" ? `স্ট্যাটাস আপডেট হয়েছে: ${statusLabels[newStatus].bn}` : `Status updated: ${statusLabels[newStatus].en}`);
  };

  const handleDispatchSuccess = (caseId: string, dispatch: CaseDispatch) => {
    const updated = reports.map((r) => {
      if (r.id === caseId) {
        const existingDispatches = r.dispatches || [];
        return {
          ...r,
          status: "assigned" as CaseStatus,
          dispatches: [dispatch, ...existingDispatches],
        };
      }
      return r;
    });
    setReports(updated);
    setSelectedNoticeCase(null);
    toast.success(locale === "bn" ? "অফিশিয়াল নোটিশ ও এসএমএস সফলভাবে প্রেরিত হয়েছে এবং কেসটি Assigned করা হয়েছে!" : "Official notice & SMS dispatched! Case updated to Assigned.");
  };

  const exportCsv = () => {
    const rows = filtered.map((item) =>
      [item.id, item.category, item.severity, item.status, item.confidence.toFixed(3), item.agreement.toFixed(3), item.location, item.ward, item.duplicateOf ?? "", item.text]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(",")
    );
    const blob = new Blob([[
      "id,category,severity,status,confidence,agreement,location,ward,duplicate_of,text",
      ...rows,
    ].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nagarai-admin-reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const ReportRow = ({ item }: { item: CivicCase }) => {
    const isExpanded = expandedReport === item.id;
    const officer = getResponsibleOfficer(item.category, item.ward, item.location, item.lat, item.lng);

    return (
      <>
        <TableRow className={`admin-report-row ${isExpanded ? "expanded" : ""}`}>
          <TableCell className="case-id" onClick={() => setExpandedReport(isExpanded ? null : item.id)}>
            {item.id}
            {item.duplicateOf && <span>DUP</span>}
            {item.image && (
              <span
                className="row-photo-badge"
                title={locale === "bn" ? "ছবির প্রমাণ দেখতে ক্লিক করুন" : "Click to view photo evidence"}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto({ src: item.image!, title: item.title[locale], id: item.id });
                }}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            )}
          </TableCell>
          <TableCell onClick={() => setExpandedReport(isExpanded ? null : item.id)}>
            <div className="issue">
              <strong>{item.title[locale]}</strong>
              <span><MapPin />{item.location}</span>
            </div>
          </TableCell>
          <TableCell onClick={() => setExpandedReport(isExpanded ? null : item.id)}>
            <span className="cat-label" style={{ color: categoryMeta[item.category].color }}>
              {categoryMeta[item.category][locale]}
            </span>
          </TableCell>
          <TableCell onClick={() => setExpandedReport(isExpanded ? null : item.id)}>
            <Badge className={severityClass(item.severity)}>{severityLabels[item.severity][locale]}</Badge>
          </TableCell>
          <TableCell>
            <Select value={item.status} onValueChange={(val) => updateStatus(item.id, val as CaseStatus)}>
              <SelectTrigger className={`admin-status-select status-${item.status}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["queued", "review", "assigned", "resolved"] as CaseStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{statusLabels[s][locale]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell onClick={() => setExpandedReport(isExpanded ? null : item.id)}>{percent(item.confidence)}</TableCell>
          <TableCell onClick={() => setExpandedReport(isExpanded ? null : item.id)}>{percent(item.agreement)}</TableCell>
          <TableCell className="admin-date" onClick={() => setExpandedReport(isExpanded ? null : item.id)}>{dateLabel(item.createdAt, locale)}</TableCell>
          <TableCell>
            <div className="row-action-btns">
              <button
                type="button"
                className="action-icon-btn notice-btn"
                title={locale === "bn" ? "নোটিশ বা এসএমএস পাঠান" : "Dispatch Notice / SMS"}
                onClick={(e) => { e.stopPropagation(); setSelectedNoticeCase(item); }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="action-icon-btn print-btn"
                title={locale === "bn" ? "অফিসিয়াল রিপোর্ট প্রিন্ট / PDF" : "Print Official Report / PDF"}
                onClick={(e) => { e.stopPropagation(); setSelectedPrintCase(item); }}
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="action-icon-btn expand-btn"
                onClick={() => setExpandedReport(isExpanded ? null : item.id)}
              >
                <ChevronDown className={`expand-icon ${isExpanded ? "rotated" : ""}`} />
              </button>
            </div>
          </TableCell>
        </TableRow>

        {isExpanded && (
          <TableRow className="admin-detail-row">
            <TableCell colSpan={9}>
              <div className="admin-detail-content">
                {/* Left side: Complaint statement & metadata */}
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

                  {/* Attached photo preview */}
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

                  {/* Dispatch history if sent before */}
                  {item.dispatches && item.dispatches.length > 0 && (
                    <div className="admin-dispatch-history">
                      <div className="history-header">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>{locale === "bn" ? "প্রেরিত নোটিশ ও সতর্কবার্তা ইতিহাস:" : "Notice & SMS Dispatch History:"}</span>
                      </div>
                      <div className="history-items">
                        {item.dispatches.map((d, idx) => (
                          <div key={idx} className="history-card">
                            <div className="history-card-top">
                              <span className="dispatch-type-badge">
                                <CheckCircle2 className="w-3 h-3" />
                                {d.type.toUpperCase()}
                              </span>
                              <strong>{d.officer} ({d.phone})</strong>
                              <time>{dateLabel(d.date, locale)}</time>
                            </div>
                            <p>{d.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side: Responsible Authority & Officer in charge Card */}
                <div className="admin-officer-section">
                  <div className="officer-card">
                    <div className="officer-card-header">
                      <div className="officer-badge">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <span>{locale === "bn" ? "দায়িত্বপ্রাপ্ত কর্তৃপক্ষ ও কর্মকর্তা" : "Responsible Authority & Officer"}</span>
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
                          <a href={`tel:${officer.phone}`} className="officer-phone-link" title="Click to call directly">
                            <strong>{officer.phone}</strong>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons under this task */}
                    <div className="officer-actions">
                      <Button
                        size="sm"
                        className="officer-btn dispatch-btn"
                        onClick={(e) => { e.stopPropagation(); setSelectedNoticeCase(item); }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        {locale === "bn" ? "নোটিশ ও এসএমএস পাঠান" : "Dispatch Notice / SMS"}
                      </Button>

                      <a href={`tel:${officer.phone}`} className="officer-call-link">
                        <Phone className="w-3.5 h-3.5" />
                        {locale === "bn" ? "সরাসরি কল" : "Direct Call"}
                      </a>

                      <Button
                        size="sm"
                        variant="outline"
                        className="officer-btn print-btn"
                        onClick={(e) => { e.stopPropagation(); setSelectedPrintCase(item); }}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        {locale === "bn" ? "প্রিন্ট / PDF রিপোর্ট" : "Print / PDF Report"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}
      </>
    );
  };

  return (
    <div className="content-view admin-panel">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-badge"><ShieldCheck /><span>ADMIN</span></div>
          <div>
            <h1>{locale === "bn" ? "অ্যাডমিন প্যানেল" : "Admin Panel"}</h1>
            <p>{locale === "bn" ? "সকল রিপোর্ট ক্যাটেগরি, এলাকা ও দায়িত্বপ্রাপ্ত কর্মকর্তা অনুযায়ী পরিচালনা করুন" : "Manage all civic reports by category, location, and assigned authority"}</p>
          </div>
        </div>
        <Button variant="outline" onClick={logout} className="admin-logout"><LogOut />{locale === "bn" ? "লগআউট" : "Logout"}</Button>
      </div>

      {/* Stats */}
      <section className="admin-stats">
        <StatCard label={locale === "bn" ? "মোট রিপোর্ট" : "Total Reports"} value={String(reports.length)} note={locale === "bn" ? "সর্বমোট" : "all time"} Icon={FileText} />
        <StatCard label={locale === "bn" ? "উচ্চ অগ্রাধিকার" : "High Priority"} value={String(high)} note={locale === "bn" ? "জরুরি পর্যালোচনা" : "needs urgent review"} Icon={Zap} color="#e53e3e" />
        <StatCard label={locale === "bn" ? "পেন্ডিং" : "Pending"} value={String(pending)} note={locale === "bn" ? "অপেক্ষমাণ" : "awaiting action"} Icon={AlertTriangle} color="#dd6b20" />
        <StatCard label={locale === "bn" ? "সমাধান হয়েছে" : "Resolved"} value={String(resolved)} note={locale === "bn" ? "সম্পন্ন" : "completed"} Icon={Check} color="#38a169" />
        <StatCard label={locale === "bn" ? "ডুপ্লিকেট" : "Duplicates"} value={String(duplicateCount)} note={locale === "bn" ? "যুক্ত ঘটনা" : "linked"} Icon={Layers3} />
        <StatCard label={locale === "bn" ? "গড় ঐকমত্য" : "Avg Agreement"} value={percent(avgAgreement)} note={locale === "bn" ? "মডেল ঐকমত্য" : "model consensus"} Icon={CircleGauge} />
      </section>

      {/* View Tabs */}
      <div className="admin-view-tabs">
        <button className={view === "overview" ? "active" : ""} onClick={() => setView("overview")}><BarChart3 />{locale === "bn" ? "সকল রিপোর্ট" : "All Reports"}</button>
        <button className={view === "category" ? "active" : ""} onClick={() => setView("category")}><Filter />{locale === "bn" ? "ক্যাটেগরি অনুসারে" : "By Category"}</button>
        <button className={view === "location" ? "active" : ""} onClick={() => setView("location")}><MapPin />{locale === "bn" ? "লোকেশন অনুসারে" : "By Location"}</button>
        <button className={view === "status" ? "active" : ""} onClick={() => setView("status")}><Activity />{locale === "bn" ? "স্ট্যাটাস অনুসারে" : "By Status"}</button>
        <div className="admin-tab-actions">
          <Button onClick={exportCsv} size="sm"><Download />{locale === "bn" ? "CSV ডাউনলোড" : "Export CSV"}</Button>
        </div>
      </div>

      {/* Filters */}
      <section className="admin-filter-bar">
        <div className="admin-search"><Search /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={locale === "bn" ? "আইডি, স্থান বা বিবরণ খুঁজুন..." : "Search by ID, location, or description..."} /></div>
        <Select value={filterCat} onValueChange={setFilterCat}><SelectTrigger className="admin-filter-select"><Filter /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{locale === "bn" ? "সব ক্যাটেগরি" : "All Categories"}</SelectItem>{getCategories().map((c) => <SelectItem key={c} value={c}>{categoryMeta[c][locale]}</SelectItem>)}</SelectContent></Select>
        <Select value={filterSev} onValueChange={setFilterSev}><SelectTrigger className="admin-filter-select"><AlertTriangle /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{locale === "bn" ? "সব অগ্রাধিকার" : "All Priorities"}</SelectItem>{(["low", "medium", "high"] as Severity[]).map((s) => <SelectItem key={s} value={s}>{severityLabels[s][locale]}</SelectItem>)}</SelectContent></Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="admin-filter-select"><Activity /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{locale === "bn" ? "সব স্ট্যাটাস" : "All Status"}</SelectItem>{(["queued", "review", "assigned", "resolved"] as CaseStatus[]).map((s) => <SelectItem key={s} value={s}>{statusLabels[s][locale]}</SelectItem>)}</SelectContent></Select>
        <span className="admin-count">{filtered.length} / {reports.length}</span>
      </section>

      {/* Content */}
      {view === "overview" && (
        <section className="admin-table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{locale === "bn" ? "সমস্যা" : "Issue"}</TableHead>
                <TableHead>{locale === "bn" ? "বিষয়" : "Category"}</TableHead>
                <TableHead>{locale === "bn" ? "অগ্রাধিকার" : "Priority"}</TableHead>
                <TableHead>{locale === "bn" ? "অবস্থা" : "Status"}</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>{locale === "bn" ? "ঐকমত্য" : "Agreement"}</TableHead>
                <TableHead>{locale === "bn" ? "তারিখ" : "Date"}</TableHead>
                <TableHead>{locale === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => <ReportRow key={item.id} item={item} />)}
              {!filtered.length && <TableRow><TableCell colSpan={9} className="empty-table">{locale === "bn" ? "কোনো রিপোর্ট নেই" : "No reports found"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </section>
      )}

      {view === "category" && (
        <section className="admin-grouped-view">
          {categoryGroups.map(({ category, items, count }) => (
            <div key={category} className="admin-group-card">
              <div className="admin-group-header">
                <span className="admin-group-dot" style={{ backgroundColor: categoryMeta[category].color }} />
                <h3>{categoryMeta[category][locale]}</h3>
                <Badge variant="outline">{count} {locale === "bn" ? "টি রিপোর্ট" : "reports"}</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{locale === "bn" ? "সমস্যা" : "Issue"}</TableHead>
                    <TableHead>{locale === "bn" ? "বিষয়" : "Category"}</TableHead>
                    <TableHead>{locale === "bn" ? "অগ্রাধিকার" : "Priority"}</TableHead>
                    <TableHead>{locale === "bn" ? "অবস্থা" : "Status"}</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>{locale === "bn" ? "ঐকমত্য" : "Agreement"}</TableHead>
                    <TableHead>{locale === "bn" ? "তারিখ" : "Date"}</TableHead>
                    <TableHead>{locale === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => <ReportRow key={item.id} item={item} />)}
                </TableBody>
              </Table>
            </div>
          ))}
          {!categoryGroups.length && <div className="admin-empty">{locale === "bn" ? "কোনো রিপোর্ট নেই" : "No reports found"}</div>}
        </section>
      )}

      {view === "location" && (
        <section className="admin-grouped-view">
          {locationGroups.map(({ location, items, count }) => (
            <div key={location} className="admin-group-card">
              <div className="admin-group-header">
                <MapPin />
                <h3>{location}</h3>
                <Badge variant="outline">{count} {locale === "bn" ? "টি রিপোর্ট" : "reports"}</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{locale === "bn" ? "সমস্যা" : "Issue"}</TableHead>
                    <TableHead>{locale === "bn" ? "বিষয়" : "Category"}</TableHead>
                    <TableHead>{locale === "bn" ? "অগ্রাধিকার" : "Priority"}</TableHead>
                    <TableHead>{locale === "bn" ? "অবস্থা" : "Status"}</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>{locale === "bn" ? "ঐকমত্য" : "Agreement"}</TableHead>
                    <TableHead>{locale === "bn" ? "তারিখ" : "Date"}</TableHead>
                    <TableHead>{locale === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => <ReportRow key={item.id} item={item} />)}
                </TableBody>
              </Table>
            </div>
          ))}
          {!locationGroups.length && <div className="admin-empty">{locale === "bn" ? "কোনো রিপোর্ট নেই" : "No reports found"}</div>}
        </section>
      )}

      {view === "status" && (
        <section className="admin-grouped-view">
          {statusGroups.map(({ status, items, count }) => (
            <div key={status} className="admin-group-card">
              <div className="admin-group-header">
                <span className={`status-indicator-dot dot-${status}`} />
                <h3>{statusLabels[status][locale]}</h3>
                <Badge variant="outline" className={`status-${status}`}>
                  {count} {locale === "bn" ? "টি রিপোর্ট" : "reports"}
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{locale === "bn" ? "সমস্যা" : "Issue"}</TableHead>
                    <TableHead>{locale === "bn" ? "বিষয়" : "Category"}</TableHead>
                    <TableHead>{locale === "bn" ? "অগ্রাধিকার" : "Priority"}</TableHead>
                    <TableHead>{locale === "bn" ? "অবস্থা" : "Status"}</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>{locale === "bn" ? "ঐকমত্য" : "Agreement"}</TableHead>
                    <TableHead>{locale === "bn" ? "তারিখ" : "Date"}</TableHead>
                    <TableHead>{locale === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => <ReportRow key={item.id} item={item} />)}
                </TableBody>
              </Table>
            </div>
          ))}
          {!statusGroups.length && <div className="admin-empty">{locale === "bn" ? "কোনো রিপোর্ট নেই" : "No reports found"}</div>}
        </section>
      )}

      {/* ─── MODAL 1: NOTICE & SMS DISPATCH MODAL ─── */}
      {selectedNoticeCase && (
        <NoticeDispatchModal
          item={selectedNoticeCase}
          locale={locale}
          onClose={() => setSelectedNoticeCase(null)}
          onSuccess={(dispatch) => handleDispatchSuccess(selectedNoticeCase.id, dispatch)}
        />
      )}

      {/* ─── MODAL 2: FULL PHOTO LIGHTBOX MODAL ─── */}
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

      {/* ─── MODAL 3: OFFICIAL PRINT / PDF DOCKET MODAL ─── */}
      {selectedPrintCase && (
        <PrintDocketModal
          item={selectedPrintCase}
          reports={reports}
          locale={locale}
          onClose={() => setSelectedPrintCase(null)}
        />
      )}
    </div>
  );
}

/**
 * Notice & Automated SMS Dispatch Modal
 */
function NoticeDispatchModal({
  item,
  locale,
  onClose,
  onSuccess,
}: {
  item: CivicCase;
  locale: Locale;
  onClose: () => void;
  onSuccess: (dispatch: CaseDispatch) => void;
}) {
  const officer = getResponsibleOfficer(item.category, item.ward, item.location, item.lat, item.lng);

  const defaultMessage = locale === "bn"
    ? `[নগরএআই জরুরি নোটিশ] কেস #${item.id} (${severityLabels[item.severity].bn} অগ্রাধিকার)। এলাকা: ${item.location} (${item.ward || "জোন"})। সমস্যা: ${item.text.slice(0, 100)}...। দায়িত্বপ্রাপ্ত কর্মকর্তা: ${officer.officerName.bn} (${officer.phone})। অবিলম্বে সরেজমিনে পরিদর্শন ও প্রয়োজনীয় ব্যবস্থা গ্রহণের নির্দেশ প্রদান করা হলো।`
    : `[NAGARAI CIVIC ALERT] Case #${item.id} (${severityLabels[item.severity].en} Priority). Location: ${item.location} (${item.ward || "Zone"}). Issue: ${item.text.slice(0, 100)}... Assigned to: ${officer.officerName.en} (${officer.phone}). Prompt field inspection and action requested.`;

  const [message, setMessage] = useState(defaultMessage);
  const [dispatchType, setDispatchType] = useState<"sms" | "notice" | "call">("sms");
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      onSuccess({
        date: new Date().toISOString(),
        type: dispatchType,
        officer: officer.officerName[locale],
        phone: officer.phone,
        message,
      });
      setSending(false);
    }, 700);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-dispatch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top-bar">
          <div className="dispatch-title">
            <Send className="w-5 h-5 text-emerald-400" />
            <div>
              <h3>{locale === "bn" ? "দায়িত্বপ্রাপ্ত কর্মকর্তাকে নোটিশ / এসএমএস প্রেরণ" : "Dispatch Notice / SMS to Officer"}</h3>
              <p>{item.id} · {item.title[locale]}</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="dispatch-body">
          {/* Target Officer Card */}
          <div className="dispatch-target-card">
            <div className="target-icon"><Building2 className="w-5 h-5 text-emerald-400" /></div>
            <div className="target-meta">
              <strong>{officer.officerName[locale]}</strong>
              <span>{officer.designation[locale]} · {officer.departmentName[locale]}</span>
              <small>{officer.office[locale]} | {locale === "bn" ? "ওয়ার্ড:" : "Ward:"} {item.ward || officer.ward || "—"}</small>
            </div>
            <a href={`tel:${officer.phone}`} className="target-call-badge" title="Direct call">
              <Phone className="w-4 h-4" />
              <span>{officer.phone}</span>
            </a>
          </div>

          {/* Dispatch Channel */}
          <div className="dispatch-field">
            <label>{locale === "bn" ? "প্রেরণের মাধ্যম:" : "Dispatch Channel:"}</label>
            <div className="channel-selector">
              <button
                type="button"
                className={`channel-btn ${dispatchType === "sms" ? "active" : ""}`}
                onClick={() => setDispatchType("sms")}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{locale === "bn" ? "স্বয়ংক্রিয় এসএমএস (SMS)" : "Automated SMS"}</span>
              </button>
              <button
                type="button"
                className={`channel-btn ${dispatchType === "notice" ? "active" : ""}`}
                onClick={() => setDispatchType("notice")}
              >
                <FileText className="w-4 h-4" />
                <span>{locale === "bn" ? "অফিশিয়াল নোটিশ (Notice)" : "Official Notice"}</span>
              </button>
            </div>
          </div>

          {/* Notice / SMS message body */}
          <div className="dispatch-field">
            <div className="field-label-row">
              <label>{locale === "bn" ? "বার্তা / নোটিশের বিবরণ (সরাসরি সম্পাদনাযোগ্য):" : "Message / Notice Content (Editable):"}</label>
              <span>{message.length} {locale === "bn" ? "অক্ষর" : "chars"}</span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="dispatch-textarea"
            />
          </div>

          <div className="dispatch-hint">
            <AlertCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p>
              {locale === "bn"
                ? "নোটিশ প্রেরণের সাথে সাথে কেসটির স্ট্যাটাস স্বয়ংক্রিয়ভাবে 'Assigned' এ রূপান্তরিত হবে এবং ট্র্যাকিং লগে সংরক্ষিত থাকবে।"
                : "Upon sending, the case status will automatically transition to 'Assigned' and log into the docket tracking history."}
            </p>
          </div>
        </div>

        <div className="dispatch-modal-footer">
          <Button variant="outline" onClick={onClose}>{locale === "bn" ? "বাতিল" : "Cancel"}</Button>
          <a href={`tel:${officer.phone}`} className="dispatch-phone-direct">
            <Phone className="w-4 h-4" />
            {locale === "bn" ? "সরাসরি কল দিন" : "Direct Call"}
          </a>
          <Button disabled={sending || !message.trim()} onClick={handleSend} className="dispatch-submit-btn">
            {sending ? <span className="spin-inline">⏳</span> : <Send className="w-4 h-4" />}
            {locale === "bn" ? "নোটিশ ও এসএমএস পাঠান" : "Send Notice & SMS"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Official Printable / PDF Civic Case Docket Modal
 */
function PrintDocketModal({
  item,
  reports,
  locale,
  onClose,
}: {
  item: CivicCase;
  reports: CivicCase[];
  locale: Locale;
  onClose: () => void;
}) {
  const officer = getResponsibleOfficer(item.category, item.ward, item.location, item.lat, item.lng);

  // Filter other pending/in-progress cases in the SAME area/ward, strictly excluding resolved ones
  const otherActiveIssues = reports.filter((r) => {
    if (r.id === item.id) return false;
    if (r.status === "resolved") return false; // Strictly exclude resolved cases as requested!
    // Match by ward or primary location name
    const matchesWard = Boolean(r.ward && item.ward && r.ward.toLowerCase() === item.ward.toLowerCase());
    const primaryLoc = item.location.split(",")[0].trim().toLowerCase();
    const matchesLocation = Boolean(primaryLoc && r.location && r.location.toLowerCase().includes(primaryLoc));
    return matchesWard || matchesLocation;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-modal-overlay print-modal-overlay" onClick={onClose}>
      <div className="admin-docket-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Toolbar (hidden in physical print via CSS) */}
        <div className="docket-modal-toolbar no-print">
          <div className="toolbar-left">
            <Printer className="w-5 h-5 text-emerald-400" />
            <strong>{locale === "bn" ? "অফিশিয়াল রিপোর্ট ডকেট প্রিভিউ (Print & PDF Ready)" : "Official Case Docket Preview (Print & PDF Ready)"}</strong>
          </div>
          <div className="toolbar-actions">
            <Button onClick={handlePrint} className="print-trigger-btn">
              <Printer className="w-4 h-4 mr-1.5" />
              {locale === "bn" ? "প্রিন্ট / পিডিএফ সংরক্ষণ" : "Print / Save as PDF"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1.5" />
              {locale === "bn" ? "বন্ধ করুন" : "Close"}
            </Button>
          </div>
        </div>

        {/* ─── PRINTABLE DOCUMENT DOCKET SHEET ─── */}
        <div className="print-docket-container">
          {/* Official Seal Header */}
          <div className="docket-header">
            <div className="docket-seal-box">
              <div className="docket-emblem">🇧🇩</div>
              <div className="docket-gov-titles">
                <h2>{locale === "bn" ? "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" : "Government of the People's Republic of Bangladesh"}</h2>
                <h3>{locale === "bn" ? "নগর এআই নাগরিক বুদ্ধিমত্তা ও অভিযোগ নিষ্পত্তি প্ল্যাটফর্ম" : "NAGARAI · CITIZEN INTELLIGENCE & CIVIC DISPATCH SYSTEM"}</h3>
                <p>{officer.authorityName[locale]} · {officer.departmentName[locale]}</p>
              </div>
            </div>
            <div className="docket-meta-box">
              <div className="docket-badge-id">
                <span>DOCKET ID</span>
                <strong>{item.id}</strong>
              </div>
              <div className="docket-meta-date">
                <span>PRINT DATE:</span>
                <strong>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
              </div>
              <div className={`docket-priority-stamp stamp-${item.severity}`}>
                {item.severity.toUpperCase()} PRIORITY
              </div>
            </div>
          </div>

          <div className="docket-divider" />

          {/* Section 1: Area & Incident Coordinates */}
          <div className="docket-section">
            <h4 className="docket-section-title">
              1. {locale === "bn" ? "এলাকা ও ঘটনার বিবরণ (Area & Incident Identification)" : "Area & Incident Identification"}
            </h4>
            <div className="docket-grid-two">
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "অবস্থান / এলাকা:" : "Location / Area:"}</span>
                <strong className="kv-value">{item.location}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "ওয়ার্ড / জোন:" : "Ward / Zone:"}</span>
                <strong className="kv-value">{item.ward || "General Area"}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "জিপিএস স্থানাঙ্ক (Coordinates):" : "GPS Coordinates:"}</span>
                <strong className="kv-value">{item.lat && item.lng ? `${item.lat.toFixed(5)}° N, ${item.lng.toFixed(5)}° E` : "23.8103° N, 90.4125° E (Map Verified)"}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "অভিযোগ দাখিলের সময়:" : "Reported Timestamp:"}</span>
                <strong className="kv-value">{dateLabel(item.createdAt, locale)}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "বর্তমান অবস্থা:" : "Current Status:"}</span>
                <strong className="kv-value uppercase">{statusLabels[item.status][locale]}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "ডুপ্লিকেট স্ট্যাটাস:" : "Duplicate Linked:"}</span>
                <strong className="kv-value">{item.duplicateOf ? `Duplicate of ${item.duplicateOf}` : "Original Incident (Primary)"}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Responsible Authority & Officer in Charge */}
          <div className="docket-section">
            <h4 className="docket-section-title">
              2. {locale === "bn" ? "দায়িত্বপ্রাপ্ত কর্তৃপক্ষ ও কর্মকর্তা (Authority in Charge)" : "Authority in Charge"}
            </h4>
            <div className="docket-officer-box">
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "কর্তৃপক্ষ ও সংস্থা:" : "Authority & Entity:"}</span>
                <strong className="kv-value">{officer.authorityName[locale]}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "সংশ্লিষ্ট বিভাগ:" : "Designated Department:"}</span>
                <strong className="kv-value">{officer.departmentName[locale]}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "দায়িত্বপ্রাপ্ত কর্মকর্তা:" : "Officer in Charge:"}</span>
                <strong className="kv-value text-green-dark">{officer.officerName[locale]}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "পদবী:" : "Designation:"}</span>
                <strong className="kv-value">{officer.designation[locale]}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "জরুরি যোগাযোগ / ফোন:" : "Official Phone:"}</span>
                <strong className="kv-value phone-highlight">{officer.phone}</strong>
              </div>
              <div className="docket-kv">
                <span className="kv-label">{locale === "bn" ? "দপ্তর ও জোনাল কার্যালয়:" : "Zonal Office:"}</span>
                <strong className="kv-value">{officer.office[locale]}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Problem Classification & Citizen Statement */}
          <div className="docket-section">
            <h4 className="docket-section-title">
              3. {locale === "bn" ? "সমস্যার মূল্যায়ন ও বিবরণ (Problem Evaluation & Risk)" : "Problem Evaluation & Risk"}
            </h4>
            <div className="docket-ai-eval">
              <div>
                <span className="kv-label">{locale === "bn" ? "বিষয় / ক্যাটেগরি:" : "Category:"}</span>
                <strong className="kv-value">{categoryMeta[item.category][locale]}</strong>
              </div>
              <div>
                <span className="kv-label">{locale === "bn" ? "ঝুঁকির মাত্রা (Risk Level):" : "Risk Level:"}</span>
                <strong className={`kv-value risk-${item.severity}`}>{item.severity.toUpperCase()} RISK</strong>
              </div>
              <div>
                <span className="kv-label">{locale === "bn" ? "Ensemble Confidence:" : "Ensemble Confidence:"}</span>
                <strong className="kv-value">{percent(item.confidence)}</strong>
              </div>
              <div>
                <span className="kv-label">{locale === "bn" ? "মডেল ঐকমত্য:" : "Model Consensus:"}</span>
                <strong className="kv-value">{percent(item.agreement)}</strong>
              </div>
            </div>
            <div className="docket-verbatim">
              <span className="kv-label">{locale === "bn" ? "নাগরিকের মূল বক্তব্য (Citizen Statement Verbatim):" : "Citizen Statement (Verbatim):"}</span>
              <p className="statement-text">"{item.text}"</p>
            </div>
          </div>

          {/* Section 4: Attached Photo Evidence */}
          <div className="docket-section">
            <h4 className="docket-section-title">
              4. {locale === "bn" ? "সংযুক্ত ছবির প্রমাণ (Photographic Evidence)" : "Photographic Evidence"}
            </h4>
            {item.image ? (
              <div className="docket-photo-wrapper">
                <img src={item.image} alt="Evidence" className="docket-photo" />
                <div className="photo-caption">
                  <span>PHOTO EVIDENCE CAPTURED VIA NAGARAI CITIZEN INTERFACE · VERIFIED GEOTAG</span>
                  <span>CASE: {item.id}</span>
                </div>
              </div>
            ) : (
              <div className="docket-no-photo">
                <Camera className="w-5 h-5 text-zinc-400 inline mr-2" />
                <span>{locale === "bn" ? "এই অভিযোগটির সাথে কোনো ডিজিটাল ছবি সংযুক্ত করা হয়নি।" : "No digital photographic evidence was attached to this report."}</span>
              </div>
            )}
          </div>

          {/* Section 5: Other Active/Pending Issues in Same Area (excluding resolved) */}
          <div className="docket-section page-break-avoid">
            <div className="other-issues-header">
              <h4 className="docket-section-title">
                5. {locale === "bn" ? "একই এলাকার অন্যান্য চলমান ও পেন্ডিং সমস্যার তালিকা" : "Other Active & Pending Issues in this Ward/Area"}
              </h4>
              <span className="other-issues-count">
                {otherActiveIssues.length} {locale === "bn" ? "টি অনিষ্পন্ন সমস্যা" : "active unresolved issues"}
              </span>
            </div>
            <p className="docket-sub-note">
              {locale === "bn"
                ? "পরিদর্শনকারী কর্মকর্তা/ইঞ্জিনিয়ারের সুবিধার্থে একই এলাকার অন্যান্য পেন্ডিং সমস্যা দেখানো হলো (সমাধানকৃত সমস্যা বাদ দেওয়া হয়েছে)।"
                : "For field inspectors & zonal engineers: only active, in-progress, or review items are shown (resolved issues are excluded)."}
            </p>

            {otherActiveIssues.length > 0 ? (
              <table className="docket-table">
                <thead>
                  <tr>
                    <th>CASE ID</th>
                    <th>{locale === "bn" ? "বিষয়" : "Category"}</th>
                    <th>{locale === "bn" ? "সমস্যার বিবরণ" : "Issue Description"}</th>
                    <th>{locale === "bn" ? "ঝুঁকি" : "Risk"}</th>
                    <th>{locale === "bn" ? "অবস্থা" : "Status"}</th>
                    <th>{locale === "bn" ? "তারিখ" : "Date"}</th>
                  </tr>
                </thead>
                <tbody>
                  {otherActiveIssues.map((sub) => (
                    <tr key={sub.id}>
                      <td className="font-mono font-bold">{sub.id}</td>
                      <td>{categoryMeta[sub.category][locale]}</td>
                      <td className="truncate-cell">{sub.title[locale]}</td>
                      <td>
                        <span className={`docket-mini-pill pill-${sub.severity}`}>
                          {sub.severity.toUpperCase()}
                        </span>
                      </td>
                      <td>{statusLabels[sub.status][locale]}</td>
                      <td>{dateLabel(sub.createdAt, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="docket-empty-active">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1.5" />
                <span>{locale === "bn" ? "এই এলাকায় অন্য কোনো পেন্ডিং বা চলমান সমস্যা নেই।" : "No other pending or in-progress issues exist in this area."}</span>
              </div>
            )}
          </div>

          {/* Section 6: Official Signature & Dispatch Authorization */}
          <div className="docket-signatures">
            <div className="sig-block">
              <div className="sig-line" />
              <strong>{locale === "bn" ? "তদন্তকারী কর্মকর্তার স্বাক্ষর ও সীল" : "Field Inspector Signature & Seal"}</strong>
              <span>{locale === "bn" ? "তারিখ:" : "Date:"} _________________</span>
            </div>
            <div className="sig-block">
              <div className="sig-line" />
              <strong>{locale === "bn" ? "নির্বাহী প্রকৌশলী / জোনাল কর্মকর্তা" : "Executive Engineer / Zonal Head"}</strong>
              <span>{locale === "bn" ? "অনুমোদনের তারিখ:" : "Approval Date:"} _________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Refinement 117: feat(ml): add confidence thresholding for human-in-the-loop triage
// Refinement 126: refactor(ui): extract reusable badge variants using class-variance-authority
// Refinement 135: perf(ui): lazy load heavy leaflet icons and map tile layers
// Refinement 144: feat(admin): add one-click pdf municipal docket print preview
// Refinement 153: feat(i18n): improve banglish transliteration mapping for road damage
// Refinement 162: test(components): test form submission validation with empty text inputs
// Refinement 171: perf(db): optimize batch insert queries for seed complaint datasets
// Refinement 180: feat: add offline indicator banner when connection is interrupted
// Refinement 189: feat: add live character counter on citizen complaint description input
// Refinement 198: perf(ml): reduce tf-idf feature matrix memory footprint (iteration 2)
// Refinement 207: fix(ml): adjust duplicate similarity threshold to 0.78 for ward radius (iteration 2)
// Refinement 216: refactor(ui): clean up unneeded styled component wrappers in card primitive (iteration 2)
