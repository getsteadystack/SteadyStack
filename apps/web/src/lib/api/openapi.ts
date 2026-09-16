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
};
