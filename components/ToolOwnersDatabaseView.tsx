import React, { useState } from 'react';
import { ToolOwner } from '../types';
import { TrashIcon, DownloadIcon, UploadIcon, PencilIcon, CheckIcon, XIcon } from './icons';
import { useLanguage } from '../contexts/languageContext';

interface ToolOwnersDatabaseViewProps {
  owners: ToolOwner[];
  onRemoveOwner: (id: string) => void;
  onUpdateOwner: (id: string, owner: ToolOwner) => void;
  onAddOwners: (owners: Omit<ToolOwner, 'id'>[]) => void;
  isAdmin: boolean;
}

const ToolOwnersDatabaseView: React.FC<ToolOwnersDatabaseViewProps> = ({ owners, onRemoveOwner, onUpdateOwner, onAddOwners, isAdmin }) => {
  const { t } = useLanguage();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedOwner, setEditedOwner] = useState<ToolOwner | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const headers = [
    t('ownerIdentifier'), t('ownerFullName'), t('ownerProfession'), t('ownerRank'),
    t('ownerDepartment'), t('ownerShift')
  ];
  if (isAdmin) headers.push(t('dbActions'));
  
  const templateHeaders = ['ownerId', 'ownerName', 'ownerTrade', 'ownerGrade', 'ownerDepartment', 'ownerShift'];

  const handleEditClick = (owner: ToolOwner) => {
    setEditingRowId(owner.id);
    setEditedOwner({ ...owner });
  };
  
  const handleCancelClick = () => {
    setEditingRowId(null);
    setEditedOwner(null);
  };
  
  const handleSaveClick = () => {
    if (editedOwner) {
      onUpdateOwner(editedOwner.id, editedOwner);
      handleCancelClick();
    }
  };
  
  const handleInputChange = (field: keyof ToolOwner, value: any) => {
    if (editedOwner) {
        setEditedOwner(prev => prev ? { ...prev, [field]: value } : null);
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
    link.setAttribute('download', 'owners-template.csv');
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
      
      const newOwners: Omit<ToolOwner, 'id'>[] = [];
      let skippedCount = 0;
      
      dataRows.forEach(line => {
        const values = line.split(',');
        const rowData: { [key: string]: string } = {};
        fileHeaders.forEach((header, index) => {
          rowData[header] = values[index]?.trim();
        });

        if (!rowData.ownerId || !rowData.ownerName) {
          skippedCount++;
          return;
        }
        
        const newOwner: Omit<ToolOwner, 'id'> = {
          ownerId: rowData.ownerId,
          ownerName: rowData.ownerName,
          ownerTrade: rowData.ownerTrade || '',
          ownerGrade: rowData.ownerGrade || '',
          ownerDepartment: rowData.ownerDepartment || '',
          ownerShift: rowData.ownerShift || '',
        };
        newOwners.push(newOwner);
      });
      
      if (newOwners.length > 0) {
        onAddOwners(newOwners);
        alert(`${t('importSuccess')} ${skippedCount > 0 ? t('requiredFieldsMissing') + ` (${skippedCount})` : ''}`);
      } else {
        alert(t('importError'));
      }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = '';
  };
  
  const TdInput = ({ value, onChange } : {value:any, onChange:(e:any)=>void}) => (
      <input type="text" value={value ?? ''} onChange={onChange} className="w-full bg-gray-700 p-1 border-none rounded-none focus:outline-none focus:ring-1 focus:ring-gray-500" />
  );

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-white">{t('ownersDatabaseTitle')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <>
              <button onClick={handleImportClick} className="btn btn-secondary gap-2">
                  <UploadIcon /> {t('importFromCsv')}
              </button>
              <button onClick={handleDownloadTemplate} className="btn btn-secondary gap-2">
                  <DownloadIcon /> {t('downloadTemplate')}
              </button>
            </>
          )}
          <button onClick={() => exportToCsv(owners, 'tool-owners-database.csv')} disabled={owners.length === 0} className="btn btn-secondary gap-2">
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
                  {owners.length === 0 ? (
                    <tr><td colSpan={headers.length} className="px-3 py-10 text-center text-sm text-gray-400">{t('noOwnersInDb')}</td></tr>
                  ) : (
                    owners.map((owner, index) => {
                      const isEditing = isAdmin && editingRowId === owner.id;
                      return (
                      <tr key={owner.id} className={isEditing ? 'bg-gray-800' : ''}>
                        {isEditing && editedOwner ? (
                           <>
                             <td className="p-1"><TdInput value={editedOwner.ownerId} onChange={e => handleInputChange('ownerId', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedOwner.ownerName} onChange={e => handleInputChange('ownerName', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedOwner.ownerTrade} onChange={e => handleInputChange('ownerTrade', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedOwner.ownerGrade} onChange={e => handleInputChange('ownerGrade', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedOwner.ownerDepartment} onChange={e => handleInputChange('ownerDepartment', e.target.value)} /></td>
                             <td className="p-1"><TdInput value={editedOwner.ownerShift} onChange={e => handleInputChange('ownerShift', e.target.value)} /></td>
                           </>
                        ) : (
                          <>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">{owner.ownerId}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{owner.ownerName}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{owner.ownerTrade}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{owner.ownerGrade}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{owner.ownerDepartment}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{owner.ownerShift}</td>
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
                                  <button onClick={() => handleEditClick(owner)} className="p-1 text-blue-500 hover:text-white rounded-full hover:bg-blue-500 transition-colors" title={t('edit')}><PencilIcon className="w-5 h-5" /></button>
                                )}
                                <button onClick={() => onRemoveOwner(owner.id)} className="p-1 text-red-500 hover:text-white rounded-full hover:bg-red-500 transition-colors" title={t('removeFromDatabase')}><TrashIcon className="w-5 h-5" /></button>
                              </div>
                            </td>
                        )}
                      </tr>
                    )})
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

export default ToolOwnersDatabaseView;