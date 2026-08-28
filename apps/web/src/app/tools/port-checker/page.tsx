import type { Metadata } from "next";
import { PortChecker } from "@/components/tools/port-checker";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Open Port Checker & TCP Port Forwarding Tester | SteadyStack",
  description:
    "Test if your TCP ports are open, listening, and accessible from the public internet. Test Minecraft (25565), SSH (22), Plex (32400), HTTP (80/443), and custom ports instantly.",
  keywords: [
    "port checker",
    "open port test",
    "port forwarding test",
    "minecraft port check",
    "ssh port 22 open",
    "tcp connection test",
    "firewall diagnostic",
  ],
  alternates: {
    canonical: "/tools/port-checker",
  },
};

/**
 * Renders the Port Checker page with interactive testing and network diagnostic guides.
 */
export default function PortCheckerPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="Open Port Checker Tool"
        description="Test if your ports are open and accessible from the internet. Check Minecraft (25565), SSH (22), Plex (32400) and more."
        url="https://steadystack.dev/tools/port-checker"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-linear-to-r from-primary to-green-400 bg-clip-text text-transparent pb-2 font-mono">
              PORT_FORWARDING_TESTER
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-mono">
              &gt; Diagnostic tool for verifying external connectivity. <br />
              &gt; Supports standard services and custom TCP ports.
            </p>
          </div>

          <PortChecker />

          <ToolContentSection
            toolName="Open Port Checker"
            overviewTitle="How TCP Port Scanning & Port Forwarding Work"
            overviewDescription="A TCP port is a communication endpoint for network applications. When hosting services behind a home router, NAT gateway, or cloud firewall (AWS Security Groups, Cloudflare, GCP), port forwarding maps incoming public traffic to your local server's private IP."
            howItWorks={[
              {
                title: "1. TCP SYN Handshake Probe",
                content:
                  "Our external scanning probe transmits a TCP SYN packet to your target IP/hostname and designated port, waiting for a SYN-ACK response.",
                codeSnippet: "Client (SYN) -> Target (SYN-ACK) -> Client (ACK)",
              },
              {
                title: "2. State & Timeout Evaluation",
                content:
                  "If the socket connects within timeout thresholds, the port is OPEN. If an RST packet is returned, the port is CLOSED (host up, no service listening). If dropped silently, it is FILTERED (firewall drop).",
                codeSnippet: "Status: OPEN | CLOSED | TIMEOUT",
              },
              {
                title: "3. Service Banner Identification",
                content:
                  "For known protocols (SSH, HTTP, SMTP), the scanner checks protocol conformance to verify that the application layer is responding normally.",
                codeSnippet: "SSH-2.0-OpenSSH_9.6p1 Ubuntu",
              },
            ]}
            useCasesTitle="Common Port Forwarding & Firewall Issues"
            useCases={[
              {
                title: "Double NAT (CGNAT / ISP Carrier Grade NAT)",
                description:
                  "If your WAN IP in your router settings does not match your public IP (often starting with 100.64.x.x), your ISP uses CGNAT, blocking direct incoming port forwards without a VPN/tunnel.",
                badge: "ISP Routing",
              },
              {
                title: "Local Host Firewall (Windows Defender / UFW / iptables)",
                description:
                  "Even if your router forwards port 25565 or 22, the local operating system firewall on the server machine must explicitly allow inbound connections on that port.",
                badge: "OS Firewall",
              },
              {
                title: "Cloud Security Group Restrictions",
                description:
                  "On AWS EC2, DigitalOcean, or Azure VMs, inbound rules in the cloud dashboard must permit traffic from 0.0.0.0/0 on the specified port range.",
                badge: "Cloud Config",
              },
              {
                title: "Binding to localhost (127.0.0.1) vs 0.0.0.0",
                description:
                  "If your daemon binds to 127.0.0.1 instead of 0.0.0.0, it will only accept connections from the local machine and will refuse all external forwarded requests.",
                badge: "App Binding",
              },
            ]}
            faqs={[
              {
                question: "Why does my port show closed when my server is running?",
                answer:
                  "Common reasons include: the server application is bound to 127.0.0.1 rather than 0.0.0.0, the router port forwarding rule points to the wrong local IP address, or your ISP blocks incoming ports (e.g. port 80/25).",
              },
              {
                question: "What are the most commonly forwarded ports?",
                answer:
                  "Common ports include 22 (SSH), 80 (HTTP), 443 (HTTPS), 25565 (Minecraft Java), 19132 (Minecraft Bedrock), 32400 (Plex Media Server), 8080 (Web Dev), and 3389 (Remote Desktop RDP).",
              },
              {
                question: "Is scanning open ports safe?",
                answer:
                  "Yes. Our port checker executes a non-intrusive standard TCP connection attempt to verify external reachability. It does not perform invasive vulnerability probing.",
              },
              {
                question: "How can I continuously monitor my custom TCP or UDP ports?",
                answer:
                  "SteadyStack provides automated TCP and HTTP port monitoring from multiple geographic regions every 60 seconds, immediately notifying your team if a port stops responding.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
