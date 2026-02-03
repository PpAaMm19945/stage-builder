
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons - assuming lucide-react is available as per project
import { Book, Anchor, ChevronRight, ChevronLeft, Sun, Moon, Star, Heart } from 'lucide-react';

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

export const AnchorCard: React.FC<AnchorCardProps> = ({ anchor, onComplete }) => {
    const [activeTab, setActiveTab] = useState<'liturgy' | 'activity' | 'book'>('liturgy');

    // Animation variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 h-[85vh] flex flex-col">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-6"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-2">
                    <Anchor size={14} />
                    <span>Daily Anchor • {new Date(anchor.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight">{anchor.theme}</h1>
            </motion.div>

            {/* Main Card */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row"
            >
                {/* Navigation Sidebar (Desktop) / Topbar (Mobile) */}
                <div className="md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-6 flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">

                    <NavButton
                        active={activeTab === 'liturgy'}
                        icon={<Sun size={20} />}
                        label="Liturgy"
                        onClick={() => setActiveTab('liturgy')}
                    />
                    <NavButton
                        active={activeTab === 'activity'}
                        icon={<Heart size={20} />}
                        label="Activity"
                        onClick={() => setActiveTab('activity')}
                    />
                    <NavButton
                        active={activeTab === 'book'}
                        icon={<Book size={20} />}
                        label="Book Nook"
                        onClick={() => setActiveTab('book')}
                    />

                    <div className="flex-1" />

                    {onComplete && (
                        <button
                            onClick={onComplete}
                            className="mt-auto hidden md:flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors"
                        >
                            Complete Day
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto relative bg-grid-slate-50">
                    <AnimatePresence mode="wait">

                        {/* LITURGY TAB */}
                        {activeTab === 'liturgy' && (
                            <motion.div
                                key="liturgy"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 max-w-2xl mx-auto"
                            >
                                <SectionHeader icon={<Sun />} title="Morning Liturgy" />

                                <div className="space-y-6">
                                    <LiturgyItem label="Call to Worship" content={anchor.liturgy.scripture} />

                                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Catechism Q{anchor.liturgy.catechism_q}</div>
                                        <div className="text-xl font-medium text-slate-800 mb-3">{anchor.liturgy.catechism_a}</div>
                                        <div className="text-indigo-600 italic">" {anchor.liturgy.catechism_a} "</div>
                                    </div>

                                    <LiturgyItem label="Hymn" content={anchor.liturgy.hymn} />
                                </div>
                            </motion.div>
                        )}

                        {/* ACTIVITY TAB */}
                        {activeTab === 'activity' && (
                            <motion.div
                                key="activity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 max-w-2xl mx-auto"
                            >
                                <SectionHeader icon={<Heart />} title="Family Activity" />

                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{anchor.family_activity.title}</h3>
                                    <p className="text-slate-600 text-lg">{anchor.family_activity.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Badge label="Skill" value={anchor.family_activity.skill_domain} />
                                    <Badge label="Lens" value={anchor.family_activity.formation_lens} color="purple" />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-400 text-sm uppercase tracking-wider">Grow at Your Level</h4>
                                    {anchor.family_activity.levels.map((level, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                                            <div className="w-24 shrink-0 flex items-center justify-center bg-slate-50 rounded-lg text-sm font-bold text-slate-500">
                                                {level.stage}
                                            </div>
                                            <div className="text-slate-700">{level.instruction}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* BOOK TAB */}
                        {activeTab === 'book' && (
                            <motion.div
                                key="book"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 max-w-2xl mx-auto"
                            >
                                <SectionHeader icon={<Book />} title="Book Nook" />

                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                                    {/* Cover Placeholder */}
                                    <div className="w-32 md:w-48 aspect-[2/3] bg-slate-200 rounded-lg shadow-inner shrink-0 overflow-hidden relative group">
                                        {anchor.book_nook.cover_image && !anchor.book_nook.cover_image.includes('placeholder') ? (
                                            <img src={anchor.book_nook.cover_image} className="w-full h-full object-cover" alt="Book cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">No Cover</div>
                                        )}
                                    </div>

                                    <div className="text-center md:text-left space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800">{anchor.book_nook.title}</h3>
                                            <p className="text-slate-500 text-lg">by {anchor.book_nook.author}</p>
                                        </div>

                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900">
                                            <div className="font-bold text-sm text-amber-700/60 uppercase mb-1">Discussion</div>
                                            "{anchor.book_nook.discussion_prompt}"
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

// --- Subcomponents ---

const NavButton = ({ active, icon, label, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left
            ${active
                ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-slate-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
        {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
);

const SectionHeader = ({ icon, title }: any) => (
    <div className="flex items-center gap-3 text-slate-400 pb-4 border-b border-slate-100">
        {icon}
        <span className="uppercase tracking-widest text-xs font-bold">{title}</span>
    </div>
);

const LiturgyItem = ({ label, content }: any) => (
    <div>
        <div className="text-sm font-medium text-slate-400 mb-1">{label}</div>
        <div className="text-xl text-slate-800 font-serif leading-relaxed">{content}</div>
    </div>
);

const Badge = ({ label, value, color = 'blue' }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return (
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
            <div className="text-xs font-bold opacity-60 uppercase mb-1">{label}</div>
            <div className="font-semibold truncate">{value}</div>
        </div>
    );
}

export default AnchorCard;
