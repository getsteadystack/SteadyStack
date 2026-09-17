/**
 * OpenAPI 3.1 document for the SteadyStack REST API.
 *
 * Hand-maintained against the route handlers in `src/app/api`. Served
 * interactively at /docs/api (Scalar) and as JSON at /docs/api/openapi.json.
 */
export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "SteadyStack API",
    description:
      "REST API for SteadyStack — uptime monitoring, status pages, incidents, and CI/CD gates.\n\n" +
      "## Authentication\n\n" +
      "Most endpoints under `/api/cli/*` use API keys created in the dashboard or via " +
      "`POST /api/cli/api-keys`. Send the key in the `Authorization` header:\n\n" +
      "```\nAuthorization: Bearer pg_live_<key>\n```\n\n" +
      "Keys are scoped (`read` / `write`). Write-scoped operations return 403 when the key " +
      "only has `read`. Public endpoints (badges, widgets, feeds, status pages) need no auth.",
    version: "1.0.0",
    contact: { url: "https://github.com/getsteadystack/SteadyStack" },
  },
  servers: [{ url: "/", description: "Same origin (self-hosted or steadystack.dev)" }],
  tags: [
    {
      name: "Monitors",
      description: "Monitor CRUD, instant checks, stats, and events",
    },
    { name: "API Keys", description: "Manage API keys for CLI and automation" },
    {
      name: "Status Pages",
      description: "Public status endpoints — badges, widgets, feeds",
    },
    { name: "Workspace", description: "Export and account data" },
    { name: "System", description: "Health and diagnostic endpoints" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "Liveness check",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Service is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
        },
      },
    },
    "/api/test-db": {
      get: {
        tags: ["System"],
        summary: "Database connectivity check",
        operationId: "getTestDb",
        responses: {
          "200": {
            description: "Database connection successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    userCount: { type: "number" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Database connection failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/cli/monitors": {
      get: {
        tags: ["Monitors"],
        summary: "List monitors",
        security: [{ apiKey: [] }],
        operationId: "listMonitors",
        responses: {
          "200": {
            description: "Monitors belonging to the authenticated user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["monitors"],
                  properties: {
                    monitors: {
                      type: "array",
                      items: { $ref: "#/components/schemas/MonitorSummary" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Monitors"],
        summary: "Create a monitor",
        security: [{ apiKey: ["write"] }],
        operationId: "createMonitor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MonitorCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Monitor created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    monitor: {
                      $ref: "#/components/schemas/MonitorCreated",
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/cli/monitors/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Monitor ID",
        },
      ],
      get: {
        tags: ["Monitors"],
        summary: "Get a monitor with its 10 most recent events",
        security: [{ apiKey: [] }],
        operationId: "getMonitor",
        responses: {
          "200": {
            description: "Monitor details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    monitor: { $ref: "#/components/schemas/MonitorDetail" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Monitors"],
        summary: "Update a monitor",
        security: [{ apiKey: ["write"] }],
        operationId: "updateMonitor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MonitorUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "Monitor updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    monitor: { $ref: "#/components/schemas/MonitorUpdated" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Monitors"],
        summary: "Delete a monitor",
        security: [{ apiKey: ["write"] }],
        operationId: "deleteMonitor",
        responses: {
          "200": {
            description: "Monitor deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/cli/monitors/{id}/trigger": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Monitor ID",
        },
      ],
      post: {
        tags: ["Monitors"],
        summary: "Run an instant check",
        description:
          "Forces an immediate HTTP check (only HTTP monitors) and persists the event. " +
          "Backs the `pulse trigger <id>` CLI command.",
        security: [{ apiKey: [] }],
        operationId: "triggerMonitor",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: {
                    type: "string",
                    format: "uri",
                    description: "Optional URL override (requires write scope)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Check result",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TriggerResult" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
          "422": {
            description: "Monitor is not an HTTP monitor",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/cli/monitors/{id}/wait": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Monitor ID",
        },
      ],
      get: {
        tags: ["Monitors"],
        summary: "Wait until a monitor is UP",
        description:
          "CI/CD gate. Polls until the monitor status is UP or the timeout elapses. " +
          "Backs the `pulse wait <id>` CLI command.",
        security: [{ apiKey: [] }],
        operationId: "waitMonitor",
        parameters: [
          {
            name: "timeout",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 600, default: 300 },
            description: "Max seconds to wait (capped at 600)",
          },
          {
            name: "interval",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 5, default: 15 },
            description: "Poll interval in seconds (min 5)",
          },
        ],
        responses: {
          "200": {
            description: "Monitor is UP",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["success", "status"],
                  properties: {
                    success: { type: "boolean" },
                    monitorId: { type: "string" },
                    name: { type: "string" },
                    status: { type: "string", enum: ["UP"] },
                    lastCheck: {
                      type: "string",
                      format: "date-time",
                      nullable: true,
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "504": {
            description: "Monitor did not recover within the timeout window",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/cli/monitors/{id}/events": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Monitor ID",
        },
      ],
      get: {
        tags: ["Monitors"],
        summary: "List recent monitor events",
        security: [{ apiKey: [] }],
        operationId: "listMonitorEvents",
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", maximum: 500, default: 50 },
          },
          {
            name: "since",
            in: "query",
            required: false,
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          "200": {
            description: "Events, newest first",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    events: {
                      type: "array",
                      items: { $ref: "#/components/schemas/MonitorEvent" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/cli/monitors/{id}/summary": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Monitor ID",
        },
      ],
      get: {
        tags: ["Monitors"],
        summary: "Uptime and latency statistics",
        security: [{ apiKey: [] }],
        operationId: "getMonitorSummary",
        parameters: [
          {
            name: "since",
            in: "query",
            required: false,
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          "200": {
            description: "Statistics for the given window (default 24h)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MonitorSummaryStats" },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/cli/api-keys": {
      get: {
        tags: ["API Keys"],
        summary: "List API keys",
        description: "Requires a logged-in web session (session cookie).",
        operationId: "listApiKeys",
        responses: {
          "200": {
            description: "Keys (raw key values are never returned)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    keys: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ApiKey" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["API Keys"],
        summary: "Create an API key",
        description:
          "Requires a logged-in web session. The raw key is returned exactly once " +
          "(`pg_live_<48 hex>`); it is hashed server-side and never retrievable again.",
        operationId: "createApiKey",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", minLength: 1 },
                  expiresAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Key created — rawKey is shown only once",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    key: { $ref: "#/components/schemas/ApiKeyCreated" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/cli/api-keys/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Key ID",
        },
      ],
      delete: {
        tags: ["API Keys"],
        summary: "Revoke an API key",
        description: "Requires a logged-in web session (session cookie).",
        operationId: "deleteApiKey",
        responses: {
          "200": {
            description: "Key revoked",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/badge/{slug}": {
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Status page slug",
        },
      ],
      get: {
        tags: ["Status Pages"],
        summary: "Uptime badge (SVG)",
        description: "Public shields.io-style badge. The `.svg` suffix is optional.",
        operationId: "getBadge",
        responses: {
          "200": {
            description: "SVG badge",
            content: {
              "image/svg+xml": { schema: { type: "string", format: "binary" } },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/widget/{slug}": {
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Status page slug",
        },
      ],
      get: {
        tags: ["Status Pages"],
        summary: "Status page widget data",
        operationId: "getWidget",
        responses: {
          "200": {
            description: "Widget payload",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/widget/{slug}/status": {
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Status page slug",
        },
      ],
      get: {
        tags: ["Status Pages"],
        summary: "Current status for embedding",
        description:
          "Public endpoint returning the current status of a status page. CORS is enforced " +
          "based on the page's allowed widget domains.",
        operationId: "getWidgetStatus",
        responses: {
          "200": {
            description: "Current status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    slug: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["UP", "DOWN", "DEGRADED", "MAINTENANCE", "UNKNOWN"],
                    },
                    message: { type: "string" },
                  },
                  additionalProperties: true,
                },
              },
            },
          },
          "403": { description: "Origin not allowed" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/feeds/{slug}/rss": {
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Status page slug",
        },
      ],
      get: {
        tags: ["Status Pages"],
        summary: "RSS feed of incidents",
        operationId: "getRssFeed",
        responses: {
          "200": {
            description: "RSS XML document",
            content: {
              "application/xml": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/feeds/{slug}/atom": {
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Status page slug",
        },
      ],
      get: {
        tags: ["Status Pages"],
        summary: "Atom feed of incidents",
        operationId: "getAtomFeed",
        responses: {
          "200": {
            description: "Atom XML document",
            content: {
              "application/xml": {
                schema: { type: "string", format: "binary" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/workspace/export": {
      get: {
        tags: ["Workspace"],
        summary: "Export all workspace data",
        description:
          "Downloads monitors (with alert rules), status pages, incidents, and alert channels " +
          "as JSON or YAML. Requires a logged-in web session.",
        operationId: "exportWorkspace",
        parameters: [
          {
            name: "format",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["json", "yaml"], default: "json" },
          },
        ],
        responses: {
          "200": {
            description: "Exported data",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
              "application/x-yaml": { schema: { type: "string" } },
            },
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      apiKey: {
        type: "http",
        scheme: "bearer",
        description:
          "API key (`pg_live_...`) created in the dashboard or via POST /api/cli/api-keys",
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid credentials",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      Forbidden: {
        description: "The key lacks the required scope (write)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      BadRequest: {
        description: "Invalid request body or parameters",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string" } },
      },
      Health: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["ok"] } },
      },
      MonitorSummary: {
        type: "object",
        required: ["id", "name", "url", "type", "status"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          url: { type: "string" },
          type: {
            type: "string",
            enum: [
              "HTTP",
              "TCP",
              "DNS",
              "SSL",
              "HEARTBEAT",
              "SEQUENCE",
              "BGP",
              "GRPC",
              "SMTP",
              "FTP",
              "ICMP",
              "MAIL",
            ],
          },
          status: { type: "string", enum: ["UP", "DOWN", "PAUSED", "UNKNOWN"] },
          interval: { type: "integer" },
          timeout: { type: "integer" },
          method: { type: "string" },
          alertThreshold: { type: "integer" },
          checkRegions: { type: "string", nullable: true },
          lastCheck: { type: "string", format: "date-time", nullable: true },
          nextCheck: { type: "string", format: "date-time", nullable: true },
        },
      },
      MonitorCreate: {
        type: "object",
        required: ["name", "url"],
        properties: {
          name: { type: "string", description: "Monitor name" },
          url: { type: "string", format: "uri", description: "Target URL" },
          type: { type: "string", enum: ["HTTP"], default: "HTTP" },
          interval: {
            type: "integer",
            default: 60,
            description: "Check interval in seconds",
          },
          timeout: {
            type: "integer",
            default: 10,
            description: "Timeout in seconds",
          },
          method: {
            type: "string",
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
            default: "GET",
          },
          headers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: { type: "string" },
              },
            },
          },
          body: {
            type: "string",
            description: "Request body for POST/PUT/PATCH",
          },
          expectation: { type: "object", additionalProperties: true },
          alertThreshold: {
            type: "integer",
            default: 1,
            description: "Failures before alerting",
          },
          checkRegions: { type: "array", items: { type: "string" } },
          runbookUrl: { type: "string", format: "uri" },
        },
      },
      MonitorCreated: {
        type: "object",
        required: ["id", "name", "url", "type", "status", "createdAt"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          url: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      MonitorDetail: {
        type: "object",
        allOf: [
          { $ref: "#/components/schemas/MonitorSummary" },
          {
            type: "object",
            properties: {
              headers: { type: "string", nullable: true },
              body: { type: "string", nullable: true },
              expectation: { type: "string", nullable: true },
              runbookUrl: { type: "string", nullable: true },
              createdAt: { type: "string", format: "date-time" },
              events: {
                type: "array",
                items: { $ref: "#/components/schemas/MonitorEvent" },
                description: "10 most recent events",
              },
            },
          },
        ],
      },
      MonitorUpdate: {
        type: "object",
        description: "All properties optional — only provided fields are updated",
        properties: {
          name: { type: "string" },
          url: { type: "string", format: "uri" },
          interval: { type: "integer" },
          timeout: { type: "integer" },
          method: { type: "string" },
          alertThreshold: { type: "integer" },
          runbookUrl: { type: "string" },
          headers: { type: "array", items: { type: "object" } },
          expectation: { type: "object" },
          checkRegions: { type: "array", items: { type: "string" } },
        },
      },
      MonitorUpdated: {
        type: "object",
        required: ["id", "name", "url", "type", "status", "updatedAt"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          url: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      MonitorEvent: {
        type: "object",
        required: ["id", "status", "timestamp"],
        properties: {
          id: { type: "string" },
          status: { type: "string", enum: ["UP", "DOWN"] },
          latency: { type: "integer", description: "Milliseconds" },
          errorReason: { type: "string", nullable: true },
          timestamp: { type: "string", format: "date-time" },
          region: { type: "string" },
        },
      },
      MonitorSummaryStats: {
        type: "object",
        required: ["monitorId", "name", "url", "since", "stats"],
        properties: {
          monitorId: { type: "string" },
          name: { type: "string" },
          url: { type: "string" },
          since: { type: "string", format: "date-time" },
          stats: {
            type: "object",
            required: ["uptimePct", "avgLatency", "checksTotal", "checksUp", "checksDown"],
            properties: {
              uptimePct: { type: "number" },
              avgLatency: { type: "integer" },
              p50Latency: { type: "integer" },
              p95Latency: { type: "integer" },
              p99Latency: { type: "integer" },
              checksTotal: { type: "integer" },
              checksUp: { type: "integer" },
              checksDown: { type: "integer" },
            },
          },
        },
      },
      TriggerResult: {
        type: "object",
        required: ["monitorId", "name", "url", "status", "checkedAt"],
        properties: {
          monitorId: { type: "string" },
          name: { type: "string" },
          url: { type: "string" },
          status: { type: "string", enum: ["UP", "DOWN"] },
          latency: { type: "integer", description: "Milliseconds" },
          httpStatus: { type: "integer", nullable: true },
          errorReason: {
            type: "string",
            nullable: true,
            enum: ["HTTP_*", "TIMEOUT", "DNS_ERROR", "CONNECTION_REFUSED", "UNKNOWN_ERROR"],
          },
          checkedAt: { type: "string", format: "date-time" },
        },
      },
      ApiKey: {
        type: "object",
        required: ["id", "name", "prefix", "scopes"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          prefix: {
            type: "string",
            description: "First 15 chars of the key for identification",
          },
          scopes: { type: "string" },
          expiresAt: { type: "string", format: "date-time", nullable: true },
          lastUsedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ApiKeyCreated: {
        type: "object",
        allOf: [
          { $ref: "#/components/schemas/ApiKey" },
          {
            type: "object",
            required: ["rawKey"],
            properties: {
              rawKey: {
                type: "string",
                description: "Returned exactly once — store it securely",
              },
            },
          },
        ],
      },
    },
  },
} as const;

/**
 * REST API v1 fragment — the `/api/v1/*` surface documented in
 * /docs/api-reference. Key-authenticated (bearer pg_live_…) and independent
 * of the session-cookie tRPC/CLI surface above.
 */
const v1Paths = {
  "/api/v1/monitors": {
    get: {
      tags: ["Monitors v1"],
      summary: "List monitors",
      description:
        "Returns monitors for the key's owner. Query params: `tag` (exact match), `status` (UP, DOWN, DEGRADED, PAUSED, MAINTENANCE).",
      security: [{ apiKey: [] }],
      operationId: "v1ListMonitors",
      parameters: [
        { name: "tag", in: "query", schema: { type: "string" } },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["UP", "DOWN", "DEGRADED", "PAUSED", "MAINTENANCE"],
          },
        },
      ],
      responses: {
        "200": {
          description: "Monitor list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data", "count"],
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/V1Monitor" },
                  },
                  count: { type: "integer" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      tags: ["Monitors v1"],
      summary: "Create a monitor",
      description:
        "Defaults: type=HTTP, interval=60, method=GET, alertThreshold=1. Automatically attaches a default STATUS_CHANGE→DOWN alert rule. 403 on plan quota/feature limits.",
      security: [{ apiKey: ["write"] }],
      operationId: "v1CreateMonitor",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/V1MonitorCreate" },
          },
        },
      },
      responses: {
        "201": {
          description: "Monitor created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1Monitor" },
                },
              },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/api/v1/monitors/{id}": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Monitor ID",
      },
    ],
    get: {
      tags: ["Monitors v1"],
      summary: "Get a monitor (with alert rules and channels)",
      security: [{ apiKey: [] }],
      operationId: "v1GetMonitor",
      responses: {
        "200": {
          description: "Monitor details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1Monitor" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Monitors v1"],
      summary: "Update a monitor (partial)",
      description:
        "Only provided fields change. Changing interval/type/checkRegions re-runs plan limits.",
      security: [{ apiKey: ["write"] }],
      operationId: "v1UpdateMonitor",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/V1MonitorUpdate" },
          },
        },
      },
      responses: {
        "200": {
          description: "Monitor updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1Monitor" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Monitors v1"],
      summary: "Delete a monitor",
      description: "Cascades to events, alert rules, and status-page placements. Cannot be undone.",
      security: [{ apiKey: ["write"] }],
      operationId: "v1DeleteMonitor",
      responses: {
        "200": {
          description: "Deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/v1/alert-channels": {
    get: {
      tags: ["Alerting v1"],
      summary: "List notification channels",
      security: [{ apiKey: [] }],
      operationId: "v1ListAlertChannels",
      responses: {
        "200": {
          description: "Channel list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data", "count"],
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/V1AlertChannel" },
                  },
                  count: { type: "integer" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      tags: ["Alerting v1"],
      summary: "Create a notification channel",
      description:
        "`config` shape depends on `type`: EMAIL → {email}, SLACK/DISCORD/WEBHOOK → {webhookUrl}, TELEGRAM → {botToken, chatId}, PAGERDUTY → {routingKey}, OPSGENIE → {apiKey, region}.",
      security: [{ apiKey: ["write"] }],
      operationId: "v1CreateAlertChannel",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/V1AlertChannelCreate" },
          },
        },
      },
      responses: {
        "201": {
          description: "Channel created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1AlertChannel" },
                },
              },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
      },
    },
  },
  "/api/v1/alert-channels/{id}": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Channel ID",
      },
    ],
    get: {
      tags: ["Alerting v1"],
      summary: "Get a notification channel",
      security: [{ apiKey: [] }],
      operationId: "v1GetAlertChannel",
      responses: {
        "200": {
          description: "Channel details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1AlertChannel" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Alerting v1"],
      summary: "Update a channel (name, full config replace)",
      security: [{ apiKey: ["write"] }],
      operationId: "v1UpdateAlertChannel",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                config: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Channel updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1AlertChannel" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Alerting v1"],
      summary: "Delete a channel",
      description: "Detaches the channel from any alert rules referencing it.",
      security: [{ apiKey: ["write"] }],
      operationId: "v1DeleteAlertChannel",
      responses: {
        "200": {
          description: "Deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/v1/alert-rules": {
    get: {
      tags: ["Alerting v1"],
      summary: "List alert rules",
      security: [{ apiKey: [] }],
      operationId: "v1ListAlertRules",
      parameters: [
        { name: "monitorId", in: "query", schema: { type: "string" } },
      ],
      responses: {
        "200": {
          description: "Rule list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data", "count"],
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/V1AlertRule" },
                  },
                  count: { type: "integer" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      tags: ["Alerting v1"],
      summary: "Create an alert rule",
      description:
        "Connects a monitor's trigger condition to channels. Every channelIds entry must belong to you (400 otherwise).",
      security: [{ apiKey: ["write"] }],
      operationId: "v1CreateAlertRule",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/V1AlertRuleCreate" },
          },
        },
      },
      responses: {
        "201": {
          description: "Rule created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1AlertRule" },
                },
              },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/v1/alert-rules/{id}": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Rule ID",
      },
    ],
    get: {
      tags: ["Alerting v1"],
      summary: "Get an alert rule",
      security: [{ apiKey: [] }],
      operationId: "v1GetAlertRule",
      responses: {
        "200": {
          description: "Rule details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1AlertRule" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Alerting v1"],
      summary: "Update a rule (channelIds is a full replacement)",
      security: [{ apiKey: ["write"] }],
      operationId: "v1UpdateAlertRule",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/V1AlertRuleCreate" },
          },
        },
      },
      responses: {
        "200": {
          description: "Rule updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1AlertRule" },
                },
              },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    delete: {
      tags: ["Alerting v1"],
      summary: "Delete an alert rule",
      security: [{ apiKey: ["write"] }],
      operationId: "v1DeleteAlertRule",
      responses: {
        "200": {
          description: "Deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/v1/status-pages": {
    get: {
      tags: ["Status Pages v1"],
      summary: "List hosted status pages (with monitor placements)",
      security: [{ apiKey: [] }],
      operationId: "v1ListStatusPages",
      responses: {
        "200": {
          description: "Status page list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data", "count"],
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/V1StatusPage" },
                  },
                  count: { type: "integer" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
    post: {
      tags: ["Status Pages v1"],
      summary: "Create a hosted status page",
      description:
        "Slug is normalized (lowercase, [^a-z0-9-_] → -). 409 when the slug is taken; 403 on plan limits (custom domain, password protection).",
      security: [{ apiKey: ["write"] }],
      operationId: "v1CreateStatusPage",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/V1StatusPageCreate" },
          },
        },
      },
      responses: {
        "201": {
          description: "Page created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1StatusPage" },
                },
              },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "409": {
          description: "Slug already taken",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  },
  "/api/v1/status-pages/{id}": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Status page ID",
      },
    ],
    get: {
      tags: ["Status Pages v1"],
      summary: "Get a status page",
      security: [{ apiKey: [] }],
      operationId: "v1GetStatusPage",
      responses: {
        "200": {
          description: "Page details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1StatusPage" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
    patch: {
      tags: ["Status Pages v1"],
      summary: "Update a status page",
      description:
        "Updatable: slug (re-checked for uniqueness), title, description, customDomain, isPrivate, password, theme, showUptime, showResponseTime, historyDays.",
      security: [{ apiKey: ["write"] }],
      operationId: "v1UpdateStatusPage",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/V1StatusPageCreate" },
          },
        },
      },
      responses: {
        "200": {
          description: "Page updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/V1StatusPage" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "403": { $ref: "#/components/responses/Forbidden" },
        "404": { $ref: "#/components/responses/NotFound" },
        "409": {
          description: "Slug already in use",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Status Pages v1"],
      summary: "Delete a status page",
      security: [{ apiKey: ["write"] }],
      operationId: "v1DeleteStatusPage",
      responses: {
        "200": {
          description: "Deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
      },
    },
  },
  "/api/v1/regions": {
    get: {
      tags: ["System"],
      summary: "List sovereign probe regions",
      security: [{ apiKey: [] }],
      operationId: "v1ListRegions",
      responses: {
        "200": {
          description: "Probe regions (wnam, enam, weur, eeur, apac, apac-ne, apac-se)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["data", "count"],
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["code", "name", "location", "flag"],
                      properties: {
                        code: { type: "string" },
                        name: { type: "string" },
                        location: { type: "string" },
                        flag: { type: "string" },
                      },
                    },
                  },
                  count: { type: "integer" },
                },
              },
            },
          },
        },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
  "/api/v1/probes/instant": {
    post: {
      tags: ["Monitors v1"],
      summary: "Run a one-off multi-region probe",
      description:
        "Probes a URL from multiple regions in parallel and returns a quorum verdict. SSRF-guarded: http/https only, no credentials, private/loopback/link-local targets rejected.",
      security: [{ apiKey: [] }],
      operationId: "v1InstantProbe",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["url"],
              properties: {
                url: { type: "string", format: "uri" },
                regions: {
                  type: "array",
                  items: { type: "string" },
                  default: ["wnam", "weur", "apac"],
                },
                method: { type: "string", default: "GET" },
                expectedStatus: {
                  type: "array",
                  items: { type: "integer" },
                  default: [200, 201, 204, 301, 302, 307, 308],
                },
                timeoutMs: { type: "integer", default: 8000 },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Quorum result",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    required: ["url", "status", "quorumPass", "regions", "checkedAt"],
                    properties: {
                      url: { type: "string" },
                      status: { type: "string", enum: ["UP", "DOWN"] },
                      overallLatencyMs: { type: "integer" },
                      quorumPass: { type: "boolean" },
                      quorumRatio: { type: "string" },
                      regions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            region: { type: "string" },
                            name: { type: "string" },
                            flag: { type: "string" },
                            status: { type: "string", enum: ["UP", "DOWN"] },
                            httpCode: { type: "integer" },
                            latencyMs: { type: "integer" },
                            error: { type: "string", nullable: true },
                          },
                        },
                      },
                      checkedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
      },
    },
  },
} as const;

const v1Schemas = {
  SuccessResponse: {
    type: "object",
    required: ["success"],
    properties: { success: { type: "boolean", const: true } },
  },
  V1Monitor: {
    type: "object",
    required: ["id", "name", "url", "type", "status", "interval"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      url: { type: "string" },
      type: { $ref: "#/components/schemas/MonitorTypeV1" },
      status: {
        type: "string",
        enum: ["UP", "DOWN", "DEGRADED", "PAUSED", "MAINTENANCE"],
      },
      interval: { type: "integer", description: "Seconds" },
      timeout: { type: "integer", description: "Seconds" },
      method: { type: "string" },
      headers: { type: "object", additionalProperties: true, nullable: true },
      body: { type: "string", nullable: true },
      expectation: { type: "object", additionalProperties: true, nullable: true },
      tags: { type: "array", items: { type: "string" } },
      checkRegions: {
        type: "array",
        items: { type: "string" },
        nullable: true,
      },
      alertThreshold: { type: "integer" },
      runbookUrl: { type: "string", nullable: true },
      lastCheck: { type: "string", format: "date-time", nullable: true },
      nextCheck: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  V1MonitorCreate: {
    type: "object",
    required: ["name", "url"],
    properties: {
      name: { type: "string" },
      url: { type: "string" },
      type: { $ref: "#/components/schemas/MonitorTypeV1" },
      interval: { type: "integer", default: 60, description: "Seconds" },
      method: { type: "string", default: "GET" },
      headers: { type: "object", additionalProperties: true },
      body: { type: "string" },
      expectation: { type: "object", additionalProperties: true },
      tags: { type: "array", items: { type: "string" } },
      checkRegions: { type: "array", items: { type: "string" } },
      alertThreshold: { type: "integer", default: 1 },
      runbookUrl: { type: "string" },
    },
  },
  V1MonitorUpdate: {
    type: "object",
    description: "All properties optional — only provided fields change",
    properties: {
      name: { type: "string" },
      url: { type: "string" },
      type: { $ref: "#/components/schemas/MonitorTypeV1" },
      interval: { type: "integer" },
      method: { type: "string" },
      headers: { type: "object", additionalProperties: true, nullable: true },
      body: { type: "string", nullable: true },
      expectation: { type: "object", additionalProperties: true, nullable: true },
      tags: { type: "array", items: { type: "string" } },
      checkRegions: {
        type: "array",
        items: { type: "string" },
        nullable: true,
      },
      alertThreshold: { type: "integer" },
      runbookUrl: { type: "string", nullable: true },
    },
  },
  V1AlertChannel: {
    type: "object",
    required: ["id", "name", "type"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      type: { $ref: "#/components/schemas/NotificationTypeV1" },
      config: { type: "object", additionalProperties: true },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  V1AlertChannelCreate: {
    type: "object",
    required: ["name", "type", "config"],
    properties: {
      name: { type: "string" },
      type: { $ref: "#/components/schemas/NotificationTypeV1" },
      config: { type: "object", additionalProperties: true },
    },
  },
  V1AlertRule: {
    type: "object",
    required: ["id", "monitorId", "trigger", "enabled"],
    properties: {
      id: { type: "string" },
      monitorId: { type: "string" },
      trigger: {
        type: "string",
        enum: ["STATUS_CHANGE", "LATENCY", "SSL_EXPIRY", "DNS_WATCHDOG", "DOMAIN_EXPIRY"],
      },
      threshold: { type: "integer", nullable: true },
      comparison: { type: "string", enum: ["GT", "LT"], nullable: true },
      targetStatus: { type: "string", nullable: true },
      enabled: { type: "boolean" },
      channels: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: { type: "string" },
          },
        },
      },
    },
  },
  V1AlertRuleCreate: {
    type: "object",
    properties: {
      monitorId: { type: "string" },
      trigger: {
        type: "string",
        enum: ["STATUS_CHANGE", "LATENCY", "SSL_EXPIRY", "DNS_WATCHDOG", "DOMAIN_EXPIRY"],
        default: "STATUS_CHANGE",
      },
      threshold: { type: "integer", nullable: true },
      comparison: { type: "string", enum: ["GT", "LT"], nullable: true },
      targetStatus: { type: "string", default: "DOWN", nullable: true },
      enabled: { type: "boolean", default: true },
      channelIds: { type: "array", items: { type: "string" } },
    },
  },
  V1StatusPage: {
    type: "object",
    required: ["id", "slug", "title"],
    properties: {
      id: { type: "string" },
      slug: { type: "string" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      customDomain: { type: "string", nullable: true },
      isPrivate: { type: "boolean" },
      historyDays: { type: "integer" },
      showUptime: { type: "boolean" },
      showResponseTime: { type: "boolean" },
      monitors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            monitorId: { type: "string" },
            displayName: { type: "string" },
            sortOrder: { type: "integer" },
          },
        },
      },
      createdAt: { type: "string", format: "date-time" },
    },
  },
  V1StatusPageCreate: {
    type: "object",
    properties: {
      slug: { type: "string" },
      title: { type: "string" },
      description: { type: "string" },
      customDomain: { type: "string" },
      isPrivate: { type: "boolean", default: false },
      password: { type: "string" },
      theme: { type: "object", additionalProperties: true, nullable: true },
      showUptime: { type: "boolean", default: true },
      showResponseTime: { type: "boolean", default: true },
      historyDays: { type: "integer", default: 90 },
    },
  },
  MonitorTypeV1: {
    type: "string",
    description: "Monitor type (schema.prisma MonitorType enum)",
  },
  NotificationTypeV1: {
    type: "string",
    enum: ["EMAIL", "DISCORD", "SLACK", "WEBHOOK", "TELEGRAM", "SMS", "PAGERDUTY", "OPSGENIE"],
  },
} as const;

/**
 * Full document served at /docs/api/openapi.json: hand-maintained REST/CLI
 * surface + REST v1 fragment + generated tRPC section (merged at import time).
 */
export function buildOpenApiSpec(trpcFragment?: {
  paths: Record<string, unknown>;
}) {
  return {
    ...openApiSpec,
    tags: [
      ...openApiSpec.tags,
      { name: "Monitors v1", description: "REST API v1 — monitor CRUD and instant probes" },
      { name: "Alerting v1", description: "REST API v1 — notification channels and alert rules" },
      { name: "Status Pages v1", description: "REST API v1 — hosted status pages" },
      {
        name: "tRPC",
        description:
          "Internal dashboard RPC (POST /api/trpc/{procedure}). Session-cookie authenticated; prefer the REST v1 surface for automation.",
      },
    ],
    paths: {
      ...openApiSpec.paths,
      ...v1Paths,
      ...(trpcFragment ? trpcFragment.paths : undefined),
    },
    components: {
      ...openApiSpec.components,
      securitySchemes: {
        ...openApiSpec.components.securitySchemes,
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description: "Web session cookie — used by the dashboard tRPC surface only",
        },
      },
      schemas: {
        ...openApiSpec.components.schemas,
        ...v1Schemas,
      },
    },
  };
}
