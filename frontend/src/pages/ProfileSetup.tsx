import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  X,
  Plus,
  Loader2,
} from 'lucide-react';

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

const profileSetupSchema = z.object({
  college: z.string().min(2, 'College name must be at least 2 characters'),
  branch: z.string().min(2, 'Branch name must be at least 2 characters'),
  cgpa: z.coerce.number().min(0, 'CGPA must be positive').max(10, 'CGPA cannot exceed 10'),
  graduationYear: z.coerce.number().int().min(2020).max(2035, 'Invalid graduation year'),
  currentSemester: z.coerce.number().int().min(1).max(8),
  preferredCareer: z.string().min(2, 'Please select a preferred career path'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      college: user?.college || '',
      branch: user?.branch || '',
      cgpa: user?.cgpa || 0,
      graduationYear: user?.graduationYear || new Date().getFullYear() + 2,
      currentSemester: user?.currentSemester || 3,
      preferredCareer: user?.preferredCareer || 'Software Engineer (SDE)',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
    },
  });

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['college', 'branch', 'cgpa', 'graduationYear', 'currentSemester']);
    } else if (step === 2) {
      isValid = await trigger(['preferredCareer']);
      if (skills.length === 0) {
        toast.error('Please add at least one skill.');
        return;
      }
    }
    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInterest = interestInput.trim();
    if (cleanInterest && !interests.includes(cleanInterest)) {
      setInterests([...interests, cleanInterest]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileSetupFormValues) => {
    setIsSubmitting(true);
    try {
      let profileImageUrl = user?.profileImage || '';

      // Upload image first if a new one is selected
      if (imageFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
          const uploadRes = await api.post('/users/profile/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          profileImageUrl = uploadRes.data.profileImage;
          toast.success('Profile picture uploaded successfully!');
        } catch (err) {
          console.error('Image upload failed, continuing with profile details:', err);
          toast.error('Failed to upload profile image.');
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Save rest of profile
      const response = await api.patch('/users/profile', {
        ...data,
        skills,
        interests,
        profileImage: profileImageUrl,
      });

      updateUser(response.data.user);
      toast.success('Your profile setup is complete!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <div className="glass-panel max-w-2xl w-full rounded-2xl p-8 md:p-10 shadow-2xl glow-primary text-white">
        
        {/* Profile Completion Bar */}
        <div className="mb-10 space-y-3">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Complete Your Profile
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Let's customize your learning roadmap and internship recommendations.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              <span>Profile Completion</span>
              <span className="font-bold text-blue-400">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out animate-pulse"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* STEP 1: Education */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="text-lg font-semibold font-heading text-blue-400">Academic Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* College */}
                <div className="col-span-2 space-y-1 text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">College Name</label>
                  <input
                    type="text"
                    placeholder="Indian Institute of Technology, Madras"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
                    {...register('college')}
                  />
                  {errors.college && <span className="text-xs text-destructive">{errors.college.message}</span>}
                </div>

                {/* Branch */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Branch / Major</label>
                  <input
                    type="text"
                    placeholder="Computer Science Engineering"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
                    {...register('branch')}
                  />
                  {errors.branch && <span className="text-xs text-destructive">{errors.branch.message}</span>}
                </div>

                {/* CGPA */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">CGPA (Out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="8.5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
                    {...register('cgpa')}
                  />
                  {errors.cgpa && <span className="text-xs text-destructive">{errors.cgpa.message}</span>}
                </div>

                {/* Graduation Year */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Graduation Year</label>
                  <input
                    type="number"
                    placeholder="2027"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
                    {...register('graduationYear')}
                  />
                  {errors.graduationYear && <span className="text-xs text-destructive">{errors.graduationYear.message}</span>}
                </div>

                {/* Current Semester */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Current Semester</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition appearance-none"
                    {...register('currentSemester')}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem} className="bg-slate-900 text-white">Semester {sem}</option>
                    ))}
                  </select>
                  {errors.currentSemester && <span className="text-xs text-destructive">{errors.currentSemester.message}</span>}
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: Career Path & Skills */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="text-lg font-semibold font-heading text-blue-400">Career Preferences & Core Skills</h3>
              
              {/* Career Goal */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Preferred Career Goal</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition appearance-none"
                  {...register('preferredCareer')}
                >
                  <option value="Software Engineer (SDE)" className="bg-slate-900">Software Engineer (SDE)</option>
                  <option value="Frontend Engineer" className="bg-slate-900">Frontend Engineer</option>
                  <option value="Backend Engineer" className="bg-slate-900">Backend Engineer</option>
                  <option value="Full Stack Developer" className="bg-slate-900">Full Stack Developer</option>
                  <option value="AI / ML Engineer" className="bg-slate-900">AI / ML Engineer</option>
                  <option value="Data Scientist / Analyst" className="bg-slate-900">Data Scientist / Analyst</option>
                  <option value="DevOps Engineer" className="bg-slate-900">DevOps Engineer</option>
                  <option value="Mobile App Developer" className="bg-slate-900">Mobile App Developer</option>
                </select>
                {errors.preferredCareer && <span className="text-xs text-destructive">{errors.preferredCareer.message}</span>}
              </div>

              {/* Skills Tags input */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Core Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="React, Node.js, Python, Java..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill()}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 rounded-xl flex items-center justify-center transition"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Skills render */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/25 text-blue-300 rounded-full text-xs font-semibold"
                    >
                      <span>{skill}</span>
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-white transition">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Selectable Skill Chips */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Popular Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.map((popSkill) => {
                      const isSelected = skills.includes(popSkill);
                      return (
                        <button
                          key={popSkill}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSkills(skills.filter((s) => s !== popSkill));
                            } else {
                              setSkills([...skills, popSkill]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {popSkill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interests Tags input */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Interests</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                    placeholder="Open Source, Competitive Coding, WebDev..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddInterest()}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 rounded-xl flex items-center justify-center transition"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Interests render */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 text-purple-300 rounded-full text-xs font-semibold"
                    >
                      <span>{interest}</span>
                      <button type="button" onClick={() => handleRemoveInterest(interest)} className="hover:text-white transition">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Selectable Interest Chips */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Popular Interests:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_INTERESTS.map((popInterest) => {
                      const isSelected = interests.includes(popInterest);
                      return (
                        <button
                          key={popInterest}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setInterests(interests.filter((i) => i !== popInterest));
                            } else {
                              setInterests([...interests, popInterest]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition duration-200 ${
                            isSelected
                              ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {popInterest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Image & Social Links */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-lg font-semibold font-heading text-blue-400">Social Portfolios & Image</h3>
              
              {/* Profile Image upload layout */}
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white/5 border border-white/5 p-5 rounded-2xl">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-white/10 bg-slate-800 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold font-heading text-muted-foreground uppercase">
                      {user?.name?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-semibold">Profile Photo</h4>
                  <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP. Max 5MB file size.</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition mx-auto sm:mx-0"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Choose Image</span>
                  </button>
                </div>
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase">LinkedIn Profile URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
                  {...register('linkedinUrl')}
                />
                {errors.linkedinUrl && <span className="text-xs text-destructive">{errors.linkedinUrl.message}</span>}
              </div>

              {/* GitHub URL */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase">GitHub Profile URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition"
                  {...register('githubUrl')}
                />
                {errors.githubUrl && <span className="text-xs text-destructive">{errors.githubUrl.message}</span>}
              </div>

            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-6 border-t border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="bg-white/5 border border-white/10 hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition duration-200 flex items-center space-x-1.5 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl transition duration-200 hover:opacity-90 flex items-center space-x-1.5 glow-primary"
              >
                <span>Continue</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl transition duration-200 hover:opacity-90 flex items-center space-x-2 glow-primary disabled:opacity-50"
              >
                {isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Finish Setup</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}

export default ProfileSetup;
