'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  UserPlus, Shield, UserCheck, BookOpen, Check, AlertCircle, Search, 
  Filter, CheckCircle2, Clock, XCircle, Ban, Edit3, Key, Trash2, 
  Layers, ChevronRight, UserX, AlertTriangle, ArrowRight, Sparkles, RefreshCw, X, Activity
} from 'lucide-react';
import { toast } from 'sonner';

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserRecord {
  id: string;
  username: string;
  email: string | null;
  name: string;
  role: 'admin' | 'student';
  status: AccountStatus;
  statusNote: string | null;
  signupGoal: string | null;
  reviewedAt: string | Date | null;
  reviewedBy: string | null;
  points: number;
  avatarUrl: string | null;
  createdAt: string | Date;
  courseIds: string[];
  completedLessons: number;
}

export interface CourseRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  level: string;
  isPublished: boolean;
}

interface UserManagementClientProps {
  users: UserRecord[];
  courses: CourseRecord[];
}

export default function UserManagementClient({ users: initialUsers, courses }: UserManagementClientProps) {
  const [usersList, setUsersList] = useState<UserRecord[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<'pending' | 'directory' | 'matrix' | 'create'>('pending');

  // Directory Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // Multi-Selection State for Bulk Actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkCourseIds, setBulkCourseIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Modals & Active Edit Targets
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editingStatusUser, setEditingStatusUser] = useState<UserRecord | null>(null);
  const [editingCoursesUser, setEditingCoursesUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

  // Form States
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'student' as 'admin' | 'student', password: '' });
  const [statusForm, setStatusForm] = useState<{ status: AccountStatus; note: string; assignedCourseIds: string[] }>({
    status: 'approved',
    note: '',
    assignedCourseIds: [],
  });
  const [userCourseSelection, setUserCourseSelection] = useState<string[]>([]);

  // Create User Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'student' as 'admin' | 'student',
    status: 'approved' as AccountStatus,
    assignedCourseIds: [] as string[],
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Matrix State (Course Centric Assignment)
  const [selectedMatrixCourseId, setSelectedMatrixCourseId] = useState<string>(courses[0]?.id || '');
  const [matrixLearnerSearch, setMatrixLearnerSearch] = useState('');
  const [matrixSaving, setMatrixSaving] = useState(false);

  // Computed Metrics
  const pendingUsers = useMemo(() => usersList.filter(u => u.status === 'pending'), [usersList]);
  const approvedStudents = useMemo(() => usersList.filter(u => u.status === 'approved' && u.role === 'student'), [usersList]);
  const admins = useMemo(() => usersList.filter(u => u.role === 'admin'), [usersList]);
  const flaggedUsers = useMemo(() => usersList.filter(u => u.status === 'rejected' || u.status === 'suspended'), [usersList]);

  // Filtered Users Directory List
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        u.name.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) || 
        (u.email && u.email.toLowerCase().includes(q));

      // Status
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      // Role
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      // Course
      const matchesCourse = courseFilter === 'all' || u.courseIds.includes(courseFilter);

      return matchesSearch && matchesStatus && matchesRole && matchesCourse;
    });
  }, [usersList, searchQuery, statusFilter, roleFilter, courseFilter]);

  // Handle Multi-Select Toggles
  const toggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const toggleSelectAll = (list: UserRecord[]) => {
    const listIds = list.map(u => u.id);
    const allSelected = listIds.every(id => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !listIds.includes(id)));
    } else {
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...listIds])));
    }
  };

  // Backend API Calls
  const handleBulkStatusChange = async (targetStatus: AccountStatus, note?: string) => {
    if (!selectedUserIds.length) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUserIds,
          status: targetStatus,
          note: note || null,
          assignedCourseIds: targetStatus === 'approved' ? bulkCourseIds : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update users');

      setUsersList(prev => prev.map(u => {
        if (selectedUserIds.includes(u.id)) {
          const updatedCourseIds = targetStatus === 'approved' && bulkCourseIds.length > 0
            ? Array.from(new Set([...u.courseIds, ...bulkCourseIds]))
            : u.courseIds;
          return { ...u, status: targetStatus, statusNote: note || null, courseIds: updatedCourseIds };
        }
        return u;
      }));

      toast.success(`Updated ${selectedUserIds.length} user(s) status to ${targetStatus}`);
      setSelectedUserIds([]);
      setBulkCourseIds([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSingleStatusChange = async (userId: string, targetStatus: AccountStatus, note?: string, coursesToAssign?: string[]) => {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: [userId],
          status: targetStatus,
          note: note || null,
          assignedCourseIds: coursesToAssign || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setUsersList(prev => prev.map(u => {
        if (u.id === userId) {
          const updatedCourseIds = coursesToAssign && coursesToAssign.length > 0
            ? Array.from(new Set([...u.courseIds, ...coursesToAssign]))
            : u.courseIds;
          return { ...u, status: targetStatus, statusNote: note || null, courseIds: updatedCourseIds };
        }
        return u;
      }));

      toast.success(`Account status updated to ${targetStatus}`);
      setEditingStatusUser(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveUserCourses = async (userId: string, newCourseIds: string[]) => {
    try {
      const res = await fetch('/api/admin/users/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, courseIds: newCourseIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update course access');

      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, courseIds: newCourseIds } : u));
      toast.success('Course access permissions saved');
      setEditingCoursesUser(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email || null,
          role: editForm.role,
          password: editForm.password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user profile');

      setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data.user } : u));
      toast.success('User account profile updated');
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setUsersList(prev => prev.filter(u => u.id !== deletingUser.id));
      toast.success(`Account @${deletingUser.username} removed`);
      setDeletingUser(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.username || !createForm.password) {
      toast.error('Name, Username, and Password are required');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user account');

      setUsersList(prev => [data.user, ...prev]);
      toast.success(`Account @${data.user.username} created successfully!`);

      // Reset Form
      setCreateForm({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'student',
        status: 'approved',
        assignedCourseIds: [],
      });
      setActiveTab('directory');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Matrix Course Bulk Toggle
  const handleToggleCourseForUser = async (userId: string, courseId: string) => {
    const user = usersList.find(u => u.id === userId);
    if (!user) return;
    const isEnrolled = user.courseIds.includes(courseId);
    const newCourses = isEnrolled 
      ? user.courseIds.filter(id => id !== courseId)
      : [...user.courseIds, courseId];

    await handleSaveUserCourses(userId, newCourses);
  };

  const handleBulkCourseAssignToSelected = async (courseId: string, action: 'assign' | 'unassign') => {
    if (!selectedUserIds.length) return;
    setMatrixSaving(true);
    try {
      const res = await fetch('/api/admin/users/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userIds: selectedUserIds, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update course access');

      setUsersList(prev => prev.map(u => {
        if (selectedUserIds.includes(u.id)) {
          const newCourseIds = action === 'assign'
            ? Array.from(new Set([...u.courseIds, courseId]))
            : u.courseIds.filter(id => id !== courseId);
          return { ...u, courseIds: newCourseIds };
        }
        return u;
      }));

      toast.success(`${action === 'assign' ? 'Assigned' : 'Unassigned'} course for ${selectedUserIds.length} learners`);
      setSelectedUserIds([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setMatrixSaving(false);
    }
  };

  const handleGrantCourseToAllStudents = async (courseId: string) => {
    const allStudentIds = usersList.filter(u => u.role === 'student' && u.status === 'approved').map(u => u.id);
    if (!allStudentIds.length) {
      toast.error('No approved students available');
      return;
    }
    setMatrixSaving(true);
    try {
      const res = await fetch('/api/admin/users/enrollments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userIds: allStudentIds, action: 'assign' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign course');

      setUsersList(prev => prev.map(u => {
        if (allStudentIds.includes(u.id)) {
          return { ...u, courseIds: Array.from(new Set([...u.courseIds, courseId])) };
        }
        return u;
      }));

      toast.success(`Assigned course to all ${allStudentIds.length} active students!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setMatrixSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#919EAB]/12 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="board-label text-[#00AB55]">ACADEMY DIRECTORY & SECURITY</span>
            {pendingUsers.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F3B61F]/15 text-[#F3B61F] border border-[#F3B61F]/30 animate-pulse">
                {pendingUsers.length} PENDING DECISIONS
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">USER & COURSE MANAGEMENT</h1>
          <p className="text-xs text-[#919EAB] mt-1">
            Review signup requests, grant course access, update learner roles, and control academy authentication.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2.5 rounded-xl bg-[#00AB55] hover:bg-[#007B55] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#00AB55]/20"
          >
            <UserPlus className="size-4" /> Create User Account
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div 
          onClick={() => { setActiveTab('directory'); setStatusFilter('all'); }}
          className="minimal-card p-4 cursor-pointer hover:border-[#00AB55]/40 transition-colors"
        >
          <span className="board-label">Total Accounts</span>
          <strong className="text-2xl font-extrabold text-white mt-2 block font-mono">{usersList.length}</strong>
        </div>

        <div 
          onClick={() => setActiveTab('pending')}
          className={`minimal-card p-4 cursor-pointer transition-colors ${pendingUsers.length > 0 ? 'border-[#F3B61F]/50 bg-[#F3B61F]/5' : 'hover:border-[#F3B61F]/40'}`}
        >
          <div className="flex items-center justify-between">
            <span className="board-label text-[#F3B61F]">Pending Review</span>
            {pendingUsers.length > 0 && <Clock className="size-4 text-[#F3B61F] animate-spin" />}
          </div>
          <strong className="text-2xl font-extrabold text-[#F3B61F] mt-2 block font-mono">{pendingUsers.length}</strong>
        </div>

        <div 
          onClick={() => { setActiveTab('directory'); setStatusFilter('approved'); setRoleFilter('student'); }}
          className="minimal-card p-4 cursor-pointer hover:border-[#00AB55]/40 transition-colors"
        >
          <span className="board-label text-[#00AB55]">Active Students</span>
          <strong className="text-2xl font-extrabold text-white mt-2 block font-mono">{approvedStudents.length}</strong>
        </div>

        <div 
          onClick={() => { setActiveTab('directory'); setRoleFilter('admin'); }}
          className="minimal-card p-4 cursor-pointer hover:border-[#3366FF]/40 transition-colors"
        >
          <span className="board-label text-[#3366FF]">Administrators</span>
          <strong className="text-2xl font-extrabold text-white mt-2 block font-mono">{admins.length}</strong>
        </div>

        <div 
          onClick={() => { setActiveTab('directory'); setStatusFilter('rejected'); }}
          className="minimal-card p-4 cursor-pointer hover:border-[#EE6A5F]/40 transition-colors"
        >
          <span className="board-label text-[#EE6A5F]">Suspended / Declined</span>
          <strong className="text-2xl font-extrabold text-[#EE6A5F] mt-2 block font-mono">{flaggedUsers.length}</strong>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#919EAB]/12 space-x-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-[#F3B61F] text-[#F3B61F] bg-[#F3B61F]/5'
              : 'border-transparent text-[#919EAB] hover:text-white hover:bg-[#212B36]/40'
          }`}
        >
          <Clock className="size-4" />
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#F3B61F] text-[#101214] font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'directory'
              ? 'border-[#00AB55] text-[#00AB55] bg-[#00AB55]/5'
              : 'border-transparent text-[#919EAB] hover:text-white hover:bg-[#212B36]/40'
          }`}
        >
          <UserCheck className="size-4" />
          User Directory ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-5 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'matrix'
              ? 'border-[#3366FF] text-[#3366FF] bg-[#3366FF]/5'
              : 'border-transparent text-[#919EAB] hover:text-white hover:bg-[#212B36]/40'
          }`}
        >
          <Layers className="size-4" />
          Course Access Matrix
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`px-5 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'create'
              ? 'border-[#00AB55] text-[#00AB55] bg-[#00AB55]/5'
              : 'border-transparent text-[#919EAB] hover:text-white hover:bg-[#212B36]/40'
          }`}
        >
          <UserPlus className="size-4" />
          New User Account
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingUsers.length === 0 ? (
            <div className="minimal-card p-12 text-center space-y-3 border-dashed border-[#919EAB]/20">
              <div className="size-12 rounded-2xl bg-[#00AB55]/15 text-[#00AB55] grid place-items-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Queue is clear!</h3>
              <p className="text-xs text-[#919EAB] max-w-md mx-auto leading-relaxed">
                There are no pending signup requests waiting for review right now. All requested accounts have been processed.
              </p>
            </div>
          ) : (
            <>
              {/* Bulk Actions Header Bar for Pending Users */}
              <div className="minimal-card p-4 border-[#F3B61F]/30 bg-[#F3B61F]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === pendingUsers.length && pendingUsers.length > 0}
                    onChange={() => toggleSelectAll(pendingUsers)}
                    className="size-4 rounded border-[#919EAB]/40 bg-[#101214] text-[#F3B61F] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold text-[#F3B61F] block">
                      {selectedUserIds.length} of {pendingUsers.length} Pending Accounts Selected
                    </span>
                    <span className="text-[11px] text-[#919EAB]">Select accounts to perform batch approval or rejection.</span>
                  </div>
                </div>

                {selectedUserIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleBulkStatusChange('approved')}
                      disabled={bulkActionLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00AB55] hover:bg-[#007B55] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <CheckCircle2 className="size-3.5" /> Approve Selected ({selectedUserIds.length})
                    </button>

                    <button
                      onClick={() => handleBulkStatusChange('rejected')}
                      disabled={bulkActionLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-[#EE6A5F] hover:bg-[#EE6A5F]/80 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <XCircle className="size-3.5" /> Decline Selected ({selectedUserIds.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Pending User Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingUsers.map(user => (
                  <div key={user.id} className="minimal-card p-6 border-[#F3B61F]/30 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => toggleSelectUser(user.id)}
                            className="size-4 rounded border-[#919EAB]/40 bg-[#101214] text-[#F3B61F] focus:ring-0 cursor-pointer"
                          />
                          <div className="size-10 rounded-xl bg-[#F3B61F]/15 border border-[#F3B61F]/30 text-[#F3B61F] font-bold text-sm flex items-center justify-center font-mono">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{user.name}</h4>
                            <span className="text-xs font-mono text-[#00AB55]">@{user.username}</span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F3B61F]/15 text-[#F3B61F] border border-[#F3B61F]/30">
                          PENDING REVIEW
                        </span>
                      </div>

                      {user.email && (
                        <p className="text-xs text-[#919EAB] font-mono flex items-center gap-1.5">
                          <span>Email:</span> <strong className="text-white">{user.email}</strong>
                        </p>
                      )}

                      {user.signupGoal && (
                        <div className="p-3 rounded-xl bg-[#212B36] border border-[#919EAB]/16 text-xs text-[#919EAB]">
                          <span className="font-bold text-white block mb-1">Stated Learning Goal:</span>
                          &ldquo;{user.signupGoal}&rdquo;
                        </div>
                      )}

                      <p className="text-[11px] font-mono text-[#637381]">
                        Requested on {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Quick Approve with Courses Dropdown / Buttons */}
                    <div className="pt-4 border-t border-[#919EAB]/12 space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-[#919EAB] block">Select initial course access upon approval:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {courses.map(course => {
                            const isAssigned = user.courseIds.includes(course.id);
                            return (
                              <button
                                key={course.id}
                                onClick={() => {
                                  const newIds = isAssigned 
                                    ? user.courseIds.filter(id => id !== course.id) 
                                    : [...user.courseIds, course.id];
                                  handleSaveUserCourses(user.id, newIds);
                                }}
                                className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                                  isAssigned 
                                    ? 'bg-[#00AB55]/20 text-[#00AB55] border-[#00AB55]/40 font-bold' 
                                    : 'bg-[#212B36] text-[#919EAB] border-[#919EAB]/20 hover:text-white'
                                }`}
                              >
                                {isAssigned ? '✓ ' : '+ '}{course.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSingleStatusChange(user.id, 'approved', undefined, user.courseIds)}
                          className="flex-1 py-2 rounded-xl bg-[#00AB55] hover:bg-[#007B55] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                          <CheckCircle2 className="size-4" /> Approve & Grant Access
                        </button>

                        <button
                          onClick={() => {
                            setEditingStatusUser(user);
                            setStatusForm({ status: 'rejected', note: '', assignedCourseIds: [] });
                          }}
                          className="px-3 py-2 rounded-xl bg-[#EE6A5F]/15 hover:bg-[#EE6A5F]/25 text-[#EE6A5F] border border-[#EE6A5F]/30 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <XCircle className="size-4" /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: USER DIRECTORY TABLE */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Filters */}
          <div className="minimal-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#919EAB]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name, username, email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white placeholder:text-[#637381] focus:outline-none focus:border-[#00AB55]"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white focus:outline-none font-mono"
                >
                  <option value="all">Status: All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Declined</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white focus:outline-none font-mono"
                >
                  <option value="all">Role: All</option>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>

                <select
                  value={courseFilter}
                  onChange={e => setCourseFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white focus:outline-none font-mono max-w-[160px] truncate"
                >
                  <option value="all">Course: All</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Multi-Actions Bar */}
            {selectedUserIds.length > 0 && (
              <div className="pt-3 border-t border-[#919EAB]/12 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-mono text-[#00AB55] font-bold">
                  {selectedUserIds.length} user account(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkStatusChange('approved')}
                    className="px-3 py-1.5 rounded-lg bg-[#00AB55] text-white font-bold text-[11px]"
                  >
                    Approve Selected
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('suspended', 'Batch suspended by administrator')}
                    className="px-3 py-1.5 rounded-lg bg-[#EE6A5F] text-white font-bold text-[11px]"
                  >
                    Suspend Selected
                  </button>
                  <button
                    onClick={() => setSelectedUserIds([])}
                    className="px-2.5 py-1.5 text-[#919EAB] hover:text-white font-mono text-[11px]"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Directory Table */}
          <div className="minimal-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F1F0E8]">
                <thead className="bg-[#212B36] text-[#919EAB] font-mono text-[10px] uppercase tracking-wider border-b border-[#919EAB]/12">
                  <tr>
                    <th className="p-3.5 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id))}
                        onChange={() => toggleSelectAll(filteredUsers)}
                        className="size-4 rounded border-[#919EAB]/40 bg-[#101214] text-[#00AB55] focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">User Profile</th>
                    <th className="p-3.5">Handle</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5">Assigned Courses</th>
                    <th className="p-3.5">Activity</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#919EAB]/12">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs text-[#919EAB]">
                        No user accounts match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isSelected = selectedUserIds.includes(u.id);
                      return (
                        <tr key={u.id} className={`hover:bg-[#212B36]/40 transition-colors ${isSelected ? 'bg-[#00AB55]/5' : ''}`}>
                          <td className="p-3.5 pl-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectUser(u.id)}
                              className="size-4 rounded border-[#919EAB]/40 bg-[#101214] text-[#00AB55] focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-[#00AB55]/15 border border-[#00AB55]/30 text-[#00AB55] font-bold text-xs flex items-center justify-center font-mono shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white">{u.name}</p>
                                {u.email && <p className="text-[11px] text-[#919EAB] font-mono">{u.email}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-[#00AB55] font-bold">
                            @{u.username}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize border ${
                              u.role === 'admin' 
                                ? 'bg-[#3366FF]/15 text-[#3366FF] border-[#3366FF]/30 font-bold' 
                                : 'bg-[#212B36] text-[#919EAB] border-[#919EAB]/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {u.status === 'approved' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00AB55]/15 text-[#00AB55] border border-[#00AB55]/30 inline-flex items-center gap-1">
                                <CheckCircle2 className="size-3" /> APPROVED
                              </span>
                            )}
                            {u.status === 'pending' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F3B61F]/15 text-[#F3B61F] border border-[#F3B61F]/30 inline-flex items-center gap-1">
                                <Clock className="size-3" /> PENDING
                              </span>
                            )}
                            {u.status === 'suspended' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EE6A5F]/15 text-[#EE6A5F] border border-[#EE6A5F]/30 inline-flex items-center gap-1">
                                <Ban className="size-3" /> SUSPENDED
                              </span>
                            )}
                            {u.status === 'rejected' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EE6A5F]/15 text-[#EE6A5F] border border-[#EE6A5F]/30 inline-flex items-center gap-1">
                                <XCircle className="size-3" /> DECLINED
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 items-center max-w-[240px]">
                              {u.courseIds.length === 0 ? (
                                <span className="text-[11px] text-[#637381] italic">No courses</span>
                              ) : (
                                u.courseIds.map(cid => {
                                  const course = courses.find(c => c.id === cid);
                                  return course ? (
                                    <span key={cid} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#212B36] text-[#F1F0E8] border border-[#919EAB]/20 truncate max-w-[110px]" title={course.title}>
                                      {course.title}
                                    </span>
                                  ) : null;
                                })
                              )}
                              <button
                                onClick={() => {
                                  setEditingCoursesUser(u);
                                  setUserCourseSelection([...u.courseIds]);
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#00AB55] hover:bg-[#00AB55]/10 border border-dashed border-[#00AB55]/30"
                              >
                                Edit Access
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-xs">
                            <span className="text-white font-bold">{u.completedLessons}</span> <span className="text-[#919EAB]">lessons</span>
                            <span className="mx-1 text-[#637381]">|</span>
                            <span className="text-[#F3B61F] font-bold">{u.points}</span> <span className="text-[#919EAB]">pts</span>
                          </td>
                          <td className="p-3.5 text-right pr-4 space-x-1">
                            <Link
                              href={`/admin/progress?userId=${u.id}`}
                              title="View student progress"
                              className="inline-flex p-1.5 rounded-lg bg-[#212B36] hover:bg-[#3366FF]/20 text-[#3366FF] transition-colors"
                            >
                              <Activity className="size-3.5" />
                            </Link>

                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditForm({ name: u.name, email: u.email || '', role: u.role, password: '' });
                              }}
                              title="Edit user details"
                              className="p-1.5 rounded-lg bg-[#212B36] hover:bg-[#919EAB]/20 text-[#919EAB] hover:text-white transition-colors"
                            >
                              <Edit3 className="size-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingStatusUser(u);
                                setStatusForm({ status: u.status, note: u.statusNote || '', assignedCourseIds: u.courseIds });
                              }}
                              title="Change account status"
                              className="p-1.5 rounded-lg bg-[#212B36] hover:bg-[#919EAB]/20 text-[#F3B61F] transition-colors"
                            >
                              <Shield className="size-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingUser(u)}
                              title="Delete account"
                              className="p-1.5 rounded-lg bg-[#212B36] hover:bg-[#EE6A5F]/20 text-[#EE6A5F] transition-colors"
                            >
                              <Trash2 className="size-3.5" />
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
        </div>
      )}

      {/* TAB 3: DEDICATED COURSE ACCESS MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="minimal-card p-6 border-[#3366FF]/30 bg-[#3366FF]/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="board-label text-[#3366FF]">BATCH COURSE ASSIGNMENT CONTROL</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Course Access Management</h3>
                <p className="text-xs text-[#919EAB] mt-0.5">
                  Select a course to view enrolled vs unassigned learners, or grant immediate access to active students.
                </p>
              </div>

              {selectedMatrixCourseId && (
                <button
                  onClick={() => handleGrantCourseToAllStudents(selectedMatrixCourseId)}
                  disabled={matrixSaving}
                  className="px-4 py-2.5 rounded-xl bg-[#3366FF] hover:bg-[#3366FF]/80 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
                >
                  <Sparkles className="size-4" /> Grant Course to All Active Students
                </button>
              )}
            </div>

            {/* Course Selector Cards Bar */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              {courses.map(c => {
                const isSelected = c.id === selectedMatrixCourseId;
                const enrolledCount = usersList.filter(u => u.courseIds.includes(c.id)).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedMatrixCourseId(c.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-[#3366FF]/20 border-[#3366FF] text-white shadow-lg' 
                        : 'bg-[#212B36] border-[#919EAB]/20 text-[#919EAB] hover:border-[#919EAB]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate pr-2 text-white">{c.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#101214] text-[#3366FF] font-bold">
                        {enrolledCount} enrolled
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#637381] block">Level: {c.level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Course Learner Management Table */}
          {selectedMatrixCourseId && (
            <div className="minimal-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#919EAB]/12">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="size-4 text-[#3366FF]" />
                  Learner Roster for: &ldquo;{courses.find(c => c.id === selectedMatrixCourseId)?.title}&rdquo;
                </h4>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={matrixLearnerSearch}
                    onChange={e => setMatrixLearnerSearch(e.target.value)}
                    placeholder="Search learners..."
                    className="px-3 py-1.5 rounded-lg bg-[#212B36] border border-[#919EAB]/20 text-xs text-white placeholder:text-[#637381] focus:outline-none"
                  />
                  {selectedUserIds.length > 0 && (
                    <>
                      <button
                        onClick={() => handleBulkCourseAssignToSelected(selectedMatrixCourseId, 'assign')}
                        disabled={matrixSaving}
                        className="px-3 py-1.5 rounded-lg bg-[#00AB55] text-white font-bold text-xs"
                      >
                        Enroll Selected ({selectedUserIds.length})
                      </button>
                      <button
                        onClick={() => handleBulkCourseAssignToSelected(selectedMatrixCourseId, 'unassign')}
                        disabled={matrixSaving}
                        className="px-3 py-1.5 rounded-lg bg-[#EE6A5F] text-white font-bold text-xs"
                      >
                        Unassign Selected ({selectedUserIds.length})
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Learner Rows */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {usersList
                  .filter(u => {
                    const q = matrixLearnerSearch.toLowerCase();
                    return !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
                  })
                  .map(user => {
                    const isEnrolled = user.courseIds.includes(selectedMatrixCourseId);
                    const isSelected = selectedUserIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isEnrolled 
                            ? 'bg-[#00AB55]/10 border-[#00AB55]/40 text-white' 
                            : 'bg-[#212B36]/60 border-[#919EAB]/16 text-[#919EAB]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(user.id)}
                            className="size-4 rounded border-[#919EAB]/40 bg-[#101214] text-[#3366FF] focus:ring-0 cursor-pointer"
                          />
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] font-mono text-[#00AB55]">@{user.username}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleCourseForUser(user.id, selectedMatrixCourseId)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold shrink-0 border transition-all ${
                            isEnrolled
                              ? 'bg-[#EE6A5F]/20 text-[#EE6A5F] border-[#EE6A5F]/30 hover:bg-[#EE6A5F]/30'
                              : 'bg-[#00AB55] text-white border-[#00AB55] hover:bg-[#007B55]'
                          }`}
                        >
                          {isEnrolled ? 'Revoke' : 'Assign'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CREATE NEW USER ACCOUNT */}
      {activeTab === 'create' && (
        <div className="minimal-card p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-[#919EAB]/12">
            <div className="size-10 rounded-xl bg-[#00AB55]/15 border border-[#00AB55]/30 text-[#00AB55] grid place-items-center">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Academy Account</h3>
              <p className="text-xs text-[#919EAB]">Directly generate login credentials and assign workspace course access.</p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#919EAB]">Full Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Maya Lin"
                  required
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white placeholder:text-[#637381] focus:outline-none focus:border-[#00AB55]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#919EAB]">Username *</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={e => setCreateForm(prev => ({ ...prev, username: e.target.value.toLowerCase() }))}
                  placeholder="e.g. maya_lin"
                  required
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white placeholder:text-[#637381] focus:outline-none focus:border-[#00AB55] font-mono"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#919EAB]">Email Address (optional)</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="maya@example.com"
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white placeholder:text-[#637381] focus:outline-none focus:border-[#00AB55]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#919EAB]">Initial Password *</label>
                <input
                  type="text"
                  value={createForm.password}
                  onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Set account password"
                  required
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white placeholder:text-[#637381] focus:outline-none focus:border-[#00AB55] font-mono"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#919EAB]">Account Role</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, role: 'student' }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      createForm.role === 'student'
                        ? 'bg-[#00AB55]/20 text-[#00AB55] border-[#00AB55]'
                        : 'bg-[#212B36] text-[#919EAB] border-[#919EAB]/20'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, role: 'admin' }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      createForm.role === 'admin'
                        ? 'bg-[#3366FF]/20 text-[#3366FF] border-[#3366FF]'
                        : 'bg-[#212B36] text-[#919EAB] border-[#919EAB]/20'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#919EAB]">Approval Status</label>
                <select
                  value={createForm.status}
                  onChange={e => setCreateForm(prev => ({ ...prev, status: e.target.value as AccountStatus }))}
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white focus:outline-none font-mono"
                >
                  <option value="approved">Approved (Immediate Access)</option>
                  <option value="pending">Pending Admin Review</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Course Access Checklist */}
            <div className="space-y-2 pt-2 border-t border-[#919EAB]/12">
              <label className="text-xs font-mono font-bold text-[#919EAB] block">Assign Courses to Workspace:</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {courses.map(course => {
                  const isChecked = createForm.assignedCourseIds.includes(course.id);
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setCreateForm(prev => ({
                          ...prev,
                          assignedCourseIds: isChecked
                            ? prev.assignedCourseIds.filter(id => id !== course.id)
                            : [...prev.assignedCourseIds, course.id]
                        }));
                      }}
                      className={`p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-[#00AB55]/15 border-[#00AB55] text-white' 
                          : 'bg-[#212B36] border-[#919EAB]/20 text-[#919EAB]'
                      }`}
                    >
                      <span className="font-bold truncate pr-2">{course.title}</span>
                      {isChecked && <Check className="size-4 text-[#00AB55] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full py-3 rounded-xl bg-[#00AB55] hover:bg-[#007B55] text-white font-bold text-xs shadow-lg shadow-[#00AB55]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <UserPlus className="size-4" />
              {createLoading ? 'Creating Account...' : 'Create Account & Grant Access'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL 1: EDIT USER DETAILS */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="minimal-card p-6 border-[#919EAB]/30 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#919EAB]/12 pb-3">
              <h3 className="text-base font-bold text-white">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="text-[#919EAB] hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#919EAB]">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#919EAB]">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#919EAB]">Account Role</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'student' }))}
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white font-mono"
                >
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#919EAB]">Reset Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="New password..."
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#212B36] text-[#919EAB] hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00AB55] hover:bg-[#007B55] text-white font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ACCOUNT STATUS */}
      {editingStatusUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="minimal-card p-6 border-[#F3B61F]/40 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#919EAB]/12 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Update Account Status</h3>
                <span className="text-xs font-mono text-[#00AB55]">@{editingStatusUser.username}</span>
              </div>
              <button onClick={() => setEditingStatusUser(null)} className="text-[#919EAB] hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#919EAB]">Status</label>
                <select
                  value={statusForm.status}
                  onChange={e => setStatusForm(prev => ({ ...prev, status: e.target.value as AccountStatus }))}
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white font-mono"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Declined</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#919EAB]">Status Note / Reason (optional)</label>
                <textarea
                  value={statusForm.note}
                  onChange={e => setStatusForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Reason for suspension, rejection, or review note..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-[#212B36] border border-[#919EAB]/20 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStatusUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#212B36] text-[#919EAB] hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSingleStatusChange(editingStatusUser.id, statusForm.status, statusForm.note)}
                  className="flex-1 py-2.5 rounded-xl bg-[#00AB55] hover:bg-[#007B55] text-white font-bold text-xs"
                >
                  Apply Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COURSE ACCESS SELECTION */}
      {editingCoursesUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="minimal-card p-6 border-[#3366FF]/40 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#919EAB]/12 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Course Access Permissions</h3>
                <span className="text-xs font-mono text-[#00AB55]">{editingCoursesUser.name} (@{editingCoursesUser.username})</span>
              </div>
              <button onClick={() => setEditingCoursesUser(null)} className="text-[#919EAB] hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono text-[#919EAB]">Toggle course access for this student workspace:</span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {courses.map(c => {
                  const isChecked = userCourseSelection.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setUserCourseSelection(prev => 
                          isChecked ? prev.filter(id => id !== c.id) : [...prev, c.id]
                        );
                      }}
                      className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-[#3366FF]/20 border-[#3366FF] text-white' 
                          : 'bg-[#212B36] border-[#919EAB]/20 text-[#919EAB]'
                      }`}
                    >
                      <span className="font-bold truncate pr-2">{c.title}</span>
                      {isChecked && <Check className="size-4 text-[#3366FF]" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCoursesUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#212B36] text-[#919EAB] hover:text-white font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveUserCourses(editingCoursesUser.id, userCourseSelection)}
                  className="flex-1 py-2.5 rounded-xl bg-[#3366FF] hover:bg-[#3366FF]/80 text-white font-bold text-xs"
                >
                  Save Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="minimal-card p-6 border-[#EE6A5F]/40 max-w-md w-full space-y-4 text-center">
            <div className="size-12 rounded-2xl bg-[#EE6A5F]/20 text-[#EE6A5F] grid place-items-center mx-auto">
              <AlertTriangle className="size-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete User Account?</h3>
              <p className="text-xs text-[#919EAB] leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-white">@{deletingUser.username}</strong> ({deletingUser.name})? This will delete all completed lessons, points, and submissions.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#212B36] text-[#919EAB] hover:text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-[#EE6A5F] hover:bg-[#EE6A5F]/80 text-white font-bold text-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
