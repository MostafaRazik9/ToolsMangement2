import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DefectItem } from '../types';
import { useLanguage } from '../contexts/languageContext';

interface SelectToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSelectedTools: (tools: DefectItem[]) => void;
  ownerId: string;
  ownerName: string;
  toolsDatabase: DefectItem[];
  existingReportToolIds: Set<string>;
}

const SelectToolsModal: React.FC<SelectToolsModalProps> = ({ isOpen, onClose, onAddSelectedTools, ownerId, ownerName, toolsDatabase, existingReportToolIds }) => {
  const { t } = useLanguage();
  const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const ownerTools = useMemo(() => {
    return toolsDatabase.filter(tool => tool.ownerId === ownerId && !existingReportToolIds.has(tool.toolId));
  }, [toolsDatabase, ownerId, existingReportToolIds]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      const numSelected = selectedToolIds.size;
      const numTotal = ownerTools.length;
      selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numTotal;
    }
  }, [selectedToolIds, ownerTools.length]);

  const handleToggleSelection = (toolId: string) => {
    setSelectedToolIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(toolId)) {
        newSelection.delete(toolId);
      } else {
        newSelection.add(toolId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedToolIds(new Set(ownerTools.map(tool => tool.id)));
    } else {
      setSelectedToolIds(new Set());
    }
  };

  const handleSubmit = () => {
    const selectedTools = ownerTools.filter(tool => selectedToolIds.has(tool.id));
    onAddSelectedTools(selectedTools);
    onClose();
    setSelectedToolIds(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-ui-dark-gray p-6 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">
          {t('selectToolsForOwner')} <span className="text-gray-300">{ownerName} ({ownerId})</span>
        </h2>
        <div className="flex-grow overflow-y-auto mt-4">
          {ownerTools.length > 0 ? (
            <table className="min-w-full">
              <thead className="sticky top-0 bg-ui-dark-gray">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      className="h-4 w-4 bg-ui-gray border-none rounded-sm focus:ring-gray-500"
                      onChange={handleSelectAll}
                      checked={ownerTools.length > 0 && selectedToolIds.size === ownerTools.length}
                    />
                  </th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('toolId')}</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('description')}</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('serialNo')}</th>
                </tr>
              </thead>
              <tbody>
                {ownerTools.map(tool => (
                  <tr key={tool.id} className="hover:bg-gray-800 cursor-pointer" onClick={() => handleToggleSelection(tool.id)}>
                    <td className="p-4 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedToolIds.has(tool.id)}
                        onChange={(e) => {
                            e.stopPropagation(); // prevent row click from firing
                            handleToggleSelection(tool.id);
                        }}
                        className="h-4 w-4 bg-ui-gray border-none rounded-sm focus:ring-gray-500"
                      />
                    </td>
                    <td className="px-3 py-4 text-sm text-white whitespace-nowrap">{tool.toolId}</td>
                    <td className="px-3 py-4 text-sm text-gray-300">{tool.description}</td>
                    <td className="px-3 py-4 text-sm text-gray-300 whitespace-nowrap">{tool.serial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 text-gray-400">{t('noDatabaseItems')}</p>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn btn-secondary h-11 px-5">
            {t('cancel')}
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={selectedToolIds.size === 0}
            className="btn h-11 px-5"
          >
            {t('addSelectedTools')} ({selectedToolIds.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectToolsModal;