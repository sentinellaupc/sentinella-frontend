export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6 border-b border-slate-700/60 pb-4">
      <h1 className="text-xl font-semibold tracking-tight text-slate-100">{title}</h1>
      {description ? <p className="mt-1 max-w-3xl text-sm text-slate-400">{description}</p> : null}
    </header>
  );
}
