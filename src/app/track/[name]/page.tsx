import Link from 'next/link';
import { ArrowLeft, Flag, ChevronRight, AlertCircle } from 'lucide-react';

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
            next: { revalidate: 60 } // Cache for 60 seconds
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
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 flex-1">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" /> Back to Meetings
            </Link>

            <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">{trackName}</h1>
                <p className="text-slate-400 font-medium">Race Card • Today</p>
            </div>

            {errorMsg ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
                    <AlertCircle className="w-6 h-6" />
                    <p>{errorMsg}</p>
                </div>
            ) : races.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 text-slate-400 p-10 text-center rounded-3xl">
                    <p>No races scheduled for {trackName} today.</p>
                </div>
            ) : (
                <div className="bg-[#0D131F] border border-white/5 rounded-3xl overflow-hidden shadow-2xl divide-y divide-white/5">
                    <div className="px-6 py-4 bg-white/[0.02] flex items-center gap-2">
                        <Flag className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold text-slate-200">Scheduled Races ({races.length})</span>
                    </div>

                    {races.map((race) => {
                        // Clean up distance formatting
                        const distanceStr = race.distance ? `${race.distance}m` : 'N/A';
                        const timeStr = race.time || 'TBD';

                        return (
                            <Link key={race.id} href={`/race/${race.id}`} className="block">
                                <div className="px-6 py-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 text-center border-r border-white/10 pr-6">
                                            <span className="text-xl font-bold text-white block">{timeStr}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                {race.grade && (
                                                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-white/10 text-slate-300 tracking-wider">
                                                        {race.grade.toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="text-sm font-medium text-slate-400">{distanceStr}</span>
                                            </div>
                                            <div className="text-sm font-medium mt-2">
                                                <span className="text-slate-500">Preview: </span>
                                                <span className="text-indigo-400">Click to view predictions and form</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
