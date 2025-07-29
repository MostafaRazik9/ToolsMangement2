import React, { useState } from 'react';
import { AppUser } from '../types';
import { TrashIcon, DownloadIcon, UploadIcon, PencilIcon, CheckIcon, XIcon } from './icons';
import { useLanguage } from '../contexts/languageContext';

interface AppUsersDatabaseViewProps {
  users: AppUser[];
  onRemoveUser: (id: string) => void;
  onUpdateUser: (id: string, user: AppUser) => void;
  onAddUsers: (users: Omit<AppUser, 'id'>[]) => void;
  currentUserId: string;
}

const AppUsersDatabaseView: React.FC<AppUsersDatabaseViewProps> = ({ users, onRemoveUser, onUpdateUser, onAddUsers, currentUserId }) => {
  const { t } = useLanguage();
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<AppUser | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const headers = [t('username'), t('password'), t('appUserRole'), t('appUserToolOwnerId'), t('dbActions')];
  const templateHeaders = ['username', 'password', 'role', 'toolOwnerId'];

  const handleEditClick = (user: AppUser) => {
    setEditingRowId(user.id);
    setEditedUser({ ...user });
  };
  
  const handleCancelClick = () => {
    setEditingRowId(null);
    setEditedUser(null);
  };
  
  const handleSaveClick = () => {
    if (editedUser) {
      onUpdateUser(editedUser.id, editedUser);
      handleCancelClick();
    }
  };
  
  const handleInputChange = (field: keyof AppUser, value: any) => {
    if (editedUser) {
        setEditedUser(prev => prev ? { ...prev, [field]: value } : null);
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
    link.setAttribute('download', 'app-users-template.csv');
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
      
      const newUsers: Omit<AppUser, 'id'>[] = [];
      let skippedCount = 0;
      
      dataRows.forEach(line => {
        const values = line.split(',');
        const rowData: { [key: string]: string } = {};
        fileHeaders.forEach((header, index) => {
          rowData[header] = values[index]?.trim();
        });

        if (!rowData.username || !rowData.password || !rowData.role) {
          skippedCount++;
          return;
        }
        
        const newUser: Omit<AppUser, 'id'> = {
          username: rowData.username,
          password: rowData.password,
          role: rowData.role as 'Admin' | 'Supervisor' | 'Technician',
          toolOwnerId: rowData.toolOwnerId || '',
        };
        newUsers.push(newUser);
      });
      
      if (newUsers.length > 0) {
        onAddUsers(newUsers);
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
  
  const TdSelect = ({ value, onChange, options }: {value:string, onChange:(e:any)=>void, options: {val:string, label:string}[]}) => (
       <select value={value} onChange={onChange} className="w-full bg-ui-gray p-1 border-none rounded-none focus:outline-none focus:ring-1 focus:ring-gray-500">
          {options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
      </select>
  );

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-white">{t('appUsersDatabaseTitle')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleImportClick} className="btn btn-secondary gap-2">
              <UploadIcon /> {t('importFromCsv')}
          </button>
          <button onClick={handleDownloadTemplate} className="btn btn-secondary gap-2">
              <DownloadIcon /> {t('downloadTemplate')}
          </button>
          <button onClick={() => exportToCsv(users, 'app-users-database.csv')} disabled={users.length === 0} className="btn btn-secondary gap-2">
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
                  {users.length === 0 ? (
                    <tr><td colSpan={headers.length} className="px-3 py-10 text-center text-sm text-gray-400">{t('noAppUsersInDb')}</td></tr>
                  ) : (
                    users.map((user, index) => {
                      const isEditing = editingRowId === user.id;
                      return (
                      <tr key={user.id} className={isEditing ? 'bg-gray-800' : ''}>
                        {isEditing && editedUser ? (
                          <>
                            <td className="p-1"><TdInput value={editedUser.username} onChange={e => handleInputChange('username', e.target.value)} /></td>
                            <td className="p-1"><TdInput value={editedUser.password} onChange={e => handleInputChange('password', e.target.value)} /></td>
                            <td className="p-1">
                              <TdSelect value={editedUser.role} onChange={e => handleInputChange('role', e.target.value)} options={[{val:'Admin', label:'Admin'},{val:'Supervisor', label:'Supervisor'},{val:'Technician', label:'Technician'}]} />
                            </td>
                            <td className="p-1"><TdInput value={editedUser.toolOwnerId} onChange={e => handleInputChange('toolOwnerId', e.target.value)} /></td>
                          </>
                        ) : (
                          <>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">{user.username}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.password}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.role}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{user.toolOwnerId}</td>
                          </>
                        )}
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                           <div className="flex items-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button onClick={handleSaveClick} className="p-1 text-green-500 hover:text-white rounded-full hover:bg-green-500 transition-colors" title={t('save')}><CheckIcon className="w-5 h-5" /></button>
                                    <button onClick={handleCancelClick} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-500 transition-colors" title={t('cancel')}><XIcon className="w-5 h-5" /></button>
                                  </>
                                ) : (
                                  <button onClick={() => handleEditClick(user)} className="p-1 text-blue-500 hover:text-white rounded-full hover:bg-blue-500 transition-colors" title={t('edit')}><PencilIcon className="w-5 h-5" /></button>
                                )}
                                <button onClick={() => onRemoveUser(user.id)} disabled={user.id === currentUserId} className="p-1 text-red-500 hover:text-white rounded-full hover:bg-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title={t('removeFromDatabase')}><TrashIcon className="w-5 h-5" /></button>
                           </div>
                        </td>
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

export default AppUsersDatabaseView;