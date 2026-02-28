import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="border-b border-white/5 bg-white/[0.02] backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Greyhound<span className="text-indigo-400">Predictor</span></h1>
                    </div>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-400">Live API Connected</span>
                </div>
            </div>
        </header>
    );
}
