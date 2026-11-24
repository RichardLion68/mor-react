import React, { useEffect, useState } from 'react';
import { S, runtime, passages, bus } from './engine/runtime';
import { play } from './engine/engine';
import { missingAssets } from './engine/assets';

type Tab = 'passages' | 'state' | 'errors' | 'mods';

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('passages');
  const [q, setQ] = useState('');
  const [, tick] = useState(0);
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === '`') setOpen((o) => !o); };
    window.addEventListener('keydown', f);
    bus.on('passageend', () => tick((n) => n + 1));
    bus.on('error', () => tick((n) => n + 1));
    return () => window.removeEventListener('keydown', f);
  }, []);
  // (all hooks must run before the early return below)
  const [manifest, setManifest] = useState<any>(null);
  useEffect(() => {
    if (tab === 'mods' && !manifest) fetch('/mods-manifest.json').then((r) => r.json()).then(setManifest).catch(() => setManifest({ mods: [], zips: [] }));
  }, [tab, manifest]);
  if (!open) return <button className="dev-toggle" onClick={() => setOpen(true)}>dev ` </button>;
  const needle = q.toLowerCase();
  return (
    <div className="dev-panel">
      <header>
        {(['passages', 'state', 'errors', 'mods'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}{t === 'errors' ? ` (${runtime.errors.length})` : ''}</button>
        ))}
        <span style={{ flex: 1 }} />
        <span>{runtime.current}</span>
        <button onClick={() => setOpen(false)}>×</button>
      </header>
      <div className="dev-body">
        <input placeholder="filter…" value={q} onChange={(e) => setQ(e.target.value)} />
        {tab === 'passages' && [...passages.keys()].filter((n) => n.toLowerCase().includes(needle)).slice(0, 300).map((n) => (
          <div key={n}><a onClick={() => play(n)}>{n}</a> <small>{passages.get(n)!.tags.join(' ')}</small></div>
        ))}
        {tab === 'state' && Object.keys(S.v).filter((k) => k.toLowerCase().includes(needle)).sort().slice(0, 400).map((k) => (
          <div className="row" key={k}>
            <span>${k}</span>
            <span style={{ wordBreak: 'break-all' }}>{typeof S.v[k] === 'object' ? JSON.stringify(S.v[k]) : String(S.v[k])}</span>
          </div>
        ))}
        {tab === 'mods' && (
          <div>
            <div>Mods found in the game folder (run <code>npm run check:mods</code> to refresh):</div>
            {(manifest?.mods ?? []).map((m: any) => (
              <div className="row" key={m.name}>
                <span>{m.name}</span>
                <span style={{ color: m.installed ? '#9f9' : '#f88' }}>{m.installed ? `installed, ${m.files} files` : 'NOT INSTALLED'}</span>
              </div>
            ))}
            {(manifest?.zips ?? []).filter((z: any) => z.missingFolders.length).map((z: any) => (
              <div key={z.zip} style={{ color: '#fc6', margin: '6px 0' }}>
                {z.mod}: only {z.installed} of {z.inZip} picture folders extracted from "{z.zip}". Missing: {z.missingFolders.join(', ')}
              </div>
            ))}
            <div style={{ marginTop: 8 }}>Files that failed to load this session ({missingAssets.size}):</div>
            {[...missingAssets].map(([u, p]) => (
              <div className="row" key={u}><span>{p}</span><span style={{ wordBreak: 'break-all' }}>{u}</span></div>
            ))}
          </div>
        )}
        {tab === 'errors' && runtime.errors.filter((e) => e.toLowerCase().includes(needle)).slice(-200).reverse().map((e, i) => <div className="row" key={i}>{e}</div>)}
      </div>
    </div>
  );
}