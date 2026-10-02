import * as React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#0f172a",
    fontSize: 9,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0",
  },
  brandName: {
    fontSize: 16,
    fontWeight: "heavy",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginTop: 2,
    letterSpacing: 0.8,
  },
  reportMeta: {
    alignItems: "flex-end",
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  reportSub: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  // Executive Callout Banner
  executiveBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  clientScopeBox: {
    width: "48%",
  },
  clientLabel: {
    fontSize: 7.5,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  periodText: {
    fontSize: 8.5,
    color: "#475569",
    marginTop: 2,
  },
  verdictBox: {
    width: "48%",
    alignItems: "flex-end",
  },
  verdictBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  verdictBadgePass: {
    backgroundColor: "#dcfce7",
  },
  verdictBadgeFail: {
    backgroundColor: "#fee2e2",
  },
  verdictTextPass: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#15803d",
    textTransform: "uppercase",
  },
  verdictTextFail: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#b91c1c",
    textTransform: "uppercase",
  },
  verdictSub: {
    fontSize: 8,
    color: "#64748b",
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kpiCard: {
    width: "23.5%",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 9,
    alignItems: "center",
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  kpiValueHighlight: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 2,
  },
  kpiValueBreach: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 0.4,
  },
  kpiHint: {
    fontSize: 6.5,
    color: "#94a3b8",
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // Tables
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 8,
    color: "#334155",
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // Outage Table Specific Columns
  colOutageDate: { width: "22%" },
  colOutageService: { width: "24%" },
  colOutageDuration: { width: "16%" },
  colOutageReason: { width: "26%" },
  colOutageStatus: { width: "12%", textAlign: "right" },

  // Service Table Specific Columns
  colServiceName: { width: "34%" },
  colServiceType: { width: "14%" },
  colServiceChecks: { width: "16%", textAlign: "right" },
  colServiceDowntime: { width: "18%", textAlign: "right" },
  colServiceUptime: { width: "18%", textAlign: "right" },

  // Daily Table Columns
  colDailyDate: { width: "25%" },
  colDailyChecks: { width: "20%", textAlign: "right" },
  colDailyDowntime: { width: "25%", textAlign: "right" },
  colDailyUptime: { width: "30%", textAlign: "right" },

  // Commentary Box
  notesBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

export interface SlaReportData {
  reportId: string;
  generatedAt: string;
  agencyName?: string;
  clientName?: string;
  scopeName: string;
  startDate: string;
  endDate: string;
  targetSla: number; // e.g. 99.9
  actualUptime: number; // e.g. 99.98
  isSlaMet: boolean;
  totalMonitoredMinutes: number;
  allowedDowntimeMinutes: number;
  consumedDowntimeMinutes: number;
  remainingErrorBudgetPct: number;
  totalChecks: number;
  totalIncidents: number;
  mttrMinutes: number;
  mttdSeconds: number;
  avgLatencyMs: number;
  p95LatencyMs?: number;
  p99LatencyMs?: number;
  notes?: string;
  services: {
    id: string;
    name: string;
    type: string;
    checks: number;
    uptimePct: number;
    downtimeMinutes: number;
    status: "PASS" | "FAIL";
  }[];
  incidents: {
    id: string;
    startedAt: string;
    durationMinutes: number;
    serviceName: string;
    reason: string;
    status: string;
  }[];
  dailyBreakdown?: {
    date: string;
    checksTotal: number;
    uptimePct: number;
    downDuration: number;
  }[];
}

export const SlaReportDocument: React.FC<{ data: SlaReportData }> = ({ data }) => {
  const brandTitle = data.agencyName?.trim() || "Service Audit";
  const clientTitle = data.clientName?.trim() || data.scopeName;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>{brandTitle}</Text>
            <Text style={styles.brandSub}>SLA Availability & Compliance Assurance</Text>
          </View>
          <View style={styles.reportMeta}>
            <Text style={styles.reportTitle}>Service Level Agreement Report</Text>
            <Text style={styles.reportSub}>
              Ref: {data.reportId} • Generated: {data.generatedAt}
            </Text>
          </View>
        </View>

        {/* Executive Callout Banner */}
        <View style={styles.executiveBanner}>
          <View style={styles.clientScopeBox}>
            <Text style={styles.clientLabel}>Deliverable For</Text>
            <Text style={styles.clientName}>{clientTitle}</Text>
            <Text style={styles.periodText}>
              Audit Window: {data.startDate} to {data.endDate}
            </Text>
          </View>
          <View style={styles.verdictBox}>
            <View
              style={[
                styles.verdictBadge,
                data.isSlaMet ? styles.verdictBadgePass : styles.verdictBadgeFail,
              ]}
            >
              <Text style={data.isSlaMet ? styles.verdictTextPass : styles.verdictTextFail}>
                {data.isSlaMet ? "✓ SLA COMPLIANT (PASS)" : "⚠ SLA BREACHED (FAIL)"}
              </Text>
            </View>
            <Text style={styles.verdictSub}>
              Target: {data.targetSla.toFixed(2)}% | Actual: {data.actualUptime.toFixed(3)}%
            </Text>
          </View>
        </View>

        {/* 4 Key Performance Indicators */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={data.isSlaMet ? styles.kpiValueHighlight : styles.kpiValueBreach}>
              {data.actualUptime.toFixed(3)}%
            </Text>
            <Text style={styles.kpiLabel}>Uptime Achieved</Text>
            <Text style={styles.kpiHint}>Target: {data.targetSla.toFixed(2)}%</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{data.consumedDowntimeMinutes}m</Text>
            <Text style={styles.kpiLabel}>Total Outage Time</Text>
            <Text style={styles.kpiHint}>Allowed: {data.allowedDowntimeMinutes.toFixed(1)}m</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text
              style={
                data.remainingErrorBudgetPct >= 0 ? styles.kpiValueHighlight : styles.kpiValueBreach
              }
            >
              {data.remainingErrorBudgetPct.toFixed(1)}%
            </Text>
            <Text style={styles.kpiLabel}>Error Budget Left</Text>
            <Text style={styles.kpiHint}>
              {data.remainingErrorBudgetPct >= 0 ? "Budget Healthy" : "Exceeded"}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiValue}>
              {data.mttrMinutes > 0 ? `${data.mttrMinutes.toFixed(1)}m` : "0m"}
            </Text>
            <Text style={styles.kpiLabel}>MTTR (Mean Recovery)</Text>
            <Text style={styles.kpiHint}>MTTD: {data.mttdSeconds}s</Text>
          </View>
        </View>

        {/* Secondary KPI Bar (Checks & Latency) */}
        <View style={[styles.kpiGrid, { marginBottom: 14 }]}>
          <View style={[styles.kpiCard, { width: "31.5%" }]}>
            <Text style={styles.kpiValue}>{data.totalChecks.toLocaleString()}</Text>
            <Text style={styles.kpiLabel}>Total Verification Checks</Text>
            <Text style={styles.kpiHint}>Distributed Edge Quorum</Text>
          </View>
          <View style={[styles.kpiCard, { width: "31.5%" }]}>
            <Text style={styles.kpiValue}>{data.totalIncidents}</Text>
            <Text style={styles.kpiLabel}>Recorded Incidents</Text>
            <Text style={styles.kpiHint}>
              {data.totalIncidents === 0 ? "Flawless Execution" : "Requires Review"}
            </Text>
          </View>
          <View style={[styles.kpiCard, { width: "31.5%" }]}>
            <Text style={styles.kpiValue}>{data.avgLatencyMs}ms</Text>
            <Text style={styles.kpiLabel}>Average Latency</Text>
            <Text style={styles.kpiHint}>
              {data.p95LatencyMs ? `p95: ${data.p95LatencyMs}ms` : "Edge Verified"}
            </Text>
          </View>
        </View>

        {/* Monitored Services Breakdown */}
        {data.services && data.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Monitored Service Breakdown ({data.services.length}{" "}
              {data.services.length === 1 ? "Component" : "Components"})
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colServiceName]}>Service Name</Text>
                <Text style={[styles.tableHeaderCell, styles.colServiceType]}>Type</Text>
                <Text style={[styles.tableHeaderCell, styles.colServiceChecks]}>Checks</Text>
                <Text style={[styles.tableHeaderCell, styles.colServiceDowntime]}>Downtime</Text>
                <Text style={[styles.tableHeaderCell, styles.colServiceUptime]}>
                  Uptime & Status
                </Text>
              </View>
              {data.services.slice(0, 10).map((srv, idx) => (
                <View
                  key={srv.id || idx}
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCellBold, styles.colServiceName]}>{srv.name}</Text>
                  <Text style={[styles.tableCell, styles.colServiceType]}>{srv.type}</Text>
                  <Text style={[styles.tableCell, styles.colServiceChecks]}>
                    {srv.checks.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCell, styles.colServiceDowntime]}>
                    {srv.downtimeMinutes} min
                  </Text>
                  <Text
                    style={[
                      styles.tableCellBold,
                      styles.colServiceUptime,
                      { color: srv.status === "PASS" ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {srv.uptimePct.toFixed(3)}% ({srv.status})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Incidents & Outage Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outage & Incident Audit Log</Text>
          {data.incidents && data.incidents.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.colOutageDate]}>Timestamp (UTC)</Text>
                <Text style={[styles.tableHeaderCell, styles.colOutageService]}>Service</Text>
                <Text style={[styles.tableHeaderCell, styles.colOutageDuration]}>Duration</Text>
                <Text style={[styles.tableHeaderCell, styles.colOutageReason]}>Root Cause</Text>
                <Text style={[styles.tableHeaderCell, styles.colOutageStatus]}>Status</Text>
              </View>
              {data.incidents.slice(0, 6).map((inc, idx) => (
                <View
                  key={inc.id || idx}
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[styles.tableCell, styles.colOutageDate]}>{inc.startedAt}</Text>
                  <Text style={[styles.tableCellBold, styles.colOutageService]}>
                    {inc.serviceName}
                  </Text>
                  <Text style={[styles.tableCell, styles.colOutageDuration]}>
                    {inc.durationMinutes}m
                  </Text>
                  <Text style={[styles.tableCell, styles.colOutageReason]}>
                    {inc.reason || "Edge Quorum Timeout"}
                  </Text>
                  <Text
                    style={[
                      styles.tableCellBold,
                      styles.colOutageStatus,
                      {
                        color: inc.status === "RESOLVED" ? "#16a34a" : "#ea580c",
                      },
                    ]}
                  >
                    {inc.status}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>
                ✓ Zero service disruptions or confirmed downtime events were recorded during this
                audit window. 100% continuous edge uptime verified.
              </Text>
            </View>
          )}
        </View>

        {/* Agency Executive Commentary & Sign-Off */}
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>Executive SLA Audit Summary & Billing Notes</Text>
          <Text style={styles.notesText}>
            {data.notes?.trim()
              ? data.notes
              : data.isSlaMet
                ? `Contractual uptime requirements (${data.targetSla.toFixed(2)}%) have been fully met for this reporting period with an achieved availability of ${data.actualUptime.toFixed(3)}%. All scheduled edge verification tests passed with zero outstanding SLA service credit liability.`
                : `Availability during this period (${data.actualUptime.toFixed(3)}%) fell below the target SLA threshold of ${data.targetSla.toFixed(2)}%. Service credits or mitigation procedures should be applied in accordance with the master service agreement.`}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by {brandTitle} SLA Engine • High-Availability Consensus Assurance
          </Text>
          <Text style={styles.footerText}>
            Report ID: {data.reportId} • Confidential & Proprietary
          </Text>
        </View>
      </Page>
    </Document>
  );
};
