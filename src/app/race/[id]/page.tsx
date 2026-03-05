"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, History, Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface FormEntry {
    date: string;
    track: string;
    distance: string;
    grade: string;
    pos: string;
    time: string;
    going: string;
    weight: number;
    sectional: string;
    remarks: string;
}

interface Dog {
    id: string;
    name: string;
    trap: number;
    formSummary: string;
    recentForm: FormEntry[];
    ml: {
        winProbability: number;
        avgTime: number;
    };
}

interface RaceData {
    raceId: string;
    track: string;
    distance: string;
    grade: string;
    date: string;
    time?: string;
    dogs: Dog[];
    source?: string;
}

const TRAP_COLORS: Record<number, string> = {
    1: 'bg-red-700',
    2: 'bg-blue-700',
    3: 'bg-white text-[#111318]',
    4: 'bg-neutral-900 border border-white/20',
    5: 'bg-orange-600',
    6: 'striped-bg',
};

function TrapBadge({ trap, size = 'md' }: { trap: number; size?: 'md' | 'lg' }) {
    const cls = size === 'lg' ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm';
    return (
        <div
            className={`${cls} rounded flex items-center justify-center font-bold shrink-0 ${TRAP_COLORS[trap] || 'bg-neutral-700'}`}
            style={{ color: trap === 6 ? '#dc2626' : undefined }}
        >
            {trap}
        </div>
    );
}

