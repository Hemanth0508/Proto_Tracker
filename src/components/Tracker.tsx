'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Phase, SubTask, Status, PHASES as DEFAULT_PHASES } from '@/lib/data'

// ─── Status config ─────────────────────────────────────────────
const STATUS_CONFIG = {
  'not-started': { label: 'Not Started', dot: '#475569', bg: 'rgba(71,85,105,0.15)', text: '#64748B' },
  'in-progress': { label: 'In Progress', dot: '#F59E0B', bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  'done':        { label: 'Done',        dot: '#10B981', bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
}

// ─── Tiny components ───────────────────────────────────────────
function StatusBadge({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const cfg = STATUS_CONFIG[status]

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const dropHeight = 116
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow < dropHeight + 8 ? rect.top - dropHeight - 4 : rect.bottom + 4
    setPos({ top, right: window.innerWidth - rect.right })
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono transition-all hover:opacity-90 flex-shrink-0"
        style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.text}30` }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
        {cfg.label}
      </button>

      {open && (
        <div
          className="fixed z-[9999] rounded-xl overflow-hidden"
          style={{
            top: pos.top,
            right: pos.right,
            background: '#1a2535',
            border: '1px solid rgba(255,255,255,0.12)',
            minWidth: '145px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
            const c = STATUS_CONFIG[s]
            const isActive = s === status
            return (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false) }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs hover:bg-white/[0.06] transition-colors text-left"
                style={{ color: c.text, background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent' }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
                <span className="flex-1">{c.label}</span>
                {isActive && <span className="text-slate-600 text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
function NoteModal({ task, phaseColor, onSave, onClose }: {
  task: SubTask; phaseColor: string; onSave: (note: string) => void; onClose: () => void
}) {
  const [note, setNote] = useState(task.note)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in"
        style={{ background: '#111827', border: `1px solid ${phaseColor}30`, boxShadow: `0 0 60px ${phaseColor}20` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-display font-bold" style={{ color: phaseColor }}>Add Note</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </div>
        <p className="text-xs text-slate-400 mb-3 font-mono leading-relaxed">{task.label}</p>
        <textarea
          className="note-input"
          rows={4}
          placeholder="What was decided, what was built, any context..."
          value={note}
          onChange={e => setNote(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(note); onClose() }}
            className="px-4 py-1.5 text-xs font-mono rounded-lg font-medium transition-all hover:opacity-90"
            style={{ background: phaseColor, color: '#080C14' }}>
            Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

function TaskRow({ task, phaseColor, onStatusChange, onNoteChange }: {
  task: SubTask; phaseColor: string;
  onStatusChange: (id: string, s: Status) => void;
  onNoteChange: (id: string, note: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false)
  const isDone = task.status === 'done'

  return (
    <>
      <div className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all ${isDone ? 'opacity-60' : 'hover:bg-white/[0.02]'}`}>
        {/* Status indicator dot */}
        <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
          style={{ background: STATUS_CONFIG[task.status].dot }} />

        {/* Label */}
        <span className={`flex-1 text-xs leading-relaxed font-mono ${isDone ? 'line-through text-slate-500' : 'text-slate-300'}`}>
          {task.label}
        </span>

        {/* Note indicator */}
        {task.note && (
          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ background: phaseColor, opacity: 0.7 }} />
        )}

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingNote(true)}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors text-xs"
            title={task.note ? 'Edit note' : 'Add note'}
          >
            ✏️
          </button>
          <StatusBadge
            status={task.status}
            color={phaseColor}
            onChange={(s) => onStatusChange(task.id, s)}
          />
        </div>
      </div>

      {/* Note preview if exists */}
      {task.note && (
        <div className="mx-3 mb-1 px-3 py-2 rounded text-xs font-mono text-slate-500 leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${phaseColor}40` }}>
          {task.note}
        </div>
      )}

      {editingNote && (
        <NoteModal
          task={task}
          phaseColor={phaseColor}
          onSave={(note) => onNoteChange(task.id, note)}
          onClose={() => setEditingNote(false)}
        />
      )}
    </>
  )
}

