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
    dogs: Dog[];
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

                // Sort dogs by trap for standard display
                if (data.dogs) {
                    data.dogs.sort((a: Dog, b: Dog) => a.trap - b.trap);
                }
                setRaceData(data);
            } catch (err: any) {
                console.error("Error loading race details:", err);
                setErrorMsg(err.message || "An error occurred parsing the ML prediction.");
            } finally {
                setLoading(false);
            }
        };

        fetchRaceData();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0A0E17]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (errorMsg || !raceData) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
                    <ArrowLeft className="w-4 h-4" /> Back Home
                </Link>
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4">
                    <AlertCircle className="w-6 h-6" />
                    <p>{errorMsg || "Unable to locate race."}</p>
                </div>
            </div>
        );
    }

    // Sort dogs by ML Win Probability purely for the Predictions Tab (Highest first)
    const dogsRanked = [...raceData.dogs].sort((a, b) => b.ml.winProbability - a.ml.winProbability);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href={`/track/${raceData.track.toLowerCase()}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to {raceData.track.toUpperCase()}
                    </Link>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1.5 rounded text-sm font-bold bg-white/10 text-white tracking-wider">TODAY</span>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-wider">{raceData.track}</h1>
                    </div>
                    <p className="text-slate-400 font-medium">
                        {raceData.grade ? `Grade ${raceData.grade}` : 'Preview'}
                        {raceData.distance ? ` • ${raceData.distance}m` : ''}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#0D131F] rounded-lg p-1 border border-white/5 shadow-xl shrink-0">
                    <button
                        onClick={() => setActiveTab('form')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'form' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        <History className="w-4 h-4" /> Dog Form
                    </button>
                    <button
                        onClick={() => setActiveTab('predictions')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'predictions' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> ML Predictor
                    </button>
                </div>
            </div>

            <div className="bg-[#0D131F] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">

                {/* Dog Form Tab */}
                {activeTab === 'form' && (
                    <div className="divide-y divide-white/5">
                        {raceData.dogs.map((dog) => {
                            const isExpanded = expandedDog === dog.trap;
                            // Limit to 5 without expanding, though the API currently only returns recent 5 anyway
                            const visibleForm = isExpanded ? dog.recentForm : dog.recentForm.slice(0, 5);

                            return (
                                <div key={dog.id} className="p-6 md:p-8 hover:bg-white/[0.01] transition-colors">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 shadow-lg
                                              ${dog.trap === 1 ? 'bg-red-600 text-white' : ''}
                                              ${dog.trap === 2 ? 'bg-blue-600 text-white' : ''}
                                              ${dog.trap === 3 ? 'bg-white text-black' : ''}
                                              ${dog.trap === 4 ? 'bg-black text-white border border-white/20' : ''}
                                              ${dog.trap === 5 ? 'bg-orange-500 text-white' : ''}
                                              ${dog.trap === 6 ? 'bg-black text-red-500 border border-white/20 striped-bg' : ''}
                                            `}>
                                                {dog.trap}
                                            </div>
                                            <h3 className="text-xl font-bold text-white tracking-wide">{dog.name}</h3>
                                        </div>
                                        {dog.recentForm.length > 5 && (
                                            <button
                                                onClick={() => setExpandedDog(isExpanded ? null : dog.trap)}
                                                className="flex items-center gap-2 text-sm text-indigo-400 font-semibold hover:text-indigo-300 transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5"
                                            >
                                                <Search className="w-4 h-4" />
                                                {isExpanded ? 'Show Less' : `Full History (${dog.recentForm.length})`}
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>

                                    {dog.recentForm.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-slate-400 whitespace-nowrap">
                                                <thead className="text-xs text-slate-500 uppercase bg-white/5 font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                                        <th className="px-4 py-3">Track</th>
                                                        <th className="px-4 py-3">Dist</th>
                                                        <th className="px-4 py-3">Grade</th>
                                                        <th className="px-4 py-3">Split</th>
                                                        <th className="px-4 py-3">Remarks</th>
                                                        <th className="px-4 py-3">Time</th>
                                                        <th className="px-4 py-3">Going</th>
                                                        <th className="px-4 py-3">Wght</th>
                                                        <th className="px-4 py-3 rounded-tr-lg">Pos</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {visibleForm.map((f, i) => (
                                                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-colors">
                                                            <td className="px-4 py-2.5 font-medium">{f.date}</td>
                                                            <td className="px-4 py-2.5">{f.track}</td>
                                                            <td className="px-4 py-2.5">{f.distance}</td>
                                                            <td className="px-4 py-2.5">{f.grade}</td>
                                                            <td className="px-4 py-2.5 font-mono text-slate-300">{f.sectional !== 'None' ? f.sectional : '-'}</td>
                                                            <td className="px-4 py-2.5 max-w-[200px] truncate" title={f.remarks}>{f.remarks}</td>
                                                            <td className="px-4 py-2.5 font-mono">{f.time}s</td>
                                                            <td className="px-4 py-2.5 text-center">{f.going}</td>
                                                            <td className="px-4 py-2.5 text-center">{f.weight}</td>
                                                            <td className="px-4 py-2.5 font-bold">
                                                                <span className="bg-white/10 px-2.5 py-1 rounded text-white">{f.pos}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Form data unavailable for this greyhound.</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* ML Predictor Tab */}
                {activeTab === 'predictions' && (
                    <div className="divide-y divide-white/5">
                        {dogsRanked.map((dog, index) => {
                            const probability = dog.ml.winProbability;

                            return (
                                <div key={dog.id} className="px-8 py-6 flex items-center gap-6 hover:bg-white/[0.02] transition-colors group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 shadow-lg
                                      ${dog.trap === 1 ? 'bg-red-600 text-white' : ''}
                                      ${dog.trap === 2 ? 'bg-blue-600 text-white' : ''}
                                      ${dog.trap === 3 ? 'bg-white text-black' : ''}
                                      ${dog.trap === 4 ? 'bg-black text-white border border-white/20' : ''}
                                      ${dog.trap === 5 ? 'bg-orange-500 text-white' : ''}
                                      ${dog.trap === 6 ? 'bg-black text-red-500 border border-white/20 striped-bg' : ''}
                                    `}>
                                        {dog.trap}
                                    </div>
                                    <div className="w-48 shrink-0">
                                        <p className="text-base font-bold text-slate-200 group-hover:text-white transition-colors uppercase">{dog.name}</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="font-semibold text-slate-300">ML Model Win Probability</span>
                                            <span className="font-bold text-white">{probability.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out
                                                  ${index === 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                                        index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                                                            'bg-gradient-to-r from-slate-500 to-slate-600'}
                                                `}
                                                style={{ width: `${Math.max(probability, 1)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-32 shrink-0 text-right">
                                        <div className="text-sm text-slate-400 mb-0.5 mt-4 group-hover:text-slate-300 transition-colors">
                                            Average Time
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {dog.ml.avgTime > 0 ? `${dog.ml.avgTime.toFixed(2)}s` : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
