import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { adminService, AdminUserItem, AdminStats } from '../services/adminService';
import toast from 'react-hot-toast';
import {
  Users,
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Eye,
  X,
  GraduationCap,
} from 'lucide-react';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';
import { StatCard } from '../components/mosaic/StatCard';
import { Badge } from '../components/mosaic/Badge';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');

  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'admin',
    college: '',
    branch: '',
    preferredCareer: '',
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({
          search: searchQuery,
          role: roleFilter,
          isVerified: verifiedFilter,
        }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      toast.error('Failed to load admin management records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter, verifiedFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addUserForm.name || !addUserForm.email || !addUserForm.password) {
      toast.error('Name, email, and password are required.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await adminService.createUser(addUserForm);
      if (res.success) {
        toast.success(`User ${res.user.name} created successfully!`);
        setIsAddUserOpen(false);
        setAddUserForm({
          name: '',
          email: '',
          password: '',
          role: 'student',
          college: '',
          branch: '',
          preferredCareer: '',
        });
        loadData();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] text-[var(--ink-900)]">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-[var(--ink-muted)] text-sm font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <MosaicShell>
      <TopHeader
        title="Admin Control & User Directory"
        subtitle={`System Administrator • Logged in as ${user?.name}`}
        searchPlaceholder="Search users by name, email, or college..."
        searchValue={searchQuery}
        onSearchChange={(v) => setSearchQuery(v)}
        primaryActionLabel="Add New User"
        onPrimaryAction={() => setIsAddUserOpen(true)}
        primaryActionIcon={<UserPlus className="h-4 w-4" />}
      />

      {/* Admin Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 text-left">
        <StatCard
          variant="white"
          icon={<Users className="h-5 w-5 text-teal-600" />}
          label="Total Users"
          value={stats?.totalUsers || 0}
          subtitle="Registered accounts"
        />
        <StatCard
          variant="white"
          icon={<Users className="h-5 w-5 text-blue-600" />}
          label="Students"
          value={stats?.studentCount || 0}
          subtitle="Active student profiles"
        />
        <StatCard
          variant="white"
          icon={<ShieldCheck className="h-5 w-5 text-purple-600" />}
          label="Administrators"
          value={stats?.adminCount || 0}
          subtitle="Privileged admin roles"
        />
        <StatCard
          variant="white"
          icon={<GraduationCap className="h-5 w-5 text-emerald-600" />}
          label="Verified Profiles"
          value={stats?.verifiedCount || 0}
          subtitle="Completed onboarding"
        />
      </div>

      {/* Filter Tabs & Data Table */}
      <div className="mosaic-card p-6 space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
              User Directory ({users.length})
            </h3>
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="Refresh List"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-[var(--card-border)] rounded-full px-3 py-1.5 text-xs text-[var(--ink-900)] font-semibold"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="bg-white border border-[var(--card-border)] rounded-full px-3 py-1.5 text-xs text-[var(--ink-900)] font-semibold"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Target Career</th>
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No matching users found in database.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-[10px]">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] text-slate-500">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge tone={u.role === 'admin' ? 'purple' : 'info'}>
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {u.preferredCareer || 'Not specified'}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {u.college || 'N/A'}
                      </td>

                      <td className="py-3 px-4">
                        <Badge tone={u.isVerified ? 'success' : 'warning'}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="mosaic-btn-outline !py-1 !px-2.5 !text-[11px] inline-flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="mosaic-card max-w-lg w-full p-6 space-y-4 text-left bg-white relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">User Profile Inspector</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Full Name</span>
                  <span className="font-bold text-slate-900">{selectedUser.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Email</span>
                  <span className="font-bold text-slate-900">{selectedUser.email}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Career & Academic Info</span>
                <p className="text-slate-800">
                  <strong>Track:</strong> {selectedUser.preferredCareer || 'N/A'} • <strong>College:</strong> {selectedUser.college || 'N/A'}
                </p>
                <p className="text-slate-800">
                  <strong>Branch:</strong> {selectedUser.branch || 'N/A'} • <strong>Graduation:</strong> {selectedUser.graduationYear || 'N/A'}
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button onClick={() => setSelectedUser(null)} className="mosaic-btn-outline !py-1.5 !px-4 !text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="mosaic-card max-w-md w-full p-6 space-y-4 text-left bg-white relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">Add User Account</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={addUserForm.name}
                  onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="jane@university.edu"
                  value={addUserForm.email}
                  onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={addUserForm.password}
                  onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">User Role</label>
                <select
                  value={addUserForm.role}
                  onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="mosaic-btn-outline !py-2 !px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="mosaic-btn-brand !py-2 !px-5"
                >
                  {isCreatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MosaicShell>
  );
}

export default AdminDashboard;
