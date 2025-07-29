import React from 'react';
import { ReportHeader as ReportHeaderType } from '../types';
import { useLanguage } from '../contexts/languageContext';

interface ReportHeaderProps {
  headerData: ReportHeaderType;
  onHeaderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOwnerIdBlur: (id: string) => void;
  onSelectTools: () => void;
  isTechnician: boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ headerData, onHeaderChange, onOwnerIdBlur, onSelectTools, isTechnician }) => {
  const { t } = useLanguage();

  const isOwnerValid = !!headerData.ownerName;

  const InputField = ({ label, name, value, onBlur, readOnly = false }: { label: string, name: keyof ReportHeaderType, value: string, onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void, readOnly?: boolean }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-semibold text-white text-sm">{label}</label>
      <input
        type={name === 'dfrDate' ? 'date' : 'text'}
        id={name}
        name={name}
        value={value}
        onChange={onHeaderChange}
        onBlur={onBlur}
        className="form-input disabled:cursor-not-allowed"
        readOnly={readOnly}
        disabled={readOnly}
      />
    </div>
  );

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        <InputField label={t('dfrDate')} name="dfrDate" value={headerData.dfrDate} />
        <InputField 
          label={t('ownerId')} 
          name="ownerId" 
          value={headerData.ownerId} 
          onBlur={(e) => onOwnerIdBlur(e.target.value)}
          readOnly={isTechnician}
        />
        <InputField label={t('ownerName')} name="ownerName" value={headerData.ownerName} readOnly />
        <InputField label={t('department')} name="department" value={headerData.department} readOnly />
        <InputField label={t('shift')} name="shift" value={headerData.shift} readOnly />
        <div className="flex items-end">
          <button
            onClick={onSelectTools}
            disabled={!isOwnerValid}
            className="btn w-full"
          >
            {t('selectTools')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;