import React, { useEffect, useState } from 'react';
import { loadStory, startGame } from './engine/engine';
import './engine/macros';
import { DevPanel } from './DevPanel';

export function App() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState('');
  useEffect(() => {
    let cancelled = false;
    loadStory()
      .then(() => { if (!cancelled) { setStatus('ready'); } })
      .catch((e) => { setErr(String(e)); setStatus('error'); });
    return () => { cancelled = true; };
  }, []);
  // start once the #passages node exists (after the 'ready' render)
  useEffect(() => { if (status === 'ready') startGame(); }, [status]);
  return (
    <>
      {status === 'loading' && <div className="loading-screen">Loading story…</div>}
      {status === 'error' && <div className="loading-screen">Failed to load: {err}</div>}
      {status === 'ready' && (
        <>
          <div id="story" role="main"><div id="passages" aria-live="polite" /></div>
          <DevPanel />
        </>
      )}
    </>
  );
}