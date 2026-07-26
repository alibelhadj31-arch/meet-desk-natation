import React, { useState, useEffect, useCallback } from 'react';
import { Waves, Users, ListOrdered, Timer, Trophy, Plus, Trash2, X, Medal, CalendarDays } from 'lucide-react';
import {
  swimmersCol, meetingsCol, entriesCol, eventsCol, resultsCol,
  listen, listenCurrentMeeting, setCurrentMeeting as saveCurrentMeeting,
  addItem, updateItem, deleteItem,
  listenAuth, login, logout,
} from './data.js';

// ---------- Constantes ----------
const EPREUVES = [
  '50m Nage Libre', '100m Nage Libre', '200m Nage Libre', '400m Nage Libre',
  '50m Dos', '100m Dos', '50m Brasse', '100m Brasse',
  '50m Papillon', '100m Papillon', '200m 4 Nages'
];

const CATEGORIES = ['Poussins', 'Benjamins', 'Minimes', 'Cadets', 'Juniors', 'Seniors'];
function calculerAge(dateNaissance) {
  if (!dateNaissance) return null;
  const [y, m, d] = dateNaissance.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const anniversairePasse = (today.getMonth() + 1 > m) || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!anniversairePasse) age -= 1;
  return age;
}

function calculerCategorie(dateNaissance) {
  const age = calculerAge(dateNaissance);
  if (age === null) return '';
  if (age <= 7) return 'Poussins';
  if (age <= 9) return 'Benjamins';
  if (age <= 11) return 'Minimes';
  if (age <= 13) return 'Cadets';
  if (age <= 17) return 'Juniors';
  return 'Seniors';
}
function calculerAge(dateNaissance) {
  if (!dateNaissance) return null;
  const [y, m, d] = dateNaissance.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const anniversairePasse = (today.getMonth() + 1 > m) || (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!anniversairePasse) age -= 1;
  return age;
}

function calculerCategorie(dateNaissance) {
  const age = calculerAge(dateNaissance);
  if (age === null) return '';
  if (age <= 7) return 'Poussins';
  if (age <= 9) return 'Benjamins';
  if (age <= 11) return 'Minimes';
  if (age <= 13) return 'Cadets';
  if (age <= 17) return 'Juniors';
  return 'Seniors';
}
const NAVY = '#0B2545';
const ORANGE = '#F4732A';
const AQUA = '#E8F4F8';
const TEAL = '#0E7C86';

