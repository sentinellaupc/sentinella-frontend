import Link from "next/link";

/**
 * Hero: `auth-hero-mining.png` (puntos) + `mix-blend-screen` funde el negro con el
 * panel. Alternativa vectorial sin caja: `public/auth-hero-terrain-dots.svg`.
 */
const AUTH_HERO = "/auth-hero-mining.png";
const USE_SVG_DOTS = false;
const HERO_SRC = USE_SVG_DOTS ? "/auth-hero-terrain-dots.svg" : AUTH_HERO;
const HERO_PNG_KNOCKOUT = HERO_SRC.endsWith(".png");

export function AuthMarketingPanel() {
  return (
    <aside className="relative hidden w-full min-h-[50vh] flex-col border-b border-slate-800/20 bg-[#0A0A0A] px-8 py-10 lg:flex lg:min-h-screen lg:flex-1 lg:border-b-0 lg:px-10 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(45,212,191,0.02),transparent_50%)]"
        aria-hidden
      />

      {/* Derecha de la columna (como antes), sin anclar al borde izquierdo */}
      <div
        className="pointer-events-none absolute bottom-24 right-0 z-0 flex h-[min(74vh,780px)] w-full max-w-6xl translate-x-1 items-end justify-end sm:bottom-32 sm:translate-x-2 lg:bottom-40 lg:translate-x-3 xl:max-w-7xl xl:translate-x-4"
        aria-hidden
      >
        <img
          src={HERO_SRC}
          alt="Vista técnica de tranque y terreno (gemelo digital)"
          decoding="async"
          className={
            HERO_PNG_KNOCKOUT
              ? "h-full w-full object-contain object-bottom-right mix-blend-screen"
              : "h-full w-full object-contain object-bottom-right"
          }
        />
      </div>

      <div className="relative z-20 flex w-full min-w-0 max-w-xl flex-1 flex-col">
        <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-cyan-50">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan-200/40 text-lg leading-none text-cyan-100">
            S
          </span>
          Sentinella
        </Link>
        <h2 className="mt-8 text-3xl font-bold leading-tight text-slate-50 drop-shadow-md md:text-4xl">
          Monitoreo de tranques de relaves en tiempo real
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/95 [text-shadow:0_1px_14px_rgba(2,8,23,0.9)]">
          Telemetría IoT, alertas multicanal, rondas de inspección y reportes regulatorios: una sola plataforma para
          operación de campo y sala de control.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-slate-200/95">
          <li className="flex gap-2 [text-shadow:0_1px_12px_rgba(2,8,23,0.88)]">
            <span className="shrink-0 text-teal-300">●</span>
            Dashboard ejecutivo y mapa georreferenciado
          </li>
          <li className="flex gap-2 [text-shadow:0_1px_12px_rgba(2,8,23,0.88)]">
            <span className="shrink-0 text-teal-300">●</span>
            PWA offline para operarios en zona altoandina
          </li>
          <li className="flex gap-2 [text-shadow:0_1px_12px_rgba(2,8,23,0.88)]">
            <span className="shrink-0 text-teal-300">●</span>
            Gemelo digital y simulación de escenarios
          </li>
        </ul>

        <p className="mt-10 text-xs text-slate-400/85 [text-shadow:0_1px_8px_rgba(2,8,23,0.95)]">ChicamaX - tranques de relaves</p>
      </div>
    </aside>
  );
}
