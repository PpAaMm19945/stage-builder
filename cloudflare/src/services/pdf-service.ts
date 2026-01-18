import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { TranscriptData } from '../types';

export const PdfService = {
    async generateTranscript(data: TranscriptData): Promise<Uint8Array> {
        const doc = await PDFDocument.create();
        const page = doc.addPage();
        const { width, height } = page.getSize();
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

        const margin = 50;
        let y = height - margin;

        // Header
        const titleSize = 24;
        page.drawText('Official High School Transcript', {
            x: margin,
            y: y - titleSize,
            size: titleSize,
            font: boldFont,
            color: rgb(0, 0, 0),
        });
        y -= 50;

        // Student Info
        const fontSize = 12;
        page.drawText(`Student Name: ${data.studentName}`, { x: margin, y, size: fontSize, font: font });
        y -= 20;
        page.drawText(`Date of Birth: ${data.dateOfBirth}`, { x: margin, y, size: fontSize, font: font });
        y -= 20;
        if (data.graduationDate) {
            page.drawText(`Graduation Date: ${data.graduationDate}`, { x: margin, y, size: fontSize, font: font });
            y -= 20;
        }
        y -= 20; // Spacer

        // Academic Record Table Header
        page.drawText('Academic Record', { x: margin, y, size: 16, font: boldFont });
        y -= 20;

        const col1 = margin;
        const col2 = margin + 150;
        const col3 = margin + 350;
        const col4 = margin + 450;

        page.drawText('Subject / Course', { x: col1, y, size: 10, font: boldFont });
        page.drawText('Year', { x: col2, y, size: 10, font: boldFont });
        page.drawText('Credits', { x: col3, y, size: 10, font: boldFont });
        page.drawText('Grade', { x: col4, y, size: 10, font: boldFont });
        y -= 15;
        page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0, 0, 0) });
        y -= 20;

        // Courses
        for (const course of data.courses) {
            if (y < margin + 50) { // New page if needed
                const newPage = doc.addPage();
                y = height - margin;
                // Rebrand header if we want, or just continue
            }
            page.drawText(`${course.subject}: ${course.title}`, { x: col1, y, size: 10, font: font });
            page.drawText(course.year, { x: col2, y, size: 10, font: font });
            page.drawText(course.credits.toFixed(2), { x: col3, y, size: 10, font: font });
            page.drawText(course.grade, { x: col4, y, size: 10, font: font });
            y -= 20;
        }

        y -= 20;
        page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0, 0, 0) });
        y -= 30;

        // Totals
        page.drawText(`Total Credits: ${data.totalCredits.toFixed(2)}`, { x: col3, y, size: 12, font: boldFont });
        y -= 40;

        // Activities / Apprenticeships
        if (data.activities.length > 0) {
            page.drawText('Apprenticeships & Activities', { x: margin, y, size: 16, font: boldFont });
            y -= 20;
            for (const activity of data.activities) {
                page.drawText(`${activity.role} at ${activity.organization}`, { x: margin, y, size: 12, font: boldFont });
                y -= 15;
                page.drawText(`${activity.hours} Hours - ${activity.description}`, { x: margin, y, size: 10, font: font });
                y -= 25;
            }
        }

        // Footer / Official Seal
        y = 100;
        page.drawLine({ start: { x: margin, y }, end: { x: width / 2 - 20, y }, thickness: 1, color: rgb(0, 0, 0) });
        page.drawText('Administrator Signature', { x: margin, y: y - 15, size: 10, font: font });

        page.drawLine({ start: { x: width / 2 + 20, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0, 0, 0) });
        page.drawText('Date', { x: width / 2 + 20, y: y - 15, size: 10, font: font });

        return doc.save();
    },

    async generateDiploma(studentName: string, date: string): Promise<Uint8Array> {
        const doc = await PDFDocument.create();
        const page = doc.addPage([842, 595]); // A4 Landscape
        const { width, height } = page.getSize();
        const font = await doc.embedFont(StandardFonts.TimesRoman);
        const boldFont = await doc.embedFont(StandardFonts.TimesRomanBold);
        const scriptFont = await doc.embedFont(StandardFonts.HelveticaOblique); // Fallback for script

        // Border
        const borderWidth = 20;
        page.drawRectangle({
            x: borderWidth,
            y: borderWidth,
            width: width - (borderWidth * 2),
            height: height - (borderWidth * 2),
            borderWidth: 3,
            borderColor: rgb(0, 0, 0),
            color: undefined,
        });

        const centerX = width / 2;
        let y = height - 100;

        const drawCentered = (text: string, size: number, f: any) => {
            const textWidth = f.widthOfTextAtSize(text, size);
            page.drawText(text, { x: centerX - (textWidth / 2), y, size, font: f });
            y -= (size + 10);
        };

        drawCentered('SchoolOS High School', 40, boldFont);
        y -= 20;
        drawCentered('Hereby Confers Upon', 20, font);
        y -= 30;
        drawCentered(studentName, 48, scriptFont);
        y -= 30;
        drawCentered('the Degree of', 20, font);
        y -= 20;
        drawCentered('High School Diploma', 36, boldFont);
        y -= 40;
        drawCentered('with all the rights, privileges, and honors appertaining thereto.', 18, font);
        y -= 20;
        drawCentered(`Given on this day, ${date}`, 16, font);

        return doc.save();
    }
};
