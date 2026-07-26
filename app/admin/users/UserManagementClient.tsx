'use client';

import { useState } from 'react';
import { UserPlus, Shield, UserCheck, BookOpen, Check, AlertCircle } from 'lucide-react';

interface UserManagementClientProps {
  users: any[];
  courses: any[];
}

export default function UserManagementClient({ users: initialUsers, courses }: UserManagementClientProps) {
  const [usersList, setUsersList] = useState(initialUsers);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          name: name.trim(),
          role,
          assignedCourseIds: selectedCourseIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setUsersList(prev => [data.user, ...prev]);
      setSuccess(`Account @${data.user.username} created successfully with assigned courses!`);

      // Reset form
      setUsername('');
      setPassword('');
      setName('');
      setSelectedCourseIds([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create User Card */}
      <div className="p-8 rounded-3xl glass-panel border border-indigo-500/20 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">Create New User Account</h2>
            <p className="text-xs text-slate-400">Generate credentials and assign specific courses (Students only see assigned courses).</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john_doe"
                required
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password *</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set password"
                required
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs font-medium text-slate-300">Account Role:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  role === 'student'
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  role === 'admin'
                    ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Administrator
              </button>
            </div>
          </div>

          {/* Course Assignment Selection */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-medium text-slate-300">Assign Courses to Student Workspace:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {courses.map((course) => {
                const isSelected = selectedCourseIds.includes(course.id);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourseSelection(course.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate pr-2 font-medium">{course.title}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating User Account...' : 'Create Account & Save Course Access'}
          </button>
        </form>
      </div>

      {/* Users Directory Table */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-400" /> Existing Users Directory ({usersList.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">User</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Points</th>
                <th className="p-3 rounded-r-xl">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-semibold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </td>
                  <td className="p-3 font-mono text-indigo-300">@{u.username}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-amber-400">{u.points || 0} PTS</td>
                  <td className="p-3 font-mono text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
