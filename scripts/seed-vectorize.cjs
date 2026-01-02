// ============================================
// Seed Vectorize with Curriculum Documents
// ============================================
// Run this script to populate the Vectorize index with curriculum explanations.
// Usage: npx wrangler vectorize insert schoolos-curriculum-docs --file curriculum-vectors.ndjson
//
// This script generates the NDJSON file that can be uploaded to Vectorize.
// The documents provide context for the AI explanation feature.

const fs = require('fs');
const path = require('path');

// Curriculum documents to vectorize
const documents = [
    // Domain Explanations
    {
        id: 'domain-motor',
        type: 'domain',
        content: `Stewardship & Dominion (Motor Skills): Physical activities teach children to care for their bodies as temples of the Holy Spirit. Gross motor skills like running, climbing, and jumping demonstrate the joy of movement that God designed into our bodies. Fine motor skills like cutting, drawing, and threading prepare children for future academic work while developing patience and precision. We believe physical development is as important as intellectual growth, reflecting our calling to have dominion over creation.`,
        metadata: { domain: 'motor', category: 'philosophy' }
    },
    {
        id: 'domain-language',
        type: 'domain',
        content: `Word & Truth (Language Development): Language development is rooted in the biblical understanding that words have power - God spoke creation into being. Scripture memory, vocabulary building, and listening skills are central to this domain. Communication reflects bearing God's image as speaking beings. We emphasize speaking truth, using words to encourage, and the importance of listening as an act of love and respect for others.`,
        metadata: { domain: 'language', category: 'philosophy' }
    },
    {
        id: 'domain-cognitive',
        type: 'domain',
        content: `Wisdom & Order (Cognitive Development): Cognitive activities develop the child's ability to think, reason, and solve problems - reflecting the order God built into creation. Pattern recognition, sorting, sequencing, and memory games train the mind to see the structure underlying reality. We believe wisdom begins with the fear of the Lord, and intellectual development is part of loving God with all our mind. Problem-solving teaches perseverance and the joy of discovery.`,
        metadata: { domain: 'cognitive', category: 'philosophy' }
    },
    {
        id: 'domain-social',
        type: 'domain',
        content: `Virtue & Sanctification (Social-Emotional Development): Social and emotional skills are the foundation of godly character. Learning to share, wait, cooperate, and manage emotions are practical expressions of the fruits of the Spirit. We emphasize the second great commandment - loving our neighbor as ourselves. Children learn empathy, kindness, and self-control not as abstract concepts but through daily interactions and guided practice.`,
        metadata: { domain: 'social-emotional', category: 'philosophy' }
    },
    {
        id: 'domain-preacademic',
        type: 'domain',
        content: `Foundations & Patterns (Pre-Academic Skills): Pre-academic activities prepare children for formal learning while honoring the developmental stage they are in. Counting, letter recognition, sorting, and basic concepts are introduced through play and exploration. We believe early childhood should not rush academics but should build strong foundations. These skills emerge naturally when children are exposed to rich environments and engaged caregivers.`,
        metadata: { domain: 'pre-academic', category: 'philosophy' }
    },

    // Activity Explanations
    {
        id: 'activity-repetition',
        type: 'explanation',
        content: `Why Activities Repeat: Repetition is essential for young children's learning. The brain builds neural pathways through repeated practice. What may seem boring to adults is deeply satisfying to children who are mastering new skills. We intentionally rotate activities within domains rather than constantly introducing new ones. Mastery brings confidence, and confidence enables children to tackle new challenges.`,
        metadata: { category: 'pedagogy' }
    },
    {
        id: 'activity-balance',
        type: 'explanation',
        content: `Why We Balance Domains: Each developmental domain supports the others. Motor skills support handwriting. Language skills support reading. Social skills support group learning. We ensure balanced coverage across all domains each week because whole-child development requires attention to every area. If your child seems to struggle in one domain, we may increase its frequency slightly while maintaining overall balance.`,
        metadata: { category: 'pedagogy' }
    },
    {
        id: 'activity-age-appropriate',
        type: 'explanation',
        content: `Why Age Ranges Matter: Activities are matched to your child's developmental stage, not just their chronological age. A 3-year-old and a 5-year-old may do a similar activity but with different expectations. We use tiered expectations so siblings can participate together, each at their own level. This respects each child's unique development timeline while allowing family learning.`,
        metadata: { category: 'pedagogy' }
    },
    {
        id: 'activity-materials',
        type: 'explanation',
        content: `Why We Prioritize Your Materials: SchoolOS prioritizes activities using materials you already have. This respects your family's resources and reduces friction. If an activity requires materials you don't have, we'll suggest simpler alternatives or skip it in favor of something you can do today. Learning should be accessible, not dependent on expensive supplies.`,
        metadata: { category: 'practical' }
    },
    {
        id: 'activity-duration',
        type: 'explanation',
        content: `Why Sessions Are Short: Young children have limited attention spans - typically 3-5 minutes per year of age. A 3-year-old can focus for about 9-15 minutes. Our activities are designed to fit within these natural limits. It's better to end on a high note than to push until frustration sets in. Short, successful sessions build positive associations with learning.`,
        metadata: { category: 'pedagogy' }
    },

    // Override Explanations
    {
        id: 'override-sensory',
        type: 'override',
        content: `Sensory Accommodations: When a child has sensory sensitivities, we adjust activity recommendations accordingly. Noise sensitivity means we avoid group music or loud rhythm activities. Texture sensitivity means we exclude playdough, slime, or finger painting. These aren't limitations but rather respectful adaptations that allow learning without overwhelm. Every child deserves to learn in ways that work for their unique nervous system.`,
        metadata: { category: 'accommodations' }
    },
    {
        id: 'override-pacing',
        type: 'override',
        content: `Pacing Accommodations: Some children need shorter sessions or more movement breaks. This is not a failure but a recognition of how their bodies and minds work best. We reduce session durations and increase activity variety when needed. Children who need to move should move - trying to force stillness is counterproductive. We work with your child's natural rhythms.`,
        metadata: { category: 'accommodations' }
    },

    // Theological Framework
    {
        id: 'theology-image-of-god',
        type: 'theology',
        content: `Image of God in Education: Every child is made in God's image (Imago Dei). This means each child has inherent dignity, capacity for relationship, creativity, and moral understanding. Education is not about filling empty vessels but about nurturing God-given potential. We approach each child with reverence for who God made them to be, not frustration at who they are not yet.`,
        metadata: { category: 'theology' }
    },
    {
        id: 'theology-parent-authority',
        type: 'theology',
        content: `Parental Authority: Parents are the primary educators of their children. Deuteronomy 6 commands parents to teach their children diligently. SchoolOS exists to serve parents, not replace them. All recommendations are suggestions - you know your child best. The curriculum provides structure and content; you provide wisdom, love, and application to your family's unique context.`,
        metadata: { category: 'theology' }
    },
    {
        id: 'theology-sabbath-rest',
        type: 'theology',
        content: `Sabbath and Rest: Rest is not laziness but obedience. God rested on the seventh day and commands us to do the same. Homeschooling should not be exhausting for parents or children. We build margin into weekly plans and never suggest activities on days you've marked as unavailable. If you need a break, take it without guilt. Learning happens in rhythms of work and rest.`,
        metadata: { category: 'theology' }
    }
];

