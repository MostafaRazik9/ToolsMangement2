import React, { useState } from 'react';
import { DefectItem, AppUser } from '../types';
import { useLanguage } from '../contexts/languageContext';
import PerformAuditModal from './PerformAuditModal';

interface ToolAuditViewProps {
  items: DefectItem[];
  onPerformAudit: (toolId: string, auditData: { auditDate: string; auditor: string; comment: string }) => void;
  currentUser: AppUser;
}

const ToolAuditView: React.FC<ToolAuditViewProps> = ({ items, onPerformAudit, currentUser }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<DefectItem | null>(null);

  const handleOpenModal = (item: DefectItem) => {
    setSelectedTool(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTool(null);
  };

  const handleConfirmAudit = (auditData: { auditDate: string; auditor: string; comment: string }) => {
    if (selectedTool) {
      onPerformAudit(selectedTool.id, auditData);
      alert(t('auditSuccess'));
    }
    handleCloseModal();
  };

  const headers = [
    t('dbToolId'), t('dbDescription'), t('dbOwnerName'), t('dbNextAudit'), t('dbActions')
  ];

  return (
    <>
      <div className="bg-ui-dark-gray p-6">
        <h2 className="text-2xl font-bold text-white">{t('toolAuditTitle')}</h2>
        <p className="text-gray-400 mt-1 mb-6">{t('toolAuditSubtitle')}</p>
        
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
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={headers.length} className="px-3 py-10 text-center text-sm text-gray-400">
                          {t('noToolsForAudit')}
                        </td>
                      </tr>
                    ) : (
                      items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-800">
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white font-medium">{item.toolId}</td>
                          <td className="px-3 py-4 text-sm text-gray-400 max-w-sm truncate" title={item.description}>{item.description}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{item.ownerName}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-red-500 font-semibold">{item.nextAuditDue}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="btn h-8 px-3"
                              title={t('performAudit')}
                            >
                              {t('performAudit')}
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
      {selectedTool && (
        <PerformAuditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAudit}
          tool={selectedTool}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default ToolAuditView;