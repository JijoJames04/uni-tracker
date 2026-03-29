'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, MapPin, Phone, Navigation,
  ExternalLink, AlertCircle, RefreshCw, Map,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────
interface DhlFacility {
  id: number;
  name: string;
  address: string;
  phone?: string;
  lat: number;
  lon: number;
  distanceKm: number;
  mapUrl: string;
  type: string;
}

type Status = 'idle' | 'locating' | 'fetching' | 'done' | 'error';

// ─── Helpers ────────────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildMapUrl(lat: number, lon: number, name: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(name)}/@${lat},${lon},15z`;
}

function formatAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:housenumber'] && tags['addr:street']
      ? `${tags['addr:street']} ${tags['addr:housenumber']}`
      : tags['addr:street'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
    tags['addr:postcode'],
    tags['addr:country'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : tags.name || 'Address unavailable';
}

function resolveType(tags: Record<string, string>): string {
  if (tags.operator?.toLowerCase().includes('dhl')) {
    if (tags.amenity === 'post_office' || tags.shop === 'post') return 'DHL Post Office';
    if (tags.amenity === 'parcel_locker') return 'DHL Parcel Locker';
    return 'DHL Service Point';
  }
  if (tags.name?.toLowerCase().includes('dhl express')) return 'DHL Express';
  if (tags.name?.toLowerCase().includes('packstation')) return 'DHL Packstation';
  return 'DHL Facility';
}

// ─── Overpass Query ─────────────────────────────────────────────────
async function fetchDhlNearby(lat: number, lon: number, radiusMeters = 5000): Promise<DhlFacility[]> {
  // Query for DHL-related nodes/ways in Overpass API
  const query = `
    [out:json][timeout:20];
    (
      node["name"~"DHL",i](around:${radiusMeters},${lat},${lon});
      node["operator"~"DHL",i](around:${radiusMeters},${lat},${lon});
      node["brand"~"DHL",i](around:${radiusMeters},${lat},${lon});
    );
    out body 30;
  `.trim();

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

  const data = await res.json();
  const elements: Array<{ id: number; lat: number; lon: number; tags: Record<string, string> }> =
    data.elements ?? [];

  return elements
    .filter((el) => el.lat && el.lon)
    .map((el) => ({
      id: el.id,
      name: el.tags?.name || el.tags?.operator || 'DHL Facility',
      address: formatAddress(el.tags ?? {}),
      phone: el.tags?.phone || el.tags?.['contact:phone'],
      lat: el.lat,
      lon: el.lon,
      distanceKm: haversineKm(lat, lon, el.lat, el.lon),
      mapUrl: buildMapUrl(el.lat, el.lon, el.tags?.name || 'DHL'),
      type: resolveType(el.tags ?? {}),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);
}

// ─── Component ──────────────────────────────────────────────────────
export default function DhlFacilityFinder() {
  const [status, setStatus] = useState<Status>('idle');
  const [facilities, setFacilities] = useState<DhlFacility[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

  const findFacilities = useCallback(async () => {
    setStatus('locating');
    setFacilities([]);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setStatus('fetching');

        try {
          const results = await fetchDhlNearby(lat, lon);
          setFacilities(results);
          setStatus('done');
        } catch (err) {
          setStatus('error');
          setErrorMsg('Failed to fetch DHL facilities. Please try again.');
          console.error(err);
        }
      },
      (err) => {
        setStatus('error');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setErrorMsg('Location access denied. Please allow location in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setErrorMsg('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setErrorMsg('Location request timed out.');
            break;
          default:
            setErrorMsg('An unknown error occurred while getting your location.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const openUserMapContext = () => {
    if (userLat && userLon) {
      window.open(
        `https://www.google.com/maps/search/DHL/@${userLat},${userLon},14z`,
        '_blank'
      );
    }
  };

  return (
    <div className="space-y-5 pt-6 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10">
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          Nearby DHL Facilities
        </h4>

        {userLat && userLon && (
          <button
            onClick={openUserMapContext}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1.5 transition-colors"
          >
            <Map className="w-3.5 h-3.5" />
            View on Map
          </button>
        )}
      </div>

      {/* CTA Button */}
      {(status === 'idle' || status === 'error') && (
        <motion.button
          onClick={findFacilities}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl
            bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500
            border border-amber-600/50 text-white text-[15px] font-black
            shadow-md hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300"
        >
          <Navigation className="w-4 h-4 shrink-0" />
          {status === 'error' ? 'Retry Finding Near Me' : 'Search DHL Near My Location'}
        </motion.button>
      )}

      {/* Error message */}
      <AnimatePresence>
        {status === 'error' && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading states */}
      <AnimatePresence>
        {(status === 'locating' || status === 'fetching') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-8 text-center"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-500/20 border-t-yellow-400 animate-spin" />
              <Package className="w-4 h-4 text-yellow-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="text-[15px] text-foreground font-bold">
                {status === 'locating' ? 'Getting your location…' : 'Searching for DHL nearby…'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {status === 'locating'
                  ? 'Please allow location access if prompted'
                  : 'Querying OpenStreetMap data'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {status === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {facilities.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-2xl border border-border/50">
                <Package className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-[15px] font-bold text-foreground">No DHL facilities found within 5 km.</p>
                <p className="text-[13px] text-muted-foreground mt-1">Try searching directly on Google Maps.</p>
                <button
                  onClick={openUserMapContext}
                  className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-1.5 mx-auto transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Search on Google Maps
                </button>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-bold text-muted-foreground text-right uppercase tracking-wider">
                  {facilities.length} facilit{facilities.length === 1 ? 'y' : 'ies'} found within 5 km
                </p>
                {facilities.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card/60 backdrop-blur-md border border-border/50 shadow-sm rounded-2xl px-5 py-4 space-y-3
                      hover:border-amber-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    {/* Name + badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{f.name}</p>
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full
                          bg-amber-500/10 text-amber-600 dark:text-amber-500 mt-1.5 border border-amber-500/20">
                          {f.type}
                        </span>
                      </div>
                      <span className="flex-shrink-0 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold
                        bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap shadow-sm">
                        {f.distanceKm < 1
                          ? `${Math.round(f.distanceKm * 1000)} m`
                          : `${f.distanceKm.toFixed(1)} km`}
                      </span>
                    </div>

                    {/* Address */}
                    <p className="text-[13px] text-muted-foreground flex items-start gap-2 pt-1.5 font-medium leading-relaxed">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      {f.address}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      {f.phone && (
                        <a
                          href={`tel:${f.phone}`}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg border border-violet-500/20 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {f.phone}
                        </a>
                      )}
                      <a
                        href={f.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-colors ml-auto"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Directions
                      </a>
                    </div>
                  </motion.div>
                ))}

                {/* Refresh */}
                <button
                  onClick={findFacilities}
                  className="w-full flex items-center justify-center gap-2.5 text-[14px] font-black text-muted-foreground
                    hover:text-amber-600 dark:hover:text-amber-400 bg-background/50 hover:bg-amber-500/10 border border-border/50 hover:border-amber-500/30 rounded-2xl transition-all py-3.5 shadow-sm mt-4"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Location
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
