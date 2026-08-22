"use client";

import { Phone, Building2, Siren, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { findAuthority, emergencyNumbers, type AuthorityRegion } from "@/data/authorities";
import type { Category } from "@/lib/ensemble";
import { categoryMeta } from "@/lib/ensemble";
import type { Locale } from "@/lib/content";

type AuthorityInfoProps = {
  locale: Locale;
  lat?: number;
  lng?: number;
  locationText?: string;
  detectedCategory?: Category;
};

export default function AuthorityInfo({ locale, lat, lng, locationText, detectedCategory }: AuthorityInfoProps) {
  const authority = findAuthority(lat, lng, locationText);

  return (
    <div className="authority-info-container">
      {/* Emergency Numbers — always shown */}
      <div className="authority-section emergency-section">
        <div className="authority-section-header">
          <Siren />
          <h3>{locale === "bn" ? "জরুরি সেবা" : "Emergency Services"}</h3>
        </div>
        <div className="emergency-grid">
          {emergencyNumbers.map((num) => (
            <a key={num.number + num.label.en} href={`tel:${num.number}`} className="emergency-card" style={{ borderColor: num.color }}>
              <span className="emergency-icon">{num.icon}</span>
              <div>
                <strong>{num.label[locale]}</strong>
                <span className="emergency-number">{num.number}</span>
              </div>
              <Phone />
            </a>
          ))}
        </div>
      </div>

      {/* Authority Info */}
      {authority ? (
        <div className="authority-section authority-detail">
          <div className="authority-section-header">
            <Building2 />
            <div>
              <h3>{authority.name[locale]}</h3>
              <Badge variant="outline">{authority.type[locale]}</Badge>
            </div>
          </div>

          {/* Office contacts */}
          <div className="authority-contacts">
            <p className="authority-sub-label">{locale === "bn" ? "অফিস যোগাযোগ" : "Office Contacts"}</p>
            {authority.contacts.map((c, i) => (
              <a key={i} href={`tel:${c.phone}`} className="authority-contact-card">
                <div>
                  <strong>{c.office[locale]}</strong>
                  <span>{c.role[locale]}</span>
                </div>
                <div className="authority-phone">
                  <Phone />
                  <strong>{c.phone}</strong>
                </div>
              </a>
            ))}
          </div>

          {/* Category-specific department */}
          {detectedCategory && authority.departments[detectedCategory] && (
            <div className="authority-contacts">
              <p className="authority-sub-label">{locale === "bn" ? "সংশ্লিষ্ট বিভাগ" : "Relevant Department"}</p>
              <a href={`tel:${authority.departments[detectedCategory]!.phone}`} className="authority-contact-card highlighted">
                <div>
                  <strong>{authority.departments[detectedCategory]!.name[locale]}</strong>
                  <span style={{ color: categoryMeta[detectedCategory].color }}>{categoryMeta[detectedCategory][locale]}</span>
                </div>
                <div className="authority-phone">
                  <Phone />
                  <strong>{authority.departments[detectedCategory]!.phone}</strong>
                </div>
              </a>
            </div>
          )}

          {/* All department contacts */}
          <div className="authority-contacts">
            <p className="authority-sub-label">{locale === "bn" ? "সকল বিভাগ" : "All Departments"}</p>
            <div className="dept-grid">
              {Object.entries(authority.departments).map(([cat, dept]) => (
                <a key={cat} href={`tel:${dept.phone}`} className={`dept-card ${cat === detectedCategory ? "active" : ""}`}>
                  <span className="dept-dot" style={{ backgroundColor: categoryMeta[cat as Category].color }} />
                  <div>
                    <strong>{dept.name[locale]}</strong>
                    <span>{dept.phone}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="authority-section authority-empty">
          <AlertCircle />
          <p>{locale === "bn" ? "অবস্থান নির্বাচন করলে সংশ্লিষ্ট কর্তৃপক্ষের তথ্য দেখা যাবে" : "Select a location to see local authority information"}</p>
        </div>
      )}
    </div>
  );
}
// Refinement 115: fix(ml): handle edge case for zero-length complaint descriptions
// Refinement 124: style(ui): improve contrast ratios on high priority severity badges
// Refinement 133: style(ui): refine dark mode borders and card shadow elevation
// Refinement 142: perf(gis): optimize leaflet tile cache headers for low-bandwidth networks
// Refinement 151: security(admin): enforce strict session token checks on status update actions
// Refinement 160: fix(emergency): format emergency phone links with tel: protocol standard
// Refinement 169: fix(build): ensure drizzle schema exports match d1 database columns
// Refinement 178: refactor: extract common types for civic grievance dockets
// Refinement 187: feat: add confirmation modal before resolving high-severity complaints
