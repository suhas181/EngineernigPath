import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Save,
  BookOpen,
  Code2,
  RotateCw,
  User,
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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'social'>('profile');

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

  const [regenerateRoadmap, setRegenerateRoadmap] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingLeetCode, setIsSyncingLeetCode] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'graduationYear' || name === 'currentSemester' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const interestsArray = formData.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        college: formData.college,
        branch: formData.branch,
        graduationYear: formData.graduationYear,
        currentSemester: formData.currentSemester,
        preferredCareer: formData.preferredCareer,
        dreamCompany: formData.dreamCompany,
        targetCompanyType: formData.targetCompanyType,
        skills: skillsArray,
        interests: interestsArray,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        leetcodeUsername: formData.leetcodeUsername,
      };

      const res = await api.patch('/users/profile', payload);
      setUser(res.data.user);
      toast.success('Profile updated successfully! 🎉');

      if (regenerateRoadmap) {
        toast.loading('Redirecting to generate updated AI Roadmap...');
        setTimeout(() => {
          navigate('/roadmaps?generate=true');
        }, 1200);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncLeetCode = async () => {
    if (!formData.leetcodeUsername.trim()) {
      toast.error('Please enter your LeetCode username first');
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
        subtitle="Manage academic status, target career path, and profile configurations"
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
          <div className="mosaic-card p-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                activeTab === 'profile'
                  ? 'bg-teal-50 text-teal-800 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="h-4 w-4 text-teal-600" />
              <span>General Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('academic')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                activeTab === 'academic'
                  ? 'bg-teal-50 text-teal-800 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="h-4 w-4 text-purple-600" />
              <span>Academic & Role</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition ${
                activeTab === 'social'
                  ? 'bg-teal-50 text-teal-800 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>Skills & LeetCode</span>
            </button>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSubmit} className="mosaic-card p-8 space-y-8 bg-white">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <User className="h-5 w-5 text-teal-600" />
                  <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                    Personal Information
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500">College / University</label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                    Academic Timeline & Target Track
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold uppercase tracking-wider text-slate-500">Target Career Track</label>
                    <select
                      name="preferredCareer"
                      value={formData.preferredCareer}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:outline-none focus:border-teal-600"
                    >
                      {CANONICAL_CAREER_PATHS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500">Current Semester</label>
                    <select
                      name="currentSemester"
                      value={formData.currentSemester}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-teal-600"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500">Graduation Year</label>
                    <input
                      type="number"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      min="2024"
                      max="2030"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2 text-xs">
                  <input
                    type="checkbox"
                    id="regen"
                    checked={regenerateRoadmap}
                    onChange={(e) => setRegenerateRoadmap(e.target.checked)}
                    className="h-4 w-4 rounded text-teal-600"
                  />
                  <label htmlFor="regen" className="text-slate-700 font-semibold cursor-pointer">
                    Regenerate AI Roadmap on Save
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-bold text-[var(--ink-900)] font-heading">
                    Skills & Live Tracking Integrations
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase tracking-wider text-slate-500">Current Skills</label>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      rows={2}
                      placeholder="e.g. React, Node.js, Python, TypeScript"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {POPULAR_SKILLS.map((popSkill) => {
                        const isSelected = isItemInCommaString(formData.skills, popSkill);
                        return (
                          <button
                            key={popSkill}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                skills: toggleCommaSeparatedItem(prev.skills, popSkill),
                              }));
                            }}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition ${
                              isSelected
                                ? 'bg-teal-100 border-teal-300 text-teal-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? `✓ ${popSkill}` : popSkill}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-amber-950 flex items-center space-x-1.5 uppercase tracking-wider">
                        <Code2 className="h-4 w-4 text-amber-600" />
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
                        className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSyncLeetCode}
                        disabled={isSyncingLeetCode}
                        className="mosaic-btn-brand !py-2 !px-4 !text-xs flex items-center space-x-1"
                      >
                        <RotateCw className={`h-3.5 w-3.5 ${isSyncingLeetCode ? 'animate-spin' : ''}`} />
                        <span>{isSyncingLeetCode ? 'Syncing...' : 'Sync Now'}</span>
                      </button>
                    </div>

                    {user?.leetcodeStatsLastFetchedAt && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-semibold text-amber-900 border-t border-amber-200/60">
                        <span className="bg-amber-100/80 px-2 py-0.5 rounded-md">
                          Total Solved: <strong>{(user.leetcodeEasyCount || 0) + (user.leetcodeMediumCount || 0) + (user.leetcodeHardCount || 0)}</strong>
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          Easy: {user.leetcodeEasyCount || 0}
                        </span>
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          Med: {user.leetcodeMediumCount || 0}
                        </span>
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                          Hard: {user.leetcodeHardCount || 0}
                        </span>
                        {user.leetcodeRanking ? (
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
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
    </MosaicShell>
  );
}

export default ProfileSettings;
