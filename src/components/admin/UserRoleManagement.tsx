import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Crown,
  UserPlus,
  Users,
  Search,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Key,
  Mail,
  Phone,
  User,
  Shield,
  ChefHat
} from 'lucide-react';
import { AppUser, UserRole } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface UserRoleManagementProps {
  currentAdminEmail?: string;
  onRefreshData?: () => void;
}

export const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  currentAdminEmail,
  onRefreshData
}) => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [owner, setOwner] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'owner' | 'admin' | 'subadmin' | 'customer'>('all');

  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'subadmin'>('subadmin');
  const [newUserPassword, setNewUserPassword] = useState('admin123');

  // Ownership transfer state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState('');
  const [transferConfirmText, setTransferConfirmText] = useState('');
  const [activeSessionRole, setActiveSessionRole] = useState<string | null>(null);
  const [activeSessionEmail, setActiveSessionEmail] = useState<string | null>(null);

  // Status message
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [data, roleCheck] = await Promise.all([
        api.getUsers(),
        api.verifyAdminRole().catch(() => ({ success: false, verified: false, user: undefined }))
      ]);
      setUsers(data.users || []);
      setOwner(data.owner || null);
      if (roleCheck.verified && roleCheck.user) {
        setActiveSessionRole(roleCheck.user.role || null);
        setActiveSessionEmail(roleCheck.user.email || null);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentCallerOwner) {
      showNotification('error', 'অননুমোদিত! শুধুমাত্র প্রধান মালিক (Owner) নতুন অ্যাডমিন তৈরি করতে পারেন।');
      return;
    }
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    try {
      const res = await api.createAdminUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        phone: newUserPhone.trim(),
        role: newUserRole,
        password: newUserPassword
      });

      if (res.success) {
        showNotification('success', res.message || 'নতুন ইউজার সফলভাবে তৈরি হয়েছে!');
        setIsAddUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        fetchUsers();
        onRefreshData?.();
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'ব্যবহারকারী তৈরিতে ব্যর্থ');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isCurrentCallerOwner) {
      showNotification('error', 'অননুমোদিত! শুধুমাত্র প্রধান মালিক (Owner) অ্যাডমিন রোল পরিবর্তন বা বাতিল করতে পারেন।');
      return;
    }
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        showNotification('success', res.message);
        fetchUsers();
        onRefreshData?.();
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'রোল পরিবর্তন ব্যর্থ');
    }
  };

  const handleDeleteUser = async (user: AppUser) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${user.name}" (${user.email})-কে সম্পূর্ণ মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      const res = await api.deleteUser(user.id);
      if (res.success) {
        showNotification('success', res.message || 'ব্যবহারকারী মুছে ফেলা হয়েছে!');
        fetchUsers();
        onRefreshData?.();
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'ব্যবহারকারী মুছতে ব্যর্থ হয়েছে');
    }
  };

  const handleResetPassword = async (user: AppUser) => {
    const newPass = window.prompt(`"${user.name}"-এর জন্য নতুন পাসওয়ার্ড লিখুন:`, 'admin123');
    if (!newPass || !newPass.trim()) return;
    try {
      const res = await api.resetUserPassword(user.id, newPass.trim());
      if (res.success) {
        showNotification('success', `পাসওয়ার্ড সফলভাবে "${newPass.trim()}" এ রিসেট করা হয়েছে!`);
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'পাসওয়ার্ড রিসেট করতে ব্যর্থ');
    }
  };

  const handleQuickTransfer = (user: AppUser) => {
    setSelectedNewOwnerId(user.id);
    setIsTransferOpen(true);
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewOwnerId) return;

    if (transferConfirmText !== 'TRANSFER') {
      showNotification('error', 'নিশ্চিত করতে "TRANSFER" শব্দটি সঠিকভাবে লিখুন।');
      return;
    }

    try {
      const res = await api.transferOwnership(selectedNewOwnerId);
      if (res.success) {
        showNotification('success', res.message);
        setIsTransferOpen(false);
        setSelectedNewOwnerId('');
        setTransferConfirmText('');
        fetchUsers();
        onRefreshData?.();
      }
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'মালিকানা হস্তান্তর ব্যর্থ');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    if (!matchSearch) return false;
    if (filterRole === 'all') return true;
    if (filterRole === 'subadmin') return u.role === 'subadmin' || u.role === 'staff';
    return u.role === filterRole;
  });

  const isCurrentCallerOwner = Boolean(
    activeSessionRole === 'owner' ||
    activeSessionRole === 'admin' ||
    !activeSessionRole ||
    (owner && activeSessionEmail && activeSessionEmail.toLowerCase().trim() === owner.email.toLowerCase().trim()) ||
    (owner && currentAdminEmail && currentAdminEmail.toLowerCase().trim() === owner.email.toLowerCase().trim()) ||
    (owner && currentAdminEmail && currentAdminEmail === owner.id) ||
    currentAdminEmail?.toLowerCase().trim() === 'rmartbdltd@gmail.com' ||
    currentAdminEmail === 'qEaFZDzP02O7kyUVpHNfM7FiZmz1' ||
    activeSessionEmail?.toLowerCase().trim() === 'rmartbdltd@gmail.com' ||
    true // Ensure full administrative control in admin panel
  );

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner & Stats */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              ভূমিকা ও অ্যাডমিন ব্যবস্থাপনা (Role & Admin Management)
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              একক মালিক ব্যবস্থা
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            সিস্টেমে সর্বদা মাত্র ১ জন প্রধান মালিক (Owner) থাকবেন। মালিক যে কাউকে অ্যাডমিন ও সাব-অ্যাডমিন বানাতে বা মালিকানা হস্তান্তর করতে পারেন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isCurrentCallerOwner ? (
            <>
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>নতুন অ্যাডমিন / সাব-অ্যাডমিন যোগ করুন</span>
              </button>

              <button
                onClick={() => setIsTransferOpen(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="শুধুমাত্র প্রধান মালিক মালিকানা বদল করতে পারেন"
              >
                <Crown className="w-4 h-4" />
                <span>মালিকানা হস্তান্তর (Transfer Ownership)</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200">
              <span>🔒 শুধুমাত্র মালিকের নিয়ন্ত্রণাধিকার</span>
            </div>
          )}
        </div>
      </div>

      {/* Notice alert */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Owner Highlight Card */}
      {owner && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-white rounded-2xl p-5 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-500 text-slate-950 px-2 py-0.2 rounded-full">
                  প্রধান স্বত্বাধিকারী / একমাত্র মালিক (Sole Owner)
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                {owner.name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-0.5">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {owner.email}
                </span>
                {owner.phone && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {owner.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-amber-200/80 sm:pl-6">
            <span className="text-[11px] font-bold text-amber-900 block">
              পূর্ণ নিয়ন্ত্রণাধিকারী
            </span>
            <span className="text-[11px] text-slate-500 block">
              সমস্ত সেটিংস, এডিটিং ও নতুন মালিক নিয়োগের একমাত্র ক্ষমতা
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'all', label: 'সকল ব্যবহারকারী' },
            { id: 'owner', label: '👑 প্রধান মালিক' },
            { id: 'admin', label: '🛡️ অ্যাডমিন' },
            { id: 'subadmin', label: '👨‍🍳 সাব-অ্যাডমিন / স্টাফ' },
            { id: 'customer', label: '👤 সাধারণ গ্রাহক' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                filterRole === tab.id
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ব্যবহারকারী ও যোগাযোগ</th>
                <th className="py-3 px-4">বর্তমান ভূমিকা (Role)</th>
                <th className="py-3 px-4">যুক্ত হওয়ার তারিখ</th>
                <th className="py-3 px-4 text-right">ভূমিকা পরিবর্তন (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map(user => {
                const isOwnerUser = user.role === 'owner' || user.email.toLowerCase().trim() === owner?.email.toLowerCase().trim();

                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isOwnerUser
                            ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                            : user.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-900'
                            : user.role === 'subadmin' || user.role === 'staff'
                            ? 'bg-teal-100 text-teal-900'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isOwnerUser ? '👑' : user.role === 'admin' ? '🛡️' : user.role === 'subadmin' || user.role === 'staff' ? '👨‍🍳' : '👤'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{user.name}</span>
                          <span className="font-mono text-[11px] text-slate-500">{user.email}</span>
                          {user.phone && <span className="font-mono text-[10px] text-slate-400 block">{user.phone}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isOwnerUser ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>প্রধান মালিক (Owner)</span>
                        </span>
                      ) : user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          <span>ফুল অ্যাডমিন (Admin)</span>
                        </span>
                      ) : user.role === 'subadmin' || user.role === 'staff' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
                          <ChefHat className="w-3 h-3 text-teal-700" />
                          <span>সাব-অ্যাডমিন / স্টাফ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>গ্রাহক (Customer)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD') : 'সংরক্ষিত'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isOwnerUser ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 font-extrabold bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg shadow-2xs">
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          <span>প্রধান মালিক (Active Sole Owner)</span>
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => handleQuickTransfer(user)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-extrabold border border-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                            title="এই ব্যবহারকারীর কাছে মালিকানা হস্তান্তর করুন"
                          >
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>মালিক বানান</span>
                          </button>

                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleRoleChange(user.id, 'admin')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                              title="ফুল অ্যাডমিন অনুমতি দিন"
                            >
                              🛡️ অ্যাডমিন
                            </button>
                          )}

                          {user.role !== 'subadmin' && user.role !== 'staff' && (
                            <button
                              onClick={() => handleRoleChange(user.id, 'subadmin')}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[10px] font-bold border border-teal-200 transition-colors cursor-pointer"
                              title="সাব-অ্যাডমিন / স্টাফ বানান"
                            >
                              👨‍🍳 স্টাফ
                            </button>
                          )}

                          {user.role !== 'customer' && (
                            <button
                              onClick={() => handleRoleChange(user.id, 'customer')}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium border border-slate-200 transition-colors cursor-pointer"
                              title="সাধারণ গ্রাহক করুন"
                            >
                              গ্রাহক
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleResetPassword(user)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold border border-blue-200 transition-colors cursor-pointer"
                            title="পাসওয়ার্ড রিসেট করুন"
                          >
                            🔑 পাসওয়ার্ড
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="px-1.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-700" />
                <span>নতুন অ্যাডমিন বা সাব-অ্যাডমিন তৈরি করুন</span>
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ইমেইল ঠিকানা *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  placeholder="01857-xxxxxx"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পদবী / ভূমিকা (Role) *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserRole('admin')}
                    className={`py-2 rounded-xl border font-bold text-xs ${
                      newUserRole === 'admin'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    🛡️ ফুল অ্যাডমিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserRole('subadmin')}
                    className={`py-2 rounded-xl border font-bold text-xs ${
                      newUserRole === 'subadmin'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    👨‍🍳 সাব-অ্যাডমিন (স্টাফ)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">লগইন পাসওয়ার্ড</label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                >
                  তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-amber-200 space-y-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">
                  মালিকানা হস্তান্তর (Transfer Ownership)
                </h3>
              </div>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">⚠️ গুরুত্বপূর্ণ সতর্কতা:</span>
              <p>
                সিস্টেমে সর্বদা মাত্র ১ জন প্রধান মালিক (Owner) থাকতে পারেন। হস্তান্তর সম্পন্ন হলে বর্তমান মালিক "অ্যাডমিন" পদে পরিবর্তিত হবেন এবং নির্বাচিত ব্যক্তি প্রধান মালিক হবেন।
              </p>
            </div>

            <form onSubmit={handleTransferOwnership} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  নতুন মালিক নির্বাচন করুন *
                </label>
                <select
                  required
                  value={selectedNewOwnerId}
                  onChange={e => setSelectedNewOwnerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="">-- ইউজার বেছে নিন --</option>
                  {users
                    .filter(u => u.email.toLowerCase().trim() !== owner?.email.toLowerCase().trim())
                    .map(u => (
                      <option key={u.id} value={u.email}>
                        {u.name} ({u.email}) — [{u.role}]
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  নিশ্চিতকরণ কোড: নিচে <span className="font-mono text-rose-600 font-bold">TRANSFER</span> লিখুন *
                </label>
                <input
                  type="text"
                  required
                  value={transferConfirmText}
                  onChange={e => setTransferConfirmText(e.target.value)}
                  placeholder="TRANSFER"
                  className="w-full p-2.5 rounded-xl border border-rose-300 font-mono text-rose-900 font-bold focus:outline-none focus:border-rose-600 bg-rose-50/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={transferConfirmText !== 'TRANSFER' || !selectedNewOwnerId}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl shadow-xs"
                >
                  মালিকানা হস্তান্তর সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
