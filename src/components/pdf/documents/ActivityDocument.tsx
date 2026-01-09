import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ApiActivity, DOMAIN_LABELS } from '@/types';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottom: '1pt solid #eee',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 5,
        color: '#111',
    },
    meta: {
        fontSize: 10,
        color: '#666',
        flexDirection: 'row',
        gap: 10,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    content: {
        marginBottom: 5,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    bullet: {
        width: 15,
        fontSize: 14,
    },
    listContent: {
        flex: 1,
    },
    scriptBox: {
        backgroundColor: '#fffbeb',
        padding: 15,
        borderRadius: 4,
        marginTop: 10,
        borderLeft: '4pt solid #fcd34d',
    },
    scriptTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#92400e',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    scriptText: {
        fontFamily: 'Helvetica-Oblique',
        color: '#92400e',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#999',
        borderTop: '1pt solid #eee',
        paddingTop: 10,
    },
});

interface ActivityDocumentProps {
    activity: ApiActivity;
    childName?: string;
    date?: string;
}

export const ActivityDocument = ({ activity, childName, date }: ActivityDocumentProps) => (
    <Document title={activity.title} author="SchoolOS">
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{activity.title}</Text>
                <View style={styles.meta}>
                    <Text>{DOMAIN_LABELS[activity.domain]}</Text>
                    <Text>•</Text>
                    <Text>{activity.duration_minutes} min</Text>
                    <Text>•</Text>
                    <Text>Ages {activity.min_age_months}-{activity.max_age_months}m</Text>
                </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.content}>{activity.description}</Text>
            </View>

            {/* Materials */}
            {activity.materials && activity.materials.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials Needed</Text>
                    {activity.materials.map((m, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.listContent}>{m}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Instructions */}
            {activity.instructions && activity.instructions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    {activity.instructions.map((step, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>{i + 1}.</Text>
                            <Text style={styles.listContent}>{step}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Parent Script */}
            {activity.parent_script && (
                <View style={styles.scriptBox}>
                    <Text style={styles.scriptTitle}>What to Say</Text>
                    <Text style={styles.scriptText}>"{activity.parent_script}"</Text>
                </View>
            )}

            {/* Success Indicators */}
            {activity.learning_outcomes && activity.learning_outcomes.length > 0 && (
                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={[styles.sectionTitle, { fontSize: 12 }]}>What to Look For</Text>
                    {activity.learning_outcomes.map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.bullet}>✓</Text>
                            <Text style={[styles.listContent, { color: '#555' }]}>{item}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Footer */}
            <Text style={styles.footer}>
                SchoolOS • {date || new Date().toLocaleDateString()} {childName ? `• Prepared for ${childName}` : ''}
            </Text>
        </Page>
    </Document>
);
