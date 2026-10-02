import * as React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  brand: {
    fontSize: 14,
    color: "#10b981", // SteadyStack Emerald
    fontWeight: "heavy",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#334155",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 8,
    width: "30%",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 8,
  },
  colDate: { width: "20%", fontSize: 10 },
  colMonitor: { width: "25%", fontSize: 10, fontWeight: "bold" },
  colDesc: { width: "40%", fontSize: 10 },
  colDuration: { width: "15%", fontSize: 10, textAlign: "right" },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 10,
  },
});

interface MonthlyReportProps {
  stats: {
    globalUptime: number;
    totalIncidents: number;
    avgResponseTime: number;
    startDate: string;
    endDate: string;
    agencyName?: string;
    clientName?: string;
    criticalEvents: {
      id: string;
      date: string;
      monitorName: string;
      description: string;
      duration: string;
    }[];
  };
}

export const MonthlyReportDocument: React.FC<MonthlyReportProps> = ({ stats }) => {
  const brandTitle = stats.agencyName?.trim() || stats.clientName?.trim() || "Performance Audit";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Monthly Performance Report</Text>
            <Text style={styles.subtitle}>
              Period: {stats.startDate} — {stats.endDate}
            </Text>
          </View>
          <Text style={styles.brand}>{brandTitle}</Text>
        </View>

        {/* Hero Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text
                style={[
                  styles.statValue,
                  { color: stats.globalUptime >= 99.9 ? "#22c55e" : "#eab308" },
                ]}
              >
                {stats.globalUptime}%
              </Text>
              <Text style={styles.statLabel}>Global Uptime</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalIncidents}</Text>
              <Text style={styles.statLabel}>Incidents</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avgResponseTime}ms</Text>
              <Text style={styles.statLabel}>Avg Latency</Text>
            </View>
          </View>
        </View>

        {/* Critical Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Critical Incidents</Text>
          {stats.criticalEvents.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colDate}>Date</Text>
                <Text style={styles.colMonitor}>Service</Text>
                <Text style={styles.colDesc}>Incident</Text>
                <Text style={styles.colDuration}>Duration</Text>
              </View>
              {stats.criticalEvents.map((event) => (
                <View key={event.id} style={styles.tableRow}>
                  <Text style={styles.colDate}>{event.date}</Text>
                  <Text style={styles.colMonitor}>{event.monitorName}</Text>
                  <Text style={styles.colDesc}>{event.description}</Text>
                  <Text style={styles.colDuration}>{event.duration}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
              No critical incidents reported this month. Great job!
            </Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by Automated Performance Reporting Engine • {new Date().getFullYear()}
        </Text>
      </Page>
    </Document>
  );
};
