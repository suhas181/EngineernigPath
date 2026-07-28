import React from 'react';
import { FileCode, CheckCircle2, Circle } from 'lucide-react';
import { MonthProject } from '../roadmap.types';
import toast from 'react-hot-toast';

interface ProjectState {
  github: string;
  demo: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface MiniProjectCardProps {
  topicId: string;
  project: MonthProject;
  projState: ProjectState;
  setProjectSubmissions: React.Dispatch<
    React.SetStateAction<Record<string, ProjectState>>
  >;
  onToggle: (
    topicId: string,
    resourceId?: string,
    problemId?: string,
    projectPayload?: any,
    isCompletedMonth?: boolean
  ) => void;
  onSubmitProjectDetails: (topicId: string) => void;
}

export const MiniProjectCard: React.FC<MiniProjectCardProps> = ({
  topicId,
  project,
  projState,
  setProjectSubmissions,
  onToggle,
  onSubmitProjectDetails,
}) => {
  const handleCompletionToggle = () => {
    const isCurrentlyCompleted = project.isCompleted;
    onToggle(topicId, undefined, undefined, { isCompleted: !isCurrentlyCompleted });
    setProjectSubmissions((prev) => ({
      ...prev,
      [topicId]: {
        ...projState,
        status: !isCurrentlyCompleted ? 'completed' : 'in-progress',
      },
    }));
  };

  const handleStartProject = () => {
    setProjectSubmissions((prev) => ({
      ...prev,
      [topicId]: { ...projState, status: 'in-progress' },
    }));
  };

  const handleCompleteAndSubmit = () => {
    setProjectSubmissions((prev) => ({
      ...prev,
      [topicId]: { ...projState, status: 'completed' },
    }));
    onToggle(topicId, undefined, undefined, {
      githubSubmission: projState.github,
      liveDemoSubmission: projState.demo,
      isCompleted: true,
    });
    toast.success('Project submitted and completed!');
  };

  return (
    <div className="space-y-3 pt-2 border-t border-white/5 text-left font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-indigo-400 uppercase font-bold flex items-center gap-1.5">
          <FileCode className="h-4 w-4" /> Capstone Project
        </span>

        {/* Project completion checkbox */}
        <button
          onClick={handleCompletionToggle}
          className="text-slate-400 hover:text-white transition bg-transparent border-none p-0 focus:outline-none"
        >
          {project.isCompleted ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 fill-emerald-500/10" />
          ) : (
            <Circle className="h-4.5 w-4.5 text-white/30" />
          )}
        </button>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
        <div>
          <h6 className="font-bold text-xs text-white">{project.title}</h6>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            {project.description}
          </p>
        </div>

        {/* Technologies chips */}
        <div className="flex flex-wrap gap-1">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="bg-white/5 border border-white/10 text-[9px] font-bold px-2 py-0.5 rounded text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Project Status Panel */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-2">
            <span>Project Status:</span>
            <span
              className={`font-bold capitalize ${
                projState.status === 'completed'
                  ? 'text-emerald-400'
                  : projState.status === 'in-progress'
                  ? 'text-blue-400'
                  : 'text-slate-500'
              }`}
            >
              {projState.status === 'completed'
                ? 'Completed'
                : projState.status === 'in-progress'
                ? 'In Progress'
                : 'Not Started'}
            </span>
          </div>

          {projState.status === 'not-started' ? (
            <button
              type="button"
              onClick={handleStartProject}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 rounded-lg text-xs transition border-none cursor-pointer"
            >
              Start Project
            </button>
          ) : (
            <div className="space-y-2 animate-slideDown">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[8px] font-semibold text-slate-400 block mb-1">
                    GitHub Repo URL
                  </span>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projState.github}
                    onChange={(e) =>
                      setProjectSubmissions((prev) => ({
                        ...prev,
                        [topicId]: { ...projState, github: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-semibold text-slate-400 block mb-1">
                    Live Demo URL
                  </span>
                  <input
                    type="url"
                    placeholder="https://demo.com"
                    value={projState.demo}
                    onChange={(e) =>
                      setProjectSubmissions((prev) => ({
                        ...prev,
                        [topicId]: { ...projState, demo: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSubmitProjectDetails(topicId)}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-1.5 rounded-lg text-[10px] transition cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleCompleteAndSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-[10px] transition cursor-pointer border-none"
                >
                  Complete & Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniProjectCard;
