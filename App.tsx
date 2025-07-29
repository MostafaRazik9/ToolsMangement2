

import React, { useState, useCallback, useEffect } from 'react';
import { ReportHeader as ReportHeaderType, DefectItem, ToolOwner, AppUser, DefectReport } from './types';
import Login from './components/Login';
import ReportHeader from './components/ReportHeader';
import DefectReportTable from './components/DefectReportTable';
import DatabaseView from './components/DatabaseView';
import AddToDatabaseForm from './components/AddToDatabaseForm';
import ToolOwnersDatabaseView from './components/ToolOwnersDatabaseView';
import AddOwnerForm from './components/AddOwnerForm';
import SelectToolsModal from './components/SelectToolsModal';
import HandoverDocument from './components/HandoverDocument';
import AppUsersDatabaseView from './components/AppUsersDatabaseView';
import AddAppUserForm from './components/AddAppUserForm';
import Dashboard from './components/Dashboard';
import AboutView from './components/AboutView';
import ApprovalsView from './components/ApprovalsView';
import ToolAuditView from './components/ToolAuditView';
import { DatabaseIcon, ChartBarIcon, InformationCircleIcon, ExclamationIcon, WarningSignIcon, HandoverIcon, ToolAuditIcon, ApprovalsIcon, UploadIcon, BoxIcon } from './components/icons';
import { getDefectSuggestions } from './services/geminiService';
import { useLanguage } from './contexts/languageContext';

// --- INITIAL DATA ---

const initialAppUsersData: AppUser[] = [
  { id: 'app-user-1', username: 'johndoe', password: 'techpassword', role: 'Technician', toolOwnerId: 'E123' },
  { id: 'app-user-2', username: 'alicej', password: 'techpassword', role: 'Technician', toolOwnerId: 'E124' },
  { id: 'app-user-3', username: 'samsuper', password: 'superpassword', role: 'Supervisor', toolOwnerId: 'S555' },
  { id: 'app-user-4', username: 'admin', password: 'admin', role: 'Admin' },
];

const initialToolOwnersData: ToolOwner[] = [
  { id: 'user-1', ownerId: 'E123', ownerName: 'John Doe', ownerTrade: 'Mechanic', ownerGrade: 'Senior', ownerDepartment: 'Maintenance', ownerShift: 'Day' },
  { id: 'user-2', ownerId: 'E124', ownerName: 'Alice Johnson', ownerTrade: 'Electrician', ownerGrade: 'Journeyman', ownerDepartment: 'Construction', ownerShift: 'Night' },
  { id: 'user-3', ownerId: 'S555', ownerName: 'Samantha Supervisor', ownerTrade: 'Foreman', ownerGrade: 'Supervisor', ownerDepartment: 'Operations', ownerShift: 'Day' },
];

const initialDbData: DefectItem[] = [
    { id: 'db-1', toolId: 'WR-001', serial: 'SN-A1B2', description: '1/2" Drive Socket Wrench', category: 'Hand Tools', quantity: 1, standardToolName: 'Socket Wrench', cost: 45.50, toolBrand: 'Craftsman', ownerId: 'E123', ownerName: 'John Doe', ownerTrade: 'Mechanic', ownerGrade: 'Senior', ownerDepartment: 'Maintenance', ownerShift: 'Day', handoverDate: '2023-01-10', status: 'In Service', lastAudit: '2023-10-15', auditor: 'Jane Smith', nextAuditDue: '2024-10-15', defectFlag: false, scrapDate: '', comment: 'Primary wrench set', defectReportNumber: '', recommendedAction: '', defectType: '' },
    { id: 'db-2', toolId: 'DR-005', serial: 'SN-C3D4', description: 'Cordless Drill 18V', category: 'Power Tools', quantity: 1, standardToolName: 'Cordless Drill', cost: 129.99, toolBrand: 'DeWalt', ownerId: 'E124', ownerName: 'Alice Johnson', ownerTrade: 'Electrician', ownerGrade: 'Journeyman', ownerDepartment: 'Construction', ownerShift: 'Night', handoverDate: '2023-02-20', status: 'In Service', lastAudit: '2024-01-20', auditor: 'Jane Smith', nextAuditDue: '2025-01-20', defectFlag: false, scrapDate: '', comment: 'Battery needs frequent charging', defectReportNumber: '', recommendedAction: '', defectType: '' },
    { id: 'db-3', toolId: 'HM-002', serial: 'SN-E5F6', description: 'Claw Hammer', category: 'Hand Tools', quantity: 1, standardToolName: 'Claw Hammer', cost: 15.00, toolBrand: 'Stanley', ownerId: 'E123', ownerName: 'John Doe', ownerTrade: 'Mechanic', ownerGrade: 'Senior', ownerDepartment: 'Maintenance', ownerShift: 'Day', handoverDate: '2023-01-10', status: 'In Service', lastAudit: '2023-10-15', auditor: 'Jane Smith', nextAuditDue: '2024-10-15', defectFlag: false, scrapDate: '', comment: '', defectReportNumber: '', recommendedAction: '', defectType: '' },
    { id: 'db-4', toolId: 'SV-001', serial: 'SN-G7H8', description: 'Safety Goggles', category: 'Safety', quantity: 1, standardToolName: 'Safety Goggles', cost: 10.00, toolBrand: '3M', ownerId: 'S555', ownerName: 'Samantha Supervisor', ownerTrade: 'Foreman', ownerGrade: 'Supervisor', ownerDepartment: 'Operations', ownerShift: 'Day', handoverDate: '2023-01-10', status: 'In Service', lastAudit: '2024-01-15', auditor: 'Jane Smith', nextAuditDue: '2025-01-15', defectFlag: false, scrapDate: '', comment: 'Scratched lens', defectReportNumber: 'DFR-001', recommendedAction: 'Replace lens', defectType: 'Wear and Tear' },
    { id: 'db-5', toolId: 'PG-010', serial: 'SN-I9J0', description: 'Pressure gauge showing incorrect readings. Calibration appears to be off by 10-15 PSI.', category: 'Measuring Tools', quantity: 1, standardToolName: 'Pressure Gauge', cost: 75.00, toolBrand: 'Ashcroft', ownerId: 'E123', ownerName: 'John Doe', ownerTrade: 'Mechanic', ownerGrade: 'Senior', ownerDepartment: 'Maintenance', ownerShift: 'Day', handoverDate: '2023-01-10', status: 'In Service', lastAudit: '2024-02-01', auditor: 'Jane Smith', nextAuditDue: '2024-07-01', defectFlag: true, scrapDate: '', comment: '', defectReportNumber: 'DFR-002', recommendedAction: 'Recalibrate or replace sensor.', defectType: 'Wear and Tear' },
];

const getInitialHeaderData = (): ReportHeaderType => ({
  dfrDate: new Date().toISOString().split('T')[0],
  ownerId: '',
  ownerName: '',
  department: '',
  shift: '',
});


type ActiveTab = 'dashboard' | 'defectReport' | 'approvals' | 'toolHandover' | 'toolAudit' | 'database' | 'about';

