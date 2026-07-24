import { useEffect, useState, useRef } from 'react';
import { getPublicTelemetryPulse, type TelemetryPulseResponse } from '@/lib/api/publicApi';

function useAnimatedNumber(targetValue: number, duration: number = 1000) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const startValueRef = useRef(targetValue);

  useEffect(() => {
    if (currentValue === targetValue) return;

    const startValue = currentValue;
    startValueRef.current = startValue;
    const change = targetValue - startValue;
    const startTime = performance.now();

    let animationFrameId: number;

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo for smooth deceleration
      const easeOutProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setCurrentValue(Math.floor(startValue + change * easeOutProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateValue);
      }
    };

    animationFrameId = requestAnimationFrame(updateValue);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, duration]); // Intentionally omitting currentValue

  return currentValue;
}

export function LiveTelemetryPulse() {
  const [telemetry, setTelemetry] = useState<TelemetryPulseResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  const animatedActiveConnections = useAnimatedNumber(telemetry?.active_connections || 0, 1500);
  const animatedEventsLast5Min = useAnimatedNumber(telemetry?.events_last_5min || 0, 1500);
  const animatedTotalEventsToday = useAnimatedNumber(telemetry?.total_events_today || 0, 1500);

  useEffect(() => {
    let isMounted = true;

    async function fetchTelemetry() {
      try {
        const res = await getPublicTelemetryPulse();
        if (isMounted && res.status === 'success') {
          setTelemetry(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch telemetry pulse', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTelemetry();
    // Refresh every 10 seconds to sync with backend Redis cache TTL
    const interval = setInterval(fetchTelemetry, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !telemetry) {
    return (
      <div className="w-full h-32 clinical-glass rounded-[var(--radius-feature)] flex items-center justify-center animate-pulse">
        <div className="text-white/40 font-mono text-sm flex items-center gap-2">
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          SYNCING TELEMETRY...
        </div>
      </div>
    );
  }

  if (!telemetry) return null;

  return (
    <div className="w-full clinical-glass rounded-[var(--radius-feature)] overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border text-cyan-400 bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold font-display flex items-center gap-2">
                Live Platform Pulse
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </h3>
              <p className="text-white/40 text-xs font-mono tracking-wider">
                GLOBAL TELEMETRY NODE
              </p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider text-cyan-400 border-cyan-400/30 bg-cyan-400/5">
            {telemetry.status}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 p-4 rounded-[var(--radius-card)] border border-white/8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-white/60 text-[10px] sm:text-xs font-bold font-ui mb-1 uppercase z-10">
              ACTIVE CONNECTIONS
            </span>
            <span className="text-2xl sm:text-3xl font-light text-white font-mono z-10">
              {animatedActiveConnections.toLocaleString()}
            </span>
          </div>

          <div className="bg-white/5 p-4 rounded-[var(--radius-card)] border border-white/8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-white/60 text-[10px] sm:text-xs font-bold font-ui mb-1 uppercase z-10">
              EVENTS (LAST 5 MIN)
            </span>
            <span className="text-2xl sm:text-3xl font-light text-white font-mono z-10">
              {animatedEventsLast5Min.toLocaleString()}
            </span>
          </div>

          <div className="bg-white/5 p-4 rounded-[var(--radius-card)] border border-white/8 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="text-white/60 text-[10px] sm:text-xs font-bold font-ui mb-1 uppercase z-10">
              TOTAL EVENTS TODAY
            </span>
            <span className="text-2xl sm:text-3xl font-light text-white font-mono z-10">
              {animatedTotalEventsToday.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Self-Healing Worker Mesh Grid */}
        {telemetry.worker_mesh && Object.keys(telemetry.worker_mesh).length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-xs font-bold font-ui uppercase tracking-wider">
                Self-Healing Worker Mesh
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(telemetry.worker_mesh).map(([name, status]) => (
                <div
                  key={name}
                  className="bg-white/3 border border-white/5 p-3 rounded-md flex items-center justify-between"
                >
                  <span className="text-white/80 text-xs font-mono capitalize">{name}</span>
                  {status === 'healthy' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      <span className="text-[9px] text-emerald-500/80 font-mono uppercase">OK</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                      <span className="text-[9px] text-amber-500/80 font-mono uppercase">
                        STALE
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
