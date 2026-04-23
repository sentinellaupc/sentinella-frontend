import { AuthMarketingPanel } from "@/components/auth/AuthMarketingPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-scheme min-h-screen bg-[#020817] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <AuthMarketingPanel />
        <div className="relative flex min-h-[50vh] flex-col justify-center overflow-hidden border-t border-slate-800/20 bg-[#010509] px-6 py-10 sm:px-10 lg:min-h-screen lg:border-t-0 lg:border-l lg:border-slate-800/15 lg:px-12 lg:py-12 xl:px-16">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_20%,rgba(8,47,73,0.1),transparent_55%)]"
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md lg:ml-auto">{children}</div>
        </div>
      </div>
      <div className="border-t border-slate-800/80 bg-[#020817] px-6 py-6 lg:hidden">
        <p className="text-center text-xs font-semibold text-teal-500">Sentinella</p>
        <p className="mt-1 text-center text-[11px] text-slate-500">Monitoreo de tranques de relaves</p>
      </div>
    </div>
  );
}
