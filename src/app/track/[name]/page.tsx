import Link from 'next/link';
import { ArrowLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface Race {
    id: string;
    time: string;
    distance: string;
    grade: string;
    going: string | null;
    track: string;
    date: string;
}

export default async function TrackPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const trackName = name.toUpperCase().replace('-', ' ');

    let races: Race[] = [];
    let errorMsg = null;

    try {
        const res = await fetch(`http://46.225.29.192:8000/api/track/${name}`, {
            cache: 'no-store'
        });
        if (!res.ok) {
            throw new Error('Failed to fetch track schedule');
        }
        const data = await res.json();
        races = data.races || [];
    } catch (err) {
        console.error("Error loading track races:", err);
        errorMsg = "Unable to load the race schedule for this track at this time.";
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/60 transition-colors text-xs uppercase tracking-wider font-medium">
                <ArrowLeft className="w-3 h-3" /> Back
            </Link>

            <div>
                <h1 className="text-2xl font-bold text-white/95 tracking-tight">{trackName}</h1>
                <p className="text-white/25 text-sm mt-1">Race Card · Today</p>
            </div>

            {errorMsg ? (
                <div className="bg-red-500/5 border border-red-500/10 text-red-400/70 p-5 rounded-lg flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{errorMsg}</p>
                </div>
            ) : races.length === 0 ? (
                <div className="border border-white/[0.04] text-white/25 p-8 text-center rounded-lg text-sm">
                    No races scheduled for {trackName} today.
                </div>
            ) : (
                <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-[#15181f]">
                    <div className="px-6 py-3 border-b border-white/[0.04]">
                        <span className="text-[11px] text-white/25 font-medium uppercase tracking-wider">
                            {races.length} Races Scheduled
                        </span>
                    </div>

                    {races.map((race) => {
                        const distanceStr = race.distance ? `${race.distance}m` : 'N/A';
                        const timeStr = race.time || 'TBD';

                        return (
                            <Link key={race.id} href={`/race/${race.id}`} className="block">
                                <div className="px-6 py-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group border-b border-white/[0.03] last:border-0">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 text-center border-r border-white/[0.06] pr-5">
                                            <span className="text-base font-semibold text-white/70 tabular-nums">{timeStr}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {race.grade && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.05] text-white/40 uppercase tracking-wider">
                                                        {race.grade.toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="text-xs text-white/30">{distanceStr}</span>
                                            </div>
                                            <div className="text-[11px] text-white/15 mt-1">
                                                View predictions and form
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
