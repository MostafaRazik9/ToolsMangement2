
import React, { useState } from 'react';
import { DefectItem, ToolOwner } from '../types';
import { useLanguage } from '../contexts/languageContext';
import { PlusIcon, TrashIcon } from './icons';

interface AddToDatabaseFormProps {
  onAddItems: (items: Omit<DefectItem, 'id'>[]) => void;
  toolOwners: ToolOwner[];
}

const AddToDatabaseForm: React.FC<AddToDatabaseFormProps> = ({ onAddItems, toolOwners }) => {
  const { t } = useLanguage();

  const getInitialState = (): Omit<DefectItem, 'id'> => ({
    toolId: '', serial: '', description: '', category: '', quantity: 1,
    standardToolName: '', cost: 0, toolBrand: '', ownerId: '', ownerName: '',
    ownerTrade: '', ownerGrade: '', ownerDepartment: '', ownerShift: '',
    handoverDate: '', status: 'In Service', lastAudit: '', auditor: '',
    nextAuditDue: '', defectFlag: false, scrapDate: '', comment: '',
    defectReportNumber: '', recommendedAction: '', defectType: '',
  });

  const [items, setItems] = useState<Omit<DefectItem, 'id'>[]>([getInitialState()]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleItemChange = (index: number, field: keyof Omit<DefectItem, 'id'>, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    (item as any)[field] = value;
    setItems(newItems);
  };

  const handleOwnerIdBlur = (index: number, ownerId: string) => {
    if (!ownerId) return;
    const owner = toolOwners.find(o => o.ownerId.toLowerCase() === ownerId.toLowerCase());
    const newItems = [...items];
    
    if (owner) {
        newItems[index] = {
            ...newItems[index],
            ownerId: owner.ownerId, // Use correct casing
            ownerName: owner.ownerName,
            ownerTrade: owner.ownerTrade,
            ownerGrade: owner.ownerGrade,
            ownerDepartment: owner.ownerDepartment,
            ownerShift: owner.ownerShift,
        };
        setItems(newItems);
    } else {
        // Clear fields if owner not found, but keep the entered ID
        newItems[index] = {
            ...newItems[index],
            ownerName: '',
            ownerTrade: '',
            ownerGrade: '',
            ownerDepartment: '',
            ownerShift: '',
        };
        setItems(newItems);
        alert(t('ownerDataNotFound'));
    }
  };

  const handleAddItemRow = () => {
    setItems([...items, getInitialState()]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(item => item.toolId && item.description);
    if (validItems.length !== items.length) {
      alert(t('formAlert'));
      return;
    }
    onAddItems(validItems);
    setItems([getInitialState()]);
    setSuccessMessage(t('itemSavedSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const Input = ({ ...props }) => <input {...props} className="form-input py-1.5 px-2 read-only:bg-ui-dark-gray read-only:cursor-not-allowed" />;
  const Select = ({ ...props }) => <select {...props} className="form-select py-1.5 px-2" />;

  return (
    <div className="max-w-full mx-auto">
        <h2 className="text-xl font-bold text-white">{t('addToDatabaseTitle')}</h2>
        <p className="mt-1 text-sm text-gray-400">{t('addToDatabaseInstructions')}</p>

        <form onSubmit={handleSubmit} className="mt-6">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-ui-dark-gray">
                        <tr>
                            {[
                                t('toolIdRequired'), t('serialNo'), t('descriptionRequired'), t('category'), t('quantity'), t('standardToolName'), t('cost'), t('brand'),
                                t('ownerId'), t('owner'), t('ownerTrade'), t('ownerGrade'), t('ownerDepartment'), t('ownerShift'), t('handoverDate'),
                                t('status'), t('defectType'), t('lastAudit'), t('auditor'), t('nextAuditDue'), t('defectFlag'), t('scrapDate'), t('comments'),
                                t('defectReportNumber'), t('actions')
                            ].map(h => <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2"><Input value={item.toolId} onChange={e => handleItemChange(index, 'toolId', e.target.value)} /></td>
                                <td className="p-2"><Input value={item.serial} onChange={e => handleItemChange(index, 'serial', e.target.value)} /></td>
                                <td className="p-2"><Input value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} /></td>
                                <td className="p-2"><Input value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)} /></td>
                                <td className="p-2"><Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))} /></td>
                                <td className="p-2"><Input value={item.standardToolName} onChange={e => handleItemChange(index, 'standardToolName', e.target.value)} /></td>
                                <td className="p-2"><Input type="number" value={item.cost} onChange={e => handleItemChange(index, 'cost', parseFloat(e.target.value))} /></td>
                                <td className="p-2"><Input value={item.toolBrand} onChange={e => handleItemChange(index, 'toolBrand', e.target.value)} /></td>
                                <td className="p-2"><Input value={item.ownerId} onChange={e => handleItemChange(index, 'ownerId', e.target.value)} onBlur={e => handleOwnerIdBlur(index, e.target.value)} /></td>
                                <td className="p-2"><Input value={item.ownerName} onChange={() => {}} readOnly /></td>
                                <td className="p-2"><Input value={item.ownerTrade} onChange={() => {}} readOnly /></td>
                                <td className="p-2"><Input value={item.ownerGrade} onChange={() => {}} readOnly /></td>
                                <td className="p-2"><Input value={item.ownerDepartment} onChange={() => {}} readOnly /></td>
                                <td className="p-2"><Input value={item.ownerShift} onChange={() => {}} readOnly /></td>
                                <td className="p-2"><Input type="date" value={item.handoverDate} onChange={e => handleItemChange(index, 'handoverDate', e.target.value)} /></td>
                                <td className="p-2">
                                  <Select value={item.status} onChange={e => handleItemChange(index, 'status', e.target.value)}>
                                    <option value="In Service">{t('statusInService')}</option>
                                    <option value="Needs Inspection">{t('statusNeedsInspection')}</option>
                                    <option value="Repairable">{t('statusRepairable')}</option>
                                    <option value="Scrap">{t('statusScrap')}</option>
                                  </Select>
                                </td>
                                <td className="p-2">
                                  <Select value={item.defectType} onChange={e => handleItemChange(index, 'defectType', e.target.value)}>
                                    <option value="">N/A</option>
                                    <option value="Misuse">{t('defectTypeMisuse')}</option>
                                    <option value="Wear and Tear">{t('defectTypeWearAndTear')}</option>
                                  </Select>
                                </td>
                                <td className="p-2"><Input type="date" value={item.lastAudit} onChange={e => handleItemChange(index, 'lastAudit', e.target.value)} /></td>
                                <td className="p-2"><Input value={item.auditor} onChange={e => handleItemChange(index, 'auditor', e.target.value)} /></td>
                                <td className="p-2"><Input type="date" value={item.nextAuditDue} onChange={e => handleItemChange(index, 'nextAuditDue', e.target.value)} /></td>
                                <td className="p-2 text-center">
                                  <input type="checkbox" checked={!!item.defectFlag} onChange={e => handleItemChange(index, 'defectFlag', e.target.checked)} className="h-4 w-4 text-gray-400 bg-ui-gray border-none rounded-none focus:ring-gray-500" />
                                </td>
                                <td className="p-2"><Input type="date" value={item.scrapDate} onChange={e => handleItemChange(index, 'scrapDate', e.target.value)} /></td>
                                <td className="p-2"><Input value={item.comment} onChange={e => handleItemChange(index, 'comment', e.target.value)} /></td>
                                <td className="p-2"><Input value={item.defectReportNumber} onChange={e => handleItemChange(index, 'defectReportNumber', e.target.value)} /></td>
                                <td className="p-2">
                                    <button type="button" onClick={() => handleRemoveItemRow(index)} className="text-red-500 hover:text-red-400 disabled:text-gray-500" disabled={items.length <= 1}>
                                        <TrashIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <button type="button" onClick={handleAddItemRow} className="btn btn-secondary h-10 px-4 gap-2">
                    <PlusIcon />
                    {t('addAnotherItem')}
                </button>
                <div className="flex items-center space-x-4">
                    {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
                    <button type="submit" className="btn h-10 px-5">
                      {t('saveToDatabase')}
                    </button>
                </div>
            </div>
        </form>
    </div>
  );
};

export default AddToDatabaseForm;