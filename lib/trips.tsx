"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "./supabase";
import { useAuth } from "./auth-context";
import { NewTripInput, Trip } from "./types";

type TripRow = {
  id: string;
  driver_id: string;
  from_city: string;
  to_city: string;
  accepts_passengers: boolean;
  accepts_parcels: boolean;
  note: string | null;
  created_at: string;
  expires_at: string;
  profiles: { full_name: string } | null;
};

function mapRow(row: TripRow): Trip {
  return {
    id: row.id,
    driverId: row.driver_id,
    driverName: row.profiles?.full_name ?? "سائق",
    driverPhone: null,
    fromCity: row.from_city,
    toCity: row.to_city,
    acceptsPassengers: row.accepts_passengers,
    acceptsParcels: row.accepts_parcels,
    note: row.note,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
  };
}

// Deliberately excludes the driver's phone number: this query backs the
// public home feed, which unauthenticated visitors can load. The phone is
// fetched separately, only once a signed-in user asks to contact a specific
// driver (see getDriverPhone below).
const SELECT_QUERY = "*, profiles!trips_driver_id_fkey(full_name)";

type TripsValue = {
  trips: Trip[];
  loading: boolean;
  loadError: string | null;
  myTrips: Trip[];
  addTrip: (data: NewTripInput) => Promise<{ error: string | null }>;
  deleteTrip: (id: string) => Promise<{ error: string | null }>;
  getDriverPhone: (driverId: string) => Promise<string | null>;
  refresh: () => Promise<void>;
};

const TripsContext = createContext<TripsValue | null>(null);

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trips")
      .select(SELECT_QUERY)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError("تعذّر تحميل الرحلات، تأكد من الاتصال بالإنترنت");
    } else if (data) {
      setLoadError(null);
      setTrips((data as unknown as TripRow[]).map(mapRow));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    refresh();
    // Trips expire on their own timer -- re-poll periodically so stale ones
    // drop out of the feed even if nobody navigates or posts a new one.
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const addTrip = useCallback(
    async (input: NewTripInput) => {
      if (!user) return { error: "لازم تسجل الدخول أول" };
      const expiresAt = new Date(Date.now() + input.durationMinutes * 60_000).toISOString();
      const { error } = await supabase.from("trips").insert({
        driver_id: user.id,
        from_city: input.fromCity,
        to_city: input.toCity,
        accepts_passengers: input.acceptsPassengers,
        accepts_parcels: input.acceptsParcels,
        note: input.note,
        expires_at: expiresAt,
      });
      if (error) return { error: error.message };
      await refresh();
      return { error: null };
    },
    [supabase, user, refresh]
  );

  const deleteTrip = useCallback(
    async (id: string) => {
      if (!user) return { error: "لازم تسجل الدخول أول" };
      const { error } = await supabase.from("trips").delete().eq("id", id).eq("driver_id", user.id);
      if (error) return { error: error.message };
      setTrips((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    },
    [supabase, user]
  );

  const getDriverPhone = useCallback(
    async (driverId: string) => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("phone").eq("id", driverId).maybeSingle();
      return data?.phone ?? null;
    },
    [supabase, user]
  );

  // `trips` already only holds rows the last refresh() found still active
  // (filtered server-side); the 30s poll keeps that from going stale.
  const myTrips = useMemo(() => (user ? trips.filter((t) => t.driverId === user.id) : []), [trips, user]);

  const value: TripsValue = {
    trips,
    loading,
    loadError,
    myTrips,
    addTrip,
    deleteTrip,
    getDriverPhone,
    refresh,
  };

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTrips must be used within TripsProvider");
  return ctx;
}
