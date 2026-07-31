import api from './api';

export interface TogglePayload {
  topicId: string;
  resourceId?: string;
  problemId?: string;
  project?: {
    isCompleted?: boolean;
    githubSubmission?: string;
    liveDemoSubmission?: string;
  };
  isCompleted?: boolean;
}

export interface WeeklyReviewPayload {
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  completedTopicIds?: string[];
  difficultTopics?: string[];
  projectCompleted?: boolean;
  adaptRoadmap?: boolean;
  weekNumber?: number;
}

/**
 * Fetch current user's personalized SDE roadmap
 */
export const getRoadmap = async (debugWeeklyReview?: boolean) => {
  const url = debugWeeklyReview ? '/roadmaps?debugWeeklyReview=true' : '/roadmaps';
  const response = await api.get(url);
  return response.data && response.data.roadmap !== undefined ? response.data.roadmap : response.data;
};

/**
 * Trigger generation of the AI roadmap
 */
export const generateRoadmap = async (regenerate: boolean = false) => {
  const response = await api.post('/roadmaps/generate', { regenerate });
  return response.data && response.data.roadmap !== undefined ? response.data.roadmap : response.data;
};

/**
 * Toggle completion status of a topic, resource, practice problem, or capstone project
 */
export const toggleRoadmapItem = async (payload: TogglePayload) => {
  const response = await api.patch('/roadmaps/toggle', payload);
  return response.data && response.data.roadmap !== undefined ? response.data.roadmap : response.data;
};

export const updateRoadmapProgress = async (
  topicId: string,
  resourceId?: string,
  problemId?: string,
  projectPayload?: any,
  isCompletedMonth?: boolean
) => {
  return toggleRoadmapItem({
    topicId,
    resourceId,
    problemId,
    project: projectPayload,
    isCompleted: isCompletedMonth,
  });
};

/**
 * Submit weekly progress check-in answers to adjust/adapt the roadmap schedule
 */
export const submitWeeklyReview = async (payload: WeeklyReviewPayload) => {
  const response = await api.post('/roadmaps/weekly-review', payload);
  return response.data;
};

/**
 * Submit or update capstone project draft/completed links
 */
export const submitProjectLinks = async (
  topicId: string,
  github: string,
  demo: string,
  isCompleted: boolean
) => {
  return toggleRoadmapItem({
    topicId,
    project: {
      githubSubmission: github,
      liveDemoSubmission: demo,
      isCompleted,
    },
  });
};

/**
 * Set active roadmap track by tab slug or roadmapId
 */
export const selectActiveRoadmap = async (trackSlug: string, roadmapId?: string, title?: string) => {
  const response = await api.post('/roadmaps/select-active', { trackSlug, roadmapId, title });
  return response.data && response.data.roadmap !== undefined ? response.data.roadmap : response.data;
};
