import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ApiActivity, Student, LiturgyItem, LITURGY_TYPE_LABELS, Book } from '@/types';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#111',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    dayCard: {
        width: '31%', // 3 columns approx
        marginBottom: 10,
        border: '1pt solid #eee',
        padding: 10,
        borderRadius: 4,
    },
    dayTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
        color: '#2563eb', // blue-600
        borderBottom: '1pt solid #eee',
        paddingBottom: 4,
    },
    sectionTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#666',
        marginTop: 6,
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    item: {
        marginBottom: 4,
        fontSize: 9,
    },
    itemTitle: {
        fontFamily: 'Helvetica-Bold',
    },
    itemMeta: {
        fontSize: 8,
        color: '#666',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#999',
    },
});

export interface DayPlan {
    date: string;
    dayName: string;
    liturgy: LiturgyItem[];
    activities: ApiActivity[];
    reading?: Book;
}

interface WeeklyPlanDocumentProps {
    weekStart: string;
    children: Student[];
    days: DayPlan[];
}

export const WeeklyPlanDocument = ({ weekStart, children, days }: WeeklyPlanDocumentProps) => (
    <Document title={`Weekly Plan - ${weekStart}`} author="SchoolOS">
        <Page orientation="landscape" size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Weekly Learning Plan</Text>
                <Text style={styles.subtitle}>
                    Week of {weekStart} • For {children.map(c => c.name).join(', ')}
                </Text>
            </View>

            <View style={styles.grid}>
                {days.map((day, i) => (
                    <View key={i} style={styles.dayCard}>
                        <Text style={styles.dayTitle}>{day.dayName}</Text>

                        {/* Liturgy */}
                        {day.liturgy.length > 0 && (
                            <View>
                                <Text style={styles.sectionTitle}>Morning Liturgy</Text>
                                {day.liturgy.map((item, idx) => (
                                    <View key={idx} style={styles.item}>
                                        <Text style={styles.itemTitle}>{LITURGY_TYPE_LABELS[item.type]}</Text>
                                        <Text style={styles.itemMeta}>{item.title}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Activities */}
                        {day.activities.length > 0 && (
                            <View>
                                <Text style={styles.sectionTitle}>Activities</Text>
                                {day.activities.map((act, idx) => {
                                    const domain = act.primary_virtue || act.domain || 'General';
                                    return (
                                    <View key={idx} style={styles.item}>
                                        <Text style={styles.itemTitle}>{act.title}</Text>
                                        <Text style={styles.itemMeta}>{act.duration_minutes}m • {domain}</Text>
                                    </View>
                                )})}
                            </View>
                        )}

                        {/* Reading */}
                        {day.reading && (
                            <View>
                                <Text style={styles.sectionTitle}>Story Time</Text>
                                <View style={styles.item}>
                                    <Text style={styles.itemTitle}>{day.reading.title}</Text>
                                    <Text style={styles.itemMeta}>by {day.reading.author || 'Unknown'}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>
                SchoolOS • Generated on {new Date().toLocaleDateString()}
            </Text>
        </Page>
    </Document>
);
