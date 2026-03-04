"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, Calendar, Star, Zap, Filter } from "lucide-react";

interface Meeting {
  id: string;
  name: string;
  raceCount: number;
  topPick: string;
  firstRace: string;
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
  elo: number;
  win_rate: number;
  banger_score: number;
  stars: number;
  label: string;
}

interface PredictionsData {
  date: string;
  model: string;
  generated_at: string;
  total_races: number;
  picks: Pick[];
}

const trapColors: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-blue-500",
  3: "bg-white/90 text-gray-900",
  4: "bg-emerald-500",
  5: "bg-amber-500 text-gray-900",
  6: "bg-gray-800 border border-gray-600",
};

const starBadgeStyles: Record<number, string> = {
  5: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  4: "bg-violet-500/20 text-violet-400 border-violet-500/40",
  3: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  2: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  1: "bg-slate-800/50 text-slate-500 border-slate-700/30",
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= count
            ? count >= 5
              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
              : count >= 4
                ? "text-violet-400 fill-violet-400"
                : count >= 3
                  ? "text-emerald-400 fill-emerald-400"
                  : "text-slate-500 fill-slate-500"
            : "text-slate-700"
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
  const [activeTab, setActiveTab] = useState<"predictions" | "meetings">("predictions");
  const [minStars, setMinStars] = useState(0);

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

  const formattedDate = new Date().toLocaleDateString("en-US", {
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          {formattedDate}
        </h2>
        {predictions && (
          <span className="inline-block text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
            🤖 {predictions.model} — 114 features
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveTab("predictions")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === "predictions"
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
            : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
        >
          <Zap className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Predictions
        </button>
        <button
          onClick={() => setActiveTab("meetings")}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === "meetings"
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
            : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
        >
          <MapPin className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          Meetings ({meetings.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeTab === "predictions" ? (
        /* PREDICTIONS TAB */
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D131F] border border-white/5 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-indigo-400">{predictions?.total_races || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Races</div>
            </div>
            <div className="bg-[#0D131F] border border-amber-500/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{starCounts[5] || 0}</div>
              <div className="text-xs text-slate-500 mt-1">★★★★★</div>
            </div>
            <div className="bg-[#0D131F] border border-violet-500/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400">{starCounts[4] || 0}</div>
              <div className="text-xs text-slate-500 mt-1">★★★★</div>
            </div>
            <div className="bg-[#0D131F] border border-emerald-500/20 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{starCounts[3] || 0}</div>
              <div className="text-xs text-slate-500 mt-1">★★★</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <Filter className="w-4 h-4 text-slate-500" />
            {[
              { label: `All (${predictions?.total_races || 0})`, value: 0 },
              { label: `★★★★★ (${starCounts[5] || 0})`, value: 5 },
              { label: `★★★★+ (${(starCounts[5] || 0) + (starCounts[4] || 0)})`, value: 4 },
              { label: `★★★+ (${(starCounts[5] || 0) + (starCounts[4] || 0) + (starCounts[3] || 0)})`, value: 3 },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setMinStars(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${minStars === f.value
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Race cards */}
          <div className="space-y-3">
            {filteredPicks.map((pick, i) => (
              <Link key={`${pick.race_id}-${i}`} href={`/race/${pick.race_id}`}>
                <div
                  className={`bg-[#0D131F] border rounded-2xl p-4 sm:p-5 transition-all hover:translate-y-[-2px] hover:shadow-xl cursor-pointer ${pick.stars >= 5
                    ? "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : pick.stars >= 4
                      ? "border-violet-500/20"
                      : pick.stars >= 3
                        ? "border-emerald-500/15"
                        : "border-white/5"
                    }`}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">{pick.track}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{pick.time}</span>
                    </div>
                    {pick.stars >= 3 && (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${starBadgeStyles[pick.stars]}`}
                      >
                        {pick.label}
                      </span>
                    )}
                  </div>

                  {/* Main row */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${trapColors[pick.trap] || "bg-gray-700"
                        }`}
                    >
                      T{pick.trap}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white text-base sm:text-lg block truncate">
                        {pick.dog_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {pick.distance}m • Grade {pick.grade}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <StarRating count={pick.stars} />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase block">Prob</span>
                      <span className="text-sm font-semibold text-white">
                        {(pick.prob * 100).toFixed(1)}%
                      </span>
                      <div className="h-1 bg-slate-800 rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(pick.prob * 200, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase block">Margin</span>
                      <span className="text-sm font-semibold text-white">
                        {(pick.margin * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase block">Elo</span>
                      <span className="text-sm font-semibold text-white">{pick.elo?.toFixed(0) || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase block">WR</span>
                      <span className="text-sm font-semibold text-white">
                        {pick.win_rate ? `${(pick.win_rate * 100).toFixed(0)}%` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* MEETINGS TAB */
        <div>
          {meetings.length === 0 ? (
            <div className="text-center text-slate-400 py-10 bg-white/[0.02] border border-white/5 rounded-2xl">
              No races available in the database for today.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((meeting) => (
                <Link key={meeting.id} href={`/track/${meeting.id}`}>
                  <div className="bg-[#0D131F] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-white/[0.03] transition-all group flex justify-between items-center cursor-pointer shadow-lg">
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-1">
                        {meeting.name}
                      </h3>
                      <p className="text-sm text-slate-400 font-medium">
                        {meeting.raceCount} Races • First Race: {meeting.firstRace}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 pt-6 border-t border-white/5">
        <p>Predictions powered by V1000 APEX-ORACLE machine learning ensemble</p>
        <p className="mt-1">© 2026 GreyhoundPredictor. For entertainment purposes only.</p>
      </div>
    </div>
  );
}
