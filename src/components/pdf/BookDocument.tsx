import React, { useMemo } from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { Book } from '@/types';
import { HymnData, CatechismData } from '@/lib/book-content';

// Register a standard serif font for Hymns and Catechism if needed
// For now, we use standard fonts.
// Font.register({ family: 'Georgia', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
    },
    titlePage: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'Times-Roman',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
        fontFamily: 'Times-Roman',
    },
    imagePage: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 0,
    },
    fullImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    textPage: {
        fontSize: 12,
        fontFamily: 'Times-Roman',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: '#888',
        fontFamily: 'Times-Roman',
    },
    hymnTitle: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'Times-Bold',
        marginBottom: 10
    },
    hymnNumber: {
        fontSize: 10,
        textAlign: 'left',
        marginBottom: 5
    },
    hymnContent: {
        fontSize: 12,
        lineHeight: 1.6,
        fontFamily: 'Times-Roman'
    },
    catechismQuestion: {
        fontSize: 14,
        fontFamily: 'Times-Bold',
        marginBottom: 10,
    },
    catechismAnswer: {
        fontSize: 14,
        fontFamily: 'Times-Italic',
        marginBottom: 20,
    },
    catechismWeek: {
        fontSize: 10,
        color: '#666',
        marginBottom: 5,
        textAlign: 'center',
    }
});

interface BookDocumentProps {
    book: Book;
    pages?: string[]; // For markdown books
    imageUrls?: string[]; // For image books
    coverImage?: string; // Base64 cover image
    hymns?: HymnData[];
    catechism?: CatechismData[];
}

// Helper to render HTML-like content (basic tags) to PDF primitives
const HtmlTextRenderer = ({ content }: { content: string }) => {
    // Split by <p> or <br> to preserve blocks
    // Also handle simple bold/italic if needed, but primary goal is line breaks

    // Normalize breaks
    const normalized = content.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<p>/gi, '');

    // Remove other tags for now to be safe
    const plainText = normalized.replace(/<[^>]+>/g, '');

    return <Text style={styles.hymnContent}>{plainText}</Text>;
};

const HymnalDocument = ({ book, hymns }: { book: Book; hymns: NonNullable<BookDocumentProps['hymns']> }) => (
    <Document title={book.title} author={book.author}>
        <Page size="A5" style={styles.page}>
            <View style={styles.titlePage}>
                <Text style={styles.title}>{book.title}</Text>
                {book.author && <Text style={styles.subtitle}>{book.author}</Text>}
            </View>
        </Page>
        {hymns.map((hymn, index) => (
            <Page key={index} size="A5" style={styles.page}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.hymnNumber}>
                        {hymn.number ? `#${hymn.number}` : ''}
                    </Text>
                    <Text style={styles.hymnTitle}>
                        {hymn.title}
                    </Text>
                </View>

                <View style={{ flexGrow: 1 }}>
                    <HtmlTextRenderer content={hymn.content} />
                </View>

                {hymn.author && (
                    <Text style={{ fontSize: 10, textAlign: 'right', fontStyle: 'italic', marginTop: 10 }}>
                        {hymn.author}
                    </Text>
                )}

                <Text style={styles.footer}>Soli Deo Gloria</Text>
            </Page>
        ))}
    </Document>
);

const CatechismDocument = ({ book, data }: { book: Book; data: NonNullable<BookDocumentProps['catechism']> }) => (
    <Document title={book.title}>
        <Page size="A5" style={styles.page}>
            <View style={styles.titlePage}>
                <Text style={styles.title}>{book.title}</Text>
                <Text style={styles.subtitle}>Westminster Shorter Catechism</Text>
            </View>
        </Page>
        {data.map((item, index) => (
            <Page key={index} size="A5" style={styles.page}>
                <View style={{ flexGrow: 1, justifyContent: 'center' }}>
                    {item.week && <Text style={styles.catechismWeek}>Week {item.week}</Text>}
                    <Text style={styles.catechismQuestion}>{item.question}</Text>
                    <Text style={styles.catechismAnswer}>{item.answer}</Text>
                </View>
                <Text style={styles.footer}>{index + 1}</Text>
            </Page>
        ))}
    </Document>
);

const PictureBookDocument = ({ book, imageUrls, coverImage }: { book: Book; imageUrls: NonNullable<BookDocumentProps['imageUrls']>; coverImage?: string }) => (
    <Document title={book.title}>
        {coverImage ? (
            <Page orientation="landscape" size="A4" style={{ padding: 0 }}>
                <Image src={coverImage} style={styles.fullImage} />
            </Page>
        ) : book.coverUrl ? (
            // Fallback to URL if base64 not provided (might fail CORS but worth trying)
            <Page orientation="landscape" size="A4" style={{ padding: 0 }}>
                <Image src={book.coverUrl} style={styles.fullImage} />
            </Page>
        ) : null}
        {imageUrls.map((url, index) => (
            <Page key={index} orientation="landscape" size="A4" style={{ padding: 0 }}>
                <Image src={url} style={styles.fullImage} />
            </Page>
        ))}
    </Document>
);

const MarkdownBookDocument = ({ book, pages }: { book: Book; pages: NonNullable<BookDocumentProps['pages']> }) => (
    <Document title={book.title} author={book.author}>
        <Page size="A5" style={styles.page}>
            <View style={styles.titlePage}>
                <Text style={styles.title}>{book.title}</Text>
                {book.author && <Text style={styles.subtitle}>{book.author}</Text>}
            </View>
        </Page>
        {pages.map((pageContent, index) => (
            <Page key={index} size="A5" style={styles.page}>
                <Text style={styles.textPage}>
                    {pageContent}
                </Text>
                <Text style={styles.footer}>{index + 1}</Text>
            </Page>
        ))}
    </Document>
);

export const BookDocument = (props: BookDocumentProps) => {
    const { book, hymns, catechism, imageUrls, pages } = props;

    if (hymns && hymns.length > 0) {
        return <HymnalDocument book={book} hymns={hymns} />;
    }

    if (catechism && catechism.length > 0) {
        return <CatechismDocument book={book} data={catechism} />;
    }

    if (imageUrls && imageUrls.length > 0) {
        return <PictureBookDocument book={book} imageUrls={imageUrls} coverImage={props.coverImage} />;
    }

    if (pages && pages.length > 0) {
        return <MarkdownBookDocument book={book} pages={pages} />;
    }

    return (
        <Document>
            <Page>
                <Text>No content available for PDF generation.</Text>
            </Page>
        </Document>
    );
};
