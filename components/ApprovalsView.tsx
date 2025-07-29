import React, { useState } from 'react';
import { DefectReport, DefectItem } from '../types';
import { useLanguage } from '../contexts/languageContext';
import { CheckIcon, XIcon } from './icons';

interface ApprovalsViewProps {
  reports: DefectReport[];
  onAction: (reportId: string, isApproved: boolean) => void;
}

const ReportDetailsModal: React.FC<{ report: DefectReport, onClose: () => void, onAction: (reportId: string, isApproved: boolean) => void }> = ({ report, onClose, onAction }) => {
    const { t } = useLanguage();

    const handleApprove = () => {
        onAction(report.id, true);
        onClose();
    }

    const handleReject = () => {
        onAction(report.id, false);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-ui-dark-gray shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{t('reportDetails')}: <span className="text-gray-300">{report.id}</span></h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-4 text-sm">
                        <p><span className="text-gray-400">{t('dfrDate')}:</span> <span className="text-white font-medium">{report.dfrDate}</span></p>
                        <p><span className="text-gray-400">{t('ownerName')}:</span> <span className="text-white font-medium">{report.ownerName}</span></p>
                        <p><span className="text-gray-400">{t('ownerId')}:</span> <span className="text-white font-medium">{report.ownerId}</span></p>
                        <p><span className="text-gray-400">{t('submittedBy')}:</span> <span className="text-white font-medium">{report.submittedBy}</span></p>
                        <p><span className="text-gray-400">{t('department')}:</span> <span className="text-white font-medium">{report.department}</span></p>
                        <p><span className="text-gray-400">{t('shift')}:</span> <span className="text-white font-medium">{report.shift}</span></p>
                    </div>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    {report.photo && (
                        <div>
                            <h4 className="font-semibold text-white mb-2">{t('attachedPhoto')}</h4>
                            <img src={report.photo} alt="Attached evidence" className="max-w-full md:max-w-sm" />
                        </div>
                    )}
                    <div>
                         <h4 className="font-semibold text-white mb-2">Defective Items ({report.items.length})</h4>
                         <div className="overflow-hidden">
                            <table className="min-w-full text-sm">
                                <thead className="bg-ui-gray">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-300">{t('toolId')}</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-300">{t('description')}</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-300">{t('comment')}</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-300">{t('status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.items.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2 text-white font-mono">{item.toolId}</td>
                                            <td className="px-3 py-2 text-gray-400">{item.description}</td>
                                            <td className="px-3 py-2 text-gray-400">{item.comment}</td>
                                            <td className="px-3 py-2 text-gray-400">{item.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>

                <div className="p-6 flex justify-end gap-3 bg-ui-gray">
                    <button onClick={onClose} className="btn btn-secondary">{t('close')}</button>
                    <button onClick={handleReject} className="btn bg-red-900/50 text-red-400 hover:bg-red-900 gap-2"><XIcon className="w-5 h-5" />{t('reject')}</button>
                    <button onClick={handleApprove} className="btn bg-green-900/50 text-green-400 hover:bg-green-900 gap-2"><CheckIcon className="w-5 h-5" />{t('approve')}</button>
                </div>
            </div>
        </div>
    )
}

const ApprovalsView: React.FC<ApprovalsViewProps> = ({ reports, onAction }) => {
  const { t } = useLanguage();
  const [selectedReport, setSelectedReport] = useState<DefectReport | null>(null);

  const headers = [
    t('id'), t('dfrDate'), t('submittedBy'), t('ownerName'), 'Items', t('dbActions')
  ];

  return (
    <>
      <div className="bg-ui-dark-gray p-6">
        <h2 className="text-2xl font-bold text-white">{t('approvalsTitle')}</h2>
        <p className="text-gray-400 mt-1 mb-6">{t('approvalsSubtitle')}</p>
        
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-ui-gray">
                    <tr>
                      {headers.map(h => (
                        <th key={h} scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={headers.length} className="px-3 py-10 text-center text-sm text-gray-400">
                          {t('noApprovals')}
                        </td>
                      </tr>
                    ) : (
                      reports.map(report => (
                        <tr key={report.id} className="hover:bg-gray-800">
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white font-medium">{report.id}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{report.dfrDate}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{report.submittedBy}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{report.ownerName}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{report.items.length}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="btn h-8 px-3"
                              title={t('viewDetails')}
                            >
                              {t('viewDetails')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedReport && (
        <ReportDetailsModal 
            report={selectedReport} 
            onClose={() => setSelectedReport(null)}
            onAction={onAction}
        />
      )}
    </>
  );
};

export default ApprovalsView;