import React, { useState } from 'react';
import { DefectItem, AppUser } from '../types';
import { useLanguage } from '../contexts/languageContext';

interface PerformAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (auditData: { auditDate: string; auditor: string; comment: string }) => void;
  tool: DefectItem;
  currentUser: AppUser;
}

const PerformAuditModal: React.FC<PerformAuditModalProps> = ({ isOpen, onClose, onConfirm, tool, currentUser }) => {
  const { t } = useLanguage();
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [auditor, setAuditor] = useState(currentUser.username);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ auditDate, auditor, comment });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-ui-dark-gray p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">{t('auditDetails')}</h2>
        <p className="text-gray-300 font-semibold">{tool.description} ({tool.toolId})</p>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="auditDate" className="block text-sm font-medium text-gray-400 mb-1">{t('auditDate')}</label>
            <input
              type="date"
              id="auditDate"
              value={auditDate}
              onChange={(e) => setAuditDate(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label htmlFor="auditor" className="block text-sm font-medium text-gray-400 mb-1">{t('auditor')}</label>
            <input
              type="text"
              id="auditor"
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-400 mb-1">{t('auditComments')}</label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-input"
              placeholder='e.g., "Condition good, no issues noted."'
            />
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('cancel')}
            </button>
            <button type="submit" className="btn">
              {t('submitAudit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformAuditModal;