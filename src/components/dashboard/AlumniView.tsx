import React from 'react';
import { Student } from '../../types';
import { GraduationCap, Scroll, Briefcase } from '@phosphor-icons/react';

interface AlumniViewProps {
    student: Student;
}

export const AlumniView: React.FC<AlumniViewProps> = ({ student }) => {
    const graduationDate = student.graduation_date
        ? new Date(student.graduation_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        : 'Unknown Date';

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full mb-4 ring-4 ring-indigo-100">
                    <GraduationCap size={48} className="text-indigo-600" weight="duotone" />
                </div>
                <h1 className="text-3xl font-serif font-medium text-slate-900">
                    Congratulations, {student.name}!
                </h1>
                <p className="text-slate-600 text-lg">
                    Class of {student.graduation_date ? new Date(student.graduation_date).getFullYear() : new Date().getFullYear()} • Graduated {graduationDate}
                </p>
            </div>

            {/* Legacy/Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Portfolio Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                <Scroll size={24} weight="duotone" />
                            </div>
                            <h2 className="text-xl font-medium text-slate-800">Learning Portfolio</h2>
                        </div>
                        <p className="text-slate-600 mb-6">
                            View the collection of milestones, projects, and creative works from {student.name}'s education journey.
                        </p>
                        <button className="w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                            View Complete Portfolio
                        </button>
                    </div>
                </div>

                {/* Work History Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <Briefcase size={24} weight="duotone" />
                            </div>
                            <h2 className="text-xl font-medium text-slate-800">Work & Service Record</h2>
                        </div>
                        <p className="text-slate-600 mb-6">
                            A record of apprenticeships, service projects, and professional experience gained during the school years.
                        </p>
                        <button className="w-full py-2.5 px-4 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                            View Work Record
                        </button>
                    </div>
                </div>
            </div>

            {/* Empty State / Coming Soon for future alumni features */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-8 text-center">
                <p className="text-slate-500 italic">
                    "The end of learning is to know God, and out of that knowledge to love him and to imitate him."
                    <br />— John Milton
                </p>
            </div>
        </div>
    );
};
