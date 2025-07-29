import React, { useState } from 'react';
import { DefectItem, ToolOwner } from '../types';
import { TrashIcon, DownloadIcon, UploadIcon, PencilIcon, CheckIcon, XIcon, RefreshIcon } from './icons';
import { useLanguage } from '../contexts/languageContext';

interface DatabaseViewProps {
  items: DefectItem[];
  toolOwners: ToolOwner[];
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, item: DefectItem) => void;
  onBatchUpdate: (items: DefectItem[]) => void;
  onAddItems: (items: Omit<DefectItem, 'id'>[]) => void;
  isAdmin: boolean;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ items, toolOwners, onRemoveItem, onUpdateItem, onBatchUpdate, onAddItems, isAdmin }) => {
  const { t } = useLanguage();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<DefectItem | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const headers = [
    t('dbToolId'), t('dbSerial'), t('dbDescription'), t('dbCategory'), t('dbQuantity'),
    t('dbStandardToolName'), t('dbCost'), t('dbToolBrand'), t('dbOwnerId'), t('dbOwnerName'),
    t('dbOwnerTrade'), t('dbOwnerGrade'), t('dbOwnerDepartment'), t('dbOwnerShift'),
    t('dbHandoverDate'), t('dbStatus'), t('defectType'), t('dbLastAudit'), t('dbAuditor'), t('dbNextAudit'),
    t('dbDefectFlag'), t('dbScrapDate'), t('dbComments'), t('dbDefectReportNumber'),
  ];
  if(isAdmin) headers.push(t('dbActions'));

  const templateHeaders = [
    'toolId', 'serial', 'description', 'category', 'quantity', 'standardToolName', 'cost', 'toolBrand', 'ownerId', 'ownerName', 'ownerTrade', 'ownerGrade', 'ownerDepartment', 'ownerShift', 'handoverDate', 'status', 'defectType', 'lastAudit', 'auditor', 'nextAuditDue', 'defectFlag', 'scrapDate', 'comment', 'defectReportNumber'
  ];

  const handleEditClick = (item: DefectItem) => {
    setEditingRowId(item.id);
    setEditedItem({ ...item });
  };
  
  const handleCancelClick = () => {
    setEditingRowId(null);
    setEditedItem(null);
  };
  
  const handleSaveClick = () => {
    if (editedItem) {
      onUpdateItem(editedItem.id, editedItem);
      handleCancelClick();
    }
  };
  
  const handleInputChange = (field: keyof DefectItem, value: any) => {
    if (editedItem) {
        setEditedItem(prev => prev ? { ...prev, [field]: value } : null);
    }
  };
  
  const exportToCsv = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
                cell = cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell.replace(/"/g, '""')}"` : cell;
                return cell;
            }).join(',')
        )
    ];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const csvString = templateHeaders.join(',');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'tools-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert(t('importError'));
        return;
      }

      const fileHeaders = lines[0].split(',').map(h => h.trim());
      const dataRows = lines.slice(1);

      const newItems: Omit<DefectItem, 'id'>[] = [];
      let skippedCount = 0;

      dataRows.forEach(line => {
        const values = line.split(',');
        const rowData: { [key: string]: string } = {};
        fileHeaders.forEach((header, index) => {
          rowData[header] = values[index]?.trim();
        });

        if (!rowData.toolId || !rowData.description) {
          skippedCount++;
          return;
        }
        
        const newItem: Omit<DefectItem, 'id'> = {
          toolId: rowData.toolId || '',
          serial: rowData.serial || '',
          description: rowData.description || '',
          category: rowData.category || '',
          quantity: parseInt(rowData.quantity, 10) || 1,
          standardToolName: rowData.standardToolName || '',
          cost: parseFloat(rowData.cost) || 0,
          toolBrand: rowData.toolBrand || '',
          ownerId: rowData.ownerId || '',
          ownerName: rowData.ownerName || '',
          ownerTrade: rowData.ownerTrade || '',
          ownerGrade: rowData.ownerGrade || '',
          ownerDepartment: rowData.ownerDepartment || '',
          ownerShift: rowData.ownerShift || '',
          handoverDate: rowData.handoverDate || '',
          status: (rowData.status as any) || 'In Service',
          defectType: (rowData.defectType as any) || '',
          lastAudit: rowData.lastAudit || '',
          auditor: rowData.auditor || '',
          nextAuditDue: rowData.nextAuditDue || '',
          defectFlag: String(rowData.defectFlag).toLowerCase() === 'true',
          scrapDate: rowData.scrapDate || '',
          comment: rowData.comment || '',
          defectReportNumber: rowData.defectReportNumber || '',
          recommendedAction: '',
        };
        newItems.push(newItem);
      });
      
      if (newItems.length > 0) {
        onAddItems(newItems);
        alert(`${t('importSuccess')} ${skippedCount > 0 ? t('requiredFieldsMissing') + ` (${skippedCount})` : ''}`);
      } else {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = ''; // Reset file input
  };

  const handleSyncWithOwners = () => {
    const ownerMap = new Map(toolOwners.map(o => [o.ownerId, o]));
    const updatedItems = items.map(tool => {
        const owner = ownerMap.get(tool.ownerId);
        if (owner) {
            return {
                ...tool,
                ownerName: owner.ownerName,
                ownerTrade: owner.ownerTrade,
                ownerGrade: owner.ownerGrade,
                ownerDepartment: owner.ownerDepartment,
                ownerShift: owner.ownerShift,
            };
        }
        return tool;
    });
    onBatchUpdate(updatedItems);
    alert(t('syncSuccess'));
  };
  
  const TdInput = ({ value, onChange, type = 'text' } : {value:any, onChange:(e:any)=>void, type?:string}) => (
      <input type={type} value={value ?? ''} onChange={onChange} className="w-full bg-gray-700 p-1 border-none rounded-none focus:outline-none focus:ring-1 focus:ring-gray-500" />
  );
  
  const TdSelect = ({ value, onChange, options }: {value:string, onChange:(e:any)=>void, options: {val:string, label:string}[]}) => (
       <select value={value} onChange={onChange} className="w-full bg-ui-gray p-1 border-none rounded-none focus:outline-none focus:ring-1 focus:ring-gray-500">
          {options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
      </select>
  );

  const TdCheckbox = ({ checked, onChange } : {checked:boolean, onChange:(e:any)=>void}) => (
    <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 text-gray-400 bg-ui-gray border-none rounded-none focus:ring-gray-500" />
  );

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-white">{t('databaseTitle')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <>
              <button onClick={handleSyncWithOwners} className="btn btn-secondary gap-2">
                  <RefreshIcon /> {t('updateFromOwners')}
              </button>
               <button onClick={handleImportClick} className="btn btn-secondary gap-2">
                  <UploadIcon /> {t('importFromCsv')}
              </button>
              <button onClick={handleDownloadTemplate} className="btn btn-secondary gap-2">
                  <DownloadIcon /> {t('downloadTemplate')}
              </button>
            </>
          )}
          <button onClick={() => exportToCsv(items, 'tools-database.csv')} disabled={items.length === 0} className="btn btn-secondary gap-2">
              <DownloadIcon /> {t('exportToCsv')}
          </button>
        </div>
      </div>
      <div className="flow-root mt-6">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead>
                  <tr>{headers.map(h => <th key={h} scope="col" className="px-3 py-3.5 text-left text-xs font-bold text-white uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={headers.length} className="px-3 py-10 text-center text-sm text-gray-400">{t('noDatabaseItems')}</td></tr>
                  ) : (
                    items.map((item, index) => {
                      const isEditing = isAdmin && editingRowId === item.id;
                      return (
                      <tr key={item.id} className={isEditing ? 'bg-gray-800' : ''}>
                        {isEditing && editedItem ? (
                           <>
                             <td className="p-1"><TdInput value={editedItem.toolId} onChange={e => handleInputChange('toolId', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.serial} onChange={e => handleInputChange('serial', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.description} onChange={e => handleInputChange('description', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.category} onChange={e => handleInputChange('category', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.quantity} onChange={e => handleInputChange('quantity', parseInt(e.target.value, 10))} type="number" /></td>
                             <td className="p-1"><TdInput value={editedItem.standardToolName} onChange={e => handleInputChange('standardToolName', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.cost} onChange={e => handleInputChange('cost', parseFloat(e.target.value))} type="number"/></td>
                             <td className="p-1"><TdInput value={editedItem.toolBrand} onChange={e => handleInputChange('toolBrand', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.ownerId} onChange={e => handleInputChange('ownerId', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.ownerName} onChange={e => handleInputChange('ownerName', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.ownerTrade} onChange={e => handleInputChange('ownerTrade', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.ownerGrade} onChange={e => handleInputChange('ownerGrade', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.ownerDepartment} onChange={e => handleInputChange('ownerDepartment', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.ownerShift} onChange={e => handleInputChange('ownerShift', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.handoverDate} onChange={e => handleInputChange('handoverDate', e.target.value)} type="date" /></td>
                             <td className="p-1"><TdSelect value={editedItem.status || ''} onChange={e => handleInputChange('status', e.target.value)} options={[{val:'In Service', label:t('statusInService')},{val:'Needs Inspection', label:t('statusNeedsInspection')},{val:'Repairable', label:t('statusRepairable')},{val:'Scrap', label:t('statusScrap')}]} /></td>
                             <td className="p-1"><TdSelect value={editedItem.defectType || ''} onChange={e => handleInputChange('defectType', e.target.value)} options={[{val:'', label:'N/A'},{val:'Misuse', label:t('defectTypeMisuse')},{val:'Wear and Tear', label:t('defectTypeWearAndTear')}]} /></td>
                             <td className="p-1"><TdInput value={editedItem.lastAudit} onChange={e => handleInputChange('lastAudit', e.target.value)} type="date" /></td>
                             <td className="p-1"><TdInput value={editedItem.auditor} onChange={e => handleInputChange('auditor', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.nextAuditDue} onChange={e => handleInputChange('nextAuditDue', e.target.value)} type="date" /></td>
                             <td className="p-1 text-center"><TdCheckbox checked={!!editedItem.defectFlag} onChange={e => handleInputChange('defectFlag', e.target.checked)} /></td>
                             <td className="p-1"><TdInput value={editedItem.scrapDate} onChange={e => handleInputChange('scrapDate', e.target.value)} type="date" /></td>
                             <td className="p-1"><TdInput value={editedItem.comment} onChange={e => handleInputChange('comment', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedItem.defectReportNumber} onChange={e => handleInputChange('defectReportNumber', e.target.value)} /></td>
                           </>
                        ) : (
                          <>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">{item.toolId}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.serial}</td>
                            <td className="px-3 py-4 text-sm text-gray-300 max-w-xs truncate" title={item.description}>{item.description}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.category}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">{item.quantity}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.standardToolName}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.cost != null ? `$${item.cost.toFixed(2)}` : ''}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.toolBrand}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.ownerId}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.ownerName}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.ownerTrade}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.ownerGrade}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.ownerDepartment}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.ownerShift}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.handoverDate}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">{item.status}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.defectType}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.lastAudit}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.auditor}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.nextAuditDue}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-center">{item.defectFlag ? <span className='text-red-500 font-bold'>Yes</span> : <span className='text-gray-400'>No</span>}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.scrapDate}</td>
                            <td className="px-3 py-4 text-sm text-gray-300 max-w-xs truncate" title={item.comment}>{item.comment}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.defectReportNumber}</td>
                          </>
                        )}
                        {isAdmin && (
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <div className="flex items-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button onClick={handleSaveClick} className="p-1 text-green-500 hover:text-white rounded-full hover:bg-green-500 transition-colors" title={t('save')}><CheckIcon className="w-5 h-5" /></button>
                                    <button onClick={handleCancelClick} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-500 transition-colors" title={t('cancel')}><XIcon className="w-5 h-5" /></button>
                                  </>
                                ) : (
                                  <button onClick={() => handleEditClick(item)} className="p-1 text-blue-500 hover:text-white rounded-full hover:bg-blue-500 transition-colors" title={t('edit')}><PencilIcon className="w-5 h-5" /></button>
                                )}
                                <button onClick={() => onRemoveItem(item.id)} className="p-1 text-red-500 hover:text-white rounded-full hover:bg-red-500 transition-colors" title={t('removeFromDatabase')}><TrashIcon className="w-5 h-5" /></button>
                               </div>
                            </td>
                        )}
                      </tr>
                    )}
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseView;