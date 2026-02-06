import { Book, Student } from '@/types';

interface RecommendationParams {
    childAgeMonths: number;
    childInterests?: string[];
    childGender?: 'male' | 'female';
}

/**
 * Calculates a suitability score for a book based on child's profile
 * Score range: 0 - 100
 */
export function scoreBookSuitability(book: Book, params: RecommendationParams): number {
    let score = 0;
    const { childAgeMonths, childInterests, childGender } = params;

    // 1. Age Appropriateness (Max 50 pts)
    // Bell curve logic: Highest score if age is exactly in the middle of range
    const optimalAge = (book.minAgeMonths + book.maxAgeMonths) / 2;
    const ageDiff = Math.abs(childAgeMonths - optimalAge);
    const ageRange = book.maxAgeMonths - book.minAgeMonths;

    // If within range, start with 50 and subtract based on distance from optimal
    if (childAgeMonths >= book.minAgeMonths && childAgeMonths <= book.maxAgeMonths) {
        score += 50 - (ageDiff * 2);
    } else {
        // Outside range penalty
        score += Math.max(0, 30 - (ageDiff * 3));
    }

    // 2. Interest Match (Max 30 pts)
    if (childInterests && book.topics) {
        const matchingInterests = book.topics.filter(topic =>
            childInterests.some(interest => interest.toLowerCase().includes(topic.toLowerCase()))
        );
        score += Math.min(30, matchingInterests.length * 15);
    }

    // 3. Gender/Protagonist Nuance (Max 10 pts)
    // We generally want a mix, but slightly boost relatable protagonists for engagement
    // This is a soft boost, not a strict filter
    if (book.protagonistGender && childGender) {
        if (book.protagonistGender === 'animal') {
            score += 10; // Animals are universally engaging
        } else if (book.protagonistGender === childGender) {
            score += 5; // Slight relatability boost
        } else if (book.protagonistGender === 'mixed') {
            score += 8; // Mixed groups are great
        }
    } else {
        // No specific gender info
        score += 5;
    }

    // 4. Energy Level Match (Max 10 pts)
    // Ideally we'd map this to time of day, but for general suitability:
    // We assume moderate energy is generally good.
    // This is a placeholder for future time-of-day sensitive scoring.
    score += 5;

    return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Sorts books by suitability score for a given child
 */
export function getRecommendedBooks(books: Book[], student: Student): Book[] {
    // Mock interests for now since they aren't on the Student type yet
    // In real app, we'd fetch these from a profile or observations
    const mockInterests = ['animals', 'nature', 'trains'];

    // Mock gender (defaults to mixed/neutral if unknown)
    const gender = 'male'; // Placeholder, would come from Student profile

    // Normalize age - handle both snake_case (API) and camelCase
    const childAgeMonths = (student as Student & { age_in_months?: number }).age_in_months ?? student.ageInMonths ?? 0;

    return books
        .map(book => ({
            book,
            score: scoreBookSuitability(book, {
                childAgeMonths,
                childInterests: mockInterests,
                childGender: gender
            })
        }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.book);
}
