import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";

/**
 * GET /api/widget/embed.js?slug=xxx
 *
 * Returns a JavaScript snippet that fetches status and renders a badge.
 * This is the embeddable widget script.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new NextResponse("// Error: No slug provided", {
      status: 400,
      headers: { "Content-Type": "application/javascript" },
    });
  }

  // Fetch status page to get theme configuration
  const statusPage = await prisma.statusPage.findUnique({
    where: { slug },
    select: {
      widgetEnabled: true,
      widgetTheme: true,
      widgetBadgeText: true,
    },
  });

  if (!statusPage || !statusPage.widgetEnabled) {
    return new NextResponse("// Error: Widget not enabled or page not found", {
      status: 404,
      headers: { "Content-Type": "application/javascript" },
    });
  }

  // Parse theme with defaults
  const theme =
    (statusPage.widgetTheme as {
      bgColor?: string;
      textColor?: string;
      borderRadius?: string;
    }) || {};

  const bgColor = theme.bgColor || "#1a1a2e";
  const textColor = theme.textColor || "#00ff88";
  const borderRadius = theme.borderRadius || "8px";

  // Parse badge text with defaults
  const badgeText =
    (statusPage.widgetBadgeText as {
      operational?: string;
      partial?: string;
      major?: string;
    }) || {};

  const operationalText = badgeText.operational || "All Systems Operational";
  const partialText = badgeText.partial || "Partial Outage";
  const majorText = badgeText.major || "Major Outage";

  // Get the base URL for API calls
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "";

  // Generate the embeddable JavaScript
  const script = `
(function() {
  'use strict';
  
  var SteadyStack = window.SteadyStack || {};
  var config = SteadyStack.config || {};
  var targetId = config.target || 'steadystack-status';
  var slug = '${slug}';
  var apiUrl = '${baseUrl}/api/widget/' + slug + '/status';
  
  // Theme configuration (from dashboard settings)
  var theme = {
    bgColor: '${bgColor}',
    textColor: '${textColor}',
    borderRadius: '${borderRadius}'
  };
  
  // Status messages (from dashboard settings)
  var messages = {
    operational: ${JSON.stringify(operationalText)},
    partial: ${JSON.stringify(partialText)},
    major: ${JSON.stringify(majorText)}
  };
  
  // Status colors
  var statusColors = {
    operational: '#10b981',
    partial: '#f59e0b',
    major: '#ef4444'
  };
  
  // CSS styles (scoped to avoid conflicts)
  var styles = \`
    .pg-widget {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: \${theme.bgColor};
      border-radius: \${theme.borderRadius};
      border: 1px solid rgba(255,255,255,0.1);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .pg-widget:hover {
      border-color: rgba(255,255,255,0.2);
      transform: translateY(-1px);
    }
    .pg-widget-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      animation: pg-pulse 2s infinite;
    }
    .pg-widget-text {
      color: \${theme.textColor};
      font-size: 14px;
      font-weight: 500;
    }
    @keyframes pg-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  \`;
  
  function createWidget(data) {
    var container = document.getElementById(targetId);
    if (!container) {
      console.warn('[SteadyStack] Container #' + targetId + ' not found');
      return;
    }
    
    var status = data.status || 'operational';
    var message = messages[status] || data.message || 'Status Unknown';
    var dotColor = statusColors[status] || statusColors.operational;
    
    // Inject scoped styles
    if (!document.getElementById('pg-widget-styles')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'pg-widget-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
    
    // Build the widget HTML
    var pageUrl = '${baseUrl}/status-page/' + slug;
    container.innerHTML = \`
      <a href="\${pageUrl}" target="_blank" rel="noopener" class="pg-widget">
        <span class="pg-widget-dot" style="background: \${dotColor};"></span>
        <span class="pg-widget-text">\${message}</span>
      </a>
    \`;
  }
  
  function showError() {
    var container = document.getElementById(targetId);
    if (container) {
      container.innerHTML = '<span style="color: #888; font-size: 12px;">Status unavailable</span>';
    }
  }
  
  function fetchStatus() {
    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function(data) {
        createWidget(data);
      })
      .catch(function(error) {
        console.error('[SteadyStack] Failed to fetch status:', error);
        showError();
      });
  }
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchStatus);
  } else {
    fetchStatus();
  }
  
  // Refresh every 60 seconds
  setInterval(fetchStatus, 60000);
})();
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      // Allow this script to be loaded from any domain
      "Access-Control-Allow-Origin": "*",
    },
  });
}
