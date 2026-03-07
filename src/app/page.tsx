"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Star, Filter, Clock, LayoutGrid, Trophy, Target, XCircle } from "lucide-react";

interface Meeting {
  id: string;
  name: string;
  raceCount: number;
  topPick: string;
  firstRace: string;
}

interface TrackRace {
  id: string;
  time: string;
  distance: string;
  grade: string;
  track: string;
}

interface Pick {
  race_id: string;
  track: string;
  time: string;
  distance: number | string;
  grade: string;
  dog_name: string;
  trap: number;
  prob: number;
  margin: number;
  win_rate: number;
  banger_score: number;
  stars: number;
  label: string;
}

interface ResultRace {
  track: string;
  time: string;
  race_id: string;
  our_pick: string | null;
  our_trap: number;
  our_prob: number;
  our_stars: number;
  winner: string;
  top3: string[];
  verdict: "win" | "place" | "miss" | "no_pick";
  race_url: string;
}

interface ResultsData {
  date: string;
  updated_at: string;
  stats: {
    total: number;
    wins: number;
    places: number;
    misses: number;
    win_rate: number;
    place_rate: number;
  };
  races: ResultRace[];
}

interface PredictionsData {
  date: string;
  model: string;
  generated_at: string;
  total_races: number;
  picks: Pick[];
}

const trapColors: Record<number, string> = {
  1: "bg-red-700",
  2: "bg-blue-700",
  3: "bg-white/90 text-[#111318]",
  4: "bg-neutral-800 border border-white/10",
  5: "bg-orange-600",
  6: "striped-bg",
};

