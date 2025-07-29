import React, { useState } from 'react';
import { ToolOwner } from '../types';
import { useLanguage } from '../contexts/languageContext';
import { PlusIcon, TrashIcon } from './icons';

interface AddOwnerFormProps {
  onAddOwners: (owners: Omit<ToolOwner, 'id'>[]) => void;
}

const AddOwnerForm: React.FC<AddOwnerFormProps> = ({ onAddOwners }) => {
  const { t } = useLanguage();

  const getInitialState = (): Omit<ToolOwner, 'id'> => ({
    ownerId: '',
    ownerName: '',
    ownerTrade: '',
    ownerGrade: '',
    ownerDepartment: '',
    ownerShift: '',
  });

  const [owners, setOwners] = useState<Omit<ToolOwner, 'id'>[]>([getInitialState()]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleOwnerChange = (index: number, field: keyof Omit<ToolOwner, 'id'>, value: string) => {
    const newOwners = [...owners];
    (newOwners[index] as any)[field] = value;
    setOwners(newOwners);
  };

  const handleAddRow = () => {
    setOwners([...owners, getInitialState()]);
  };

  const handleRemoveRow = (index: number) => {
    if (owners.length > 1) {
      setOwners(owners.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOwners = owners.filter(owner => owner.ownerId && owner.ownerName);
    if (validOwners.length !== owners.length) {
      alert(t('formAlertUsers'));
      return;
    }
    onAddOwners(validOwners);
    setOwners([getInitialState()]);
    setSuccessMessage(t('ownersSavedSuccess'));
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const Input = ({ ...props }) => <input {...props} className="form-input py-1.5 px-2" />;

  const headers = [
    t('ownerIdentifier'), t('ownerFullName'), t('ownerProfession'), t('ownerRank'),
    t('ownerDepartment'), t('ownerShift'), t('actions')
  ];

  return (
    <div className="max-w-full mx-auto">
      <h2 className="text-xl font-bold text-white">{t('addOwnersTitle')}</h2>
      <p className="mt-1 text-sm text-gray-400">{t('addOwnersInstructions')}</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-ui-dark-gray">
              <tr>
                {headers.map(h => <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {owners.map((owner, index) => (
                <tr key={index}>
                  <td className="p-2"><Input value={owner.ownerId} onChange={e => handleOwnerChange(index, 'ownerId', e.target.value)} /></td>
                  <td className="p-2"><Input value={owner.ownerName} onChange={e => handleOwnerChange(index, 'ownerName', e.target.value)} /></td>
                  <td className="p-2"><Input value={owner.ownerTrade} onChange={e => handleOwnerChange(index, 'ownerTrade', e.target.value)} /></td>
                  <td className="p-2"><Input value={owner.ownerGrade} onChange={e => handleOwnerChange(index, 'ownerGrade', e.target.value)} /></td>
                  <td className="p-2"><Input value={owner.ownerDepartment} onChange={e => handleOwnerChange(index, 'ownerDepartment', e.target.value)} /></td>
                  <td className="p-2"><Input value={owner.ownerShift} onChange={e => handleOwnerChange(index, 'ownerShift', e.target.value)} /></td>
                  <td className="p-2">
                    <button type="button" onClick={() => handleRemoveRow(index)} className="text-red-500 hover:text-red-400 disabled:text-gray-500" disabled={owners.length <= 1}>
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
              {t('saveOwners')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddOwnerForm;