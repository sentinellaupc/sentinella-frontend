import Link from "next/link";

/**
 * Hero estático en /public/auth-hero-mining.png.
 * Usamos <img> en lugar de next/image para evitar problemas de layout con fill + absolute en flex.
 */
export function AuthMarketingPanel() {
  return (
    <aside className="relative hidden min-h-[50vh] flex-col border-b border-slate-800/20 bg-[#020817] px-8 py-10 lg:flex lg:min-h-screen lg:border-b-0 lg:px-10 lg:py-12">
      {/* Capa decorativa suave: no tapa el bloque de imagen inferior */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(45,212,191,0.12),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-sm flex-col">
        <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-cyan-50">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan-200/40 text-lg leading-none text-cyan-100">
            S
          </span>
          Sentinella
        </Link>
        <h2 className="mt-8 text-3xl font-bold leading-tight text-slate-50 md:text-4xl">
          Monitoreo de tranques de relaves en tiempo real
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/90">
          Telemetría IoT, alertas multicanal, rondas de inspección y reportes regulatorios: una sola plataforma para
          operación de campo y sala de control.
        </p>
        <ul className="relative z-20 mt-8 space-y-3 text-sm text-slate-200/95">
          <li className="flex gap-2">
            <span className="text-teal-300">●</span>
            Dashboard ejecutivo y mapa georreferenciado
          </li>
          <li className="flex gap-2">
            <span className="text-teal-300">●</span>
            PWA offline para operarios en zona altoandina
          </li>
          <li className="flex gap-2">
            <span className="text-teal-300">●</span>
            Gemelo digital y simulación de escenarios
          </li>
        </ul>

        {/* Ilustración debajo del copy, compacta; el listado queda legible “por encima” si se solapa un poco */}
        <div className="relative z-10 mt-5 flex w-full justify-end lg:mt-4">
          <div className="w-[min(55%,200px)] shrink-0 sm:max-w-[180px]">
            <img
              src="/auth-hero-mining.png"
              alt="Vista técnica minera en estilo de puntos"
              decoding="async"
              className="h-auto w-full max-h-[88px] object-contain object-right [image-rendering:auto] opacity-90 [filter:drop-shadow(0_0_20px_rgba(45,212,191,0.06))] sm:max-h-[96px]"
            />
          </div>
        </div>

        <p className="relative z-20 mt-4 text-xs text-slate-400/70">ChicamaX - tranques de relaves</p>
      </div>
    </aside>
  );
}