const starTierStyles: Record<number, { border: string; accent: string; label: string }> = {
  5: { border: "border-[#c9a84c]/30", accent: "text-[#c9a84c]", label: "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/25" },
  4: { border: "border-white/10", accent: "text-white/60", label: "bg-white/[0.06] text-white/50 border-white/10" },
  3: { border: "border-white/[0.06]", accent: "text-white/40", label: "bg-white/[0.04] text-white/35 border-white/[0.06]" },
  2: { border: "border-white/[0.04]", accent: "text-white/25", label: "bg-white/[0.03] text-white/25 border-white/[0.04]" },
  1: { border: "border-white/[0.03]", accent: "text-white/20", label: "bg-white/[0.02] text-white/20 border-white/[0.03]" },
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= count
            ? count >= 5
              ? "text-[#c9a84c] fill-[#c9a84c]"
              : count >= 4
                ? "text-white/50 fill-white/50"
                : "text-white/30 fill-white/30"
            : "text-white/[0.06]"
            }`}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [predictions, setPredictions] = useState<PredictionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"predictions" | "results" | "meetings">("predictions");
  const [minStars, setMinStars] = useState(0);
  const [meetingsView, setMeetingsView] = useState<"tracks" | "all">("tracks");
  const [allRaces, setAllRaces] = useState<TrackRace[]>([]);
  const [loadingRaces, setLoadingRaces] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsRes, predsRes] = await Promise.all([
          fetch(`/api/proxy/races/today`, { cache: "no-store" }),
          fetch(`/api/proxy/predictions`, { cache: "no-store" }),
        ]);

        if (meetingsRes.ok) {
          const mData = await meetingsRes.json();
          setMeetings(mData.meetings || []);
        }

        if (predsRes.ok) {
          const pData = await predsRes.json();
          setPredictions(pData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch results
  const fetchResults = useCallback(async () => {
    setLoadingResults(true);
    try {
      const res = await fetch(`/api/proxy/results`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error("Error loading results:", err);
    } finally {
      setLoadingResults(false);
    }
  }, []);

  // Fetch results when tab is switched and auto-refresh every 5 min
  useEffect(() => {
    if (activeTab === "results" && !results) fetchResults();
    if (activeTab !== "results") return;
    const interval = setInterval(fetchResults, 300000);
    return () => clearInterval(interval);
  }, [activeTab, results, fetchResults]);

  // Fetch all races when user switches to "all races" view
  useEffect(() => {
    if (meetingsView !== "all" || allRaces.length > 0 || meetings.length === 0) return;
    const fetchAllRaces = async () => {
      setLoadingRaces(true);
      try {
        const results = await Promise.all(
          meetings.map((m) =>
            fetch(`/api/proxy/track/${m.id}`, { cache: "no-store" })
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          )
        );
        const races: TrackRace[] = [];
        for (const data of results) {
          if (!data?.races) continue;
          for (const r of data.races) {
            races.push({
              id: r.id,
              time: r.time || "",
              distance: r.distance || "",
              grade: r.grade || "",
              track: r.track || data.track || "",
            });
          }
        }
        // Sort by time extracted from "Race at HH:MM"
        races.sort((a, b) => {
          const tA = a.time.replace("Race at ", "");
          const tB = b.time.replace("Race at ", "");
          return tA.localeCompare(tB);
        });
        setAllRaces(races);
      } catch (err) {
        console.error("Error loading all races:", err);
      } finally {
        setLoadingRaces(false);
      }
    };
    fetchAllRaces();
  }, [meetingsView, meetings, allRaces.length]);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const filteredPicks = predictions?.picks.filter((p) => (minStars === 0 ? true : p.stars >= minStars)) || [];
  const starCounts = predictions?.picks.reduce(
    (acc, p) => {
      acc[p.stars] = (acc[p.stars] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  ) || {};

  // Map race_id → max stars from predictions picks
  const raceStars: Record<string, number> = {};
  if (predictions?.picks) {
    for (const p of predictions.picks) {
      if (!raceStars[p.race_id] || p.stars > raceStars[p.race_id]) {
        raceStars[p.race_id] = p.stars;
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-white/25 text-xs uppercase tracking-widest">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </div>
        {predictions && (
          <div className="text-[11px] text-white/15 font-medium">
            {predictions.model} · {predictions.total_races} races analysed
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border border-white/[0.08] rounded-lg overflow-hidden w-fit">
        <button
          onClick={() => setActiveTab("predictions")}
          className={`px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all ${activeTab === "predictions"
            ? "bg-white/[0.08] text-white"
            : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
            }`}
        >
          Predictions
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all border-l border-white/[0.08] ${activeTab === "results"
            ? "bg-white/[0.08] text-white"
            : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
            }`}
        >
          🏁 Results
        </button>
        <button
          onClick={() => setActiveTab("meetings")}
          className={`px-5 py-2 text-xs font-medium uppercase tracking-wider transition-all border-l border-white/[0.08] ${activeTab === "meetings"
            ? "bg-white/[0.08] text-white"
            : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
            }`}
        >
          Meetings ({meetings.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-7 h-7 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
        </div>
      ) : activeTab === "predictions" ? (
        /* PREDICTIONS TAB */
        <div className="space-y-5">
          {/* Summary row */}
          <div className="flex gap-6 text-xs">
            <div>
              <span className="text-white/20 uppercase tracking-wider">Total</span>
              <span className="ml-2 text-white/70 font-semibold tabular-nums">{predictions?.total_races || 0}</span>
            </div>
            <div>
              <span className="text-[#c9a84c]/50 uppercase tracking-wider">★★★★★</span>
              <span className="ml-2 text-[#c9a84c] font-semibold tabular-nums">{starCounts[5] || 0}</span>
            </div>
            <div>
              <span className="text-white/20 uppercase tracking-wider">★★★★</span>
              <span className="ml-2 text-white/50 font-semibold tabular-nums">{starCounts[4] || 0}</span>
            </div>
            <div>
              <span className="text-white/15 uppercase tracking-wider">★★★</span>
              <span className="ml-2 text-white/35 font-semibold tabular-nums">{starCounts[3] || 0}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <Filter className="w-3.5 h-3.5 text-white/15 mr-1" />
            {[
              { label: `All (${predictions?.total_races || 0})`, value: 0 },
              { label: `★★★★★ (${starCounts[5] || 0})`, value: 5 },
              { label: `★★★★+ (${(starCounts[5] || 0) + (starCounts[4] || 0)})`, value: 4 },
              { label: `★★★+ (${(starCounts[5] || 0) + (starCounts[4] || 0) + (starCounts[3] || 0)})`, value: 3 },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setMinStars(f.value)}
                className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${minStars === f.value
                  ? "bg-white/[0.08] text-white"
                  : "text-white/25 hover:text-white/40 hover:bg-white/[0.03]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Race cards */}
          <div className="space-y-2">
            {filteredPicks.map((pick, i) => {
              const tier = starTierStyles[pick.stars] || starTierStyles[1];
              return (
                <Link key={`${pick.race_id}-${i}`} href={`/race/${pick.race_id}`}>
                  <div
                    className={`bg-[#15181f] border rounded-lg p-4 transition-all hover:bg-[#1a1e27] cursor-pointer ${tier.border}`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/30 font-medium uppercase tracking-wider">{pick.track}</span>
                        <span className="text-white/10">·</span>
                        <span className="text-[11px] text-white/20">{pick.time}</span>
                      </div>
                      {pick.stars >= 3 && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider border ${tier.label}`}
                        >
                          {pick.label}
                        </span>
                      )}
                    </div>

                    {/* Main row */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded flex items-center justify-center font-bold text-xs shrink-0 ${trapColors[pick.trap] || "bg-neutral-700"
                          }`}
                        style={{ color: pick.trap === 6 ? '#dc2626' : undefined }}
                      >
                        T{pick.trap}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-white/90 text-sm block truncate">
                          {pick.dog_name}
                        </span>
                        <span className="text-[11px] text-white/20">
                          {pick.distance}m · Grade {pick.grade}
                        </span>
                      </div>
                      <StarRating count={pick.stars} />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                      <div>
                        <span className="text-[10px] text-white/15 uppercase block tracking-wider">Prob</span>
                        <span className="text-xs font-semibold text-white/60 tabular-nums">
                          {(pick.prob * 100).toFixed(1)}%
                        </span>
                        <div className="h-[3px] bg-white/[0.04] rounded-full mt-1">
                          <div
                            className="h-full bg-[#c9a84c]/60 rounded-full"
                            style={{ width: `${Math.min(pick.prob * 200, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/15 uppercase block tracking-wider">Margin</span>
                        <span className="text-xs font-semibold text-white/60 tabular-nums">
                          {(pick.margin * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/15 uppercase block tracking-wider">WR</span>
                        <span className="text-xs font-semibold text-white/60 tabular-nums">
                          {pick.win_rate ? `${(pick.win_rate * 100).toFixed(0)}%` : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : activeTab === "results" ? (
        /* RESULTS TAB */
        <div className="space-y-5">
          {loadingResults ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-7 h-7 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
            </div>
          ) : !results || results.races.length === 0 ? (
            <div className="text-center text-white/25 py-10 border border-white/[0.04] rounded-lg text-sm">
              📭 No results available yet. Results update every 30 minutes.
            </div>
          ) : (
            <>
              {/* Stats summary */}
              <div className="flex gap-6 text-xs">
                <div>
                  <span className="text-white/20 uppercase tracking-wider">Completed</span>
                  <span className="ml-2 text-white/70 font-semibold tabular-nums">{results.stats.total}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-emerald-500/50" />
                  <span className="text-emerald-500/70 font-semibold tabular-nums">{results.stats.wins}</span>
                  <span className="text-white/20 ml-0.5">({(results.stats.win_rate * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-500/50" />
                  <span className="text-amber-500/70 font-semibold tabular-nums">{results.stats.places}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500/30" />
                  <span className="text-red-500/50 font-semibold tabular-nums">{results.stats.misses}</span>
                </div>
              </div>

              {/* Results grouped by track */}
              {(() => {
                const byTrack: Record<string, ResultRace[]> = {};
                results.races.forEach(r => {
                  if (!byTrack[r.track]) byTrack[r.track] = [];
                  byTrack[r.track].push(r);
                });
                return Object.entries(byTrack).map(([track, races]) => {
                  const wins = races.filter(r => r.verdict === "win").length;
                  const total = races.filter(r => r.verdict !== "no_pick").length;
                  return (
                    <div key={track} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-white/30 font-medium uppercase tracking-wider">{track}</span>
                        {total > 0 && (
                          <span className="text-[10px] text-white/20">{wins}/{total} wins</span>
                        )}
                      </div>
                      {races.sort((a, b) => a.time.localeCompare(b.time)).map((r, i) => (
                        <div
                          key={`${r.race_id}-${i}`}
                          className={`bg-[#15181f] border rounded-lg p-4 flex items-center gap-3 ${r.verdict === "win" ? "border-emerald-500/20" : r.verdict === "place" ? "border-amber-500/15" : r.verdict === "miss" ? "border-red-500/10" : "border-white/[0.04]"
                            }`}
                        >
                          {/* Verdict icon */}
                          <div className={`w-9 h-9 rounded flex items-center justify-center text-base shrink-0 ${r.verdict === "win" ? "bg-emerald-500/10" : r.verdict === "place" ? "bg-amber-500/10" : r.verdict === "miss" ? "bg-red-500/5" : "bg-white/[0.03]"
                            }`}>
                            {r.verdict === "win" ? "✅" : r.verdict === "place" ? "🟡" : r.verdict === "miss" ? "❌" : "⏳"}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-white/20">
                              {r.time}
                              {r.our_stars > 0 && " · " + "★".repeat(r.our_stars) + "☆".repeat(5 - r.our_stars)}
                            </div>
                            <div className="font-semibold text-white/90 text-sm truncate">
                              {r.our_pick ? `T${r.our_trap} ${r.our_pick}` : "No prediction"}
                            </div>
                            <div className="text-[11px] text-white/25 mt-0.5">
                              {r.verdict === "win" ? "🏆 Winner!" : r.verdict === "place" ? `🥉 Top 3 — Won: ${r.winner}` : r.verdict === "miss" ? `Won: ${r.winner}` : ""}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}

              {/* Updated timestamp */}
              <div className="text-center text-[10px] text-white/15 pt-2">
                Updated: {new Date(results.updated_at).toLocaleTimeString()} · Auto-refreshes every 5 min
              </div>
            </>
          )}
        </div>
      ) : (
        /* MEETINGS TAB */
        <div className="space-y-4">
          {/* Sub-toggle: By Track / All Races */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMeetingsView("tracks")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-md transition-all ${meetingsView === "tracks"
                ? "bg-white/[0.08] text-white border border-white/[0.12]"
                : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
            >
              <LayoutGrid className="w-3 h-3" />
              By Track
            </button>
            <button
              onClick={() => setMeetingsView("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-md transition-all ${meetingsView === "all"
                ? "bg-white/[0.08] text-white border border-white/[0.12]"
                : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
            >
              <Clock className="w-3 h-3" />
              All Races
            </button>
          </div>

          {meetings.length === 0 ? (
            <div className="text-center text-white/25 py-10 border border-white/[0.04] rounded-lg text-sm">
              No races available for today.
            </div>
          ) : meetingsView === "tracks" ? (
            /* BY TRACK VIEW */
            <div className="space-y-2">
              {[...meetings].sort((a, b) => a.firstRace.localeCompare(b.firstRace)).map((meeting) => (
                <Link key={meeting.id} href={`/track/${meeting.id}`}>
                  <div className="bg-[#15181f] border border-white/[0.06] rounded-lg p-5 hover:border-white/[0.12] hover:bg-[#1a1e27] transition-all group flex justify-between items-center cursor-pointer">
                    <div>
                      <h3 className="text-sm font-semibold text-white/85 uppercase tracking-wide">
                        {meeting.name}
                      </h3>
                      <p className="text-[11px] text-white/25 mt-0.5">
                        {meeting.raceCount} races · First: {meeting.firstRace}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors">
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* ALL RACES (CHRONOLOGICAL) VIEW */
            loadingRaces ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-6 h-6 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                {allRaces.map((race) => (
                  <Link key={race.id} href={`/race/${race.id}`}>
                    <div className="bg-[#15181f] border border-white/[0.06] rounded-lg px-4 py-3 hover:border-white/[0.12] hover:bg-[#1a1e27] transition-all group flex items-center gap-4 cursor-pointer">
                      <span className="text-[#c9a84c] font-mono text-sm font-semibold w-12 shrink-0">
                        {race.time.replace("Race at ", "")}
                      </span>
                      <span className="text-sm text-white/80 font-medium uppercase tracking-wide w-28 shrink-0">
                        {race.track}
                      </span>
                      <span className="text-xs text-white/30">
                        {race.distance}m
                      </span>
                      {race.grade && (
                        <span className="text-[10px] text-white/40 border border-white/[0.08] rounded px-1.5 py-0.5">
                          {race.grade}
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-3">
                        {raceStars[race.id] > 0 && <StarRating count={raceStars[race.id]} />}
                        <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/35" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
