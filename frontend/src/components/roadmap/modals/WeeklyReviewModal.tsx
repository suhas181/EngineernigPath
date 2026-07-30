import React, { useState } from 'react';
import { X, Calendar, Plus } from 'lucide-react';

interface WeeklyReviewModalProps {
  onClose: () => void;
  onSubmit: (data: {
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    difficultTopics: string[];
    projectCompletedCheck: boolean;
    adaptRoadmap: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [easySolved, setEasySolved] = useState(0);
  const [mediumSolved, setMediumSolved] = useState(0);
  const [hardSolved, setHardSolved] = useState(0);
  const [difficultInput, setDifficultInput] = useState('');
  const [difficultTopics, setDifficultTopics] = useState<string[]>([]);
  const [projectCompletedCheck, setProjectCompletedCheck] = useState(false);
  const [adaptRoadmap, setAdaptRoadmap] = useState(false);

  const handleAddDifficultTopic = () => {
    const clean = difficultInput.trim();
    if (clean && !difficultTopics.includes(clean)) {
      setDifficultTopics([...difficultTopics, clean]);
      setDifficultInput('');
    }
  };

  const handleRemoveDifficultTopic = (topic: string) => {
    setDifficultTopics(difficultTopics.filter((t) => t !== topic));
  };

  const handleSubmitClick = async () => {
    await onSubmit({
      easySolved,
      mediumSolved,
      hardSolved,
      difficultTopics,
      projectCompletedCheck,
      adaptRoadmap,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="mosaic-card max-w-lg w-full p-6 space-y-6 text-left bg-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition p-1 hover:bg-slate-100 rounded-full bg-transparent border-none focus:outline-none cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1 border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold font-heading text-[var(--ink-900)] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            Weekly Progress Check-in
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            Log your SDE accomplishments from the past 7 days to adjust your preparation timeline.
          </p>
        </div>

        {/* Inputs: LeetCode solved count */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase block">
            Solved on LeetCode this week:
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 block">Easy</span>
              <input
                type="number"
                min="0"
                value={easySolved}
                onChange={(e) => setEasySolved(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-center text-slate-900 font-bold focus:outline-none focus:border-teal-600"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-700 block">Medium</span>
              <input
                type="number"
                min="0"
                value={mediumSolved}
                onChange={(e) => setMediumSolved(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-center text-slate-900 font-bold focus:outline-none focus:border-teal-600"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-700 block">Hard</span>
              <input
                type="number"
                min="0"
                value={hardSolved}
                onChange={(e) => setHardSolved(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-center text-slate-900 font-bold focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Inputs: Struggled SDE Topics tags */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase block">
            Difficult topics this week:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="DP Memoization, Redux, Docker..."
              value={difficultInput}
              onChange={(e) => setDifficultInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDifficultTopic())}
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
            />
            <button
              type="button"
              onClick={handleAddDifficultTopic}
              className="mosaic-btn-outline !py-2 !px-3"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {difficultTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-[10px] font-bold"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDifficultTopic(topic)}
                  className="hover:text-rose-950 transition bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="projectCompletedCheck"
              checked={projectCompletedCheck}
              onChange={(e) => setProjectCompletedCheck(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label
              htmlFor="projectCompletedCheck"
              className="text-xs text-slate-800 font-semibold cursor-pointer"
            >
              I completed the capstone project for the active month!
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="adaptRoadmap"
              checked={adaptRoadmap}
              onChange={(e) => setAdaptRoadmap(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer"
            />
            <div className="text-left">
              <label
                htmlFor="adaptRoadmap"
                className="text-xs text-slate-900 font-bold cursor-pointer"
              >
                Adapt future roadmap schedule
              </label>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Recommended if you added difficult topics or completed milestone builds.
              </p>
            </div>
          </div>
        </div>

        {/* Actions button */}
        <button
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="mosaic-btn-brand w-full !py-3"
        >
          {isSubmitting ? 'Saving Progress...' : 'Submit Weekly Feedback'}
        </button>
      </div>
    </div>
  );
};

export default WeeklyReviewModal;
