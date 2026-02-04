import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Anchor, Sun, Heart, ChevronDown, Sparkles, Music } from 'lucide-react';

// Types derived from our AI Payload
export interface AnchorPayload {
    date: string;
    theme: string;
    liturgy: {
        hymn: string;
        scripture: string;
        catechism_q: number;
        catechism_a: string;
    };
    family_activity: {
        title: string;
        description: string;
        skill_domain: string;
        formation_lens: string;
        levels: Array<{ stage: string; instruction: string }>;
    };
    book_nook: {
        title: string;
        author: string;
        cover_image: string;
        discussion_prompt: string;
    };
}

interface AnchorCardProps {
    anchor: AnchorPayload;
    onComplete?: () => void;
}

// Animated star component for the background
const Star = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
    <motion.div
        className="absolute rounded-full bg-amber-300/60"
        style={{ left: x, top: y, width: size, height: size }}
        animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
        }}
        transition={{
            duration: 3,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

export const AnchorCard: React.FC<AnchorCardProps> = ({ anchor, onComplete }) => {
    const [expandedSection, setExpandedSection] = useState<'liturgy' | 'activity' | 'book' | null>('liturgy');

    const toggleSection = (section: 'liturgy' | 'activity' | 'book') => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const sectionData = [
        { id: 'liturgy' as const, icon: Sun, label: 'Liturgy', color: 'from-amber-500 to-orange-500' },
        { id: 'activity' as const, icon: Heart, label: 'Activity', color: 'from-rose-400 to-pink-500' },
        { id: 'book' as const, icon: Book, label: 'Reading', color: 'from-violet-400 to-purple-500' },
    ];

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
            {/* Constellation Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Stars */}
                <Star delay={0} x="10%" y="15%" size={3} />
                <Star delay={0.5} x="85%" y="10%" size={2} />
                <Star delay={1} x="70%" y="25%" size={4} />
                <Star delay={1.5} x="20%" y="40%" size={2} />
                <Star delay={2} x="90%" y="35%" size={3} />
                <Star delay={0.3} x="5%" y="60%" size={2} />
                <Star delay={0.8} x="75%" y="55%" size={3} />
                <Star delay={1.2} x="30%" y="70%" size={2} />
                <Star delay={1.8} x="60%" y="80%" size={4} />
                <Star delay={0.6} x="15%" y="85%" size={2} />
                <Star delay={2.2} x="95%" y="75%" size={3} />
                <Star delay={0.9} x="45%" y="12%" size={2} />

                {/* Constellation lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                    <line x1="10%" y1="15%" x2="45%" y2="12%" stroke="rgb(251 191 36)" strokeWidth="0.5" />
                    <line x1="45%" y1="12%" x2="70%" y2="25%" stroke="rgb(251 191 36)" strokeWidth="0.5" />
                    <line x1="85%" y1="10%" x2="70%" y2="25%" stroke="rgb(251 191 36)" strokeWidth="0.5" />
                </svg>

                {/* Ambient glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
                {/* Anchor Icon */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mb-6"
                >
                    <div className="p-3 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30">
                        <Anchor className="w-6 h-6 text-amber-400" />
                    </div>
                </motion.div>

                {/* Theme Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 tracking-tight">
                        {anchor.theme}
                    </h1>
                    <p className="text-amber-200/60 text-sm">
                        Daily Devotion for Families
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                        {new Date(anchor.date).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </motion.div>

                {/* Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="backdrop-blur-xl bg-white/5 dark:bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Illustration Area */}
                    <div className="relative h-48 bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-transparent overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {/* Tree silhouette */}
                                <svg className="w-32 h-32 text-amber-400/30" viewBox="0 0 100 100">
                                    <path d="M50 90 L50 60 M50 60 Q30 50 35 35 Q40 20 50 15 Q60 20 65 35 Q70 50 50 60"
                                        stroke="currentColor" strokeWidth="2" fill="none" />
                                    <circle cx="50" cy="15" r="20" fill="currentColor" opacity="0.3" />
                                    <circle cx="35" cy="35" r="15" fill="currentColor" opacity="0.2" />
                                    <circle cx="65" cy="35" r="15" fill="currentColor" opacity="0.2" />
                                </svg>
                                {/* Moon */}
                                <div className="absolute top-2 right-0 w-8 h-8 rounded-full bg-amber-200/80 shadow-lg shadow-amber-200/20" />
                            </div>
                        </div>
                        {/* Gradient overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    </div>

                    {/* Tagline */}
                    <div className="px-6 py-4 text-center border-b border-white/5">
                        <p className="text-white font-medium">Explore the wonder of creation together.</p>
                    </div>

                    {/* Section Buttons */}
                    <div className="p-6 space-y-3">
                        {sectionData.map((section, index) => (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                {/* Section Header Button */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${expandedSection === section.id
                                            ? 'bg-gradient-to-r ' + section.color + ' shadow-lg shadow-amber-500/20'
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                        }`}
                                >
                                    <div className={`p-2.5 rounded-xl ${expandedSection === section.id
                                            ? 'bg-white/20'
                                            : 'bg-gradient-to-br ' + section.color + ' bg-opacity-80'
                                        }`}>
                                        <section.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-white font-medium flex-1 text-left">{section.label}</span>
                                    <ChevronDown className={`w-5 h-5 text-white/60 transition-transform duration-300 ${expandedSection === section.id ? 'rotate-180' : ''
                                        }`} />
                                </button>

                                {/* Expandable Content */}
                                <AnimatePresence>
                                    {expandedSection === section.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 pb-2 px-2 space-y-4">
                                                {section.id === 'liturgy' && (
                                                    <LiturgyContent liturgy={anchor.liturgy} />
                                                )}
                                                {section.id === 'activity' && (
                                                    <ActivityContent activity={anchor.family_activity} />
                                                )}
                                                {section.id === 'book' && (
                                                    <BookContent book={anchor.book_nook} />
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Complete Button */}
                    {onComplete && (
                        <div className="px-6 pb-6">
                            <button
                                onClick={onComplete}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-lg transition-all duration-300 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Complete Today's Anchor
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

// --- Section Content Components ---

const LiturgyContent = ({ liturgy }: { liturgy: AnchorPayload['liturgy'] }) => (
    <div className="space-y-4">
        {/* Scripture */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sun className="w-3 h-3" />
                Call to Worship
            </div>
            <p className="text-white/90 font-serif text-lg leading-relaxed">{liturgy.scripture}</p>
        </div>

        {/* Catechism */}
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-xl p-4 border border-amber-500/20">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Catechism Q{liturgy.catechism_q}
            </div>
            <p className="text-white font-medium text-lg mb-2">{liturgy.catechism_a}</p>
        </div>

        {/* Hymn */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Music className="w-3 h-3" />
                Hymn
            </div>
            <p className="text-white/90 italic">{liturgy.hymn}</p>
        </div>
    </div>
);

const ActivityContent = ({ activity }: { activity: AnchorPayload['family_activity'] }) => (
    <div className="space-y-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <h4 className="text-white font-bold text-lg mb-2">{activity.title}</h4>
            <p className="text-white/70">{activity.description}</p>
        </div>

        {/* Skills */}
        <div className="flex gap-3">
            <div className="flex-1 bg-rose-500/20 rounded-xl p-3 border border-rose-500/30">
                <div className="text-xs text-rose-300 uppercase font-bold mb-1">Skill</div>
                <div className="text-white font-medium text-sm">{activity.skill_domain}</div>
            </div>
            <div className="flex-1 bg-purple-500/20 rounded-xl p-3 border border-purple-500/30">
                <div className="text-xs text-purple-300 uppercase font-bold mb-1">Focus</div>
                <div className="text-white font-medium text-sm">{activity.formation_lens}</div>
            </div>
        </div>

        {/* Levels */}
        {activity.levels && activity.levels.length > 0 && (
            <div className="space-y-2">
                <div className="text-xs font-bold text-white/50 uppercase tracking-wider">By Age Level</div>
                {activity.levels.map((level, i) => (
                    <div key={i} className="bg-slate-800/30 rounded-lg p-3 border border-white/5 flex gap-3">
                        <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold text-white/60 shrink-0">
                            {level.stage}
                        </span>
                        <span className="text-white/80 text-sm">{level.instruction}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const BookContent = ({ book }: { book: AnchorPayload['book_nook'] }) => (
    <div className="space-y-4">
        <div className="flex gap-4">
            {/* Book Cover */}
            <div className="w-20 h-28 bg-slate-700 rounded-lg shrink-0 overflow-hidden">
                {book.cover_image && !book.cover_image.includes('placeholder') ? (
                    <img src={book.cover_image} className="w-full h-full object-cover" alt={book.title} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Book className="w-8 h-8 text-slate-500" />
                    </div>
                )}
            </div>

            {/* Book Info */}
            <div className="flex-1">
                <h4 className="text-white font-bold text-lg">{book.title}</h4>
                <p className="text-white/50 text-sm">by {book.author}</p>
            </div>
        </div>

        {/* Discussion Prompt */}
        <div className="bg-violet-500/20 rounded-xl p-4 border border-violet-500/30">
            <div className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">
                Discussion Prompt
            </div>
            <p className="text-white/90 italic">"{book.discussion_prompt}"</p>
        </div>
    </div>
);

export default AnchorCard;
