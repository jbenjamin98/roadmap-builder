/** Selection card. Selected state is shown by the border highlight only. */
export function OptionCard({ selected, onClick, title, desc, children, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
        selected
          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <span className="text-xs font-bold text-slate-900 dark:text-white">{title}</span>
      {children}
      {desc && <span className="text-[10px] text-slate-500 dark:text-slate-400">{desc}</span>}
    </button>
  );
}

export function Stage({ tokens, children, className = '', style }) {
  return (
    <div
      style={{
        backgroundColor: tokens.stickyBg,
        color: tokens.textMain,
        borderColor: tokens.gridBorder,
        ...style,
      }}
      className={`rounded-lg border overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function Segmented({ options, value, onChange, disabled = false }) {
  return (
    <div
      className={`inline-flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${
        disabled ? 'opacity-45 pointer-events-none' : ''
      }`}
    >
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(id)}
          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            value === id
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SectionTitle({ icon: Icon, tone, children }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${tone}`}>
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
}

export function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
      {children}
    </label>
  );
}

export function ToggleRow({ icon: Icon, tone, title, desc, checked, onChange, testId }) {
  return (
    <label
      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
        checked
          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 ${tone}`} />
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">{title}</div>
          <div className="text-[10px] text-slate-500">{desc}</div>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={testId}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600"
      />
    </label>
  );
}
