'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import type { Goal } from '@/lib/validation';
import { personalGoalProgress } from '@/lib/progress';

type Props = {
  goals: Goal[];
  busy: boolean;
  onSave: (method: string, body: unknown, message: string) => Promise<boolean>;
  onDelete: (id: string) => void;
};
const format = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

export default function PersonalGoals({ goals, busy, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState<Goal | 'new' | null>(null);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (editing) dialog.current?.showModal(); else dialog.current?.close(); }, [editing]);
  const goal = editing && editing !== 'new' ? editing : undefined;
  function open(value: Goal | 'new') { setError(''); setEditing(value); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const saved = await onSave(goal ? 'PUT' : 'POST', {
      ...(goal ? { id: goal.id } : {}), title: fields.get('title'), description: fields.get('description'),
      target: Number(fields.get('target')), current: Number(fields.get('current')), unit: fields.get('unit'),
      deadline: fields.get('deadline') || null,
    }, goal ? 'Objectif mis à jour.' : 'Un nouvel objectif pour avancer à ton rythme.');
    if (saved) setEditing(null); else setError('Impossible d’enregistrer. Vérifie les champs et la connexion, puis réessaie.');
  }
  return <section className="panel personal-goals" aria-label="Mes petits objectifs">
    <div className="panel-head"><div><span className="eyebrow">DES ENVIES QUI DEVIENNENT DES ACTIONS</span><h2>Mes petits objectifs</h2><p>{goals.filter(g => g.current >= g.target).length} accompli{goals.filter(g => g.current >= g.target).length > 1 ? 's' : ''} sur {goals.length}</p></div><button className="secondary" onClick={() => open('new')} disabled={busy}><Plus size={16}/> Nouvel objectif</button></div>
    {goals.length === 0 ? <div className="empty compact"><Target size={28}/><h3>Choisis ton prochain petit pas.</h3><p>Faire 3 séances, marcher 20 km ou réussir une première traction : donne un nom et une cible à ton objectif.</p><button className="text-btn" onClick={() => open('new')}>Créer mon premier objectif <Plus size={15}/></button></div> : <div className="personal-goals-grid">{goals.map(g => {
      const complete = g.current >= g.target;
      return <article className={`personal-goal ${complete ? 'complete' : ''}`} key={g.id}>
        <div className="personal-goal-title"><h3>{g.title}</h3><span className={`pill ${complete ? 'current' : ''}`}>{complete ? 'Accompli' : 'En cours'}</span></div>
        {g.description && <p className="goal-description">{g.description}</p>}
        <div className="goal-quantity"><strong>{format(g.current)}</strong><span> / {format(g.target)} {g.unit}</span></div>
        <div className="progress-track" role="progressbar" aria-label={`Progression de ${g.title}`} aria-valuenow={Math.round(personalGoalProgress(g.current,g.target))} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${personalGoalProgress(g.current,g.target)}%` }}/></div>
        <div className="goal-meta"><span>{Math.round(personalGoalProgress(g.current,g.target))} %</span><span>{g.deadline ? `Échéance : ${new Date(g.deadline+'T12:00:00').toLocaleDateString('fr-FR')}` : 'À mon rythme, sans échéance'}</span></div>
        <div className="personal-goal-actions"><button className="text-btn" disabled={busy} onClick={() => open(g)}><Pencil size={14}/> Modifier / progresser</button><div>{!complete && <button className="icon-btn" aria-label={`Accomplir ${g.title}`} title="Marquer comme accompli" disabled={busy} onClick={() => void onSave('PUT', { ...g, current: g.target }, 'Objectif accompli. Prends le temps de célébrer ce pas !')}><Check size={17}/></button>}<button className="icon-btn danger" aria-label={`Supprimer l’objectif ${g.title}`} disabled={busy} onClick={() => onDelete(g.id)}><Trash2 size={16}/></button></div></div>
      </article>;
    })}</div>}
    <dialog ref={dialog} className="modal" onCancel={event => { event.preventDefault(); if (!busy) setEditing(null); }} onClick={event => { if (!busy && event.target === event.currentTarget) setEditing(null); }}>
      {editing && <><div className="modal-head"><div><span className="eyebrow">UN PAS À LA FOIS</span><h2>{goal ? 'Modifier mon objectif' : 'Mon prochain petit objectif'}</h2></div><button className="icon-btn" aria-label="Fermer" disabled={busy} onClick={() => setEditing(null)}><X size={20}/></button></div>
      <form key={goal?.id ?? 'new'} onSubmit={submit}><label>Nom de l’objectif<input name="title" required maxLength={100} defaultValue={goal?.title ?? ''} placeholder="Faire 3 séances cette semaine"/></label><label>Ce que cela représente pour moi<textarea name="description" maxLength={2000} rows={3} defaultValue={goal?.description ?? ''} placeholder="Pourquoi ce petit pas me tient à cœur…"/></label><div className="form-grid"><label>Cible à atteindre<input type="number" name="target" required min="0.01" max="1000000000" step="0.01" defaultValue={goal?.target ?? 1}/></label><label>Progression actuelle<input type="number" name="current" required min="0" max="1000000000" step="0.01" defaultValue={goal?.current ?? 0}/></label></div><label>Unité<input name="unit" required maxLength={30} defaultValue={goal?.unit ?? 'étapes'} placeholder="séances, jours, km, répétitions…"/></label><label>Échéance (facultative)<input type="date" name="deadline" defaultValue={goal?.deadline ?? ''}/></label><p className="help-text">Renseigne ta progression au fil du parcours. Pour un objectif à cocher, choisis une cible de 1. Ce suivi est indépendant de tes mesures corporelles.</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="secondary" disabled={busy} onClick={() => setEditing(null)}>Annuler</button><button className="primary" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer mon objectif'}</button></div></form></>}
    </dialog>
  </section>;
}
