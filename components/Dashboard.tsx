

import React, { useMemo } from 'react';
import { DefectItem } from '../types';
import { useLanguage } from '../contexts/languageContext';
import { BoxIcon, WrenchIcon, WarningSignIcon, ChartBarIcon, HandoverIcon, CalendarCheckIcon, DollarIcon } from './icons';

const DashboardStatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconBgClass: string;
    iconTextClass: string;
    subtitle?: string;
}> = ({ title, value, icon, iconBgClass, iconTextClass, subtitle }) => (
    <div className="bg-ui-dark-gray p-5 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass} ${iconTextClass}`}>
            {icon}
        </div>
    </div>
);

const StatusLegend: React.FC<{ title: string; data: {label: string, value: number, color: string}[] }> = ({ title, data }) => (
    <div className="bg-ui-dark-gray p-5 h-full">
        <h3 className="font-semibold text-white mb-4">{title}</h3>
        <ul className="space-y-3">
            {data.map(item => (
                <li key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                        <span className="text-gray-400">{item.label}</span>
                    </div>
                    <span className="font-bold text-white">{item.value}</span>
                </li>
            ))}
        </ul>
    </div>
);

const RecentReports: React.FC<{ title: string, reports: DefectItem[] }> = ({ title, reports }) => (
    <div className="bg-ui-dark-gray p-5 h-full">
        <h3 className="font-semibold text-white mb-4">{title}</h3>
        <div className="space-y-4">
            {reports.length > 0 ? reports.map(report => (
                <div key={report.id}>
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-white">{report.standardToolName}</p>
                        <span className="text-xs font-semibold bg-yellow-900 text-yellow-300 px-2 py-1">MEDIUM</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 truncate">{report.description}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{report.lastAudit ? new Date(report.lastAudit).toLocaleDateString() : 'N/A'}</p>
                </div>
            )) : <p className="text-sm text-gray-400">No recent defect reports found.</p>}
        </div>
    </div>
);

interface DashboardProps {
    items: DefectItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
    const { t } = useLanguage();

    const stats = useMemo(() => {
        const totalTools = items.length;
        const activeTools = items.filter(i => i.status === 'In Service' && !i.defectFlag).length;
        const defectiveTools = items.filter(i => i.defectFlag).length;
        const openReports = defectiveTools; // Assuming one report per defective tool
        const criticalIssues = 0; // No data for this, default to 0
        const pendingHandovers = 0; // No data for this, default to 0
        const needsAudit = items.filter(i => i.nextAuditDue && new Date(i.nextAuditDue) < new Date()).length;
        const totalAssetValue = items.reduce((sum, item) => sum + (item.cost || 0), 0);

        const statusCounts = items.reduce((acc, item) => {
             const status = item.defectFlag ? t('defective') : (item.status === 'In Service' ? t('active') : t('maintenance'));
             acc[status] = (acc[status] || 0) + 1;
             return acc;
        }, {} as Record<string, number>);

        const statusBreakdown = [
            { label: t('active'), value: statusCounts[t('active')] || 0, color: 'bg-green-500' },
            { label: t('defective'), value: statusCounts[t('defective')] || 0, color: 'bg-red-500' },
            { label: t('maintenance'), value: statusCounts[t('maintenance')] || 0, color: 'bg-yellow-500' },
        ];
        
        const recentDefectReports = items.filter(i => i.defectFlag).slice(0, 3);

        return { totalTools, activeTools, defectiveTools, openReports, criticalIssues, pendingHandovers, needsAudit, totalAssetValue, statusBreakdown, recentDefectReports };
    }, [items, t]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white">{t('dashboardTitle')}</h2>
            <p className="text-gray-400 mt-1 mb-6">{t('dashboardSubtitle')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <DashboardStatCard title={t('totalTools')} value={stats.totalTools} icon={<BoxIcon />} iconBgClass="bg-blue-900/50" iconTextClass="text-blue-400" />
                <DashboardStatCard title={t('activeTools')} value={stats.activeTools} icon={<WrenchIcon />} iconBgClass="bg-green-900/50" iconTextClass="text-green-400" />
                <DashboardStatCard title={t('defectiveTools')} value={stats.defectiveTools} icon={<WarningSignIcon />} iconBgClass="bg-red-900/50" iconTextClass="text-red-400" subtitle="Click to view details" />
                <DashboardStatCard title={t('openReports')} value={stats.openReports} icon={<ChartBarIcon />} iconBgClass="bg-yellow-900/50" iconTextClass="text-yellow-400" />
                <DashboardStatCard title={t('criticalIssues')} value={stats.criticalIssues} icon={<WarningSignIcon />} iconBgClass="bg-red-900/50" iconTextClass="text-red-400" />
                <DashboardStatCard title={t('pendingHandovers')} value={stats.pendingHandovers} icon={<HandoverIcon />} iconBgClass="bg-purple-900/50" iconTextClass="text-purple-400" />
                <DashboardStatCard title={t('toolsNeedingAudit')} value={stats.needsAudit} icon={<CalendarCheckIcon />} iconBgClass="bg-orange-900/50" iconTextClass="text-orange-400" subtitle="Click to view details" />
                <DashboardStatCard title={t('totalAssetValue')} value={`$${stats.totalAssetValue.toLocaleString('en-US')}`} icon={<DollarIcon />} iconBgClass="bg-teal-900/50" iconTextClass="text-teal-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1">
                    <StatusLegend title={t('toolStatusBreakdown')} data={stats.statusBreakdown} />
                 </div>
                 <div className="lg:col-span-2">
                    <RecentReports title={t('recentDefectReports')} reports={stats.recentDefectReports} />
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;