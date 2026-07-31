import React from 'react';
import { FileCode, CheckCircle2, Circle } from 'lucide-react';
import { MonthProject } from '../roadmap.types';
import toast from 'react-hot-toast';
import { Badge } from '../../mosaic/Badge';

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
    <div className="space-y-3 pt-2 border-t border-slate-200 text-left font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-teal-700 uppercase font-bold tracking-wider flex items-center gap-1.5 font-heading">
          <FileCode className="h-4 w-4 text-teal-600" /> Capstone Project
        </span>

        <button
          onClick={handleCompletionToggle}
          className="text-slate-400 hover:text-slate-700 transition bg-transparent border-none p-0 focus:outline-none cursor-pointer"
        >
          {project.isCompleted ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
          ) : (
            <Circle className="h-4.5 w-4.5 text-slate-300" />
          )}
        </button>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div>
          <h6 className="font-bold text-xs text-slate-900">{project.title}</h6>
          <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
            {project.description}
          </p>
        </div>

        {/* Technologies chips */}
        <div className="flex flex-wrap gap-1">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="bg-white border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded text-slate-700"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Project Status Panel */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-2">
            <span>Status:</span>
            <Badge tone={projState.status === 'completed' ? 'success' : projState.status === 'in-progress' ? 'info' : 'warning'}>
              {projState.status === 'completed' ? 'Completed' : projState.status === 'in-progress' ? 'In Progress' : 'Not Started'}
            </Badge>
          </div>

          {projState.status === 'not-started' ? (
            <button
              type="button"
              onClick={handleStartProject}
              className="mosaic-btn-brand w-full !py-1.5 !text-xs"
            >
              Start Project
            </button>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
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
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSubmitProjectDetails(topicId)}
                  className="mosaic-btn-outline flex-1 !py-1.5 !text-[11px]"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleCompleteAndSubmit}
                  className="mosaic-btn-brand flex-1 !py-1.5 !text-[11px]"
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