// Generate embeddings would require the AI API - this script generates the NDJSON format
// You'll need to run this through the Vectorize CLI with embeddings

function generateNdjsonForManualEmbedding() {
    const output = documents.map(doc => JSON.stringify({
        id: doc.id,
        metadata: {
            ...doc.metadata,
            type: doc.type,
            content: doc.content // Store content in metadata for retrieval
        },
        // Note: You'll need to generate embeddings using the Vectorize CLI
        // or the Workers AI embedding model
        values: [] // Placeholder - will be filled by Vectorize CLI
    })).join('\n');

    fs.writeFileSync(
        path.join(__dirname, '..', 'curriculum-vectors.ndjson'),
        output
    );

    console.log(`Generated ${documents.length} documents for Vectorize`);
    console.log('Output: curriculum-vectors.ndjson');
    console.log('\nTo upload with embeddings, use:');
    console.log('npx wrangler vectorize insert schoolos-curriculum-docs --file curriculum-vectors.ndjson');
}

// Alternative: Generate a JSON file that can be used with the embedding API
function generateDocsForEmbedding() {
    const output = documents.map(doc => ({
        id: doc.id,
        text: doc.content,
        metadata: {
            ...doc.metadata,
            type: doc.type,
            content: doc.content
        }
    }));

    fs.writeFileSync(
        path.join(__dirname, '..', 'curriculum-docs.json'),
        JSON.stringify(output, null, 2)
    );

    console.log(`Generated ${documents.length} documents for embedding`);
    console.log('Output: curriculum-docs.json');
}

// Run both
generateNdjsonForManualEmbedding();
generateDocsForEmbedding();

console.log('\n--- Vectorize Seeding Complete ---');
console.log('Documents cover:');
console.log('- 5 domain philosophy explanations');
console.log('- 5 activity pedagogy explanations');
console.log('- 2 override/accommodation explanations');
console.log('- 3 theological framework documents');
