import Link from "next/link";
import LandingHeader from "@/components/landing/header";

export default function AuthLayout({
  children,
  title,
  subtitle: customSubtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const displayTitle =
    title === "System Login"
      ? "Welcome back"
      : title === "New User Registration"
        ? "Create an account"
        : title;

  const subtitle =
    customSubtitle ??
    (title === "System Login"
      ? "Log in to your SteadyStack dashboard"
      : title === "New User Registration"
        ? "Start monitoring your infrastructure globally"
        : "");

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0A0A] text-foreground font-sans selection:bg-primary/20">
      <LandingHeader />

      {/* Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-20">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center flex flex-col items-center">
            <Link
              href="/"
              className="mb-6 flex items-center justify-center size-14 rounded-2xl bg-[#181715] border border-[#2e2c26] shadow-md hover:scale-105 transition-transform overflow-hidden p-1.5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="SteadyStack" className="size-full object-contain" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{displayTitle}</h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">{subtitle}</p>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-[#0a0a0a]/80 p-6 md:p-8 shadow-xl backdrop-blur-xl overflow-hidden">
            {/* Card Top Glow Edge */}
            <div className="absolute top-0 inset-x-0 h-px grid grid-cols-1">
              <div className="w-full h-full bg-linear-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