function PhaseCard({ phase, onStatusChange, onNoteChange }: {
  phase: Phase;
  onStatusChange: (phaseId: string, taskId: string, s: Status) => void;
  onNoteChange: (phaseId: string, taskId: string, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false)
  const total = phase.tasks.length
  const done = phase.tasks.filter(t => t.status === 'done').length
  const inProgress = phase.tasks.filter(t => t.status === 'in-progress').length
  const pct = Math.round((done / total) * 100)
  const isComplete = done === total
  const hasStarted = done > 0 || inProgress > 0

  const phaseStatus: Status = isComplete ? 'done' : hasStarted ? 'in-progress' : 'not-started'

  return (
    <div className="phase-card rounded-2xl overflow-hidden"
      style={{
        background: '#0D1520',
        border: `1px solid ${isComplete ? phase.color + '40' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isComplete ? `0 0 30px ${phase.glowColor}` : 'none',
      }}>

      {/* Phase Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
      >
        {/* Phase number */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm"
          style={{ background: `${phase.color}15`, color: phase.color, border: `1px solid ${phase.color}25` }}>
          {String(phase.number).padStart(2, '0')}
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-sm text-slate-100">{phase.title}</h3>
            {isComplete && <span className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: `${phase.color}20`, color: phase.color }}>✓ Complete</span>}
          </div>
          <p className="text-xs text-slate-500 font-mono truncate">{phase.description}</p>
        </div>

        {/* Progress */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: hasStarted ? phase.color : '#475569' }}>
              {done}/{total}
            </span>
            <StatusBadge status={phaseStatus} color={phase.color} onChange={() => {}} />
          </div>
          {/* Mini progress bar */}
          <div className="w-24 h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: phase.color,
                boxShadow: pct > 0 ? `0 0 8px ${phase.color}` : 'none' }} />
          </div>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 text-slate-600 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </div>
      </button>

      {/* Progress bar full width */}
      <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-px transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${phase.color}80, ${phase.color})` }} />
      </div>

      {/* Tasks */}
      {expanded && (
        <div className="p-3 pt-3 flex flex-col gap-0.5 animate-fade-in">
          {phase.tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              phaseColor={phase.color}
              onStatusChange={(id, s) => onStatusChange(phase.id, id, s)}
              onNoteChange={(id, note) => onNoteChange(phase.id, id, note)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main App ──────────────────────────────────────────────────
export default function Tracker() {
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Load from server on mount
  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => {
        setPhases(data)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  // Save to server
  const save = useCallback(async (updatedPhases: Phase[]) => {
    setSaving(true)
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPhases),
      })
      setLastSaved(new Date().toLocaleTimeString())
    } catch {}
    setSaving(false)
  }, [])

  const handleStatusChange = useCallback((phaseId: string, taskId: string, status: Status) => {
    setPhases(prev => {
      const updated = prev.map(p => p.id !== phaseId ? p : {
        ...p,
        tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, status })
      })
      save(updated)
      return updated
    })
  }, [save])

  const handleNoteChange = useCallback((phaseId: string, taskId: string, note: string) => {
    setPhases(prev => {
      const updated = prev.map(p => p.id !== phaseId ? p : {
        ...p,
        tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, note })
      })
      save(updated)
      return updated
    })
  }, [save])

  // Overall stats
  const allTasks = phases.flatMap(p => p.tasks)
  const totalDone = allTasks.filter(t => t.status === 'done').length
  const totalInProgress = allTasks.filter(t => t.status === 'in-progress').length
  const totalTasks = allTasks.length
  const overallPct = Math.round((totalDone / totalTasks) * 100)
  const phasesComplete = phases.filter(p => p.tasks.every(t => t.status === 'done')).length

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 font-mono text-sm animate-pulse">Loading mission data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-40 px-6 py-4"
        style={{ background: 'rgba(8,12,20,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Agent Governance</span>
            </div>
            <h1 className="font-display font-bold text-lg text-slate-100">SDLC Mission Control</h1>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-slate-500">
              {saving ? (
                <span className="text-amber-400">Saving...</span>
              ) : lastSaved ? (
                <span className="text-slate-600">Saved {lastSaved}</span>
              ) : null}
            </div>
            <div className="text-xs font-mono text-slate-400 mt-0.5">
              {phasesComplete}/12 phases · {totalDone}/{totalTasks} tasks
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Overall Progress Hero */}
        <div className="mb-10 p-6 rounded-2xl relative overflow-hidden"
          style={{ background: '#0D1520', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Background glow */}
          <div className="absolute inset-0 opacity-30"
            style={{ background: `radial-gradient(ellipse at 50% 100%, rgba(96,165,250,0.15), transparent 70%)` }} />

          <div className="relative">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Overall Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-5xl text-slate-100">{overallPct}%</span>
                  <span className="text-slate-500 font-mono text-sm">complete</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="font-display font-bold text-2xl text-emerald-400">{totalDone}</div>
                    <div className="text-xs font-mono text-slate-500">done</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display font-bold text-2xl text-amber-400">{totalInProgress}</div>
                    <div className="text-xs font-mono text-slate-500">active</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display font-bold text-2xl text-slate-400">{totalTasks - totalDone - totalInProgress}</div>
                    <div className="text-xs font-mono text-slate-500">remaining</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main progress bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full relative overflow-hidden transition-all duration-1000"
                style={{
                  width: `${overallPct}%`,
                  background: 'linear-gradient(90deg, #60A5FA, #A78BFA, #34D399)',
                  boxShadow: '0 0 20px rgba(96,165,250,0.5)',
                }}>
                <div className="absolute inset-0 progress-shimmer" />
              </div>
            </div>

            {/* Phase progress dots */}
            <div className="flex gap-1.5 mt-3">
              {phases.map(phase => {
                const done = phase.tasks.every(t => t.status === 'done')
                const started = phase.tasks.some(t => t.status !== 'not-started')
                return (
                  <div key={phase.id} className="flex-1 h-1 rounded-full transition-all duration-500"
                    style={{
                      background: done ? phase.color : started ? `${phase.color}50` : 'rgba(255,255,255,0.05)',
                      boxShadow: done ? `0 0 6px ${phase.color}` : 'none',
                    }} />
                )
              })}
            </div>
          </div>
        </div>

        {/* Phase Cards */}
        <div className="flex flex-col gap-3">
          {phases.map(phase => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              onStatusChange={handleStatusChange}
              onNoteChange={handleNoteChange}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pb-8 text-center">
          <p className="text-xs font-mono text-slate-600">
            Agent Governance — Hemanth Porapu · {new Date().getFullYear()}
          </p>
          <p className="text-xs font-mono text-slate-700 mt-1">
            Enforcement is deterministic infrastructure, not probabilistic LLM reasoning.
          </p>
        </div>
      </main>
    </div>
  )
}
