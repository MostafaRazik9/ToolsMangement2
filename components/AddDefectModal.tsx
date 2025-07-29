import React, { useState } from 'react';
import { DefectItem } from '../types';
import { useLanguage } from '../contexts/languageContext';

interface AddDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<DefectItem, 'id'>) => void;
}

const AddDefectModal: React.FC<AddDefectModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const { t } = useLanguage();
  const initialState: Omit<DefectItem, 'id'> = {
    toolId: '',
    serial: '',
    description: '',
    status: 'New', 
    quantity: 1,
    recommendedAction: '',
    comment: ''
  };

  const [newItem, setNewItem] = useState(initialState);
  const commonInputClass = "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.toolId || !newItem.description) {
        alert(t('formAlert'));
        return;
    }
    onAddItem(newItem);
    setNewItem(initialState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-800 mb-6">{t('addNewDefectItem')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <label htmlFor="toolId" className="block text-sm font-medium text-slate-600">{t('toolIdRequired')}</label>
              <input type="text" name="toolId" value={newItem.toolId} onChange={handleChange} className={commonInputClass} />
            </div>
            <div>
              <label htmlFor="serial" className="block text-sm font-medium text-slate-600">{t('serialNo')}</label>
              <input type="text" name="serial" value={newItem.serial} onChange={handleChange} className={commonInputClass} />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-600">{t('descriptionRequired')}</label>
                <textarea name="description" value={newItem.description} onChange={handleChange} rows={3} className={commonInputClass}></textarea>
            </div>
             <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-600">{t('quantity')}</label>
              <input type="number" name="quantity" value={newItem.quantity} onChange={handleChange} min="1" className={commonInputClass} />
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              {t('addItem')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDefectModal;