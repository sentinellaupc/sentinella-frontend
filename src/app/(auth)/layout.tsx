import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-scheme min-h-screen bg-[#0A0A0A] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
        <AuthMarketingPanel />
        <div className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden border-t border-slate-800/20 bg-zinc-950 px-6 py-10 sm:px-10 lg:min-h-screen lg:border-t-0 lg:border-l lg:border-white/[0.06] lg:px-10 lg:py-12 xl:px-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_15%_25%,rgba(15,23,42,0.45),transparent_60%)]"
            aria-hidden
          />
          <div className="relative z-10 mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
      <div className="border-t border-slate-800/80 bg-[#0A0A0A] px-6 py-6 lg:hidden">
        <p className="text-center text-xs font-semibold text-teal-500">Sentinella</p>
        <p className="mt-1 text-center text-[11px] text-slate-500">Monitoreo de tranques de relaves</p>
      </div>
    </div>
  );
}
