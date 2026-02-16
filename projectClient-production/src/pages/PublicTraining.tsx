import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

// --- Types ---
interface CourseDate {
    date: string;
    highlight?: 'green' | 'yellow';
}

interface Course {
    id: string;
    title: string;
    days: number;
    method: 'F2F' | 'Online';
    professionalPoint: boolean;
    schedule: {
        jan?: CourseDate;
        feb?: CourseDate;
        mar?: CourseDate;
        apr?: CourseDate;
        may?: CourseDate;
        jun?: CourseDate;
    };
}

interface CategoryGroup {
    title: string;
    color: string; // Background color class for the header
    courses: Course[];
}

// --- Mock Data ---
const CALENDAR_DATA: CategoryGroup[] = [
    {
        title: 'HUMAN RESOURCES',
        color: 'bg-yellow-100',
        courses: [
            { id: 'hr-1', title: 'Effective Payroll Management', days: 2, method: 'F2F', professionalPoint: false, schedule: { may: { date: '5-6' } } },
            { id: 'hr-2', title: 'Training Needs Analysis (TNA)', days: 2, method: 'F2F', professionalPoint: false, schedule: { may: { date: '4-5' } } },
            { id: 'hr-3', title: 'Excel for Human Resources', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '29-30' } } },
            { id: 'hr-4', title: 'HR Compliance and Employment Law', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '1-2' } } },
            { id: 'hr-5', title: 'Talent Acquisition and Development Strategies', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '15-16' } } },
            { id: 'hr-6', title: 'Malaysian Foreign Labor Management', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '22-23' } } },
        ]
    },
    {
        title: 'SOFT SKILLS & ADMINISTRATION',
        color: 'bg-pink-100',
        courses: [
            { id: 'ss-1', title: 'Smart Office Communication: Mastering Minute Taking & Official Writing Skills', days: 2, method: 'F2F', professionalPoint: false, schedule: { jan: { date: '7-8', highlight: 'yellow' } } },
            { id: 'ss-2', title: 'Strategic Negotiation & Influencing Skills', days: 2, method: 'F2F', professionalPoint: false, schedule: { jan: { date: '22-23' } } },
            { id: 'ss-3', title: 'Emotional Intelligence for Workplace Success', days: 2, method: 'Online', professionalPoint: false, schedule: { mar: { date: '9-10' } } },
            { id: 'ss-4', title: 'Time Management and Productivity Boosters for Professionals', days: 2, method: 'Online', professionalPoint: false, schedule: { mar: { date: '4-5' } } },
            { id: 'ss-5', title: 'Creative Critical Thinking & Problem Solving', days: 2, method: 'Online', professionalPoint: false, schedule: { mar: { date: '10-11' } } },
            { id: 'ss-6', title: 'Effective Business Communication and Presentation Skills', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '21-22' } } },
            { id: 'ss-7', title: 'English Masterclass: Speak & Write Confidently at The Workplace', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '14-15' } } },
            { id: 'ss-8', title: 'Stress Management & Workplace Well-Being', days: 2, method: 'F2F', professionalPoint: false, schedule: { may: { date: '6-7' } } },
            { id: 'ss-9', title: 'Professional Secretary & Office Management', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '24-25' } } },
            { id: 'ss-10', title: 'Conflict Resolution and Negotiation Techniques', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '24-25' } } },
            { id: 'ss-11', title: 'Collaborative Skills & Effective Communication At Work', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '29-30' } } },
            { id: 'ss-12', title: 'Strategic Communications and Stakeholder Engagement for Business Success', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '15-16' } } },
        ]
    },
    {
        title: 'LEADERSHIP & MANAGEMENT',
        color: 'bg-red-100',
        courses: [
            { id: 'lm-1', title: 'Mastering The 6 Leadership Styles: Knowledge And Real Practice', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '22-23' } } },
            { id: 'lm-2', title: 'Successful Project Management', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '15-16' } } },
            { id: 'lm-3', title: 'Mindset Change and Effective Leadership Styles', days: 2, method: 'F2F', professionalPoint: false, schedule: { mar: { date: '30-31' } } },
        ]
    },
    {
        title: 'FINANCE & ACCOUNTS',
        color: 'bg-blue-50', // Light blue background
        courses: [
            { id: 'fa-1', title: 'Practical Cash Flow Management and Working Capital Optimization', days: 2, method: 'F2F', professionalPoint: false, schedule: { jan: { date: '26-27', highlight: 'yellow' }, apr: { date: '1-2', highlight: 'yellow' } } },
            { id: 'fa-2', title: 'Finance, Costing & Budgeting Analysis for Managers', days: 2, method: 'F2F', professionalPoint: false, schedule: { feb: { date: '11-12', highlight: 'green' } } },
            { id: 'fa-3', title: 'Finance for Non-Finance Professional', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '18-19' } } },
            { id: 'fa-4', title: 'E-Invoicing in Malaysia', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '23-24' } } },
        ]
    },
    {
        title: 'PROPERTY & REAL ESTATE',
        color: 'bg-green-100',
        courses: [
            { id: 'prop-1', title: 'Mall Marketing Power: Attract & Retain Top Tenants', days: 2, method: 'F2F', professionalPoint: true, schedule: { jan: { date: '19-20' }, apr: { date: '15-16' } } },
            { id: 'prop-2', title: 'Land Ownership & Dealing Rights under National Land Code', days: 2, method: 'F2F', professionalPoint: true, schedule: { jan: { date: '26-27' }, apr: { date: '22-23' } } },
            { id: 'prop-3', title: 'Strategic Asset Management: Best Practices for Maintenance, Compliance & ESG Goals', days: 2, method: 'F2F', professionalPoint: true, schedule: { jan: { date: '28-29' }, apr: { date: '15-16' } } },
            { id: 'prop-4', title: 'Beyond Rent: Exploring Legal Responsibilities of Landlord and Tenants', days: 2, method: 'F2F', professionalPoint: true, schedule: { feb: { date: '4-5', highlight: 'green' } } },
            { id: 'prop-5', title: 'Effective Tenancy Management: Best Practices & Legal Frameworks', days: 2, method: 'F2F', professionalPoint: true, schedule: { feb: { date: '3-4', highlight: 'green' }, may: { date: '18-19' } } },
            { id: 'prop-6', title: 'Property Tax Planning', days: 2, method: 'F2F', professionalPoint: true, schedule: { feb: { date: '3-4' }, jun: { date: '10-11' } } },
            { id: 'prop-7', title: 'Feasibility Studies for Successful Property Development', days: 2, method: 'F2F', professionalPoint: true, schedule: { apr: { date: '13-14' } } },
            { id: 'prop-8', title: 'Mastering Sale & Purchase Agreements', days: 2, method: 'F2F', professionalPoint: true, schedule: { feb: { date: '11-12', highlight: 'green' }, may: { date: '20-21' } } },
        ]
    },
    {
        title: 'BUILDINGS & FACILITIES',
        color: 'bg-gray-200', // Grey background
        courses: [
            { id: 'bf-1', title: 'A Practical Approach to Building Fire Safety, Health & Environment', days: 2, method: 'F2F', professionalPoint: true, schedule: { jan: { date: '26-27' } } },
            { id: 'bf-2', title: 'Building Facilities Management, Operation & Maintenance', days: 2, method: 'F2F', professionalPoint: true, schedule: { feb: { date: '4-5' } } },
            { id: 'bf-3', title: 'Smart Facilities Management (With Digital Technology)', days: 2, method: 'F2F', professionalPoint: true, schedule: { feb: { date: '9-10' } } },
            { id: 'bf-4', title: 'Facilities Management: Legal and Regulatory Compliance in Malaysia', days: 2, method: 'F2F', professionalPoint: true, schedule: { jun: { date: '23-24' } } },
        ]
    },
    {
        title: 'IT & SOFTWARE',
        color: 'bg-blue-100', // Light blue background
        courses: [
            { id: 'it-1', title: 'Microsoft Excel Basic & Intermediate', days: 2, method: 'F2F', professionalPoint: false, schedule: { jan: { date: '19-20' }, mar: { date: '30-31' } } },
            { id: 'it-2', title: 'Dashboard with Power BI Desktop', days: 2, method: 'F2F', professionalPoint: false, schedule: { jan: { date: '21-22' } } },
            { id: 'it-3', title: 'Advanced AI Mastery - Agentic AI', days: 2, method: 'F2F', professionalPoint: false, schedule: { jan: { date: '26-27' } } },
            { id: 'it-4', title: 'Advanced AI and ChatGPT for Secretarial and Administrative Professionals', days: 2, method: 'F2F', professionalPoint: false, schedule: { jan: { date: '28-29' }, feb: { date: '9-10' }, jun: { date: '24-25' } } },
            { id: 'it-5', title: 'AI for Secretarial and Administrative Professionals', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '22-23' }, may: { date: '11-12' } } },
            { id: 'it-6', title: 'Data Analysis and Dashboard Reporting using Microsoft Excel', days: 2, method: 'F2F', professionalPoint: false, schedule: { feb: { date: '24-25' } } },
            { id: 'it-7', title: 'AI for Social Media & Marketing', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '28-29' } } },
            { id: 'it-8', title: 'Microsoft PowerPoint (Basic & Intermediate)', days: 2, method: 'F2F', professionalPoint: false, schedule: { may: { date: '13-14' } } },
            { id: 'it-9', title: 'AI for Work Productivity', days: 2, method: 'F2F', professionalPoint: false, schedule: { may: { date: '18-19' } } },
            { id: 'it-10', title: 'Leveraging Artificial Intelligence in Modern Procurement: From Strategy to Implementation with Strategic Negotiation Insights', days: 2, method: 'F2F', professionalPoint: false, schedule: { feb: { date: '11-12' } } },
            { id: 'it-11', title: 'Excel Intermediate', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '10-11' } } },
            { id: 'it-12', title: 'Power BI Essential: Transform Data Into Actionable Insights', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '28-29' }, may: { date: '29-30' } } },
        ]
    },
    {
        title: 'CONFERENCE',
        color: 'bg-orange-100', // Peach/Light Orange background
        courses: [
            { id: 'conf-1', title: 'The Elite Secretaries and Administrators Conference 2026', days: 2, method: 'F2F', professionalPoint: false, schedule: { apr: { date: '22-23' } } },
            { id: 'conf-2', title: 'Malaysia PropLaw and Land Conference', days: 2, method: 'F2F', professionalPoint: true, schedule: { may: { date: '13-14' } } },
            { id: 'conf-3', title: 'ESG Conference 2026', days: 2, method: 'F2F', professionalPoint: false, schedule: { jun: { date: '29-30' } } },
        ]
    }
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'] as const;

