import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  Save,
  RefreshCw,
  Github,
  Linkedin,
  BookOpen,
  ArrowLeft,
  Code2,
  RotateCw,
} from 'lucide-react';
import { CANONICAL_CAREER_PATHS } from '../constants/careerPaths';

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

const POPULAR_INTERESTS = [
  'Open Source',
  'Competitive Coding',
  'Web Development',
  'Mobile Development',
  'Machine Learning',
  'Cloud Computing',
  'System Design',
  'UI/UX Design',
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
      // Parse skills & interests from comma-separated strings
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
      // First save username if changed
      const patchRes = await api.patch('/users/profile', { leetcodeUsername: formData.leetcodeUsername.trim() });
      setUser(patchRes.data.user);

      // Now trigger force refresh
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
    <div className="min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-8 text-left">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-muted-foreground hover:text-white flex items-center space-x-1 mb-2 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold font-heading">Profile & Career Settings</h1>
            <p className="text-sm text-muted-foreground">
              Update your academic status, target career path, and skills anytime.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 rounded-xl text-xs text-indigo-400 font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Keeps your AI Roadmaps accurate</span>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Academic & Personal Info */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-bold font-heading">Academic Profile</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">College / University</label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Branch / Stream</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science, ISE, ECE"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Current Semester</label>
                  <select
                    name="currentSemester"
                    value={formData.currentSemester}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    min="2024"
                    max="2030"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Career Goals & Target Role */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              <h2 className="text-xl font-bold font-heading">Career Goal & Preferences</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Target Career Track</label>
                <select
                  name="preferredCareer"
                  value={formData.preferredCareer}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-indigo-500 transition"
                >
                  {CANONICAL_CAREER_PATHS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Dream Company (Optional)</label>
                <input
                  type="text"
                  name="dreamCompany"
                  value={formData.dreamCompany}
                  onChange={handleChange}
                  placeholder="e.g. Google, Microsoft, Atlassian"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Target Company Type</label>
                <select
                  name="targetCompanyType"
                  value={formData.targetCompanyType}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Product-Based">Product-Based (FAANG, Unicorns)</option>
                  <option value="Service-Based">Service-Based (TCS, Infosys, Wipro)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Skills & Social Profiles */}
          <div className="glass-panel rounded-2xl p-6 space-y-6">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-bold font-heading">Skills & Online Profiles</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Current Skills (Comma Separated)</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. HTML, CSS, JavaScript, React, Python, Git"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Popular Skill Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-semibold'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {isSelected ? `✓ ${popSkill}` : popSkill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Interests / Domains (Comma Separated)</label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="e.g. Web Development, Machine Learning, System Design"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Popular Domain Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_INTERESTS.map((popInt) => {
                      const isSelected = isItemInCommaString(formData.interests, popInt);
                      return (
                        <button
                          key={popInt}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              interests: toggleCommaSeparatedItem(prev.interests, popInt),
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                            isSelected
                              ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-semibold'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {isSelected ? `✓ ${popInt}` : popInt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center space-x-1.5">
                    <Linkedin className="h-4 w-4 text-blue-400" />
                    <span>LinkedIn URL</span>
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center space-x-1.5">
                    <Github className="h-4 w-4 text-purple-400" />
                    <span>GitHub URL</span>
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2 bg-white/[0.02] border border-amber-500/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase text-amber-400 flex items-center space-x-1.5">
                      <Code2 className="h-4 w-4 text-amber-400" />
                      <span>LeetCode Username (Live Problem Tracking)</span>
                    </label>
                    {user?.leetcodeUsername && (
                      <span className="text-[11px] text-muted-foreground">
                        Last Synced: {user.leetcodeStatsLastFetchedAt ? new Date(user.leetcodeStatsLastFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="leetcodeUsername"
                      value={formData.leetcodeUsername}
                      onChange={handleChange}
                      placeholder="e.g. neal_wu or your_leetcode_handle"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleSyncLeetCode}
                      disabled={isSyncingLeetCode}
                      className="bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
                    >
                      <RotateCw className={`h-3.5 w-3.5 ${isSyncingLeetCode ? 'animate-spin' : ''}`} />
                      <span>{isSyncingLeetCode ? 'Syncing...' : 'Sync LeetCode'}</span>
                    </button>
                  </div>
                  {user?.leetcodeUsername && (
                    <p className="text-xs text-muted-foreground flex items-center gap-3 pt-1">
                      <span>Total Solved: <strong className="text-white font-semibold">{(user.leetcodeEasyCount || 0) + (user.leetcodeMediumCount || 0) + (user.leetcodeHardCount || 0)}</strong> (Easy: {user.leetcodeEasyCount || 0}, Med: {user.leetcodeMediumCount || 0}, Hard: {user.leetcodeHardCount || 0})</span>
                      {user.leetcodeRanking ? <span>• Rank: <strong className="text-white font-semibold">#{user.leetcodeRanking.toLocaleString()}</strong></span> : null}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Regenerate AI Roadmap Checkbox Callout */}
          <div className="glass-panel rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-indigo-400" />
                <span>Regenerate AI Roadmap on Save?</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Check this if you changed your Target Career or Semester and want a fresh AI learning plan.
              </p>
            </div>
            <input
              type="checkbox"
              checked={regenerateRoadmap}
              onChange={(e) => setRegenerateRoadmap(e.target.checked)}
              className="h-5 w-5 rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Submit Controls */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold text-muted-foreground hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:opacity-90 transition text-primary-foreground font-semibold px-8 py-3 rounded-xl shadow-lg glow-primary flex items-center space-x-2 text-sm disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default ProfileSettings;
