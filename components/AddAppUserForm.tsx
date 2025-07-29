
import React, { useState } from 'react';
import { AppUser } from '../types';
import { useLanguage } from '../contexts/languageContext';
import { PlusIcon, TrashIcon } from './icons';

interface AddAppUserFormProps {
  onAddUsers: (users: Omit<AppUser, 'id'>[]) => void;
}

const AddAppUserForm: React.FC<AddAppUserFormProps> = ({ onAddUsers }) => {
  const { t } = useLanguage();

  const getInitialState = (): Omit<AppUser, 'id'> => ({
    username: '',
    password: '',
    role: 'Technician',
    toolOwnerId: '',
  });

  const [users, setUsers] = useState<Omit<AppUser, 'id'>[]>([getInitialState()]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleUserChange = (index: number, field: keyof Omit<AppUser, 'id'>, value: string) => {
    const newUsers = [...users];
    (newUsers[index] as any)[field] = value;
    setUsers(newUsers);
  };

  const handleAddRow = () => {
    setUsers([...users, getInitialState()]);
  };

  const handleRemoveRow = (index: number) => {
    if (users.length > 1) {
      setUsers(users.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUsers = users.filter(user => user.username && user.password && user.role);
    if (validUsers.length !== users.length) {
      alert(t('formAlertAppUsers'));
      return;
    }
    onAddUsers(validUsers);
    setUsers([getInitialState()]);
    setSuccessMessage(t('appUsersSavedSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const Input = ({ ...props }) => <input {...props} className="form-input py-1.5 px-2" />;
  const Select = ({ ...props }) => <select {...props} className="form-select py-1.5 px-2" />;

  const headers = [t('username'), t('password'), t('appUserRole'), t('appUserToolOwnerId'), t('actions')];

  return (
    <div className="max-w-full mx-auto">
      <h2 className="text-xl font-bold text-white">{t('addAppUsersTitle')}</h2>
      <p className="mt-1 text-sm text-gray-400">{t('addAppUsersInstructions')}</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-ui-dark-gray">
              <tr>
                {headers.map(h => <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td className="p-2"><Input value={user.username} onChange={e => handleUserChange(index, 'username', e.target.value)} required /></td>
                  <td className="p-2"><Input value={user.password} onChange={e => handleUserChange(index, 'password', e.target.value)} required /></td>
                  <td className="p-2">
                    <Select value={user.role} onChange={e => handleUserChange(index, 'role', e.target.value)}>
                      <option value="Technician">Technician</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Admin">Admin</option>
                    </Select>
                  </td>
                  <td className="p-2"><Input value={user.toolOwnerId} onChange={e => handleUserChange(index, 'toolOwnerId', e.target.value)} placeholder="Optional"/></td>
                  <td className="p-2">
                     <button type="button" onClick={() => handleRemoveRow(index)} className="text-red-500 hover:text-red-400 disabled:text-gray-500" disabled={users.length <= 1}>
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button type="button" onClick={handleAddRow} className="btn btn-secondary h-10 px-4 gap-2">
            <PlusIcon />
            {t('addAnotherItem')}
          </button>
          <div className="flex items-center space-x-4">
            {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
            <button type="submit" className="btn h-10 px-5">
              {t('saveAppUsers')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddAppUserForm;