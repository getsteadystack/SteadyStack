import type { Metadata } from "next";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { SubnetCalculator } from "./calculator";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IP Subnet Calculator & CIDR Bitmask Tool | SteadyStack",
  description:
    "Free IP Subnet Calculator to visualize CIDR masks, network addresses, broadcast addresses, wildcard masks, and usable host ranges for IPv4 infrastructure.",
  keywords: [
    "ip subnet calculator",
    "cidr calculator",
    "subnet mask tool",
    "network broadcast address",
    "ipv4 bitmask converter",
    "vpc subnet planner",
  ],
  alternates: {
    canonical: "/tools/ip-subnet",
  },
  openGraph: {
    title: "IP Subnet Calculator",
    description:
      "Visualize and decompose your network topology with SteadyStack's IP pulse sentinel.",
    type: "website",
  },
};

export default function IPSubnetPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="IP Subnet Calculator"
        description="Free IP Subnet Calculator to visualize network masks, broadcast addresses, and host ranges. Decode binary bitmasks and optimize your infrastructure topology."
        url="https://steadystack.dev/tools/ip-subnet"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-20">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-linear-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent pb-2 uppercase italic">
              Network Pulse Sentinel
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-mono">
              [DECOMPOSING TOPOLOGY BITSETS... ] Instantly resolve address ranges, masks, and
              network geometry.
            </p>
          </div>

          <SubnetCalculator />

          <ToolContentSection
            toolName="IP Subnet Calculator"
            overviewTitle="How CIDR Subnetting & Bitmask Mathematics Work"
            overviewDescription="Classless Inter-Domain Routing (CIDR) replaced legacy Class A/B/C network blocks with flexible prefix lengths (/0 to /32). By applying a 32-bit subnet mask to an IPv4 address, network engineers divide large IP spaces into smaller, secure subnets for cloud VPCs, Kubernetes clusters, and firewall zoning."
            howItWorks={[
              {
                title: "1. Binary Bitmask Partitioning",
                content:
                  "An IPv4 address contains 32 binary bits. The CIDR prefix (e.g. /24) dictates how many leading bits represent the Network ID, while the remaining bits designate Host IDs.",
                codeSnippet: "192.168.1.0/24 -> 11111111.11111111.11111111.00000000",
              },
              {
                title: "2. Network & Broadcast Boundaries",
                content:
                  "The first address (all host bits 0) is the Network Address. The last address (all host bits 1) is the Broadcast Address, leaving 2^(32-prefix) - 2 usable host IPs.",
                codeSnippet: "Usable Hosts = (2^(32 - CIDR)) - 2",
              },
              {
                title: "3. Wildcard Mask Inversion",
                content:
                  "Inverted subnet masks (wildcards) are generated for Cisco ACLs and firewall rules to match contiguous ranges with zero routing ambiguity.",
                codeSnippet: "Subnet: 255.255.255.0 -> Wildcard: 0.0.0.255",
              },
            ]}
            useCasesTitle="Common Subnetting Scenarios in Cloud Architecture"
            useCases={[
              {
                title: "AWS / GCP / Azure VPC Partitioning",
                description:
                  "Cloud providers reserve the first 4 IP addresses and the last IP address in each subnet for gateway, DNS, and future use. A /28 provides 11 usable IPs instead of 14.",
                badge: "Cloud VPC",
              },
              {
                title: "Kubernetes Pod CIDR Allocation",
                description:
                  "Assigning /24 or /22 pod ranges prevents IP exhaustion in high-churn container environments where pods spin up and terminate rapidly.",
                badge: "Containers",
              },
              {
                title: "Firewall Whitelisting & Ingress Rules",
                description:
                  "Convert dynamic IP lists from webhook providers or uptime monitoring probes into minimal CIDR ranges for secure security group whitelisting.",
                badge: "Security",
              },
              {
                title: "Site-to-Site VPN Tunnel Overlaps",
                description:
                  "Detect and avoid overlapping RFC 1918 private address ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) when connecting branch offices or partner networks.",
                badge: "VPN Routing",
              },
            ]}
            faqs={[
              {
                question: "What are the private IPv4 address ranges (RFC 1918)?",
                answer:
                  "The designated private ranges are: 10.0.0.0/8 (10.0.0.0 – 10.255.255.255), 172.16.0.0/12 (172.16.0.0 – 172.31.255.255), and 192.168.0.0/16 (192.168.0.0 – 192.168.255.255).",
              },
              {
                question: "Why do cloud providers subtract 5 IPs from every subnet?",
                answer:
                  "In AWS VPCs, for instance, in 10.0.0.0/24: .0 is network, .1 is VPC router, .2 is AWS DNS, .3 is reserved for future use, and .255 is broadcast.",
              },
              {
                question: "What is the difference between /24 and /16?",
                answer:
                  "A /24 subnet has 256 total IP addresses (254 usable), whereas a /16 subnet has 65,536 total IP addresses (65,534 usable).",
              },
              {
                question: "Does SteadyStack publish its probe IP ranges for firewall whitelisting?",
                answer:
                  "Yes. SteadyStack provides a clean, automated API and static CIDR list of all global edge probe IP addresses so you can whitelist monitoring traffic through your WAF or firewall.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
