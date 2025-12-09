'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, startOfWeek, isMonday } from 'date-fns';
import { toast } from 'react-hot-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { WeeklyReportPDF } from './WeeklyReportPDF';

interface ReportData {
    meta: { weekStart: string; generatedAt: string };
    stats: { total: number; completed: number; pending: number; completionRate: number };
    highlights: Array<{ id: string; title: string; priority: string }>;
    actionItems: Array<{ id: string; title: string; priority: string }>;
}

export const WeeklyReport = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const res = await fetch(`/api/reports/weekly?date=${dateStr}`);
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to fetch report');

            setReport(json);
            toast.success('Report Generated!');
        } catch (e: any) {
            console.error(e);
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!report) return;

        const { stats, highlights, actionItems, meta } = report;

        const lines = [
            `📅 *Weekly Report: ${meta.weekStart}*`,
            `-----------------------------------`,
            `📊 *Summary*`,
            `• Completion Rate: ${stats.completionRate}%`,
            `• Completed: ${stats.completed} / ${stats.total}`,
            ``,
            `🏆 *Highlights*`,
            highlights.length === 0 ? `• (None)` : highlights.map(h => `• ${h.title}`).join('\n'),
            ``,
            `📝 *Action Items / Carry Over*`,
            actionItems.length === 0 ? `• (All clear!)` : actionItems.map(t => `• ${t.title}`).join('\n'),
        ];

        navigator.clipboard.writeText(lines.join('\n'));
        toast.success('Copied to Clipboard!');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Report Generator</h2>

            <div className="flex gap-4 items-end mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Week</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => date && setSelectedDate(startOfWeek(date, { weekStartsOn: 1 }))}
                        dateFormat="yyyy-MM-dd"
                        className="rounded-md border-gray-300 shadow-sm p-2 border text-gray-900"
                        popperClassName="!z-50"
                    />
                </div>
                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {report && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                            <div className="text-2xl font-bold text-green-700">{report.stats.completionRate}%</div>
                            <div className="text-xs text-green-600 font-medium uppercase">Completion</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                            <div className="text-2xl font-bold text-blue-700">{report.stats.completed}</div>
                            <div className="text-xs text-blue-600 font-medium uppercase">Done</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-center">
                            <div className="text-2xl font-bold text-orange-700">{report.stats.pending}</div>
                            <div className="text-xs text-orange-600 font-medium uppercase">Pending</div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">🏆 Highlights</h3>
                            {report.highlights.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No completed tasks yet.</p>
                            ) : (
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {report.highlights.map(h => <li key={h.id}>{h.title}</li>)}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">📝 Action Items</h3>
                            {report.actionItems.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">All tasks completed!</p>
                            ) : (
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {report.actionItems.map(h => <li key={h.id}>{h.title}</li>)}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={copyToClipboard}
                            className="flex-1 border border-gray-300 bg-gray-50 text-gray-700 py-2 rounded-md hover:bg-gray-100 transition flex items-center justify-center gap-2 font-medium"
                        >
                            📋 Copy Summary
                        </button>

                        <PDFDownloadLink
                            document={<WeeklyReportPDF data={report} />}
                            fileName={`weekly-report-${report.meta.weekStart}.pdf`}
                            className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium"
                        >
                            {({ blob, url, loading, error }) =>
                                loading ? 'Preparing PDF...' : '📄 Download PDF'
                            }
                        </PDFDownloadLink>
                    </div>
                </div>
            )}
        </div>
    );
};
