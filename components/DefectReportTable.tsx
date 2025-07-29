import React from 'react';
import { DefectItem } from '../types';
import { TrashIcon, SparklesIcon, LoadingSpinner } from './icons';
import { useLanguage } from '../contexts/languageContext';

interface DefectReportTableProps {
  items: DefectItem[];
  onUpdateItem: (id: string, field: keyof DefectItem, value: any) => void;
  onRemoveItem: (id: string) => void;
  onGetSuggestion: (id: string) => void;
  suggestionLoadingState: { [key: string]: boolean };
}

const DefectReportTable: React.FC<DefectReportTableProps> = ({ items, onUpdateItem, onRemoveItem, onGetSuggestion, suggestionLoadingState }) => {
  const { t } = useLanguage();

  const handleInputChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.getAttribute('type') === 'number';
    onUpdateItem(id, name as keyof DefectItem, isNumber ? parseFloat(value) : value);
  };

  const headers = [t('toolId'), t('serial'), t('description'), t('status'), t('defectType'), t('qty'), t('recommendedAction'), t('comment'), t('actions')];
  
  const commonInputClass = "w-full p-2 bg-ui-gray rounded-none text-sm text-white read-only:bg-ui-dark-gray read-only:cursor-not-allowed";
  const commonTextareaClass = "w-full min-w-[200px] p-2 bg-ui-gray rounded-none text-sm text-white read-only:bg-ui-dark-gray read-only:cursor-not-allowed";

  return (
    <div className="mt-6 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div>
            <table className="min-w-full">
              <thead>
                <tr>
                  {headers.map(header => (
                    <th key={header} scope="col" className="px-4 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="px-4 py-10 text-left text-sm text-gray-400">
                      {t('noDefectItems')}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                        <input type="text" name="toolId" value={item.toolId} onChange={(e) => handleInputChange(item.id, e)} className={`${commonInputClass} w-24`} readOnly />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                        <input type="text" name="serial" value={item.serial} onChange={(e) => handleInputChange(item.id, e)} className={`${commonInputClass} w-24`} readOnly />
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        <textarea name="description" value={item.description} onChange={(e) => handleInputChange(item.id, e)} className={commonTextareaClass} rows={2} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                         <select name="status" value={item.status} onChange={(e) => handleInputChange(item.id, e)} className={`${commonInputClass} w-36`}>
                            <option value="New">{t('statusNew')}</option>
                            <option value="Needs Inspection">{t('statusNeedsInspection')}</option>
                            <option value="Repairable">{t('statusRepairable')}</option>
                            <option value="Scrap">{t('statusScrap')}</option>
                         </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                         <select name="defectType" value={item.defectType || ''} onChange={(e) => handleInputChange(item.id, e)} className={`${commonInputClass} w-40`}>
                            <option value="">Select...</option>
                            <option value="Misuse">{t('defectTypeMisuse')}</option>
                            <option value="Wear and Tear">{t('defectTypeWearAndTear')}</option>
                         </select>
                      </td>
                       <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                        <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleInputChange(item.id, e)} className={`${commonInputClass} w-16`} />
                      </td>
                       <td className="px-4 py-3 text-sm text-white">
                        <textarea name="recommendedAction" value={item.recommendedAction} onChange={(e) => handleInputChange(item.id, e)} className={commonTextareaClass} rows={2} readOnly />
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        <textarea name="comment" value={item.comment} onChange={(e) => handleInputChange(item.id, e)} className={commonTextareaClass} rows={2} />
                      </td>
                      <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                         <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => onGetSuggestion(item.id)}
                                disabled={suggestionLoadingState[item.id] || !item.description}
                                className="inline-flex items-center justify-center p-2 text-white hover:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                                title={!item.description ? t('enterDescriptionForSuggestion') : t('getAiSuggestion')}
                            >
                                {suggestionLoadingState[item.id] ? <LoadingSpinner /> : <SparklesIcon />}
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                className="p-2 text-red-500 hover:text-white hover:bg-red-500/80 transition-colors"
                                title={t('removeItem')}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                         </div>
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
  );
};

export default DefectReportTable;