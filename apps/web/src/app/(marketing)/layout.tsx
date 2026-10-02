import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";

export const dynamic = "force-dynamic";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf9] text-[#23211a] font-sans selection:bg-[#ffd439]/30">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
