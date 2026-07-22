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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="glass-panel max-w-lg w-full rounded-2xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6 text-left relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 hover:bg-white/5 rounded-full bg-transparent border-none focus:outline-none cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-400" />
            Weekly Progress Check-in
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Log your SDE accomplishments from the past 7 days to adjust your preparation timeline and update your profiles.
          </p>
        </div>

        {/* Inputs: LeetCode solved count */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase block">
            Solved on LeetCode this week:
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-green-400 block">Easy</span>
              <input
                type="number"
                min="0"
                value={easySolved}
                onChange={(e) => setEasySolved(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-amber-400 block">Medium</span>
              <input
                type="number"
                min="0"
                value={mediumSolved}
                onChange={(e) => setMediumSolved(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-rose-400 block">Hard</span>
              <input
                type="number"
                min="0"
                value={hardSolved}
                onChange={(e) => setHardSolved(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-center text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Inputs: Struggled SDE Topics tags */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase block">
            Difficult topics this week:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="DP Memoization, Redux, Docker images..."
              value={difficultInput}
              onChange={(e) => setDifficultInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDifficultTopic())}
              className="flex-grow bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddDifficultTopic}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-3 rounded-xl flex items-center justify-center transition text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Tag render */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {difficultTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-lg text-[10px] font-semibold"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDifficultTopic(topic)}
                  className="hover:text-white transition bg-transparent border-none p-0 focus:outline-none cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Checkbox project completed */}
        <div className="flex items-center justify-start space-x-2 py-1">
          <input
            type="checkbox"
            id="projectCompletedCheck"
            checked={projectCompletedCheck}
            onChange={(e) => setProjectCompletedCheck(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
          />
          <label
            htmlFor="projectCompletedCheck"
            className="text-xs text-slate-300 font-semibold select-none cursor-pointer"
          >
            I completed the capstone project for the active month!
          </label>
        </div>

        {/* Toggle adapt roadmap dynamically */}
        <div className="flex items-start justify-start space-x-2 py-1 border-t border-white/5 pt-4">
          <input
            type="checkbox"
            id="adaptRoadmap"
            checked={adaptRoadmap}
            onChange={(e) => setAdaptRoadmap(e.target.checked)}
            className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 mt-0.5 cursor-pointer"
          />
          <div className="text-left">
            <label
              htmlFor="adaptRoadmap"
              className="text-xs text-white font-bold select-none cursor-pointer"
            >
              Adapt future roadmap schedule
            </label>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              Recommended if you added difficult topics or checked off completed projects. Gemini will
              recalculate SDE months.
            </p>
          </div>
        </div>

        {/* Actions button */}
        <button
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 transition text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border-none"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1"></div>
              <span>Saving progress...</span>
            </>
          ) : (
            <span>Submit Weekly Feedback</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default WeeklyReviewModal;