export function PublicTraining() {
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

    const currentCategory = CALENDAR_DATA[currentCategoryIndex];
    const totalCategories = CALENDAR_DATA.length;

    const handleNext = () => {
        if (currentCategoryIndex < totalCategories - 1) {
            setCurrentCategoryIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentCategoryIndex > 0) {
            setCurrentCategoryIndex(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* Header Controls */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Training Calendar [Jan - June] 2026</h1>
                        <p className="text-sm text-gray-500">Public training schedule for H1 2026</p>
                    </div>
                    <a
                        href="/training-calendar-2026.pdf"
                        download="Training-Calendar-2026.pdf"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </a>
                </div>

                {/* Category Filter Bar */}
                <div className="w-full overflow-x-auto pb-2">
                    <div className="flex items-center min-w-max text-sm text-gray-500">
                        {CALENDAR_DATA.map((category, index) => (
                            <div key={category.title} className="flex items-center">
                                <button
                                    onClick={() => setCurrentCategoryIndex(index)}
                                    className={`whitespace-nowrap hover:text-gray-900 transition-colors uppercase font-medium px-2
                                        ${currentCategoryIndex === index ? 'text-blue-600 font-bold' : ''}
                                    `}
                                >
                                    {category.title}
                                </button>
                                {index < CALENDAR_DATA.length - 1 && (
                                    <span className="mx-1 text-gray-300">|</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Controls - Moved Here */}
                <div className="grid grid-cols-3 items-center border-t border-b border-gray-100 py-4">
                    <div className="justify-self-start">
                        <button
                            onClick={handlePrev}
                            disabled={currentCategoryIndex === 0}
                            className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </button>
                    </div>

                    <div className="justify-self-center text-center">
                        <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                            {currentCategory.title} <span className="text-gray-400 mx-2">|</span> Page <span className="font-bold text-gray-900">{currentCategoryIndex + 1}</span> of <span className="font-bold text-gray-900">{totalCategories}</span>
                        </span>
                    </div>

                    <div className="justify-self-end">
                        <button
                            onClick={handleNext}
                            disabled={currentCategoryIndex === totalCategories - 1}
                            className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>

                {/* Desktop/Tablet Calendar Grid */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                            <thead className="bg-gray-50 text-gray-900 font-medium">
                                {/* Category Header Row - Moved to Top */}
                                <tr className={`${currentCategory.color}`}>
                                    <th colSpan={4 + MONTHS.length} className="py-2 px-4 font-bold text-gray-900 uppercase tracking-wide border-b border-gray-200 text-left">
                                        {currentCategory.title}
                                    </th>
                                </tr>
                                {/* Column Headers */}
                                <tr>
                                    <th className="py-3 px-4 border-b border-r border-gray-200 w-1/3 min-w-[300px]">Courses Title</th>
                                    <th className="py-3 px-2 border-b border-gray-200 text-center w-16">Days</th>
                                    <th className="py-3 px-2 border-b border-gray-200 text-center w-24">Delivery Method</th>
                                    <th className="py-3 px-2 border-b border-r border-gray-200 text-center w-24">Professional Point</th>
                                    {MONTHS.map(month => (
                                        <th key={month} className="py-3 px-2 border-b border-gray-200 text-center w-24">{month}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Course Rows */}
                                {currentCategory.courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0">
                                        <td className="py-3 px-4 text-gray-900 font-medium border-r border-gray-200 break-words">
                                            {course.title}
                                        </td>
                                        <td className="py-3 px-2 text-center text-gray-600">
                                            {course.days}
                                        </td>
                                        <td className="py-3 px-2 text-center text-gray-600">
                                            {course.method}
                                        </td>
                                        <td className="py-3 px-2 text-center text-gray-600 border-r border-gray-200">
                                            {course.professionalPoint ? 'Yes' : 'No'}
                                        </td>

                                        {/* Month Columns */}
                                        {MONTHS.map(month => {
                                            const monthKey = month.toLowerCase().slice(0, 3) as keyof typeof course.schedule;
                                            const scheduleData = course.schedule[monthKey];

                                            return (
                                                <td key={month} className="py-3 px-1 text-center border-gray-100 border-r last:border-r-0">
                                                    {scheduleData ? (
                                                        <div className={`inline-block px-3 py-1 rounded text-xs font-semibold
                                                            ${scheduleData.highlight === 'green' ? 'bg-green-500 text-white' :
                                                                scheduleData.highlight === 'yellow' ? 'bg-yellow-400 text-gray-900' :
                                                                    'text-gray-900'}
                                                        `}>
                                                            {scheduleData.date}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
