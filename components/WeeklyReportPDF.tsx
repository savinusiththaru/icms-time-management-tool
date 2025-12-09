
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

Font.register({
    family: 'Helvetica-Bold',
    src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', // Fallback or standard font usage
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#111',
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        flexDirection: 'column',
    },
    logo: {
        width: 60,
        height: 'auto',
    },
    title: {
        fontSize: 24,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        marginBottom: 8,
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#f0f0f0',
        padding: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '30%',
        textAlign: 'center',
        borderRadius: 4,
    },
    statValue: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: '#555',
    },
    listItem: {
        fontSize: 12,
        marginBottom: 4,
        flexDirection: 'row',
    },
    bullet: {
        width: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 10,
        color: '#888',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    }
});

interface ReportData {
    meta: { weekStart: string; generatedAt: string };
    stats: { total: number; completed: number; pending: number; completionRate: number };
    highlights: Array<{ id: string; title: string; priority: string }>;
    actionItems: Array<{ id: string; title: string; priority: string }>;
}

export const WeeklyReportPDF = ({ data }: { data: ReportData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.title}>Weekly Task Report</Text>
                    <Text style={styles.subtitle}>Week of {data.meta.weekStart}</Text>
                </View>
                {/* Ensure logo is in public folder and we pass absolute URL or relative if served correctly. 
                    React-PDF in browser often needs full URL or base64. 
                    For local dev `window.location.origin + /logo.png` is safest if client-side.
                */}
                <Image style={styles.logo} src="/logo.png" />
            </View>

            <View style={styles.statsContainer}>
                <View style={{ ...styles.statCard, backgroundColor: '#f0fdf4' }}>
                    <Text style={{ ...styles.statValue, color: '#15803d' }}>{data.stats.completionRate}%</Text>
                    <Text style={styles.statLabel}>Completion Rate</Text>
                </View>
                <View style={{ ...styles.statCard, backgroundColor: '#eff6ff' }}>
                    <Text style={{ ...styles.statValue, color: '#1d4ed8' }}>{data.stats.completed}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={{ ...styles.statCard, backgroundColor: '#fff7ed' }}>
                    <Text style={{ ...styles.statValue, color: '#c2410c' }}>{data.stats.pending}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 Highlights</Text>
                {data.highlights.length > 0 ? (
                    data.highlights.map((item) => (
                        <View key={item.id} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text>{item.title}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontSize: 12, fontStyle: 'italic', color: '#666' }}>No completed tasks yet.</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Action Items / Pending</Text>
                {data.actionItems.length > 0 ? (
                    data.actionItems.map((item) => (
                        <View key={item.id} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text>{item.title}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontSize: 12, fontStyle: 'italic', color: '#666' }}>All tasks completed!</Text>
                )}
            </View>

            <Text style={styles.footer}>
                Generated on {new Date(data.meta.generatedAt).toLocaleString()} | Weekly Task App
            </Text>
        </Page>
    </Document>
);
