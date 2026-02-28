"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, TrendingUp, Clock, ChevronRight } from "lucide-react";

interface Meeting {
  id: string;
  name: string;
  raceCount: number;
  topPick: string;
  firstRace: string;
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMeetings = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/proxy/races/today`, { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch tracks");
        const data = await res.json();
        setMeetings(data.meetings || []);
      } catch (err) {
        console.error("Error loading live tracks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveMeetings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Today's Win Rate</p>
            <p className="text-2xl font-bold text-white">38.5%</p>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/10">
            <Clock className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Races Analyzed</p>
            <p className="text-2xl font-bold text-white">42</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-400" /> Today's Meetings
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center text-slate-400 py-10 bg-white/[0.02] border border-white/5 rounded-2xl">
            No races available in the database for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((meeting) => (
              <Link key={meeting.id} href={`/track/${meeting.id}`}>
                <div className="bg-[#0D131F] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/50 hover:bg-white/[0.03] transition-all group flex justify-between items-center cursor-pointer shadow-lg">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-1">{meeting.name}</h3>
                    <p className="text-sm text-slate-400 font-medium">{meeting.raceCount} Races • First Race: {meeting.firstRace}</p>
                    {/* Best Bet is a placeholder until we run the analyzer live */}
                    <p className="text-xs text-indigo-400 mt-2 font-semibold">Best Bet: {meeting.topPick}</p>
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
    </div>
  );
}
