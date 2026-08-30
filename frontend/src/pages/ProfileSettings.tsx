import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Save,
  BookOpen,
  Code2,
  RotateCw,
  User,
  Sun,
  Moon,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { CANONICAL_CAREER_PATHS } from '../constants/careerPaths';
import { MosaicShell } from '../components/mosaic/MosaicShell';
import { TopHeader } from '../components/mosaic/TopHeader';

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'Java',
  'C++',
  'SQL',
  'MongoDB',
  'Docker',
  'Git',
  'TailwindCSS',
  'AWS',
];

const toggleCommaSeparatedItem = (currentStr: string, item: string): string => {
  const items = currentStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const normalizedTarget = item.toLowerCase();
  const exists = items.some((i) => i.toLowerCase() === normalizedTarget);

  if (exists) {
    const filtered = items.filter((i) => i.toLowerCase() !== normalizedTarget);
    return filtered.join(', ');
  } else {
    return [...items, item].join(', ');
  }
};

const isItemInCommaString = (currentStr: string, item: string): boolean => {
  const items = currentStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.some((i) => i.toLowerCase() === item.toLowerCase());
};

export function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'social' | 'appearance'>('profile');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear || 2026,
    currentSemester: user?.currentSemester || 5,
    preferredCareer: user?.preferredCareer || 'Software Engineer (SDE)',
    dreamCompany: user?.dreamCompany || '',
    targetCompanyType: user?.targetCompanyType || 'Product-Based',
    skills: user?.skills ? user.skills.join(', ') : '',
    interests: user?.interests ? user.interests.join(', ') : '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    leetcodeUsername: user?.leetcodeUsername || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingLeetCode, setIsSyncingLeetCode] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'graduationYear' || name === 'currentSemester' ? Number(value) : value,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: toggleCommaSeparatedItem(prev.skills, skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        graduationYear: formData.graduationYear,
        currentSemester: formData.currentSemester,
        preferredCareer: formData.preferredCareer,
        dreamCompany: formData.dreamCompany.trim(),
        targetCompanyType: formData.targetCompanyType,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        interests: formData.interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        linkedinUrl: formData.linkedinUrl.trim(),
        githubUrl: formData.githubUrl.trim(),
        leetcodeUsername: formData.leetcodeUsername.trim(),
      };

      const res = await api.patch('/users/profile', payload);
      setUser(res.data.user);
      toast.success('Profile and preferences updated successfully! 🚀');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Could not save profile updates');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncLeetCode = async () => {
    if (!formData.leetcodeUsername.trim()) {
      toast.error('Please enter a LeetCode username before syncing.');
      return;
    }
    setIsSyncingLeetCode(true);
    try {
      const patchRes = await api.patch('/users/profile', { leetcodeUsername: formData.leetcodeUsername.trim() });
      setUser(patchRes.data.user);

      const res = await api.post('/users/leetcode/refresh');
      setUser(res.data.user);
      const total = (res.data.user.leetcodeEasyCount || 0) + (res.data.user.leetcodeMediumCount || 0) + (res.data.user.leetcodeHardCount || 0);
      toast.success(`LeetCode stats synced! (${total} Solved, Rank: ${res.data.user.leetcodeRanking || 'N/A'}) 🚀`);
    } catch (err: any) {
      console.error('Failed to sync LeetCode stats:', err);
      toast.error(err.response?.data?.message || 'Could not verify LeetCode username. Please check and try again.');
    } finally {
      setIsSyncingLeetCode(false);
    }
  };

  return (
    <MosaicShell>
      <TopHeader
        title="Settings & Profile Preferences"
        subtitle="Manage academic status, target career path, appearance, and profile configurations"
        primaryActionLabel={isSaving ? 'Saving...' : 'Save Changes'}
        onPrimaryAction={() => {
          const btn = document.getElementById('submit-profile-form');
          if (btn) btn.click();
        }}
        primaryActionIcon={<Save className="h-4 w-4" />}
      />

      <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
        {/* Left Sub-Nav Panel */}
        <div className="lg:col-span-3 space-y-2">
          <div className="mosaic-card p-3 space-y-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                activeTab === 'profile'
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>General Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('academic')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                activeTab === 'academic'
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Academic & Role</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                activeTab === 'social'
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Skills & LeetCode</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                activeTab === 'appearance'
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Palette className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <span>Appearance & Theme</span>
            </button>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-9">
          <div className="mosaic-card p-8 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Tab: Appearance & Theme */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Palette className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                    Appearance & Theme Preferences
                  </h3>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Choose your interface theme preference. Your selection is stored in your browser and persists across visits.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col space-y-3 cursor-pointer ${
                      theme === 'light'
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 w-fit">
                        <Sun className="h-5 w-5" />
                      </div>
                      {theme === 'light' && (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--ink-900)]">Light Mode ☀️</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Crisp, high-contrast light surfaces for daytime productivity and clarity.
                      </p>
                    </div>
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col space-y-3 cursor-pointer ${
                      theme === 'dark'
                        ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
                        <Moon className="h-5 w-5" />
                      </div>
                      {theme === 'dark' && (
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-teal-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--ink-900)]">Dark Mode 🌙</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Deep slate and navy tones tailored for low-light focus and reduced eye strain.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">College / University</label>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                      Academic Timeline & Target Track
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Career Track</label>
                      <select
                        name="preferredCareer"
                        value={formData.preferredCareer}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                      >
                        {CANONICAL_CAREER_PATHS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Semester</label>
                      <select
                        name="currentSemester"
                        value={formData.currentSemester}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Graduation Year</label>
                      <select
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                      >
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                          <option key={yr} value={yr}>
                            Class of {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                      Technical Skills & Coding Profiles
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Popular Engineering Skills (Click to Toggle)
                      </label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {POPULAR_SKILLS.map((skill) => {
                          const active = isItemInCommaString(formData.skills, skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillToggle(skill)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                                active
                                  ? 'bg-teal-600 text-white border-teal-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              {active ? `✓ ${skill}` : `+ ${skill}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-amber-950 dark:text-amber-300 flex items-center space-x-1.5 uppercase tracking-wider">
                          <Code2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span>LeetCode Username Sync</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="leetcodeUsername"
                          value={formData.leetcodeUsername}
                          onChange={handleChange}
                          placeholder="e.g. leetcode_handle"
                          className="flex-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSyncLeetCode}
                          disabled={isSyncingLeetCode}
                          className="mosaic-btn-brand !py-2 !px-4 !text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <RotateCw className={`h-3.5 w-3.5 ${isSyncingLeetCode ? 'animate-spin' : ''}`} />
                          <span>{isSyncingLeetCode ? 'Syncing...' : 'Sync Now'}</span>
                        </button>
                      </div>

                      {user?.leetcodeStatsLastFetchedAt && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-semibold text-amber-900 dark:text-amber-300 border-t border-amber-200/60 dark:border-amber-900/40">
                          <span className="bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                            Total Solved: <strong>{(user.leetcodeEasyCount || 0) + (user.leetcodeMediumCount || 0) + (user.leetcodeHardCount || 0)}</strong>
                          </span>
                          <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                            Easy: {user.leetcodeEasyCount || 0}
                          </span>
                          <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                            Med: {user.leetcodeMediumCount || 0}
                          </span>
                          <span className="bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-md">
                            Hard: {user.leetcodeHardCount || 0}
                          </span>
                          {user.leetcodeRanking ? (
                            <span className="bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md">
                              Rank: #{user.leetcodeRanking.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" id="submit-profile-form" className="hidden">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </MosaicShell>
  );
}

export default ProfileSettings;