// ---------- Utils temps ----------
function parseTime(str) {
  if (!str) return null;
  const parts = str.split(':');
  let mins = 0, rest = str;
  if (parts.length === 2) { mins = parseFloat(parts[0]) || 0; rest = parts[1]; }
  const sec = parseFloat(rest);
  if (isNaN(sec)) return null;
  return mins * 60 + sec;
}
function formatTime(totalSec) {
  if (totalSec === null || totalSec === undefined || isNaN(totalSec)) return '—';
  const mins = Math.floor(totalSec / 60);
  const sec = (totalSec - mins * 60).toFixed(2).padStart(5, '0');
  return mins > 0 ? `${mins}:${sec}` : sec;
}
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  if (isNaN(d)) return str;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------- Composant principal ----------
export default function App() {
  const [tab, setTab] = useState('competitions');
  const [swimmers, setSwimmers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [entries, setEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);
  const [currentMeeting, setCurrentMeetingState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const isAdmin = !!user;

  useEffect(() => {
    const unsubs = [
      listen(swimmersCol, setSwimmers),
      listen(meetingsCol, setMeetings),
      listen(entriesCol, setEntries),
      listen(eventsCol, setEvents),
      listen(resultsCol, setResults),
      listenCurrentMeeting((id) => { setCurrentMeetingState(id); setLoading(false); }),
      listenAuth(setUser),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const selectMeeting = async (id) => {
    await saveCurrentMeeting(id);
  };

  const meeting = meetings.find(m => m.id === currentMeeting) || null;

  const tabs = [
    { id: 'competitions', label: 'Compétitions', icon: CalendarDays },
    { id: 'inscriptions', label: 'Inscriptions', icon: Users },
    { id: 'series', label: 'Séries', icon: ListOrdered },
    { id: 'resultats', label: 'Résultats', icon: Timer },
    { id: 'classements', label: 'Classements', icon: Trophy },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: AQUA, fontFamily: 'system-ui', fontSize: 14, letterSpacing: 1 }}>Chargement du bassin…</div>
      </div>
    );
  }

  const needsMeeting = ['series', 'resultats'].includes(tab);

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFB', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        .lane-divider { height: 3px; background: repeating-linear-gradient(90deg, ${ORANGE} 0 18px, transparent 18px 30px); }
        input, select { font-family: inherit; }
        button { font-family: inherit; cursor: pointer; }
        table { border-collapse: collapse; width: 100%; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #cbd5db; border-radius: 4px; }
      `}</style>

      <header style={{ background: NAVY, padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Waves size={22} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 600, letterSpacing: 0.5 }}>MEET DECK</div>
            <div style={{ color: '#7C94AE', fontSize: 12 }}>Academy Sportive des Jeunes Talents</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {meeting && (
            <div style={{ background: 'rgba(255,255,255,.08)', padding: '8px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: ORANGE }} />
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{meeting.nom}</div>
                <div style={{ color: '#7C94AE', fontSize: 11 }}>{formatDate(meeting.date)}{meeting.lieu ? ` · ${meeting.lieu}` : ''}</div>
              </div>
            </div>
          )}
          {isAdmin ? (
            <button onClick={() => logout()} style={{
              background: 'none', border: '1px solid rgba(255,255,255,.25)', color: '#fff',
              borderRadius: 6, padding: '7px 12px', fontSize: 12.5
            }}>Se déconnecter</button>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{
              background: 'none', border: '1px solid rgba(255,255,255,.25)', color: '#7C94AE',
              borderRadius: 6, padding: '7px 12px', fontSize: 12.5
            }}>Connexion admin</button>
          )}
        </div>
      </header>
      {showLogin && !isAdmin && (
        <LoginBar onClose={() => setShowLogin(false)} showToast={showToast} />
      )}
      <div className="lane-divider" />

      <nav style={{ background: '#fff', display: 'flex', gap: 4, padding: '0 20px', borderBottom: '1px solid #E5EAED', overflowX: 'auto' }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px',
                border: 'none', background: 'none',
                borderBottom: active ? `3px solid ${ORANGE}` : '3px solid transparent',
                color: active ? NAVY : '#8A99A8', fontWeight: active ? 600 : 500, fontSize: 14,
                whiteSpace: 'nowrap', transition: 'color .15s'
              }}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </nav>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px 60px' }}>
        {needsMeeting && !meeting ? (
          <EmptyState text="Sélectionnez ou créez d'abord une compétition dans l'onglet Compétitions." />
        ) : (
          <>
            {tab === 'competitions' && (
              <Competitions meetings={meetings} currentMeeting={currentMeeting} selectMeeting={selectMeeting} showToast={showToast} isAdmin={isAdmin} />
            )}
            {tab === 'inscriptions' && (
              <Inscriptions swimmers={swimmers} entries={entries} meeting={meeting} showToast={showToast} isAdmin={isAdmin} />
            )}
            {tab === 'series' && (
              <Series swimmers={swimmers} entries={entries} events={events} meeting={meeting} showToast={showToast} isAdmin={isAdmin} />
            )}
            {tab === 'resultats' && (
              <Resultats swimmers={swimmers} events={events} results={results} meeting={meeting} showToast={showToast} isAdmin={isAdmin} />
            )}
            {tab === 'classements' && (
              <Classements swimmers={swimmers} results={results} meetings={meetings} meeting={meeting} />
            )}
          </>
        )}
      </main>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: NAVY, color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,.2)', zIndex: 50
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ---------- Barre de connexion admin ----------
function LoginBar({ onClose, showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { showToast('Email et mot de passe requis'); return; }
    setBusy(true);
    try {
      await login(email, password);
      showToast('Connecté en tant qu\'administrateur');
      onClose();
    } catch (e) {
      showToast('Identifiants incorrects');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E5EAED', padding: '14px 20px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <input type="email" placeholder="Email admin" value={email} onChange={e => setEmail(e.target.value)}
        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 13.5, width: 220 }} />
      <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 13.5, width: 180 }} />
      <button onClick={handleLogin} disabled={busy} style={{
        padding: '8px 16px', borderRadius: 8, border: 'none', background: NAVY, color: '#fff', fontSize: 13, fontWeight: 600
      }}>{busy ? 'Connexion…' : 'Se connecter'}</button>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8A99A8', fontSize: 13 }}>Annuler</button>
    </div>
  );
}

// ---------- Onglet Compétitions ----------
function Competitions({ meetings, currentMeeting, selectMeeting, showToast, isAdmin }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', date: '', lieu: '' });

  const addMeeting = async () => {
    if (!form.nom.trim()) { showToast('Nom de la compétition requis'); return; }
    const ref = await addItem(meetingsCol, form);
    setForm({ nom: '', date: '', lieu: '' });
    setShowForm(false);
    await selectMeeting(ref.id);
    showToast('Compétition créée et sélectionnée');
  };

  const removeMeeting = async (id) => {
    await deleteItem(meetingsCol, id);
    if (currentMeeting === id) await selectMeeting(null);
  };

  return (
    <div>
      <SectionHeader title="Compétitions" subtitle={`${meetings.length} compétition${meetings.length !== 1 ? 's' : ''} créée${meetings.length !== 1 ? 's' : ''}`}>
        {isAdmin && <PrimaryButton onClick={() => setShowForm(true)} icon={Plus}>Nouvelle compétition</PrimaryButton>}
      </SectionHeader>

      {isAdmin && showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: NAVY, fontWeight: 600 }}>Nouvelle compétition</div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none' }}><X size={18} color="#8A99A8" /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Nom de la compétition" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} />
            <Field label="Date" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
            <Field label="Lieu" value={form.lieu} onChange={v => setForm(f => ({ ...f, lieu: v }))} />
          </div>
          <PrimaryButton onClick={addMeeting}>Créer</PrimaryButton>
        </Card>
      )}

      {meetings.length === 0 && !showForm ? (
        <EmptyState text="Aucune compétition créée. Créez-en une pour commencer les inscriptions." />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {meetings.map(m => {
            const active = currentMeeting === m.id;
            return (
              <Card key={m.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: active ? `1.5px solid ${ORANGE}` : '1px solid #E5EAED'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{m.nom}</div>
                  <div style={{ fontSize: 12.5, color: '#8A99A8', marginTop: 2 }}>{formatDate(m.date)}{m.lieu ? ` · ${m.lieu}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {active ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: ORANGE, padding: '6px 12px' }}>Sélectionnée</span>
                  ) : isAdmin ? (
                    <button onClick={() => selectMeeting(m.id)} style={{
                      padding: '7px 14px', borderRadius: 6, border: `1px solid ${NAVY}`, background: '#fff', color: NAVY, fontSize: 12.5, fontWeight: 600
                    }}>Sélectionner</button>
                  ) : null}
                  {isAdmin && (
                    <button onClick={() => removeMeeting(m.id)} style={{ background: 'none', border: 'none' }}>
                      <Trash2 size={15} color="#C4CCD3" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Onglet Inscriptions ----------
function Inscriptions({ swimmers, entries, meeting, showToast, isAdmin }) {
  const [form, setForm] = useState({ nom: '', prenom: '', naissance: '', categorie: CATEGORIES[0] });
  const [showForm, setShowForm] = useState(false);

  const addSwimmer = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) { showToast('Nom et prénom requis'); return; }
    await addItem(swimmersCol, form);
    setForm({ nom: '', prenom: '', naissance: '', categorie: CATEGORIES[0] });
    setShowForm(false);
    showToast('Nageur ajouté au club');
  };

  const removeSwimmer = async (id) => {
    await deleteItem(swimmersCol, id);
    const toRemove = entries.filter(e => e.swimmerId === id);
    for (const e of toRemove) await deleteItem(entriesCol, e.id);
  };

  const entryFor = (swimmerId) => meeting ? entries.find(e => e.swimmerId === swimmerId && e.meetingId === meeting.id) : null;

  const toggleEpreuve = async (swimmerId, ep) => {
    if (!meeting) return;
    const existing = entryFor(swimmerId);
    if (existing) {
      const eps = existing.epreuves.includes(ep) ? existing.epreuves.filter(e => e !== ep) : [...existing.epreuves, ep];
      await updateItem(entriesCol, existing.id, { epreuves: eps });
    } else {
      await addItem(entriesCol, { meetingId: meeting.id, swimmerId, epreuves: [ep] });
    }
  };

  return (
    <div>
      <SectionHeader title="Inscriptions" subtitle={meeting ? `Épreuves pour : ${meeting.nom}` : `${swimmers.length} nageur(s) au club`}>
        {isAdmin && <PrimaryButton onClick={() => setShowForm(true)} icon={Plus}>Ajouter un nageur</PrimaryButton>}
      </SectionHeader>

      {isAdmin && !meeting && (
        <div style={{ marginBottom: 16, fontSize: 13, color: '#8A99A8', background: '#FFF8F0', border: '1px solid #F5DCC0', padding: '10px 14px', borderRadius: 8 }}>
          Aucune compétition sélectionnée : vous pouvez gérer le roster du club, mais pour inscrire des épreuves, sélectionnez une compétition dans l'onglet Compétitions.
        </div>
      )}

      {isAdmin && showForm && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: NAVY, fontWeight: 600 }}>Nouveau nageur</div>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none' }}><X size={18} color="#8A99A8" /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Prénom" value={form.prenom} onChange={v => setForm(f => ({ ...f, prenom: v }))} />
            <Field label="Nom" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} />
            <DateNaissanceField value={form.naissance} onChange={v => setForm(f => ({ ...f, naissance: v }))} />
            <div>
              <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>Catégorie</label>
              <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14 }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <PrimaryButton onClick={addSwimmer}>Enregistrer</PrimaryButton>
        </Card>
      )}

      {swimmers.length === 0 && !showForm ? (
        <EmptyState text="Aucun nageur au club. Ajoutez le premier." />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {swimmers.map(s => {
            const entry = entryFor(s.id);
            return (
              <Card key={s.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{s.prenom} {s.nom}</div>
                    <div style={{ fontSize: 12.5, color: '#8A99A8' }}>{s.categorie}</div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => removeSwimmer(s.id)} style={{ background: 'none', border: 'none' }}>
                      <Trash2 size={15} color="#C4CCD3" />
                    </button>
                  )}
                </div>
                {meeting && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {(isAdmin ? EPREUVES : EPREUVES.filter(ep => entry?.epreuves.includes(ep))).map(ep => {
                      const active = entry?.epreuves.includes(ep);
                      const Tag = isAdmin ? 'button' : 'span';
                      return (
                        <Tag key={ep} onClick={isAdmin ? () => toggleEpreuve(s.id, ep) : undefined} style={{
                          padding: '5px 11px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                          border: `1px solid ${active ? ORANGE : '#D7DFE4'}`,
                          background: active ? '#FFF1E8' : '#fff', color: active ? ORANGE : '#5C7186'
                        }}>{ep}</Tag>
                      );
                    })}
                    {!isAdmin && !entry?.epreuves.length && (
                      <span style={{ fontSize: 12, color: '#B8C2CA' }}>Non inscrit à cette compétition</span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Onglet Séries ----------
function Series({ swimmers, entries, events, meeting, showToast, isAdmin }) {
  const [selectedEpreuve, setSelectedEpreuve] = useState(EPREUVES[0]);
  const [couloirsParSerie, setCouloirsParSerie] = useState(6);

  const meetingEntries = entries.filter(e => e.meetingId === meeting.id && e.epreuves.includes(selectedEpreuve));
  const eligible = meetingEntries.map(e => swimmers.find(s => s.id === e.swimmerId)).filter(Boolean);
  const meetingEvents = events.filter(e => e.meetingId === meeting.id);

  const generateSeries = async () => {
    if (eligible.length === 0) { showToast('Aucun nageur inscrit à cette épreuve'); return; }
    const shuffled = [...eligible];
    const nbSeries = Math.ceil(shuffled.length / couloirsParSerie);
    const series = [];
    for (let i = 0; i < nbSeries; i++) {
      const nageurs = shuffled.slice(i * couloirsParSerie, (i + 1) * couloirsParSerie).map((s, idx) => ({ swimmerId: s.id, couloir: idx + 1 }));
      series.push({ numero: i + 1, nageurs });
    }
    const existing = meetingEvents.find(e => e.epreuve === selectedEpreuve);
    if (existing) {
      await updateItem(eventsCol, existing.id, { series });
    } else {
      await addItem(eventsCol, { meetingId: meeting.id, epreuve: selectedEpreuve, series });
    }
    showToast(`${nbSeries} série(s) générée(s)`);
  };

  const currentEvent = meetingEvents.find(e => e.epreuve === selectedEpreuve);
  const swimmerName = (id) => {
    const s = swimmers.find(sw => sw.id === id);
    return s ? `${s.prenom} ${s.nom}` : '—';
  };

  return (
    <div>
      <SectionHeader title="Séries & couloirs" subtitle={`Génération automatique par épreuve — ${meeting.nom}`} />
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>Épreuve</label>
            <select value={selectedEpreuve} onChange={e => setSelectedEpreuve(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14 }}>
              {EPREUVES.map(ep => <option key={ep} value={ep}>{ep}</option>)}
            </select>
          </div>
          {isAdmin && (
            <div style={{ width: 140 }}>
              <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>Couloirs / série</label>
              <input type="number" min={4} max={10} value={couloirsParSerie} onChange={e => setCouloirsParSerie(parseInt(e.target.value) || 6)}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14 }} />
            </div>
          )}
          {isAdmin && <PrimaryButton onClick={generateSeries}>Générer les séries</PrimaryButton>}
        </div>
        <div style={{ marginTop: 10, fontSize: 12.5, color: '#8A99A8' }}>{eligible.length} nageur(s) inscrit(s) à cette épreuve</div>
      </Card>

      {currentEvent ? (
        <div style={{ display: 'grid', gap: 14 }}>
          {currentEvent.series.map(serie => (
            <Card key={serie.numero}>
              <div style={{ fontFamily: "'Oswald', sans-serif", color: NAVY, fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
                Série {serie.numero}
              </div>
              <table>
                <tbody>
                  {serie.nageurs.map(n => (
                    <tr key={n.couloir} style={{ borderTop: '1px solid #EEF2F4' }}>
                      <td style={{ padding: '7px 10px', width: 70, color: ORANGE, fontWeight: 700, fontSize: 13 }}>Couloir {n.couloir}</td>
                      <td style={{ padding: '7px 10px', fontSize: 14, color: NAVY, fontWeight: 500 }}>{swimmerName(n.swimmerId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState text="Aucune série générée pour cette épreuve." />
      )}
    </div>
  );
}

// ---------- Onglet Résultats ----------
function Resultats({ swimmers, events, results, meeting, showToast, isAdmin }) {
  const [selectedEpreuve, setSelectedEpreuve] = useState(EPREUVES[0]);
  const [times, setTimes] = useState({});

  const currentEvent = events.find(e => e.epreuve === selectedEpreuve && e.meetingId === meeting.id);
  const allEntrants = currentEvent ? currentEvent.series.flatMap(s => s.nageurs) : [];

  const swimmerName = (id) => {
    const s = swimmers.find(sw => sw.id === id);
    return s ? `${s.prenom} ${s.nom}` : '—';
  };

  const existing = (swimmerId) => {
    const r = results.find(r => r.epreuve === selectedEpreuve && r.swimmerId === swimmerId && r.meetingId === meeting.id);
    return r ? formatTime(r.temps) : '';
  };

  const saveTime = async (swimmerId) => {
    const raw = times[swimmerId];
    const sec = parseTime(raw);
    if (sec === null) { showToast('Format invalide (ex: 1:02.35 ou 32.10)'); return; }
    const existingResult = results.find(r => r.epreuve === selectedEpreuve && r.swimmerId === swimmerId && r.meetingId === meeting.id);
    if (existingResult) {
      await updateItem(resultsCol, existingResult.id, { temps: sec });
    } else {
      await addItem(resultsCol, { meetingId: meeting.id, epreuve: selectedEpreuve, swimmerId, temps: sec });
    }
    showToast('Temps enregistré');
  };

  return (
    <div>
      <SectionHeader title="Saisie des résultats" subtitle={`Format mm:ss.cc (ex. 1:02.35) — ${meeting.nom}`} />
      <Card style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>Épreuve</label>
        <select value={selectedEpreuve} onChange={e => setSelectedEpreuve(e.target.value)}
          style={{ width: '100%', maxWidth: 320, padding: '9px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14 }}>
          {EPREUVES.map(ep => <option key={ep} value={ep}>{ep}</option>)}
        </select>
      </Card>

      {allEntrants.length === 0 ? (
        <EmptyState text="Générez d'abord les séries pour cette épreuve dans l'onglet Séries." />
      ) : (
        <Card>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', color: '#8A99A8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <th style={{ padding: '8px 10px' }}>Nageur</th>
                <th style={{ padding: '8px 10px' }}>Temps</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {allEntrants.map(n => (
                <tr key={n.swimmerId} style={{ borderTop: '1px solid #EEF2F4' }}>
                  <td style={{ padding: '10px', fontWeight: 600, color: NAVY, fontSize: 14 }}>{swimmerName(n.swimmerId)}</td>
                  {isAdmin ? (
                    <>
                      <td style={{ padding: '8px 10px' }}>
                        <input
                          placeholder={existing(n.swimmerId) || '0:00.00'}
                          value={times[n.swimmerId] ?? ''}
                          onChange={e => setTimes(t => ({ ...t, [n.swimmerId]: e.target.value }))}
                          style={{ width: 110, padding: '7px 9px', borderRadius: 6, border: '1px solid #D7DFE4', fontSize: 13.5, fontFamily: 'monospace' }}
                        />
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <button onClick={() => saveTime(n.swimmerId)} style={{
                          padding: '6px 12px', borderRadius: 6, border: 'none', background: NAVY, color: '#fff', fontSize: 12.5, fontWeight: 600
                        }}>Valider</button>
                      </td>
                    </>
                  ) : (
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: 13.5, color: TEAL, fontWeight: 700 }}>{existing(n.swimmerId) || '—'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ---------- Onglet Classements ----------
function Classements({ swimmers, results, meetings, meeting }) {
  const [selectedEpreuve, setSelectedEpreuve] = useState(EPREUVES[0]);
  const [scope, setScope] = useState(meeting ? 'meeting' : 'all');

  const swimmerInfo = (id) => swimmers.find(s => s.id === id);
  const meetingName = (id) => meetings.find(m => m.id === id)?.nom || '—';

  const scoped = scope === 'meeting' && meeting
    ? results.filter(r => r.meetingId === meeting.id)
    : results;

  const ranked = scoped
    .filter(r => r.epreuve === selectedEpreuve)
    .sort((a, b) => a.temps - b.temps);

  const medalColor = (i) => i === 0 ? '#D4A017' : i === 1 ? '#9AA5AD' : i === 2 ? '#B5651D' : null;

  const records = EPREUVES.map(ep => {
    const rs = results.filter(r => r.epreuve === ep).sort((a, b) => a.temps - b.temps);
    if (rs.length === 0) return null;
    const s = swimmerInfo(rs[0].swimmerId);
    return { epreuve: ep, temps: rs[0].temps, nom: s ? `${s.prenom} ${s.nom}` : '—', meetingNom: meetingName(rs[0].meetingId) };
  }).filter(Boolean);

  return (
    <div>
      <SectionHeader title="Classements" subtitle="Par épreuve, triés du meilleur au moins bon temps" />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>Épreuve</label>
            <select value={selectedEpreuve} onChange={e => setSelectedEpreuve(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14 }}>
              {EPREUVES.map(ep => <option key={ep} value={ep}>{ep}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 220 }}>
            <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>Portée</label>
            <select value={scope} onChange={e => setScope(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14 }}>
              {meeting && <option value="meeting">Cette compétition ({meeting.nom})</option>}
              <option value="all">Toutes les compétitions</option>
            </select>
          </div>
        </div>
      </Card>

      {ranked.length === 0 ? (
        <EmptyState text="Aucun résultat enregistré pour cette épreuve." />
      ) : (
        <Card style={{ marginBottom: 28 }}>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', color: '#8A99A8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <th style={{ padding: '8px 10px', width: 50 }}>Rang</th>
                <th style={{ padding: '8px 10px' }}>Nageur</th>
                <th style={{ padding: '8px 10px' }}>Temps</th>
                {scope === 'all' && <th style={{ padding: '8px 10px' }}>Compétition</th>}
              </tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => {
                const s = swimmerInfo(r.swimmerId);
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid #EEF2F4' }}>
                    <td style={{ padding: '10px' }}>
                      {medalColor(i) ? <Medal size={16} color={medalColor(i)} /> : <span style={{ color: '#8A99A8', fontSize: 13 }}>{i + 1}</span>}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600, color: NAVY, fontSize: 14 }}>{s ? `${s.prenom} ${s.nom}` : '—'}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: 14, color: TEAL, fontWeight: 700 }}>{formatTime(r.temps)}</td>
                    {scope === 'all' && <td style={{ padding: '10px', fontSize: 12.5, color: '#8A99A8' }}>{meetingName(r.meetingId)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 10 }}>Records du club (toutes compétitions)</div>
      {records.length === 0 ? (
        <EmptyState text="Pas encore de records enregistrés." />
      ) : (
        <Card>
          <table>
            <tbody>
              {records.map(r => (
                <tr key={r.epreuve} style={{ borderTop: '1px solid #EEF2F4' }}>
                  <td style={{ padding: '9px 10px', fontSize: 13.5, color: '#5C7186' }}>{r.epreuve}</td>
                  <td style={{ padding: '9px 10px', fontSize: 13.5, color: NAVY, fontWeight: 600 }}>{r.nom}</td>
                  <td style={{ padding: '9px 10px', fontFamily: 'monospace', fontWeight: 700, color: ORANGE }}>{formatTime(r.temps)}</td>
                  <td style={{ padding: '9px 10px', fontSize: 12, color: '#8A99A8' }}>{r.meetingNom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ---------- Composants UI ----------
function SectionHeader({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 600, color: NAVY }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: '#8A99A8', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
      background: ORANGE, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13.5, fontWeight: 600
    }}>
      {Icon && <Icon size={15} />} {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5EAED', borderRadius: 12, padding: 18, ...style }}>
      {children}
    </div>
  );
}
function DateNaissanceField({ value, onChange }) {
  const [y, m, d] = value ? value.split('-') : ['', '', ''];
  const years = Array.from({ length: 80 }, (_, i) => String(new Date().getFullYear() - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const update = (ny, nm, nd) => { if (ny && nm && nd) onChange(`${ny}-${nm}-${nd}`); };
  return (
    <div>
      <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>Date de naissance</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <select value={d} onChange={e => update(y, m, e.target.value)} style={{ padding: '9px 6px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14, flex: 1 }}>
          <option value="">Jour</option>
          {days.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
        <select value={m} onChange={e => update(y, e.target.value, d)} style={{ padding: '9px 6px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14, flex: 1 }}>
          <option value="">Mois</option>
          {months.map(mo => <option key={mo} value={mo}>{mo}</option>)}
        </select>
        <select value={y} onChange={e => update(e.target.value, m, d)} style={{ padding: '9px 6px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14, flex: 1 }}>
          <option value="">Année</option>
          {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
        </select>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={{ fontSize: 12, color: '#5C7186', fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid #D7DFE4', fontSize: 14 }} />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center', color: '#8A99A8', fontSize: 14,
      background: '#fff', border: '1px dashed #D7DFE4', borderRadius: 12
    }}>
      {text}
    </div>
  );
}
