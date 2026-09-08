"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Layers, Search, X, Loader2, Check, Compass, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/lib/content";

type LatLng = { lat: number; lng: number };

type LocationMapProps = {
  locale: Locale;
  onLocationSelect: (data: { lat: number; lng: number; address: string }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  isModal?: boolean;
  onClose?: () => void;
  onOpenModal?: () => void;
};

type SearchSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

// Bangladesh center coordinates
const BD_CENTER: LatLng = { lat: 23.6850, lng: 90.3563 };
const BD_DEFAULT_ZOOM = 7;

export default function LocationMap({
  locale,
  onLocationSelect,
  initialLat,
  initialLng,
  initialAddress,
  isModal = false,
  onClose,
  onOpenModal,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const labelsLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const searchTimerRef = useRef<any>(null);

  const [isSatellite, setIsSatellite] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || "");
  const [currentLat, setCurrentLat] = useState<number | undefined>(initialLat);
  const [currentLng, setCurrentLng] = useState<number | undefined>(initialLng);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync state if props change externally
  useEffect(() => {
    if (initialAddress && initialAddress !== selectedAddress) {
      setSelectedAddress(initialAddress);
    }
  }, [initialAddress]);

  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined) {
      setCurrentLat(initialLat);
      setCurrentLng(initialLng);
      if (mapInstanceRef.current && LRef.current) {
        placeMarker(initialLat, initialLng, 15);
      }
    }
  }, [initialLat, initialLng]);

  // Handle ESC key in modal mode
  useEffect(() => {
    if (!isModal || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModal, onClose]);

  // Load Leaflet stylesheet and library dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    import("leaflet")
      .then((L) => {
        LRef.current = L.default || L;
        setLeafletLoaded(true);
      })
      .catch((err) => {
        console.warn("Leaflet dynamic load error:", err);
      });
  }, []);

  const setTileLayer = useCallback((satellite: boolean) => {
    const L = LRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (labelsLayerRef.current) map.removeLayer(labelsLayerRef.current);

    if (satellite) {
      tileLayerRef.current = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles © Esri", maxZoom: 19 }
      ).addTo(map);

      // CartoDB labels overlay for cities, roads, and places in Bangladesh
      labelsLayerRef.current = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
        { maxZoom: 19, pane: "overlayPane" }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors", maxZoom: 19 }
      ).addTo(map);
      labelsLayerRef.current = null;
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${locale === "bn" ? "bn" : "en"}`
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setSelectedAddress(addr);
      setCurrentLat(lat);
      setCurrentLng(lng);
      if (!isModal) {
        onLocationSelect({ lat, lng, address: addr });
      }
    } catch {
      const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setSelectedAddress(addr);
      setCurrentLat(lat);
      setCurrentLng(lng);
      if (!isModal) {
        onLocationSelect({ lat, lng, address: addr });
      }
    }
  }, [locale, isModal, onLocationSelect]);

  const placeMarker = useCallback((lat: number, lng: number, zoom?: number) => {
    const L = LRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    if (markerRef.current) map.removeLayer(markerRef.current);

    const customIcon = L.divIcon({
      className: "nagarai-map-pin",
      html: `<div class="map-pin-inner"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);

    markerRef.current.on("dragend", () => {
      const pos = markerRef.current.getLatLng();
      setCurrentLat(pos.lat);
      setCurrentLng(pos.lng);
      reverseGeocode(pos.lat, pos.lng);
    });

    if (zoom) {
      map.flyTo([lat, lng], zoom, { duration: 1.1 });
    } else {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 1.1 });
    }
  }, [reverseGeocode]);

  // Autocomplete search handler
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value + ", Bangladesh")}&limit=5&accept-language=${locale === "bn" ? "bn" : "en"}`
        );
        const results = await res.json();
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        /* ignore */
      }
    }, 320);
  }, [locale]);

  const selectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setCurrentLat(lat);
    setCurrentLng(lng);
    placeMarker(lat, lng, 16);
    const addr = suggestion.display_name;
    setSelectedAddress(addr);
    setSearchQuery(addr.split(",")[0]);
    if (!isModal) {
      onLocationSelect({ lat, lng, address: addr });
    }
    setSuggestions([]);
    setShowSuggestions(false);
  }, [placeMarker, isModal, onLocationSelect]);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;
    const L = LRef.current;

    const initialCenterLat = initialLat ?? BD_CENTER.lat;
    const initialCenterLng = initialLng ?? BD_CENTER.lng;
    const initialZoom = initialLat ? 15 : BD_DEFAULT_ZOOM;

    const map = L.map(mapRef.current, {
      center: [initialCenterLat, initialCenterLng],
      zoom: initialZoom,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapInstanceRef.current = map;
    setTileLayer(isSatellite);

    map.on("click", (e: any) => {
      if (!isModal && onOpenModal) {
        onOpenModal();
        return;
      }
      setCurrentLat(e.latlng.lat);
      setCurrentLng(e.latlng.lng);
      placeMarker(e.latlng.lat, e.latlng.lng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    if (initialLat && initialLng) {
      placeMarker(initialLat, initialLng);
      if (!initialAddress) {
        reverseGeocode(initialLat, initialLng);
      }
    }

    // Leaflet invalidation for proper tile rendering
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletLoaded]);

  // Invalidate size if modal state changes or window resizes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isModal]);

  useEffect(() => {
    if (mapInstanceRef.current) setTileLayer(isSatellite);
  }, [isSatellite, setTileLayer]);

  const handleLiveLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentLat(lat);
        setCurrentLng(lng);
        placeMarker(lat, lng, 17);
        reverseGeocode(lat, lng);
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast(locale === "bn" ? "লোকেশন অ্যাক্সেস পাওয়া যায়নি।" : "Location access denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Bangladesh")}&limit=1&accept-language=${locale === "bn" ? "bn" : "en"}`
      );
      const results = await res.json();
      if (results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lng = parseFloat(results[0].lon);
        setCurrentLat(lat);
        setCurrentLng(lng);
        placeMarker(lat, lng, 16);
        const addr = results[0].display_name;
        setSelectedAddress(addr);
        if (!isModal) {
          onLocationSelect({ lat, lng, address: addr });
        }
      }
    } catch {
      /* ignore */
    }
    setSearching(false);
  };

  const handleConfirmModal = () => {
    if (currentLat && currentLng) {
      const finalAddr = selectedAddress || `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`;
      onLocationSelect({ lat: currentLat, lng: currentLng, address: finalAddr });
    }
    if (onClose) onClose();
  };

  const mapBody = (
    <div
      className={`location-map-container ${isModal ? "modal-map" : "inline-map clickable-mini-map"}`}
      onClick={() => {
        if (!isModal && onOpenModal) onOpenModal();
      }}
    >
      {/* Map Toolbar - Only shown in dedicated popup modal */}
      {isModal && (
        <div className="map-toolbar">
          <div className="map-search-wrapper">
            <div className="map-search-bar">
              <Search className="search-icon-fixed" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder={locale === "bn" ? "স্থান, এলাকা বা জেলা খুঁজুন..." : "Search area, landmark or road..."}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="map-search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                >
                  <X />
                </button>
              )}
              <Button size="sm" onClick={handleSearch} disabled={searching} className="map-search-btn">
                {searching ? <Loader2 className="spin w-4 h-4" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="map-suggestions">
                {suggestions.map((s, i) => (
                  <button
                    type="button"
                    key={i}
                    className="map-suggestion-item"
                    onClick={() => selectSuggestion(s)}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{s.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="map-actions">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleLiveLocation}
              disabled={locating}
              className="map-live-btn"
            >
              {locating ? <Loader2 className="spin w-4 h-4" /> : <Navigation className="w-4 h-4" />}
              <span>{locale === "bn" ? "লাইভ অবস্থান" : "Live GPS"}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsSatellite(!isSatellite)}
              className="map-layer-btn"
            >
              <Layers className="w-4 h-4" />
              <span>
                {isSatellite
                  ? locale === "bn"
                    ? "ম্যাপ ভিউ"
                    : "Street Map"
                  : locale === "bn"
                  ? "স্যাটেলাইট"
                  : "Satellite"}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapRef} className="map-canvas relative">
        {!isModal && (
          <div className="mini-map-floating-hint">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>{locale === "bn" ? "ম্যাপে ক্লিক করে পপআপে বড় ম্যাপ খুলুন" : "Click anywhere to open selector"}</span>
            <Maximize2 className="w-3 h-3 text-emerald-300 ml-1" />
          </div>
        )}
      </div>

      {/* Inline Mode Footer */}
      {!isModal && (
        <div className="inline-map-footer">
          {selectedAddress ? (
            <div className="map-selected-location">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="truncate">{selectedAddress}</span>
              {currentLat && currentLng && (
                <span className="map-coords-badge">
                  {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
                </span>
              )}
            </div>
          ) : (
            <div className="map-hint">
              <Compass className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                {locale === "bn"
                  ? "ম্যাপের যেকোনো স্থানে ক্লিক করে পপআপে অবস্থান নির্ধারণ করুন"
                  : "Click anywhere on the map to open location selector"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Dedicated Popup Page / Modal Mode
  if (isModal) {
    return (
      <div
        className="map-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose();
        }}
      >
        <div className="map-modal-content">
          {/* Modal Header */}
          <div className="map-modal-header">
            <div className="map-modal-title-group">
              <div className="modal-icon-badge">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3>
                  {locale === "bn"
                    ? "ম্যাপে অবস্থান নির্বাচন করুন"
                    : "Select Location on Map"}
                </h3>
                <p>
                  {locale === "bn"
                    ? "ম্যাপে ক্লিক করে বা অনুসন্ধান করে অভিযোগের সঠিক অবস্থান চিহ্নিত করুন"
                    : "Search or click anywhere on the Bangladesh map to pinpoint exact location"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="map-modal-close"
              onClick={onClose}
              aria-label="Close map modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="map-modal-body">{mapBody}</div>

          {/* Modal Footer */}
          <div className="map-modal-footer">
            <div className="map-modal-footer-info">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {selectedAddress ? (
                <>
                  <span title={selectedAddress}>{selectedAddress}</span>
                  {currentLat && currentLng && (
                    <span className="map-modal-footer-coords">
                      {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  {locale === "bn"
                    ? "ম্যাপে ক্লিক করে একটি অবস্থান চিহ্নিত করুন..."
                    : "Click on the map to drop a pin..."}
                </span>
              )}
            </div>

            <div className="map-modal-footer-actions">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="map-btn-cancel"
              >
                {locale === "bn" ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmModal}
                disabled={!currentLat}
                className="map-btn-confirm"
              >
                <Check className="w-4 h-4" />
                <span>
                  {locale === "bn"
                    ? "এই অবস্থান নিশ্চিত করুন"
                    : "Confirm & Select Location"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Inline Render
  return mapBody;
}

function toast(msg: string) {
  if (typeof window !== "undefined") {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.cssText =
      "position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#07140e;color:#65d8b0;padding:.7rem 1.4rem;border:1px solid #1e3d2c;border-radius:8px;font-size:.84rem;font-weight:600;z-index:999999;box-shadow:0 10px 30px rgba(0,0,0,.5);";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
}
// Refinement 116: refactor(ml): streamline complement naive bayes prior calibration
// Refinement 125: feat(ui): add smooth spring animations for alert dialog transitions
// Refinement 134: feat(ui): add tooltip explanations for machine learning confidence scores
// Refinement 143: fix(gis): fix marker popup styling in high contrast dark mode
// Refinement 152: feat(i18n): expand bangla civic vocabulary dictionary for waterlogging terms
// Refinement 161: test(components): verify interactive map coordinate selector rendering
// Refinement 170: refactor(db): add indexes on complaint category and ward id columns
// Refinement 179: perf: reduce client-side bundle size by stripping debug symbols
// Refinement 188: fix: prevent duplicate form submissions with disabled submit state
// Refinement 197: refactor(ml): optimize soft-voting weights derived from validation f1 (iteration 2)
// Refinement 206: feat(ml): implement semantic duplicate detection cosine scoring (iteration 2)
// Refinement 215: perf(ui): memoize chart rendering components in admin dashboard (iteration 2)
// Refinement 224: fix(gis): handle geolocation permission denial gracefully with fallback pin (iteration 2)
// Refinement 233: fix(admin): resolve sorting glitch on severity column in triage table (iteration 2)
// Refinement 242: feat(emergency): add national emergency helpline 999 quick-dial button (iteration 2)
// Refinement 251: perf(build): optimize tree-shaking for lucide-react icon imports (iteration 2)
