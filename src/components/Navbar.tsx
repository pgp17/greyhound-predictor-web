import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="border-b border-white/[0.06] bg-[#15181f] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                    <div className="w-7 h-7 bg-[#c9a84c] rounded flex items-center justify-center">
                        <span className="text-[#111318] font-extrabold text-sm">G</span>
                    </div>
                    <h1 className="text-[15px] font-semibold tracking-tight text-white/90">
                        GREYHOUND<span className="text-white/40 font-normal ml-1">PREDICTOR</span>
                    </h1>
                </Link>
            </div>
        </header>
    );
}
