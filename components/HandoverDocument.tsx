import React, { useState, useMemo } from 'react';
import { ToolOwner, DefectItem } from '../types';
import { useLanguage } from '../contexts/languageContext';

interface HandoverDocumentProps {
    users: ToolOwner[];
    tools: DefectItem[];
    onConfirmHandover: (toolIds: string[], toUser: ToolOwner) => void;
}

const HandoverDocument: React.FC<HandoverDocumentProps> = ({ users, tools, onConfirmHandover }) => {
    const { t } = useLanguage();
    const [fromUserId, setFromUserId] = useState('');
    const [toUserId, setToUserId] = useState('');
    const [fromUser, setFromUser] = useState<ToolOwner | null>(null);
    const [toUser, setToUser] = useState<ToolOwner | null>(null);
    const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    
    const fromUserTools = useMemo(() => {
        if (!fromUser) return [];
        return tools.filter(tool => tool.ownerId === fromUser.ownerId);
    }, [fromUser, tools]);

    const filteredTools = useMemo(() => {
        if (!searchTerm) return fromUserTools;
        return fromUserTools.filter(tool => 
            tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.toolId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [fromUserTools, searchTerm]);
    
    const selectedTools = useMemo(() => {
        return fromUserTools.filter(tool => selectedToolIds.has(tool.id));
    }, [fromUserTools, selectedToolIds]);

    const handleUserSelect = (userId: string, type: 'from' | 'to') => {
        const user = users.find(u => u.ownerId === userId);
        if (type === 'from') {
            setFromUserId(userId);
            setFromUser(user || null);
            setSelectedToolIds(new Set()); // Reset selection when from user changes
        } else {
            setToUserId(userId);
            setToUser(user || null);
        }
    }

    const handleToggleSelection = (toolId: string) => {
        setSelectedToolIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(toolId)) newSelection.delete(toolId);
            else newSelection.add(toolId);
            return newSelection;
        });
    };

    const handlePrint = () => {
        window.print();
    }
    
    const handleConfirm = () => {
        if (!toUser || selectedToolIds.size === 0) {
            alert(t('handoverValidation'));
            return;
        }
        onConfirmHandover(Array.from(selectedToolIds), toUser);
        // Reset form
        setFromUserId('');
        setFromUser(null);
        setToUserId('');
        setToUser(null);
        setSelectedToolIds(new Set());
    }

    const UserSelector = ({ label, value, onChange, userList }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, userList: ToolOwner[] }) => (
        <div>
            <label className="block text-sm font-medium text-white">{label}</label>
            <select value={value} onChange={onChange} className="form-select mt-1">
                <option value="">{t('selectUser')}</option>
                {userList.map(u => <option key={u.id} value={u.ownerId}>{u.ownerName} ({u.ownerId})</option>)}
            </select>
        </div>
    );
    
    return (
        <div className="bg-ui-dark-gray p-6">
            <div className="no-print">
                <h2 className="text-xl font-bold text-white">{t('handoverTitle')}</h2>
                <p className="mt-1 text-sm text-gray-400">{t('handoverInstructions')}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-ui-gray">
                    <UserSelector label={t('handoverFromUser')} value={fromUserId} onChange={(e) => handleUserSelect(e.target.value, 'from')} userList={users} />
                    <UserSelector label={t('handoverToUser')} value={toUserId} onChange={(e) => handleUserSelect(e.target.value, 'to')} userList={users.filter(u => u.ownerId !== fromUserId)} />
                </div>

                {fromUser && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold text-white">{t('selectToolsToHandover')}</h3>
                           <input 
                              type="text"
                              placeholder={t('searchTools')}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="form-input max-w-xs py-1.5"
                           />
                        </div>
                        <div className="mt-2 flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <div className="relative overflow-hidden" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                                        <table className="min-w-full">
                                            <thead className="bg-ui-gray sticky top-0">
                                                <tr>
                                                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6"></th>
                                                    <th scope="col" className="py-3.5 pr-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider sm:pl-0">{t('toolId')}</th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">{t('description')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-ui-dark-gray">
                                                {filteredTools.map(tool => (
                                                    <tr key={tool.id} className="hover:bg-gray-800">
                                                        <td className="relative px-7 sm:w-12 sm:px-6">
                                                            <input
                                                                type="checkbox"
                                                                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 bg-ui-gray border-none text-gray-400 focus:ring-gray-500"
                                                                checked={selectedToolIds.has(tool.id)}
                                                                onChange={() => handleToggleSelection(tool.id)}
                                                            />
                                                        </td>
                                                        <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-white sm:pl-0">{tool.toolId}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{tool.description}</td>
                                                    </tr>
                                                ))}
                                                 {filteredTools.length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="text-center py-4 text-sm text-gray-400">{t('noDatabaseItems')}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-8 flex justify-end space-x-3">
                     <button onClick={handlePrint} disabled={selectedToolIds.size === 0} className="btn btn-secondary h-11 px-5">
                        {t('printHandover')}
                    </button>
                    <button onClick={handleConfirm} disabled={!fromUser || !toUser || selectedToolIds.size === 0} className="btn h-11 px-5">
                        {t('confirmHandover')}
                    </button>
                </div>
            </div>
            
            {/* Printable Document */}
            <div id="handover-printable" className="hidden print:block p-4 text-black">
                <h1 className="text-2xl font-bold text-center mb-8">{t('handoverDocument')}</h1>
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div>
                        <h2 className="font-bold border-b border-black pb-1 mb-2">{t('handoverFromUser')}</h2>
                        <p><strong>{t('name')}:</strong> {fromUser?.ownerName}</p>
                        <p><strong>{t('id')}:</strong> {fromUser?.ownerId}</p>
                        <p><strong>{t('department')}:</strong> {fromUser?.ownerDepartment}</p>
                        <p className="mt-12"><strong>{t('signature')}:</strong> _________________________</p>
                    </div>
                    <div>
                        <h2 className="font-bold border-b border-black pb-1 mb-2">{t('handoverToUser')}</h2>
                        <p><strong>{t('name')}:</strong> {toUser?.ownerName}</p>
                        <p><strong>{t('id')}:</strong> {toUser?.ownerId}</p>
                        <p><strong>{t('department')}:</strong> {toUser?.ownerDepartment}</p>
                        <p className="mt-12"><strong>{t('signature')}:</strong> _________________________</p>
                    </div>
                </div>

                <h2 className="font-bold text-lg mb-2">Handed Over Items</h2>
                 <table className="min-w-full text-sm border-collapse border border-black">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border border-black p-2 text-left">{t('toolId')}</th>
                            <th className="border border-black p-2 text-left">{t('serial')}</th>
                            <th className="border border-black p-2 text-left">{t('description')}</th>
                            <th className="border border-black p-2 text-left">{t('condition')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedTools.map(tool => (
                             <tr key={tool.id}>
                                <td className="border border-black p-2">{tool.toolId}</td>
                                <td className="border border-black p-2">{tool.serial}</td>
                                <td className="border border-black p-2">{tool.description}</td>
                                <td className="border border-black p-2 h-12"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-8 text-sm">
                    <p><strong>{t('handoverDate')}:</strong> {new Date().toLocaleDateString()}</p>
                    <p className="mt-4">Confirmation: By signing this document, the recipient acknowledges receipt of the tools listed above in the specified condition.</p>
                </div>
            </div>
        </div>
    );
};

export default HandoverDocument;