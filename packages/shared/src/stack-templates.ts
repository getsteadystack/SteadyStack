export type StackMonitorPreset = {
  name: string;
  type: "HTTP" | "PING" | "PORT" | "SSL" | "DNS" | "HEARTBEAT";
  url: string;
  port?: number;
  description?: string;
  method?: string;
  headers?: { key: string; value: string }[];
  body?: string;
  expectation?: string;
  interval?: number;
  timeout?: number;
};

export type StackTemplate = {
  id: string;
  name: string;
  description: string;
  tagline: string;
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  monitors: StackMonitorPreset[];
  techStack: string[];
};

export const stackTemplates: StackTemplate[] = [
  {
    id: "nextjs",
    name: "The Perfect Next.js Setup",
    description:
      "Complete monitoring for a Next.js application — frontend pages, API routes, SSL certificate, and revalidation checks.",
    tagline: "1-click peace of mind for your Next.js app",
    icon: "Globe",
    difficulty: "beginner",
    techStack: ["Next.js", "React", "Vercel", "Node.js"],
    monitors: [
      {
        name: "Next.js Production (Homepage)",
        type: "HTTP",
        url: "https://example.com",
        method: "GET",
        expectation: JSON.stringify({ body_contains: "</div>" }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "Next.js API Health",
        type: "HTTP",
        url: "https://example.com/api/health",
        method: "GET",
        expectation: JSON.stringify({
          json_assertions: [{ path: "status", operator: "==", value: "ok" }],
        }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "Next.js SSL Certificate",
        type: "SSL",
        url: "https://example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "supabase",
    name: "The Supabase Stack",
    description:
      "Monitor your Supabase project — dashboard availability, database connectivity, authentication endpoint, and edge functions.",
    tagline: "Full visibility into your Supabase ecosystem",
    icon: "Database",
    difficulty: "beginner",
    techStack: ["Supabase", "PostgreSQL", "Auth", "Edge Functions"],
    monitors: [
      {
        name: "Supabase Project Dashboard",
        type: "HTTP",
        url: "https://project-ref.supabase.co",
        method: "GET",
        interval: 300,
        timeout: 15,
      },
      {
        name: "Supabase Auth Endpoint",
        type: "HTTP",
        url: "https://project-ref.supabase.co/auth/v1/health",
        method: "GET",
        interval: 300,
        timeout: 10,
      },
      {
        name: "Supabase Database Port",
        type: "PORT",
        url: "db.project-ref.supabase.co",
        port: 5432,
        interval: 300,
        timeout: 10,
      },
      {
        name: "Supabase Edge Functions",
        type: "HTTP",
        url: "https://project-ref.functions.supabase.co/health",
        method: "GET",
        interval: 300,
        timeout: 15,
      },
    ],
  },
  {
    id: "ecommerce",
    name: "The E-Commerce Stack",
    description:
      "Comprehensive monitoring for an online store — product pages, checkout flow, API, search, and payment gateway availability.",
    tagline: "Never lose a sale to downtime",
    icon: "ShoppingCart",
    difficulty: "intermediate",
    techStack: ["Shopify", "Stripe", "Next.js", "Search"],
    monitors: [
      {
        name: "Homepage & Landing",
        type: "HTTP",
        url: "https://store.example.com",
        method: "GET",
        expectation: JSON.stringify({ body_contains: "Add to Cart" }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "Product Pages",
        type: "HTTP",
        url: "https://store.example.com/products/sample",
        method: "GET",
        expectation: JSON.stringify({ body_contains: "price" }),
        interval: 120,
        timeout: 10,
      },
      {
        name: "Checkout API",
        type: "HTTP",
        url: "https://api.store.example.com/checkout/health",
        method: "GET",
        expectation: JSON.stringify({
          json_assertions: [{ path: "status", operator: "==", value: "healthy" }],
        }),
        interval: 60,
        timeout: 15,
      },
      {
        name: "Search Endpoint",
        type: "HTTP",
        url: "https://api.store.example.com/search/health",
        method: "GET",
        interval: 120,
        timeout: 10,
      },
      {
        name: "Store SSL Certificate",
        type: "SSL",
        url: "https://store.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "api-stack",
    name: "The API Stack",
    description:
      "Full coverage for a REST or GraphQL API — endpoint availability, response validation, latency tracking, and port monitoring.",
    tagline: "Your API deserves enterprise-grade watching",
    icon: "Code",
    difficulty: "beginner",
    techStack: ["REST", "GraphQL", "Node.js", "Express", "Fastify"],
    monitors: [
      {
        name: "API Root Health",
        type: "HTTP",
        url: "https://api.example.com/health",
        method: "GET",
        expectation: JSON.stringify({
          json_assertions: [{ path: "status", operator: "==", value: "ok" }],
        }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "API Authentication Endpoint",
        type: "HTTP",
        url: "https://api.example.com/auth/login",
        method: "POST",
        body: JSON.stringify({ test: true }),
        headers: [{ key: "Content-Type", value: "application/json" }],
        expectation: JSON.stringify({ body_contains: "token" }),
        interval: 300,
        timeout: 15,
      },
      {
        name: "GraphQL Endpoint",
        type: "HTTP",
        url: "https://api.example.com/graphql",
        method: "POST",
        body: JSON.stringify({ query: "{ __typename }" }),
        headers: [{ key: "Content-Type", value: "application/json" }],
        expectation: JSON.stringify({ body_contains: "__typename" }),
        interval: 120,
        timeout: 15,
      },
      {
        name: "API SSL Certificate",
        type: "SSL",
        url: "https://api.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "docker-host",
    name: "The Docker Host",
    description:
      "Monitor your Docker infrastructure — host reachability, container port availability, registry access, and resource health.",
    tagline: "Keep your containers containerized and online",
    icon: "Container",
    difficulty: "advanced",
    techStack: ["Docker", "Linux", "Portainer", "Nginx"],
    monitors: [
      {
        name: "Host Reachability (Ping)",
        type: "PING",
        url: "192.168.1.100",
        interval: 60,
        timeout: 10,
      },
      {
        name: "SSH Port",
        type: "PORT",
        url: "192.168.1.100",
        port: 22,
        interval: 300,
        timeout: 10,
      },
      {
        name: "Docker Registry",
        type: "HTTP",
        url: "https://registry.example.com/v2/_catalog",
        method: "GET",
        interval: 300,
        timeout: 15,
      },
      {
        name: "Portainer Dashboard",
        type: "HTTP",
        url: "https://portainer.example.com",
        method: "GET",
        interval: 120,
        timeout: 10,
      },
    ],
  },
  {
    id: "jamstack",
    name: "Static Site (JAMStack)",
    description:
      "Essential monitoring for a static site — page availability, SSL health, DNS propagation, and CDN edge cache checks.",
    tagline: "Your static site, statically reliable",
    icon: "FileText",
    difficulty: "beginner",
    techStack: ["Next.js SSG", "Gatsby", "Vercel", "Netlify", "Cloudflare"],
    monitors: [
      {
        name: "Homepage Availability",
        type: "HTTP",
        url: "https://yoursite.com",
        method: "GET",
        expectation: JSON.stringify({ body_contains: "<html" }),
        interval: 300,
        timeout: 10,
      },
      {
        name: "SSL Certificate",
        type: "SSL",
        url: "https://yoursite.com",
        interval: 3600,
        timeout: 10,
      },
      {
        name: "DNS Propagation",
        type: "DNS",
        url: "yoursite.com",
        expectation: JSON.stringify({ expectedIPs: [] }),
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "saas-dashboard",
    name: "The SaaS Dashboard",
    description:
      "End-to-end monitoring for a SaaS application — login sequence, key dashboard pages, billing API, and critical user flows.",
    tagline: "Your SaaS, always operational",
    icon: "LayoutDashboard",
    difficulty: "advanced",
    techStack: ["React", "Node.js", "Stripe", "Auth0", "PostgreSQL"],
    monitors: [
      {
        name: "Login Page",
        type: "HTTP",
        url: "https://app.example.com/login",
        method: "GET",
        expectation: JSON.stringify({ body_contains: "password" }),
        interval: 120,
        timeout: 10,
      },
      {
        name: "Billing API Health",
        type: "HTTP",
        url: "https://api.example.com/billing/health",
        method: "GET",
        expectation: JSON.stringify({
          json_assertions: [{ path: "status", operator: "==", value: "up" }],
        }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "Database Connectivity",
        type: "PORT",
        url: "db.example.com",
        port: 5432,
        interval: 300,
        timeout: 10,
      },
      {
        name: "SSL Certificate",
        type: "SSL",
        url: "https://app.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "fullstack-node",
    name: "The Full-Stack Node App",
    description:
      "Complete monitoring for a Node.js application — frontend health, API endpoints, WebSocket stream, database port, and background job heartbeat.",
    tagline: "Node.js monitoring, zero config",
    icon: "Server",
    difficulty: "intermediate",
    techStack: ["Node.js", "Express", "Socket.io", "MongoDB", "Redis"],
    monitors: [
      {
        name: "Frontend Availability",
        type: "HTTP",
        url: "https://app.example.com",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "API Health",
        type: "HTTP",
        url: "https://api.example.com/health",
        method: "GET",
        expectation: JSON.stringify({
          json_assertions: [{ path: "uptime", operator: "==", value: "ok" }],
        }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "MongoDB Port",
        type: "PORT",
        url: "mongo.example.com",
        port: 27017,
        interval: 300,
        timeout: 10,
      },
      {
        name: "Redis Port",
        type: "PORT",
        url: "redis.example.com",
        port: 6379,
        interval: 300,
        timeout: 10,
      },
      {
        name: "Background Job Heartbeat",
        type: "HEARTBEAT",
        url: "heartbeat://placeholder",
        interval: 300,
        timeout: 10,
      },
    ],
  },
  {
    id: "ai-llm",
    name: "The AI & LLM Stack",
    description:
      "Monitor your AI infrastructure — LLM API gateway, vector database, agent runner, and model inference latency.",
    tagline: "Watch your AI agents, model gateways & vector DBs",
    icon: "Cpu",
    difficulty: "intermediate",
    techStack: ["OpenAI", "Anthropic", "LangChain", "Vector DB", "vLLM"],
    monitors: [
      {
        name: "LLM Gateway Models Endpoint",
        type: "HTTP",
        url: "https://api.openai.com/v1/models",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "Vector Database Port",
        type: "PORT",
        url: "vector.example.com",
        port: 6333,
        interval: 300,
        timeout: 10,
      },
      {
        name: "AI Agent Runner Health",
        type: "HTTP",
        url: "https://agent.example.com/health",
        method: "GET",
        expectation: JSON.stringify({
          json_assertions: [{ path: "status", operator: "==", value: "ready" }],
        }),
        interval: 60,
        timeout: 15,
      },
      {
        name: "Inference API SSL Certificate",
        type: "SSL",
        url: "https://agent.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "kubernetes-k8s",
    name: "The Kubernetes Cluster",
    description:
      "Cluster control plane & ingress monitoring — API server, ingress controller, Kubelet metrics, and SSL cert renewal.",
    tagline: "Control plane, ingress & K8s cluster telemetry",
    icon: "Boxes",
    difficulty: "advanced",
    techStack: ["Kubernetes", "Helm", "Ingress-Nginx", "Prometheus", "Cert-Manager"],
    monitors: [
      {
        name: "K8s API Server Health",
        type: "HTTP",
        url: "https://k8s.example.com/healthz",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "Ingress Controller Route",
        type: "HTTP",
        url: "https://ingress.example.com",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "Kubelet Metrics Port",
        type: "PORT",
        url: "node-1.k8s.example.com",
        port: 10250,
        interval: 300,
        timeout: 10,
      },
      {
        name: "Cluster SSL Certificate",
        type: "SSL",
        url: "https://ingress.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "firebase-gcp",
    name: "The Firebase & GCP Stack",
    description:
      "Observability for Firebase and Google Cloud apps — Cloud Run services, Firestore REST API, Auth, and Storage CDN.",
    tagline: "Full observability for Firebase & Google Cloud",
    icon: "Cloud",
    difficulty: "beginner",
    techStack: ["Firebase", "Cloud Run", "Firestore", "GCP"],
    monitors: [
      {
        name: "Cloud Run Microservice",
        type: "HTTP",
        url: "https://service-run.a.run.app/health",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "Firestore REST API",
        type: "HTTP",
        url: "https://firestore.googleapis.com/v1/projects/demo/databases",
        method: "GET",
        interval: 300,
        timeout: 10,
      },
      {
        name: "Firebase Auth Endpoint",
        type: "HTTP",
        url: "https://identitytoolkit.googleapis.com/v1/projects",
        method: "GET",
        interval: 300,
        timeout: 10,
      },
    ],
  },
  {
    id: "microservices-mesh",
    name: "Microservices Mesh",
    description:
      "Distributed architecture monitoring — service mesh gateway, gRPC RPC port, RabbitMQ broker, and Redis cluster.",
    tagline: "Distributed architecture & service mesh telemetry",
    icon: "Network",
    difficulty: "advanced",
    techStack: ["Istio", "gRPC", "RabbitMQ", "Redis", "PostgreSQL"],
    monitors: [
      {
        name: "Service Mesh Gateway",
        type: "HTTP",
        url: "https://gateway.internal.example.com/health",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "gRPC Core Service Port",
        type: "PORT",
        url: "grpc.example.com",
        port: 50051,
        interval: 120,
        timeout: 10,
      },
      {
        name: "RabbitMQ AMQP Port",
        type: "PORT",
        url: "mq.example.com",
        port: 5672,
        interval: 300,
        timeout: 10,
      },
      {
        name: "Redis Cache Port",
        type: "PORT",
        url: "redis.example.com",
        port: 6379,
        interval: 300,
        timeout: 10,
      },
    ],
  },
  {
    id: "mobile-backend",
    name: "The Mobile App Backend",
    description:
      "Telemetry for mobile apps — API gateway, push notification service, OAuth token refresh, and static asset CDN.",
    tagline: "End-to-end telemetry for iOS & Android backends",
    icon: "Smartphone",
    difficulty: "intermediate",
    techStack: ["Expo", "React Native", "APNs", "FCM", "GraphQL"],
    monitors: [
      {
        name: "Mobile API Gateway",
        type: "HTTP",
        url: "https://api.mobile.example.com/v1/ping",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "Push Notification Relay",
        type: "HTTP",
        url: "https://push.mobile.example.com/health",
        method: "GET",
        interval: 120,
        timeout: 10,
      },
      {
        name: "OAuth Auth Token Endpoint",
        type: "HTTP",
        url: "https://api.mobile.example.com/oauth/token",
        method: "POST",
        body: JSON.stringify({ grant_type: "refresh_token" }),
        interval: 300,
        timeout: 15,
      },
      {
        name: "Mobile API SSL Certificate",
        type: "SSL",
        url: "https://api.mobile.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "web3-crypto",
    name: "Web3 & Crypto Node",
    description:
      "Blockchain infrastructure — RPC node health (`eth_blockNumber`), GraphQL subgraph indexer, and dApp frontend.",
    tagline: "Blockchain RPC node, indexer & dApp frontend monitoring",
    icon: "Coins",
    difficulty: "advanced",
    techStack: ["Ethereum", "Solana", "RPC", "Alchemy", "IPFS"],
    monitors: [
      {
        name: "Ethereum RPC Node",
        type: "HTTP",
        url: "https://eth-mainnet.alchemyapi.io/v2/demo",
        method: "POST",
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
        headers: [{ key: "Content-Type", value: "application/json" }],
        expectation: JSON.stringify({ body_contains: "jsonrpc" }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "Subgraph Indexer Endpoint",
        type: "HTTP",
        url: "https://api.thegraph.com/subgraphs/name/example",
        method: "POST",
        body: JSON.stringify({ query: "{ _meta { block { number } } }" }),
        headers: [{ key: "Content-Type", value: "application/json" }],
        interval: 120,
        timeout: 15,
      },
      {
        name: "dApp Gateway (IPFS)",
        type: "HTTP",
        url: "https://dapp.example.com",
        method: "GET",
        interval: 120,
        timeout: 10,
      },
      {
        name: "RPC Node SSL Certificate",
        type: "SSL",
        url: "https://eth-mainnet.alchemyapi.io",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "wordpress-agency-care",
    name: "WordPress Care Plan Fleet",
    description:
      "Essential multi-point monitoring for client WordPress sites — homepage rendering, WP REST API health, wp-cron heartbeat, and SSL certificate validity.",
    tagline: "Turn $50/mo WP maintenance into high-value SLA retainers",
    icon: "Layers",
    difficulty: "beginner",
    techStack: ["WordPress", "PHP", "MySQL", "WooCommerce", "Nginx"],
    monitors: [
      {
        name: "WordPress Homepage Availability",
        type: "HTTP",
        url: "https://example.com",
        method: "GET",
        expectation: JSON.stringify({ body_contains: "wp-content" }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "WordPress REST API Health",
        type: "HTTP",
        url: "https://example.com/wp-json/",
        method: "GET",
        expectation: JSON.stringify({
          json_assertions: [{ path: "name", operator: "is_not_empty", value: "" }],
        }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "WP-Cron Execution Heartbeat",
        type: "HTTP",
        url: "https://example.com/wp-cron.php?doing_wp_cron",
        method: "GET",
        interval: 300,
        timeout: 15,
      },
      {
        name: "WordPress SSL Certificate Expiry",
        type: "SSL",
        url: "https://example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "ecommerce-client-store",
    name: "E-Commerce & Shopify Client Store",
    description:
      "High-frequency checkout protection for WooCommerce, Shopify, and custom e-commerce stores. Checks storefront availability, dynamic cart endpoints, and payment webhook receivers.",
    tagline: "Zero downtime during flash sales and checkout peaks",
    icon: "ShoppingCart",
    difficulty: "intermediate",
    techStack: ["Shopify", "WooCommerce", "Stripe", "Next.js", "Redis"],
    monitors: [
      {
        name: "E-Commerce Storefront Availability",
        type: "HTTP",
        url: "https://store.example.com",
        method: "GET",
        interval: 60,
        timeout: 10,
      },
      {
        name: "Dynamic Cart / Checkout Endpoint",
        type: "HTTP",
        url: "https://store.example.com/cart",
        method: "GET",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
        interval: 60,
        timeout: 10,
      },
      {
        name: "Payment Webhook Receiver",
        type: "HTTP",
        url: "https://store.example.com/api/webhooks/stripe",
        method: "POST",
        headers: [{ key: "Content-Type", value: "application/json" }],
        interval: 120,
        timeout: 10,
      },
      {
        name: "Store SSL Certificate",
        type: "SSL",
        url: "https://store.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
  {
    id: "agency-marketing-funnel",
    name: "Agency Marketing Funnel & Lead Capture",
    description:
      "Guarantee client ad spend isn't wasted on broken landing pages or failing lead-capture forms. Monitors landing page keywords, form submission endpoints, DNS resolution, and SSL.",
    tagline: "Protect client ad budget and lead capture pipelines",
    icon: "Target",
    difficulty: "beginner",
    techStack: ["HubSpot", "Zapier", "Webflow", "WordPress", "Cloudflare"],
    monitors: [
      {
        name: "Landing Page DOM & Keyword Check",
        type: "HTTP",
        url: "https://funnel.example.com",
        method: "GET",
        expectation: JSON.stringify({ body_contains: "form" }),
        interval: 60,
        timeout: 10,
      },
      {
        name: "Lead Capture Form Webhook",
        type: "HTTP",
        url: "https://funnel.example.com/api/leads/health",
        method: "GET",
        interval: 120,
        timeout: 10,
      },
      {
        name: "Primary Domain DNS Health",
        type: "DNS",
        url: "funnel.example.com",
        interval: 300,
        timeout: 10,
      },
      {
        name: "Funnel SSL Certificate",
        type: "SSL",
        url: "https://funnel.example.com",
        interval: 3600,
        timeout: 10,
      },
    ],
  },
];

export function getTemplateById(id: string): StackTemplate | undefined {
  return stackTemplates.find((t) => t.id === id);
}

export function getTemplatesByDifficulty(difficulty: StackTemplate["difficulty"]): StackTemplate[] {
  return stackTemplates.filter((t) => t.difficulty === difficulty);
}
