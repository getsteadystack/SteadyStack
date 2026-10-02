import * as React from "react";
import { emailTheme } from "./styles/theme";
import { t, type EmailLocale } from "./i18n";

export interface BaseProps {
  children?: React.ReactNode;
  style?: React.CSSProperties | undefined;
  className?: string | undefined;
}

export function Html({
  children,
  lang = "en",
  dir = "ltr",
}: BaseProps & { lang?: string; dir?: string }) {
  return (
    <html lang={lang} dir={dir}>
      {children}
    </html>
  );
}

export function Head({ children }: BaseProps) {
  return (
    <head>
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {children}
    </head>
  );
}

export function Body({ children, style }: BaseProps) {
  return (
    <body
      style={{
        margin: 0,
        padding: 0,
        WebkitFontSmoothing: "antialiased",
        ...style,
      }}
    >
      {children}
    </body>
  );
}

export function Container({ children, style }: BaseProps) {
  return (
    <table
      align="center"
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      style={{
        maxWidth: "600px",
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        ...style,
      }}
    >
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function Section({ children, style }: BaseProps) {
  return (
    <table
      width="100%"
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      style={{
        width: "100%",
        ...style,
      }}
    >
      <tbody>
        <tr>
          <td>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function Text({ children, style }: BaseProps) {
  return (
    <p
      style={{
        margin: "0 0 16px",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function Link({
  children,
  href,
  style,
  target = "_blank",
}: BaseProps & { href?: string | undefined; target?: string | undefined }) {
  return (
    <a
      href={href}
      target={target}
      rel="noreferrer"
      style={{
        textDecoration: "none",
        ...style,
      }}
    >
      {children}
    </a>
  );
}

export function Hr({ style }: Omit<BaseProps, "children">) {
  return (
    <hr
      style={{
        width: "100%",
        border: "none",
        borderTop: "1px solid #27272a",
        margin: "24px 0",
        ...style,
      }}
    />
  );
}

// ─── Modern SaaS Email Components ────────────────────────────────────────────

export function EmailHeader({
  badge,
  badgeColor = emailTheme.colors.primary,
}: {
  badge?: string;
  badgeColor?: string;
  /** Reserved for localized header chrome; accepted for API stability. */
  locale?: EmailLocale;
}) {
  return (
    <Section
      style={{
        padding: "24px 32px 20px",
        borderBottom: "1px solid #27272a",
      }}
    >
      <table width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            <td align="left" style={{ verticalAlign: "middle" }}>
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                {/* Modern Brand Logo */}
                <div
                  style={{
                    display: "inline-block",
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    backgroundColor: "#10b981",
                    textAlign: "center",
                    lineHeight: "28px",
                    marginRight: "10px",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      color: "#09090b",
                      fontWeight: "900",
                      fontSize: "15px",
                      fontFamily: emailTheme.fonts.sans,
                      display: "inline-block",
                      marginTop: "-1px",
                    }}
                  >
                    ⚡
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: emailTheme.fonts.sans,
                    fontSize: "17px",
                    fontWeight: "700",
                    letterSpacing: "-0.3px",
                    color: "#f4f4f5",
                    verticalAlign: "middle",
                  }}
                >
                  Steady<span style={{ color: "#10b981" }}>Stack</span>
                </span>
              </div>
            </td>
            {badge && (
              <td align="right" style={{ verticalAlign: "middle" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: emailTheme.fonts.mono,
                    fontSize: "11px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "3px 8px",
                    borderRadius: "9999px",
                    color: badgeColor,
                    backgroundColor: `${badgeColor}18`,
                    border: `1px solid ${badgeColor}33`,
                  }}
                >
                  {badge}
                </span>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

export function EmailFooter({
  customMessage,
  unsubscribeUrl,
  locale = "en",
}: {
  customMessage?: string;
  unsubscribeUrl?: string;
  locale?: EmailLocale;
}) {
  const tr = (key: string) => t(locale, key);
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "https://steadystack.dev"
  ).replace(/\/+$/, "");

  const dashboardUrl = `${baseUrl}/dashboard`;
  const statusUrl = `${baseUrl}/status-page/steadystack`;
  const docsUrl = `${baseUrl}/docs`;
  const prefUrl = unsubscribeUrl || `${baseUrl}/dashboard/settings?tab=notifications`;

  return (
    <Section
      style={{
        padding: "24px 32px",
        borderTop: "1px solid #1f1f23",
        backgroundColor: "#0c0c0e",
        borderBottomLeftRadius: "12px",
        borderBottomRightRadius: "12px",
      }}
    >
      {customMessage && (
        <Text
          style={{
            margin: "0 0 12px",
            fontSize: "12px",
            color: "#71717a",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {customMessage}
        </Text>
      )}
      <table width="100%" border={0} cellPadding="0" cellSpacing="0" role="presentation">
        <tbody>
          <tr>
            <td align="center">
              <div style={{ marginBottom: "12px" }}>
                <Link
                  href={dashboardUrl}
                  style={{
                    fontSize: "12px",
                    color: "#a1a1aa",
                    textDecoration: "none",
                    margin: "0 8px",
                    fontWeight: "500",
                  }}
                >
                  {tr("footer.dashboard")}
                </Link>
                <span style={{ color: "#3f3f46", fontSize: "12px" }}>•</span>
                <Link
                  href={statusUrl}
                  style={{
                    fontSize: "12px",
                    color: "#a1a1aa",
                    textDecoration: "none",
                    margin: "0 8px",
                    fontWeight: "500",
                  }}
                >
                  {tr("footer.status")}
                </Link>
                <span style={{ color: "#3f3f46", fontSize: "12px" }}>•</span>
                <Link
                  href={docsUrl}
                  style={{
                    fontSize: "12px",
                    color: "#a1a1aa",
                    textDecoration: "none",
                    margin: "0 8px",
                    fontWeight: "500",
                  }}
                >
                  {tr("footer.docs")}
                </Link>
                <span style={{ color: "#3f3f46", fontSize: "12px" }}>•</span>
                <Link
                  href={prefUrl}
                  style={{
                    fontSize: "12px",
                    color: "#71717a",
                    textDecoration: "none",
                    margin: "0 8px",
                  }}
                >
                  {tr("footer.preferences")}
                </Link>
              </div>
              <Text
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#52525b",
                  lineHeight: 1.5,
                }}
              >
                {tr("footer.tagline")}
                <br />
                {tr("footer.secured")} •{" "}
                <Link
                  href={baseUrl}
                  style={{
                    color: "#71717a",
                    textDecoration: "none",
                  }}
                >
                  steadystack.dev
                </Link>
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

export function StatusBadge({
  status,
  variant = "success",
}: {
  status: string;
  variant?: "success" | "danger" | "warning" | "info" | "neutral";
}) {
  let color: string = emailTheme.colors.primary;
  let dot = "●";

  if (variant === "danger") {
    color = emailTheme.colors.destructive;
  } else if (variant === "warning") {
    color = emailTheme.colors.warning;
  } else if (variant === "info") {
    color = emailTheme.colors.info;
  } else if (variant === "neutral") {
    color = emailTheme.colors.foregroundMuted;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "9999px",
        backgroundColor: `${color}14`,
        border: `1px solid ${color}33`,
        color: color,
        fontSize: "12px",
        fontWeight: "700",
        fontFamily: emailTheme.fonts.mono,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
      }}
    >
      <span style={{ marginRight: "6px", fontSize: "10px" }}>{dot}</span>
      {status}
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  variant = "primary",
  style,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "danger" | "secondary";
  style?: React.CSSProperties;
}) {
  let bg = "#10b981";
  let fg = "#ffffff";
  let border = "1px solid #10b981";

  if (variant === "danger") {
    bg = "#ef4444";
    fg = "#ffffff";
    border = "1px solid #ef4444";
  } else if (variant === "secondary") {
    bg = "#18181b";
    fg = "#f4f4f5";
    border = "1px solid #27272a";
  }

  return (
    <table
      border={0}
      cellPadding="0"
      cellSpacing="0"
      role="presentation"
      style={{ margin: "24px auto" }}
    >
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              borderRadius: "8px",
              backgroundColor: bg,
              border: border,
              boxShadow: variant === "primary" ? "0 4px 14px rgba(16, 185, 129, 0.25)" : "none",
            }}
          >
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                fontFamily: emailTheme.fonts.sans,
                fontSize: "14px",
                fontWeight: "600",
                color: fg,
                textDecoration: "none",
                borderRadius: "8px",
                letterSpacing: "-0.1px",
                ...style,
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ─── Standalone Lightweight HTML Renderer (No react-dom/server dependency) ───

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const UNITLESS_PROPERTIES = new Set([
  "animationIterationCount",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "floodOpacity",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
]);

function styleObjectToString(style?: React.CSSProperties): string {
  if (!style || typeof style !== "object") return "";
  const entries: string[] = [];
  for (const [key, value] of Object.entries(style)) {
    if (value === null || value === undefined || value === "") continue;
    const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    const cssVal =
      typeof value === "number" && !UNITLESS_PROPERTIES.has(key) ? `${value}px` : value;
    entries.push(`${cssKey}:${cssVal}`);
  }
  return entries.join(";");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderNode(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(renderNode).join("");
  }

  if (React.isValidElement(node)) {
    const { type, props } = node as { type: any; props: any };

    if (typeof type === "function") {
      const rendered = type(props);
      return renderNode(rendered);
    }

    if (typeof type === "string") {
      const tag = type.toLowerCase();
      const attributes: string[] = [];
      let innerHtml: string | null = null;

      if (props) {
        for (const [propName, propValue] of Object.entries(props)) {
          if (propName === "children" || propName === "key" || propName === "ref") continue;

          if (propName === "style" && propValue && typeof propValue === "object") {
            const styleStr = styleObjectToString(propValue as React.CSSProperties);
            if (styleStr) {
              attributes.push(`style="${escapeHtml(styleStr)}"`);
            }
            continue;
          }

          if (propName === "className" && propValue) {
            attributes.push(`class="${escapeHtml(String(propValue))}"`);
            continue;
          }

          if (
            propName === "dangerouslySetInnerHTML" &&
            propValue &&
            typeof propValue === "object" &&
            "__html" in (propValue as any)
          ) {
            innerHtml = String((propValue as any).__html);
            continue;
          }

          if (propName === "httpEquiv") {
            attributes.push(`http-equiv="${escapeHtml(String(propValue))}"`);
            continue;
          }

          if (typeof propValue === "boolean") {
            if (propValue) {
              attributes.push(propName.toLowerCase());
            }
            continue;
          }

          if (propValue !== null && propValue !== undefined) {
            attributes.push(`${propName.toLowerCase()}="${escapeHtml(String(propValue))}"`);
          }
        }
      }

      const attrStr = attributes.length > 0 ? ` ${attributes.join(" ")}` : "";

      if (VOID_ELEMENTS.has(tag)) {
        return `<${tag}${attrStr} />`;
      }

      if (innerHtml !== null) {
        return `<${tag}${attrStr}>${innerHtml}</${tag}>`;
      }

      const childrenStr = props && "children" in props ? renderNode(props.children) : "";
      return `<${tag}${attrStr}>${childrenStr}</${tag}>`;
    }

    if (type === React.Fragment) {
      return props && "children" in props ? renderNode(props.children) : "";
    }
  }

  return "";
}

export async function render(component: React.ReactElement): Promise<string> {
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n';
  return doctype + renderNode(component);
}