const App: React.FC = () => {
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // --- Data State ---
  const [databaseItems, setDatabaseItems] = useState<DefectItem[]>(initialDbData);
  const [toolOwnersData, setToolOwnersData] = useState<ToolOwner[]>(initialToolOwnersData);
  const [appUsers, setAppUsers] = useState<AppUser[]>(initialAppUsersData);
  const [defectReports, setDefectReports] = useState<DefectReport[]>([]);
  
  // --- Defect Report Form State ---
  const [reportHeaderData, setReportHeaderData] = useState<ReportHeaderType>(getInitialHeaderData());
  const [reportDefectItems, setReportDefectItems] = useState<DefectItem[]>([]);
  const [reportPhoto, setReportPhoto] = useState<string | null>(null);
  
  const [isSelectToolsModalOpen, setSelectToolsModalOpen] = useState(false);
  const [suggestionLoadingState, setSuggestionLoadingState] = useState<{ [key: string]: boolean }>({});
  
  // Secondary active tab state for database sub-views
  type ActiveDbTab = 'tools' | 'owners' | 'users' | 'addTool' | 'addOwner' | 'addUser';
  const [activeDbTab, setActiveDbTab] = useState<ActiveDbTab>('tools');

  const isAdmin = currentUser?.role === 'Admin';
  const isSupervisor = currentUser?.role === 'Supervisor';
  const isTechnician = currentUser?.role === 'Technician';

  // Effect to pre-fill technician data
  useEffect(() => {
    if (currentUser && isTechnician && currentUser.toolOwnerId) {
      const ownerProfile = toolOwnersData.find(owner => owner.ownerId === currentUser.toolOwnerId);
      if (ownerProfile) {
        setReportHeaderData({
          dfrDate: new Date().toISOString().split('T')[0],
          ownerId: ownerProfile.ownerId,
          ownerName: ownerProfile.ownerName,
          department: ownerProfile.ownerDepartment,
          shift: ownerProfile.ownerShift,
        });
      }
    }
  }, [currentUser, isTechnician, toolOwnersData]);
  
  const resetDefectReportForm = useCallback(() => {
    // If technician, reset to their details, otherwise clear completely
    if (isTechnician && currentUser?.toolOwnerId) {
      const ownerProfile = toolOwnersData.find(owner => owner.ownerId === currentUser.toolOwnerId);
      setReportHeaderData(ownerProfile ? {
          dfrDate: new Date().toISOString().split('T')[0],
          ownerId: ownerProfile.ownerId,
          ownerName: ownerProfile.ownerName,
          department: ownerProfile.ownerDepartment,
          shift: ownerProfile.ownerShift,
      } : getInitialHeaderData());
    } else {
        setReportHeaderData(getInitialHeaderData());
    }
    setReportDefectItems([]);
    setReportPhoto(null);
  }, [isTechnician, currentUser, toolOwnersData]);


  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    resetDefectReportForm();
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    resetDefectReportForm();
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReportHeaderData(prev => ({ ...prev, [name]: value }));
  };

  const findOwnerDetails = (id: string) => {
    if (isTechnician) return; // Technicians can't change owner
    const owner = toolOwnersData.find(u => u.ownerId.toLowerCase() === id.toLowerCase());
    if (owner) {
      setReportHeaderData(prev => ({
        ...prev,
        ownerId: owner.ownerId, // Use correct casing
        ownerName: owner.ownerName,
        department: owner.ownerDepartment,
        shift: owner.ownerShift,
      }));
      setReportDefectItems([]); // Clear items when owner changes
    } else {
      setReportHeaderData(prev => ({...prev, ownerName: '', department: '', shift: '' }));
      alert(t('ownerNotFound'));
    }
  };

  const addItemsToDatabase = (items: Omit<DefectItem, 'id'>[]) => {
    const newItemsWithIds = items.map(item => ({...item, id: crypto.randomUUID()}));
    setDatabaseItems(prev => [...prev, ...newItemsWithIds]);
    setActiveTab('database');
    setActiveDbTab('tools');
  };
  
  const removeItemFromDatabase = (id: string) => {
    setDatabaseItems(prev => prev.filter(item => item.id !== id));
  };
  
  const updateDatabaseItem = (id: string, updatedItem: DefectItem) => {
    setDatabaseItems(prev => prev.map(item => (item.id === id ? updatedItem : item)));
  };

  const addOwnersToDatabase = (owners: Omit<ToolOwner, 'id'>[]) => {
    const newOwnersWithIds = owners.map(owner => ({...owner, id: crypto.randomUUID()}));
    setToolOwnersData(prev => [...prev, ...newOwnersWithIds]);
    setActiveTab('database');
    setActiveDbTab('owners');
  }
  
  const removeOwnerFromDatabase = (id: string) => {
    setToolOwnersData(prev => prev.filter(owner => owner.id !== id));
  }

  const updateToolOwner = (id: string, updatedOwner: ToolOwner) => {
    setToolOwnersData(prev => prev.map(owner => (owner.id === id ? updatedOwner : owner)));
  };

  const addAppUsers = (users: Omit<AppUser, 'id'>[]) => {
    const newUsersWithIds = users.map(user => ({...user, id: crypto.randomUUID()}));
    setAppUsers(prev => [...prev, ...newUsersWithIds]);
    setActiveTab('database');
    setActiveDbTab('users');
  }

  const removeAppUser = (id: string) => {
    if (currentUser?.id === id) {
        alert(t('cannotDeleteSelf'));
        return;
    }
    setAppUsers(prev => prev.filter(user => user.id !== id));
  }
  
  const updateAppUser = (id: string, updatedUser: AppUser) => {
    setAppUsers(prev => prev.map(user => (user.id === id ? updatedUser : user)));
  };

  const handleConfirmHandover = (toolIds: string[], toOwner: ToolOwner) => {
    setDatabaseItems(prevItems => prevItems.map(item => {
        if (toolIds.includes(item.id)) {
            return {
                ...item,
                ownerId: toOwner.ownerId,
                ownerName: toOwner.ownerName,
                ownerTrade: toOwner.ownerTrade,
                ownerGrade: toOwner.ownerGrade,
                ownerDepartment: toOwner.ownerDepartment,
                ownerShift: toOwner.ownerShift,
                handoverDate: new Date().toISOString().split('T')[0],
            };
        }
        return item;
    }));
    alert(t('handoverSuccess'));
  };

  const updateReportDefectItem = useCallback((id: string, field: keyof DefectItem, value: any) => {
    setReportDefectItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }, []);

  const removeReportDefectItem = (id: string) => {
    setReportDefectItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddSelectedTools = (selectedTools: DefectItem[]) => {
    const newDefectItems = selectedTools.map(tool => ({
      ...tool,
      id: crypto.randomUUID(),
      status: 'New' as const,
      recommendedAction: '',
      comment: '',
      defectType: '' as const,
    }));
    setReportDefectItems(prev => [...prev, ...newDefectItems]);
  };
  
  const handleGetSuggestion = async (id: string) => {
    const item = reportDefectItems.find(i => i.id === id);
    if (!item || !item.description) return;
    setSuggestionLoadingState(prev => ({ ...prev, [id]: true }));
    try {
        const suggestion = await getDefectSuggestions(item.description);
        updateReportDefectItem(id, 'status', suggestion.status);
        updateReportDefectItem(id, 'recommendedAction', suggestion.recommendedAction);
    } catch (error) {
        console.error(error);
        alert(t('aiError'));
    } finally {
        setSuggestionLoadingState(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleClearAllData = () => {
    if (!currentUser || !isAdmin) return;
    const pass = window.prompt(t('enterAdminPass'));
    if (pass === null) return; // User cancelled prompt
    
    if (pass === currentUser.password) {
        if (window.confirm(t('confirmClearData'))) {
            setDatabaseItems(initialDbData);
            setToolOwnersData(initialToolOwnersData);
            setAppUsers(initialAppUsersData);
            setDefectReports([]);
            alert(t('dataCleared'));
        }
    } else {
        alert(t('incorrectPass'));
    }
  }

  const handleDefectReportSubmit = () => {
    if (!currentUser) return;
    // Validation
    if (!reportHeaderData.ownerId || reportDefectItems.length === 0) {
        alert(t('reportValidation'));
        return;
    }
    if (isTechnician && !reportPhoto) {
        alert(t('photoRequired'));
        return;
    }

    const reportId = `DFR-${String(defectReports.length + 1).padStart(3, '0')}`;
    const newReport: DefectReport = {
        id: reportId,
        dfrDate: reportHeaderData.dfrDate,
        ownerId: reportHeaderData.ownerId,
        ownerName: reportHeaderData.ownerName,
        department: reportHeaderData.department,
        shift: reportHeaderData.shift,
        submittedBy: currentUser.username,
        status: 'Pending Approval',
        items: reportDefectItems,
        photo: reportPhoto || undefined,
    };

    setDefectReports(prev => [...prev, newReport]);
    
    // Update the master database items
    const submittedToolIds = new Set(reportDefectItems.map(item => item.toolId));
    setDatabaseItems(prevDb => prevDb.map(dbItem => {
        if (submittedToolIds.has(dbItem.toolId)) {
            const reportItem = reportDefectItems.find(ri => ri.toolId === dbItem.toolId);
            return {
                ...dbItem,
                defectFlag: true,
                status: reportItem?.status || 'Needs Inspection',
                defectReportNumber: reportId,
                defectType: reportItem?.defectType || '',
            };
        }
        return dbItem;
    }));

    alert(t('reportSubmittedSuccess', { reportId }));
    resetDefectReportForm();
  };
  
  const handleApprovalAction = (reportId: string, isApproved: boolean) => {
    const report = defectReports.find(r => r.id === reportId);
    if (!report) return;

    // 1. Update the report status itself
    setDefectReports(prevReports => 
      prevReports.map(r => 
        r.id === reportId ? { ...r, status: isApproved ? 'Approved' : 'Rejected' } : r
      )
    );

    // 2. Update the master tool database based on the action
    const toolIdsInReport = new Set(report.items.map(item => item.toolId));
    
    setDatabaseItems(prevDb => 
      prevDb.map(dbItem => {
        if (toolIdsInReport.has(dbItem.toolId)) {
          if (isApproved) {
            // Find the corresponding item in the report to get its final status
            const reportItem = report.items.find(ri => ri.toolId === dbItem.toolId);
            if (reportItem) {
              const updates: Partial<DefectItem> = {
                  status: reportItem.status,
              };
              if (reportItem.status === 'Scrap') {
                  updates.scrapDate = report.dfrDate;
              }
              return { ...dbItem, ...updates };
            }
          } else { // Rejected: Revert tool status
            return {
              ...dbItem,
              status: 'In Service',
              defectFlag: false,
              defectReportNumber: '',
              defectType: '',
            };
          }
        }
        return dbItem;
      })
    );

    alert(t('approvalActionSuccess', { reportId, status: isApproved ? t('statusApproved') : t('statusRejected') }));
  };

  const handlePerformAudit = (toolId: string, auditData: { auditDate: string; auditor: string; comment: string }) => {
     setDatabaseItems(prevItems => prevItems.map(item => {
        if (item.id === toolId) {
            const nextAudit = new Date(auditData.auditDate);
            nextAudit.setFullYear(nextAudit.getFullYear() + 1);
            return {
                ...item,
                lastAudit: auditData.auditDate,
                auditor: auditData.auditor,
                comment: `${item.comment ? item.comment + '\n' : ''}Audit on ${auditData.auditDate}: ${auditData.comment}`.trim(),
                nextAuditDue: nextAudit.toISOString().split('T')[0],
            };
        }
        return item;
     }));
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setReportPhoto(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  if (!currentUser) {
    return <Login users={appUsers} onLogin={handleLogin} />;
  }
  
  const NavButton = ({ tabName, setTab, icon, label }: { tabName: ActiveTab, setTab: (tab:ActiveTab)=>void, icon: React.ReactNode, label:string }) => {
    return (
        <button
            onClick={() => setTab(tabName)}
            className={`flex flex-col items-center justify-center gap-2 p-3 bg-ui-gray hover:bg-gray-700 transition-colors w-28 h-24`}
        >
            <div className="w-8 h-8 text-white">{icon}</div>
            <span className="text-sm font-semibold">{label}</span>
        </button>
    )
  }
  
  const renderContent = () => {
    const content = () => {
        switch(activeTab) {
            case 'dashboard':
                return <Dashboard items={databaseItems} />;
            case 'defectReport':
               return (<>
                  <ReportHeader 
                    headerData={reportHeaderData} 
                    onHeaderChange={handleHeaderChange}
                    onOwnerIdBlur={findOwnerDetails}
                    onSelectTools={() => setSelectToolsModalOpen(true)}
                    isTechnician={!!isTechnician}
                  />
                  <DefectReportTable
                    items={reportDefectItems}
                    onUpdateItem={updateReportDefectItem}
                    onRemoveItem={removeReportDefectItem}
                    onGetSuggestion={handleGetSuggestion}
                    suggestionLoadingState={suggestionLoadingState}
                  />
                  <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {isTechnician && (
                          <div className="flex-1">
                              <label className="block text-sm font-medium mb-2">{t('uploadPhotoRequired')}</label>
                              <div className="flex items-center gap-4">
                                  <input type="file" accept="image/*" onChange={handlePhotoUpload} id="photo-upload" className="hidden" />
                                  <label htmlFor="photo-upload" className="btn btn-secondary cursor-pointer gap-2">
                                      <UploadIcon />
                                      {t('uploadPhoto')}
                                  </label>
                                  {reportPhoto && <img src={reportPhoto} alt="Preview" className="h-16 w-16 object-cover" />}
                              </div>
                          </div>
                      )}
                      <div className="w-full md:w-auto flex-shrink-0 ml-auto">
                           <button onClick={handleDefectReportSubmit} className="btn w-full" disabled={reportDefectItems.length === 0}>
                              {t('submitReport')}
                          </button>
                      </div>
                  </div>
                </>);
            case 'approvals':
                if (isAdmin || isSupervisor) {
                    const itemsForApproval = defectReports.filter(r => r.status === 'Pending Approval');
                    return <ApprovalsView reports={itemsForApproval} onAction={handleApprovalAction} />;
                }
                return null;
            case 'toolHandover':
              if (isAdmin || isSupervisor) {
                   return <HandoverDocument users={toolOwnersData} tools={databaseItems} onConfirmHandover={handleConfirmHandover} />;
              }
              return null;
            case 'toolAudit':
              if (isAdmin || isSupervisor) {
                  const today = new Date().toISOString().split('T')[0];
                  const itemsForAudit = databaseItems.filter(item => item.nextAuditDue && item.nextAuditDue <= today);
                  return <ToolAuditView items={itemsForAudit} onPerformAudit={handlePerformAudit} currentUser={currentUser} />;
              }
              return null;
            case 'database':
              return (
                   <div>
                      <div className="mb-4">
                          <nav className="-mb-px flex gap-x-6" aria-label="Database Tabs">
                              <button onClick={()=>setActiveDbTab('tools')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeDbTab === 'tools' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('databaseViewTab')}</button>
                              <button onClick={()=>setActiveDbTab('owners')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeDbTab === 'owners' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('ownersDbTab')}</button>
                              {isAdmin && <button onClick={()=>setActiveDbTab('users')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeDbTab === 'users' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('appUsersDbTab')}</button>}
                              {isAdmin && <button onClick={()=>setActiveDbTab('addTool')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeDbTab === 'addTool' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('addToDatabaseTab')}</button>}
                              {isAdmin && <button onClick={()=>setActiveDbTab('addOwner')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeDbTab === 'addOwner' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('addOwnerTab')}</button>}
                              {isAdmin && <button onClick={()=>setActiveDbTab('addUser')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeDbTab === 'addUser' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('addAppUserTab')}</button>}
                          </nav>
                      </div>
                      
                      <div className="mt-6">
                        {activeDbTab === 'tools' && <DatabaseView items={databaseItems} toolOwners={toolOwnersData} onRemoveItem={removeItemFromDatabase} onUpdateItem={updateDatabaseItem} onBatchUpdate={setDatabaseItems} onAddItems={addItemsToDatabase} isAdmin={!!isAdmin} />}
                        {activeDbTab === 'owners' && <ToolOwnersDatabaseView owners={toolOwnersData} onRemoveOwner={removeOwnerFromDatabase} onUpdateOwner={updateToolOwner} onAddOwners={addOwnersToDatabase} isAdmin={!!isAdmin} />}
                        {activeDbTab === 'users' && isAdmin && <AppUsersDatabaseView users={appUsers} onRemoveUser={removeAppUser} currentUserId={currentUser.id} onUpdateUser={updateAppUser} onAddUsers={addAppUsers} />}
                        {activeDbTab === 'addTool' && isAdmin && <AddToDatabaseForm onAddItems={addItemsToDatabase} toolOwners={toolOwnersData} />}
                        {activeDbTab === 'addOwner' && isAdmin && <AddOwnerForm onAddOwners={addOwnersToDatabase} />}
                        {activeDbTab === 'addUser' && isAdmin && <AddAppUserForm onAddUsers={addAppUsers} />}
                      </div>
                  </div>
              )
            case 'about':
               return <AboutView />;
            default:
               return <div className="text-center p-8"><h2 className="text-2xl font-bold">Coming Soon</h2><p className="mt-2">This feature is under construction.</p></div>;
        }
    }

    return (
      <div className="p-4">
        <div className="mb-4">
          <p>{currentUser.username}</p>
          <p className="bg-gray-700 inline-block px-2 py-1 text-xs">{currentUser.role.toUpperCase()}</p>
        </div>
        {content()}
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-black">
          <header className="p-4 no-print">
            <h1 className="text-2xl font-bold text-white">{t('defectReportForm')}</h1>
            <p className="text-gray-400">{t('appSubtitle')}</p>
          </header>

          <nav className="flex flex-wrap gap-1 p-4 no-print">
             <NavButton tabName="dashboard" setTab={setActiveTab} icon={<ChartBarIcon className="w-full h-full" />} label={t('dashboardTab')} />
             <NavButton tabName="defectReport" setTab={setActiveTab} icon={<WarningSignIcon className="w-full h-full" />} label={t('defectReportTab')} />
             {(isAdmin || isSupervisor) && <NavButton tabName="approvals" setTab={setActiveTab} icon={<ApprovalsIcon className="w-full h-full" />} label={t('approvalsTab')} />}
             {(isAdmin || isSupervisor) && <NavButton tabName="toolHandover" setTab={setActiveTab} icon={<HandoverIcon className="w-full h-full" />} label={t('handoverTab')} />}
             {(isAdmin || isSupervisor) && <NavButton tabName="toolAudit" setTab={setActiveTab} icon={<ToolAuditIcon className="w-full h-full" />} label={t('toolAuditTab')} />}
             <NavButton tabName="database" setTab={setActiveTab} icon={<BoxIcon className="w-full h-full" />} label={t('database')} />
             <NavButton tabName="about" setTab={setActiveTab} icon={<InformationCircleIcon className="w-full h-full" />} label={t('aboutTab')} />
          </nav>

          <main className="p-4">
            {renderContent()}
          </main>
      </div>
      <SelectToolsModal
        isOpen={isSelectToolsModalOpen}
        onClose={() => setSelectToolsModalOpen(false)}
        onAddSelectedTools={handleAddSelectedTools}
        ownerId={reportHeaderData.ownerId}
        ownerName={reportHeaderData.ownerName}
        toolsDatabase={databaseItems}
        existingReportToolIds={new Set(reportDefectItems.map(item => item.toolId))}
      />
    </>
  );
};

export default App;