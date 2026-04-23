import { useEffect, useState } from 'react';
import { getPublicGateStats, type GateStatsResponse } from '@/lib/api/publicApi';

export function AntiGravityShield() {
    const [stats, setStats] = useState<GateStatsResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchStats() {
            try {
                const res = await getPublicGateStats();
                if (isMounted && res.status === 'success') {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch gate stats', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // refresh every 30s
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (loading && !stats) {
        return (
            <div className="w-full h-48 clinical-glass rounded-[var(--radius-feature)] flex items-center justify-center animate-pulse">
                <div className="text-white/40 font-mono text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V2m0 20v-2m8-8h2M2 12h2m15.364-6.364l1.414-1.414M4.222 19.778l1.414-1.414m12.728 12.728l1.414 1.414M4.222 4.222l1.414 1.414" /></svg>
                    INITIALIZING GATE...
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const threatColor = 
        stats.threat_level === 'defcon-1' ? 'text-red-500 bg-red-500/10 border-red-500/30' :
        stats.threat_level === 'defcon-3' ? 'text-amber-500 bg-amber-500/10 border-amber-500/30' :
        'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

    const glowColor = 
        stats.threat_level === 'defcon-1' ? 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
        stats.threat_level === 'defcon-3' ? 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
        'shadow-[0_0_15px_rgba(16,185,129,0.1)]';

    return (
        <div className="w-full clinical-glass rounded-[var(--radius-feature)] overflow-hidden relative">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${threatColor} ${glowColor}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-bold font-display flex items-center gap-2">
                                AntiGravity Gate
                                {stats.metrics.active_ddos_detected && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                )}
                            </h3>
                            <p className="text-white/40 text-xs font-mono">LIVE TRAFFIC ANALYSIS</p>
                        </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider ${threatColor}`}>
                        {stats.threat_level.replace('-', ' ')}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 relative">
                    <div className="bg-white/5 p-4 rounded-[var(--radius-card)] border border-white/8 flex flex-col justify-center">
                        <span className="text-white/60 text-[10px] sm:text-xs font-bold font-ui mb-1 uppercase">BLOCKED REQUESTS (24H)</span>
                        <span className="text-2xl sm:text-3xl font-light text-white font-mono">{stats.metrics.total_blocked_requests_24h.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-[var(--radius-card)] border border-white/8 flex flex-col justify-center">
                        <span className="text-white/60 text-[10px] sm:text-xs font-bold font-ui mb-1 uppercase">ACTIEVE BANS</span>
                        <span className="text-2xl sm:text-3xl font-light text-white font-mono">{stats.metrics.total_bans_24h.toLocaleString()}</span>
                    </div>
                </div>

                {stats.active_bans && stats.active_bans.length > 0 && (
                    <div className="space-y-2 mt-4 border-t border-white/10 pt-4 relative">
                        <span className="text-white/60 text-xs font-bold font-ui mb-2 block uppercase">RECENTE INTERVENTIES</span>
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                            {stats.active_bans.slice(0, 5).map((ban, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white/3 p-2 rounded border border-white/5 text-xs font-mono">
                                    <div className="flex items-center gap-2">
                                        {ban.is_recidivist ? (
                                            <span className="text-amber-500" title="Recidivist (Repeat Offender)">⚠️</span>
                                        ) : (
                                            <span className="text-red-500">🚫</span>
                                        )}
                                        <span className="text-white/70 truncate max-w-[150px] sm:max-w-[200px]" title={ban.reason}>
                                            {ban.reason.replace('toxic_path: ', '')}
                                        </span>
                                    </div>
                                    <span className="text-white/40 text-[10px]">
                                        {Math.ceil(ban.expires_in_seconds / 60)}M REMAINS
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
