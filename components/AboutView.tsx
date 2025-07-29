import React from 'react';
import { useLanguage } from '../contexts/languageContext';

const AboutView: React.FC = () => {
    const { t } = useLanguage();

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">{title}</h3>
            <div className="text-gray-400 space-y-2">{children}</div>
        </div>
    );

    const Feature: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-4">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm">{children}</p>
        </div>
    );
    
    const Role: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
         <li className="mb-2">
            <strong className="text-white">{title}</strong>
            <span className="text-sm"> {children}</span>
        </li>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-ui-dark-gray">
            <h2 className="text-2xl font-bold text-white mb-4">{t('aboutTitle')}</h2>
            <p className="mb-8 text-gray-400">{t('aboutIntro')}</p>

            <Section title={t('aboutFeaturesTitle')}>
                <Feature title={t('aboutDashboardTitle')}>{t('aboutDashboardDesc')}</Feature>
                <Feature title={t('aboutDefectReportTitle')}>{t('aboutDefectReportDesc')}</Feature>
                <Feature title={t('aboutApprovalsTitle')}>{t('aboutApprovalsDesc')}</Feature>
                <Feature title={t('aboutToolAuditTitle')}>{t('aboutToolAuditDesc')}</Feature>
                <Feature title={t('aboutHandoverTitle')}>{t('aboutHandoverDesc')}</Feature>
                <Feature title={t('aboutDatabaseTitle')}>{t('aboutDatabaseDesc')}</Feature>
                <Feature title={t('aboutExportTitle')}>{t('aboutExportDesc')}</Feature>
                <Feature title={t('aboutAITitle')}>{t('aboutAIDesc')}</Feature>
            </Section>

            <Section title={t('howToUseTitle')}>
                <h4 className="text-md font-semibold text-white mb-3">{t('userRolesTitle')}</h4>
                <ul className="list-disc list-inside space-y-2 mb-4">
                   <Role title={t('adminRole')}>{t('adminRoleDesc')}</Role>
                   <Role title={t('supervisorRole')}>{t('supervisorRoleDesc')}</Role>
                   <Role title={t('technicianRole')}>{t('technicianRoleDesc')}</Role>
                </ul>
                
                <h4 className="text-md font-semibold text-white mb-3">{t('gettingStartedTitle')}</h4>
                 <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                    <li>{t('gettingStartedStep1')}</li>
                    <li>{t('gettingStartedStep2')}</li>
                    <li>{t('gettingStartedStep3')}</li>
                    <li>{t('gettingStartedStep4')}</li>
                </ol>
            </Section>
        </div>
    );
};

export default AboutView;