export default function RacePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [activeTab, setActiveTab] = useState("form");
    const [expandedDog, setExpandedDog] = useState<number | null>(null);
    const [raceData, setRaceData] = useState<RaceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const fetchRaceData = async () => {
            try {
                const res = await fetch(`/api/proxy/race/${resolvedParams.id}`);
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || "Failed to fetch race details.");
                }
                const data = await res.json();
                if (data.dogs) {
                    data.dogs = data.dogs.map((d: Dog) => ({ ...d, trap: Number(d.trap) }));
                    data.dogs.sort((a: Dog, b: Dog) => a.trap - b.trap);
                }
                setRaceData(data);
            } catch (err: any) {
                console.error("Error loading race details:", err);
                setErrorMsg(err.message || "An error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchRaceData();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
                    <span className="text-white/30 text-xs uppercase tracking-widest">Loading</span>
                </div>
            </div>
        );
    }

    if (errorMsg || !raceData) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
                <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Link>
                <div className="bg-red-500/5 border border-red-500/10 text-red-400/80 p-5 rounded-lg flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{errorMsg || "Unable to locate race."}</p>
                </div>
            </div>
        );
    }

    const dogsRanked = [...raceData.dogs].sort((a, b) => b.ml.winProbability - a.ml.winProbability);

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
            {/* Header */}
            <div>
                <Link href={`/track/${raceData.track.toLowerCase()}`} className="inline-flex items-center gap-1.5 text-white/35 hover:text-white/60 transition-colors text-xs uppercase tracking-wider font-medium mb-5">
                    <ArrowLeft className="w-3 h-3" /> {raceData.track}
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white/95 tracking-tight">{raceData.track}</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            {raceData.time && (
                                <span className="text-[#c9a84c] text-sm font-semibold">
                                    {raceData.time}
                                </span>
                            )}
                            <span className="text-white/30 text-sm">
                                {raceData.grade ? `Grade ${raceData.grade}` : 'Preview'}
                                {raceData.distance ? ` · ${raceData.distance}m` : ''}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#c9a84c]/15 text-[#c9a84c] uppercase tracking-wider">Today</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border border-white/[0.08] rounded-lg overflow-hidden shrink-0">
                        <button
                            onClick={() => setActiveTab('form')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all ${activeTab === 'form'
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
                                }`}
                        >
                            <History className="w-3.5 h-3.5" /> Form
                        </button>
                        <button
                            onClick={() => setActiveTab('predictions')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all border-l border-white/[0.08] ${activeTab === 'predictions'
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
                                }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" /> Predictor
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-[#15181f]">

                {/* Dog Form Tab */}
                {activeTab === 'form' && (
                    <div>
                        {[1, 2, 3, 4, 5, 6].map((trapNum) => {
                            const dog = raceData.dogs.find(d => d.trap === trapNum);
                            if (!dog) {
                                return (
                                    <div key={`vacant-${trapNum}`} className="px-6 py-5 border-b border-white/[0.04] last:border-0 opacity-25">
                                        <div className="flex items-center gap-3">
                                            <TrapBadge trap={trapNum} />
                                            <span className="text-sm text-white/40 italic">Vacant</span>
                                        </div>
                                    </div>
                                );
                            }

                            const isExpanded = expandedDog === dog.trap;
                            const visibleForm = isExpanded ? dog.recentForm : dog.recentForm.slice(0, 5);

                            return (
                                <div key={dog.id} className="border-b border-white/[0.04] last:border-0">
                                    {/* Dog header */}
                                    <div className="px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <TrapBadge trap={dog.trap} />
                                            <h3 className="text-sm font-semibold text-white/90 tracking-wide uppercase">{dog.name}</h3>
                                        </div>
                                        {dog.recentForm.length > 5 && (
                                            <button
                                                onClick={() => setExpandedDog(isExpanded ? null : dog.trap)}
                                                className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider font-medium"
                                            >
                                                {isExpanded ? 'Less' : `All ${dog.recentForm.length}`}
                                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                            </button>
                                        )}
                                    </div>

                                    {/* Form table */}
                                    {dog.recentForm.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs data-table">
                                                <thead>
                                                    <tr className="border-t border-white/[0.04]">
                                                        <th className="px-6 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase">Date</th>
                                                        <th className="px-3 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase">Track</th>
                                                        <th className="px-3 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase">Dist</th>
                                                        <th className="px-3 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase">Grd</th>
                                                        <th className="px-3 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase">Split</th>
                                                        <th className="px-3 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase">Race</th>
                                                        <th className="px-3 py-2.5 text-left text-[10px] text-white/25 font-medium uppercase">Time</th>
                                                        <th className="px-3 py-2.5 text-center text-[10px] text-white/25 font-medium uppercase">Going</th>
                                                        <th className="px-3 py-2.5 text-center text-[10px] text-white/25 font-medium uppercase">Wt</th>
                                                        <th className="px-3 py-2.5 text-center text-[10px] text-white/25 font-medium uppercase">Pos</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {visibleForm.map((f, i) => (
                                                        <tr key={i} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                            <td className="px-6 py-2 text-white/50 font-medium">{f.date}</td>
                                                            <td className="px-3 py-2 text-white/40">{f.track}</td>
                                                            <td className="px-3 py-2 text-white/40 tabular-nums">{f.distance}</td>
                                                            <td className="px-3 py-2 text-white/40">{f.grade || '—'}</td>
                                                            <td className="px-3 py-2 text-white/30 tabular-nums">{f.sectional || '—'}</td>
                                                            <td className="px-3 py-2 text-white/30">{f.remarks || '—'}</td>
                                                            <td className="px-3 py-2 text-white/40 tabular-nums">{f.time ? `${f.time}s` : '—'}</td>
                                                            <td className="px-3 py-2 text-center text-white/30 tabular-nums">{f.going || '—'}</td>
                                                            <td className="px-3 py-2 text-center text-white/30 tabular-nums">{f.weight || '—'}</td>
                                                            <td className="px-3 py-2 text-center">
                                                                <span className={`inline-block min-w-[28px] px-1.5 py-0.5 rounded text-[11px] font-semibold ${f.pos === '1' || f.pos === '1st'
                                                                    ? 'bg-[#c9a84c]/15 text-[#c9a84c]'
                                                                    : f.pos === '2' || f.pos === '2nd'
                                                                        ? 'bg-white/[0.06] text-white/60'
                                                                        : 'bg-white/[0.03] text-white/35'
                                                                    }`}>{f.pos}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="px-6 pb-4">
                                            <p className="text-[11px] text-white/20 italic">No form data available</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ML Predictor Tab */}
                {activeTab === 'predictions' && (
                    <div>
                        {/* Column header */}
                        <div className="px-6 py-3 flex items-center gap-4 border-b border-white/[0.04]">
                            <div className="w-9 shrink-0" />
                            <div className="w-44 shrink-0">
                                <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Runner</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Win Probability</span>
                            </div>
                            <div className="w-20 text-right shrink-0">
                                <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">Prob</span>
                            </div>
                        </div>

                        {dogsRanked.map((dog, index) => {
                            const probability = dog.ml.winProbability;
                            const isMissing = probability === 0;

                            return (
                                <div key={dog.id} className={`px-6 py-4 flex items-center gap-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.015] transition-colors ${isMissing ? 'opacity-30' : ''}`}>
                                    <TrapBadge trap={dog.trap} />
                                    <div className="w-44 shrink-0">
                                        <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">{dog.name}</p>
                                    </div>

                                    {isMissing ? (
                                        <div className="flex-1 text-center">
                                            <span className="text-white/20 text-[11px]">No data</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1">
                                                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${index === 0
                                                            ? 'bg-[#c9a84c]'
                                                            : index === 1
                                                                ? 'bg-white/30'
                                                                : 'bg-white/15'
                                                            }`}
                                                        style={{ width: `${Math.max(probability, 2)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-20 text-right shrink-0">
                                                <span className={`text-sm font-semibold tabular-nums ${index === 0 ? 'text-[#c9a84c]' : 'text-white/50'
                                                    }`}>
                                                    {probability.toFixed(1)}%
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
