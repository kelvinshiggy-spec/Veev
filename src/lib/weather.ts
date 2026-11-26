"use client";

import { useEffect, useState } from "react";
import { useStore } from "./store";

// Free, keyless weather from Open-Meteo (open-meteo.com). Only her rounded location is sent,
// and only after she turns weather on. Cached for 30 minutes.

export interface Weather {
  temp: number;
  high: number;
  low: number;
  code: number;
  isDay: boolean;
  unit: "f" | "c";
  at: number;
}

const CACHE = "elevate.weather";

export function describe(code: number): { label: string; kind: "sun" | "cloud" | "rain" | "snow" | "storm" | "fog" } {
  if (code === 0) return { label: "Clear", kind: "sun" };
  if (code <= 2) return { label: "Partly cloudy", kind: "sun" };
  if (code === 3) return { label: "Cloudy", kind: "cloud" };
  if (code === 45 || code === 48) return { label: "Foggy", kind: "fog" };
  if (code >= 51 && code <= 67) return { label: "Rainy", kind: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snowy", kind: "snow" };
  if (code >= 80 && code <= 82) return { label: "Showers", kind: "rain" };
  if (code >= 85 && code <= 86) return { label: "Snow showers", kind: "snow" };
  if (code >= 95) return { label: "Stormy", kind: "storm" };
  return { label: "Mixed", kind: "cloud" };
}

/** A playful one-liner for the dashboard. */
export function weatherLine(w: Weather) {
  const d = describe(w.code);
  const t = `${Math.round(w.temp)}°`;
  switch (d.kind) {
    case "snow":
      return `${t} and snowing. Ski season energy, cozy-night potential.`;
    case "rain":
      return `${t} and rainy. Candle, blanket, a good show. Soft life.`;
    case "storm":
      return `${t} with storms. A perfect stay-in night, no apologies.`;
    case "fog":
      return `${t} and foggy. Moody-chic. Take it slow.`;
    case "cloud":
      return `${t} and cloudy. Good day for the gym and a nice coffee.`;
    default:
      return w.temp >= (w.unit === "f" ? 75 : 24) ? `${t} and sunny. Golden-hour walk? Iced coffee? Yes.` : `${t} and clear. Fresh air will do you good.`;
  }
}

export function useWeather(): Weather | null {
  const { vault } = useStore();
  const loc = vault.settings.weather;
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    if (!loc) return;
    let cancelled = false;
    try {
      const c = JSON.parse(localStorage.getItem(CACHE) || "null") as Weather | null;
      if (c && Date.now() - c.at < 30 * 60_000 && c.unit === loc.unit) {
        setW(c);
        return;
      }
    } catch {}
    if (!navigator.onLine) return;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto&temperature_unit=${loc.unit === "f" ? "fahrenheit" : "celsius"}`;
    fetch(url, { referrerPolicy: "no-referrer" })
      .then((r) => r.json())
      .then((j) => {
        if (cancelled || !j?.current) return;
        const data: Weather = {
          temp: j.current.temperature_2m,
          code: j.current.weather_code,
          isDay: !!j.current.is_day,
          high: j.daily?.temperature_2m_max?.[0] ?? j.current.temperature_2m,
          low: j.daily?.temperature_2m_min?.[0] ?? j.current.temperature_2m,
          unit: loc.unit,
          at: Date.now(),
        };
        setW(data);
        try {
          localStorage.setItem(CACHE, JSON.stringify(data));
        } catch {}
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loc]);
  return loc ? w : null;
}

/** Ask for location once, round it (about 1 km), and save. */
export function requestWeatherLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 }),
      () => resolve(null),
      { maximumAge: 6 * 3600_000, timeout: 10_000, enableHighAccuracy: false },
    );
  });
}
