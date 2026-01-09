import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { WeeklyPlanDocument, DayPlan } from './WeeklyPlanDocument';
import { Student } from '@/types';

// Reuse styles from WeeklyPlanDocument but adjusted for portrait A4 daily view
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#111',
    },
    header: {
        marginBottom: 30,
        textAlign: 'center',
        borderBottom: '2pt solid #eee',
        paddingBottom: 20,
    },
    date: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        color: '#111',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        borderBottom: '1pt solid #eee',
        paddingBottom: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#2563eb',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    time: {
        width: 60,
        fontSize: 10,
        color: '#666',
        fontFamily: 'Helvetica-Bold',
        paddingTop: 2,
    },
    content: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    itemDesc: {
        fontSize: 11,
        color: '#444',
        marginBottom: 2,
    },
    itemMeta: {
        fontSize: 10,
        color: '#888',
        fontStyle: 'italic',
    },
    checkbox: {
        width: 20,
        height: 20,
        border: '1pt solid #ccc',
        marginRight: 10,
        marginTop: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#999',
    },
});

interface DailyPlanDocumentProps {
    day: DayPlan;
    children?: Student[];
}

export const DailyPlanDocument = ({ day, children }: DailyPlanDocumentProps) => (
    <Document title={`Daily Plan - ${day.date}`} author="SchoolOS">
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.date}>{day.date}</Text>
                <Text style={styles.title}>{day.dayName}</Text>
                {children && (
                    <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                        For: {children.map(c => c.name).join(', ')}
                    </Text>
                )}
            </View>

            {/* Morning Liturgy */}
            {day.liturgy.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Morning Liturgy</Text>
                    </View>
                    {day.liturgy.map((item, i) => (
                        <View key={i} style={styles.row}>
                            <View style={styles.checkbox} />
                            <View style={styles.content}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDesc}>{item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Activities */}
            {day.activities.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Activities</Text>
                    </View>
                    {day.activities.map((act, i) => (
                        <View key={i} style={styles.row}>
                            <View style={styles.checkbox} />
                            <View style={styles.content}>
                                <Text style={styles.itemTitle}>{act.title}</Text>
                                <Text style={styles.itemDesc}>{act.description}</Text>
                                <Text style={styles.itemMeta}>
                                    {act.duration_minutes} min • {act.domain} • Materials: {act.materials.join(', ')}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Reading */}
            {day.reading && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Story Time</Text>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.checkbox} />
                        <View style={styles.content}>
                            <Text style={styles.itemTitle}>{day.reading.title}</Text>
                            <Text style={styles.itemDesc}>{day.reading.description}</Text>
                            <Text style={styles.itemMeta}>by {day.reading.author}</Text>
                        </View>
                    </View>
                </View>
            )}

            <Text style={styles.footer}>
                "Teach us to number our days, that we may gain a heart of wisdom." - Psalm 90:12
            </Text>
        </Page>
    </Document>
);
