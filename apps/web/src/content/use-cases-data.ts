export type UseCaseItem = {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  heroGraphic: string; // Icon or layout type
  keyMetrics: { label: string; value: string; detail: string }[];
  features: { title: string; description: string; iconName: string }[];
  architecturePoints: { step: string; title: string; description: string }[];
  quote: { text: string; author: string; role: string; company: string };
};

export const USE_CASES: Record<string, UseCaseItem> = {
  devops: {
    slug: "devops",
    title: "4-of-7 Quorum-Verified Monitoring for DevOps & SRE Teams",
    subtitle:
      "Eliminate 3 AM pager noise with 4-of-7 multi-region consensus validation and native Docker probes.",
    badge: "For DevOps & SREs",
    description:
      "SteadyStack executes multi-region edge checks across 7 global edge regions. When an endpoint fails in one region, our 4-of-7 quorum consensus engine verifies the outage across independent vantage points to eliminate localized ISP glitches.",
    heroGraphic: "terminal",
    keyMetrics: [
      {
        label: "False Positive Reduction",
        value: "99.4%",
        detail: "Consensus-based regional validation",
      },
      {
        label: "Deployment Speed",
        value: "< 60s",
        detail: "Single Docker command probe setup",
      },
      {
        label: "Check Granularity",
        value: "1 Minute",
        detail: "Included on free tier",
      },
    ],
    features: [
      {
        title: "Private Probe Deployment",
        description:
          "Deploy internal probe agents into private Kubernetes clusters or AWS VPCs using lightweight Docker containers.",
        iconName: "Server",
      },
      {
        title: "Terraform & CLI Integration",
        description: "Manage monitors as code using our native CLI and Terraform modules.",
        iconName: "Code2",
      },
      {
        title: "Incident Escalation Policies",
        description:
          "Route alerts to PagerDuty, Opsgenie, Slack, or Discord based on severity and schedule.",
        iconName: "BellRing",
      },
      {
        title: "BGP & Routing Anomaly Detection",
        description:
          "Identify regional network latency degradation before it impacts user transactions.",
        iconName: "Network",
      },
    ],
    architecturePoints: [
      {
        step: "01",
        title: "Global Probe Ping",
        description: "Edge Workers dispatch synthetic HTTP/Ping requests every 60 seconds.",
      },
      {
        step: "02",
        title: "Consensus Check",
        description:
          "If a failure occurs, 3 adjacent regional nodes perform immediate double-check validation.",
      },
      {
        step: "03",
        title: "Instant Notification",
        description: "Alerts are dispatched within 2 seconds via Webhooks, Slack, or SMS.",
      },
    ],
    quote: {
      text: "SteadyStack eliminated our nightly false alarm fatigue. We only get alerted when real incidents impact our infrastructure.",
      author: "Alex Rivers",
      role: "Lead SRE",
      company: "CloudScale Systems",
    },
  },
  ecommerce: {
    slug: "ecommerce",
    title: "Protect Revenue & Cart Conversion with 1-Min Checks",
    subtitle:
      "Every minute of checkout downtime costs revenue. Detect payment gateway and cart failures instantly.",
    badge: "For E-Commerce Stores",
    description:
      "During peak shopping events like Black Friday, 5-minute check intervals are too slow. SteadyStack monitors your checkout funnel, payment gateway endpoints, and search APIs every 60 seconds.",
    heroGraphic: "shopping-cart",
    keyMetrics: [
      {
        label: "Revenue Saved per Outage",
        value: "$14,000+",
        detail: "Based on 8 min average response speed",
      },
      {
        label: "Checkout Verification",
        value: "100%",
        detail: "Multi-step cart flow verification",
      },
      {
        label: "SLA Uptime Assurance",
        value: "99.99%",
        detail: "Continuous uptime tracking",
      },
    ],
    features: [
      {
        title: "Payment Gateway Health",
        description:
          "Monitor Stripe, PayPal, and Adyen API response times to prevent checkout drop-offs.",
        iconName: "CreditCard",
      },
      {
        title: "Multi-Step Shopping Cart Flow",
        description: "Simulate add-to-cart and checkout API sequences to catch hidden failures.",
        iconName: "ShoppingCart",
      },
      {
        title: "Public Status Page for Shoppers",
        description: "Reassure customer support and shoppers with branded status pages.",
        iconName: "Globe",
      },
      {
        title: "Peak Traffic Spike Monitoring",
        description: "Track latency degradation under high concurrency during flash sales.",
        iconName: "TrendingUp",
      },
    ],
    architecturePoints: [
      {
        step: "01",
        title: "Cart API Check",
        description: "Synthetic browser probes execute checkout actions on 60-second loops.",
      },
      {
        step: "02",
        title: "Latency Tracking",
        description: "Alerts fire if payment gateway response exceeds 1500ms threshold.",
      },
      {
        step: "03",
        title: "On-Call Paging",
        description: "SMS and Slack messages reach store engineers before customers complain.",
      },
    ],
    quote: {
      text: "SteadyStack caught a silent Stripe webhook failure during our holiday sale. Saved us thousands in lost orders.",
      author: "Elena Rostova",
      role: "VP of E-Commerce",
      company: "Nordic Goods",
    },
  },
  saas: {
    slug: "saas",
    title: "Build Customer Trust & Prove Enterprise SLAs",
    subtitle:
      "Custom domain status pages, automated SLA reporting, and transparent incident management for SaaS.",
    badge: "For SaaS Companies",
    description:
      "Enterprise buyers demand strict uptime SLAs and total transparency. SteadyStack gives your SaaS application beautiful white-label status pages, automatic SLA calculations, and AI-driven incident post-mortems.",
    heroGraphic: "layers",
    keyMetrics: [
      {
        label: "Enterprise SLA Compliance",
        value: "99.95%",
        detail: "Automated monthly SLA reports",
      },
      {
        label: "Status Page Setup Time",
        value: "< 2 Mins",
        detail: "Custom domain & SSL included",
      },
      {
        label: "Subscriber Incident Reach",
        value: "Instant",
        detail: "Email & Webhook subscriber broadcasts",
      },
    ],
    features: [
      {
        title: "Custom Domain Status Pages",
        description:
          "Host status pages on status.yourdomain.com with your brand colors, logo, and custom CSS.",
        iconName: "Globe",
      },
      {
        title: "Automated Monthly SLA Reports",
        description:
          "Generate shareable PDF and web SLA uptime reports for enterprise procurement teams.",
        iconName: "FileCheck",
      },
      {
        title: "AI Incident Post-Mortems",
        description:
          "Generate structured root cause analysis reports in 1-click using AI insights.",
        iconName: "Sparkles",
      },
      {
        title: "Subscribers & Notifications",
        description:
          "Allow your users to subscribe via email, SMS, or webhooks for outage notifications.",
        iconName: "Users",
      },
    ],
    architecturePoints: [
      {
        step: "01",
        title: "Continuous Monitoring",
        description: "Track core application routes, API gateways, and webhooks.",
      },
      {
        step: "02",
        title: "Status Page Sync",
        description: "Component status updates automatically on public status pages.",
      },
      {
        step: "03",
        title: "SLA Export",
        description: "Monthly uptime percentages calculated automatically for enterprise clients.",
      },
    ],
    quote: {
      text: "Our enterprise deals require 99.9% SLA proof. SteadyStack automated all our status reporting effortlessly.",
      author: "Marcus Chen",
      role: "CTO & Co-Founder",
      company: "SyncMesh Data",
    },
  },
  "api-monitoring": {
    slug: "api-monitoring",
    title: "Deep Synthetic Testing & Multi-Step API Sequences",
    subtitle:
      "Assert JSON responses, validate headers, and test multi-step OAuth API sequences worldwide.",
    badge: "For API & Microservice Devs",
    description:
      "Simple HTTP GET pings aren't enough for modern APIs. SteadyStack validates payload regex matches, verifies JSON schemas, checks SSL certificate expirations, and executes multi-step HTTP sequences.",
    heroGraphic: "code",
    keyMetrics: [
      {
        label: "Payload Assertion Speed",
        value: "Sub-10ms",
        detail: "Fast regex & JSON evaluation",
      },
      {
        label: "Edge Regions",
        value: "7 Global",
        detail: "4-of-7 Quorum consensus",
      },
      {
        label: "SSL Expiry Warning",
        value: "30 Days",
        detail: "Proactive certificate watchdog",
      },
    ],
    features: [
      {
        title: "Multi-Step API Workflows",
        description:
          "Chain HTTP requests (e.g. obtain OAuth token → POST payload → GET status) into automated synthetic tests.",
        iconName: "Workflow",
      },
      {
        title: "JSON & Regex Assertions",
        description:
          "Verify body contents, status codes, and HTTP headers with granular assertion rules.",
        iconName: "FileJson",
      },
      {
        title: "SSL Certificate Watchdog",
        description:
          "Receive advance notifications before SSL certificates expire or root CA chains break.",
        iconName: "ShieldAlert",
      },
      {
        title: "DNS & Port Checks",
        description: "Monitor DNS record propagation (A, AAAA, CNAME, MX) and custom TCP ports.",
        iconName: "Radio",
      },
    ],
    architecturePoints: [
      {
        step: "01",
        title: "Sequence Execution",
        description: "Probes execute multi-step HTTP sequences storing response tokens in memory.",
      },
      {
        step: "02",
        title: "Payload Validation",
        description: "JSON properties and HTTP headers checked against exact expectations.",
      },
      {
        step: "03",
        title: "Telemetry Recording",
        description: "Response times broken down by DNS lookup, TLS handshake, and TTFB.",
      },
    ],
    quote: {
      text: "The multi-step sequence runner lets us test our entire authentication & checkout API pipeline every single minute.",
      author: "Samantha Vance",
      role: "Principal API Architect",
      company: "Nexus Gateway",
    },
  },
};
