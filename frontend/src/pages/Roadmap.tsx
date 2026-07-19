import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { aiEngineerRoadmap } from '../utils/aiEngineerData';
import { dataAnalystRoadmap } from '../utils/dataAnalystData';
import { dataScientistRoadmap } from '../utils/dataScientistData';
import { cyberSecurityRoadmap } from '../utils/cyberSecurityData';
import { javaDeveloperRoadmap } from '../utils/javaDeveloperData';
import { softwareEngineerRoadmap } from '../utils/softwareEngineerData';
import { devOpsRoadmap } from '../utils/devOpsData';
import { flutterRoadmap } from '../utils/flutterData';
import { pythonBackendRoadmap } from '../utils/pythonBackendData';

import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Video,
  Book,
  ArrowRight,
  TrendingUp,
  Target,
  AlertOctagon,
  Code,
  Cpu,
  FolderGit2,
  Wrench,
  Youtube,
  Server,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  resources: Resource[];
}

interface RoadmapData {
  title: string;
  description: string;
  progress: number;
  topics: Topic[];
}

export function Roadmap() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'personalized' | 'ai-engineer' | 'data-scientist' | 'data-analyst' | 'cybersecurity' | 'java-developer' | 'software-engineer' | 'devops' | 'flutter' | 'python-backend'>('personalized');

  // Local storage state for AI Engineer track
  const [aiEngineerCompletedTopics, setAiEngineerCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ai_engineer_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [aiEngineerCompletedProjects, setAiEngineerCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('ai_engineer_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [aiEngineerExpandedMonths, setAiEngineerExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('ai_engineer_completed_topics', JSON.stringify(aiEngineerCompletedTopics));
  }, [aiEngineerCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('ai_engineer_completed_projects', JSON.stringify(aiEngineerCompletedProjects));
  }, [aiEngineerCompletedProjects]);

  const toggleAiTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setAiEngineerCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAiProject = (monthNum: number) => {
    setAiEngineerCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleAiMonthExpand = (monthNum: number) => {
    setAiEngineerExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalAiTopics = aiEngineerRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalAiProjects = aiEngineerRoadmap.length;
  const totalAiItems = totalAiTopics + totalAiProjects;

  const completedAiTopicsCount = Object.values(aiEngineerCompletedTopics).filter(Boolean).length;
  const completedAiProjectsCount = Object.values(aiEngineerCompletedProjects).filter(Boolean).length;
  const totalCompletedAiItems = completedAiTopicsCount + completedAiProjectsCount;

  const aiEngineerProgress = totalAiItems > 0
    ? Math.round((totalCompletedAiItems / totalAiItems) * 100)
    : 0;

  // Local storage state for Data Scientist track
  const [dataScientistCompletedTopics, setDataScientistCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('data_scientist_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [dataScientistCompletedProjects, setDataScientistCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('data_scientist_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [dataScientistExpandedMonths, setDataScientistExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('data_scientist_completed_topics', JSON.stringify(dataScientistCompletedTopics));
  }, [dataScientistCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('data_scientist_completed_projects', JSON.stringify(dataScientistCompletedProjects));
  }, [dataScientistCompletedProjects]);

  const toggleDsTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setDataScientistCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDsProject = (monthNum: number) => {
    setDataScientistCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleDsMonthExpand = (monthNum: number) => {
    setDataScientistExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalDsTopics = dataScientistRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalDsProjects = dataScientistRoadmap.length;
  const totalDsItems = totalDsTopics + totalDsProjects;

  const completedDsTopicsCount = Object.values(dataScientistCompletedTopics).filter(Boolean).length;
  const completedDsProjectsCount = Object.values(dataScientistCompletedProjects).filter(Boolean).length;
  const totalCompletedDsItems = completedDsTopicsCount + completedDsProjectsCount;

  const dataScientistProgress = totalDsItems > 0
    ? Math.round((totalCompletedDsItems / totalDsItems) * 100)
    : 0;

  // Local storage state for Data Analyst track
  const [dataAnalystCompletedTopics, setDataAnalystCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('data_analyst_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [dataAnalystCompletedProjects, setDataAnalystCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('data_analyst_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [dataAnalystExpandedMonths, setDataAnalystExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    localStorage.setItem('data_analyst_completed_topics', JSON.stringify(dataAnalystCompletedTopics));
  }, [dataAnalystCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('data_analyst_completed_projects', JSON.stringify(dataAnalystCompletedProjects));
  }, [dataAnalystCompletedProjects]);

  const toggleDaTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setDataAnalystCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDaProject = (monthNum: number) => {
    setDataAnalystCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleDaMonthExpand = (monthNum: number) => {
    setDataAnalystExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalDaTopics = dataAnalystRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalDaProjects = dataAnalystRoadmap.length;
  const totalDaItems = totalDaTopics + totalDaProjects;

  const completedDaTopicsCount = Object.values(dataAnalystCompletedTopics).filter(Boolean).length;
  const completedDaProjectsCount = Object.values(dataAnalystCompletedProjects).filter(Boolean).length;
  const totalCompletedDaItems = completedDaTopicsCount + completedDaProjectsCount;

  const dataAnalystProgress = totalDaItems > 0
    ? Math.round((totalCompletedDaItems / totalDaItems) * 100)
    : 0;

  // Local storage state for Cybersecurity track
  const [cyberSecurityCompletedTopics, setCyberSecurityCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('cyber_security_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [cyberSecurityCompletedProjects, setCyberSecurityCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('cyber_security_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [cyberSecurityExpandedMonths, setCyberSecurityExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    localStorage.setItem('cyber_security_completed_topics', JSON.stringify(cyberSecurityCompletedTopics));
  }, [cyberSecurityCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('cyber_security_completed_projects', JSON.stringify(cyberSecurityCompletedProjects));
  }, [cyberSecurityCompletedProjects]);

  const toggleCsTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setCyberSecurityCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleCsProject = (monthNum: number) => {
    setCyberSecurityCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleCsMonthExpand = (monthNum: number) => {
    setCyberSecurityExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalCsTopics = cyberSecurityRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalCsProjects = cyberSecurityRoadmap.length;
  const totalCsItems = totalCsTopics + totalCsProjects;

  const completedCsTopicsCount = Object.values(cyberSecurityCompletedTopics).filter(Boolean).length;
  const completedCsProjectsCount = Object.values(cyberSecurityCompletedProjects).filter(Boolean).length;
  const totalCompletedCsItems = completedCsTopicsCount + completedCsProjectsCount;

  const cyberSecurityProgress = totalCsItems > 0
    ? Math.round((totalCompletedCsItems / totalCsItems) * 100)
    : 0;

  // Local storage state for Java Developer track
  const [javaCompletedTopics, setJavaCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('java_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [javaCompletedProjects, setJavaCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('java_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [javaExpandedMonths, setJavaExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    localStorage.setItem('java_completed_topics', JSON.stringify(javaCompletedTopics));
  }, [javaCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('java_completed_projects', JSON.stringify(javaCompletedProjects));
  }, [javaCompletedProjects]);

  const toggleJavaTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setJavaCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleJavaProject = (monthNum: number) => {
    setJavaCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleJavaMonthExpand = (monthNum: number) => {
    setJavaExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalJavaTopics = javaDeveloperRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalJavaProjects = javaDeveloperRoadmap.length;
  const totalJavaItems = totalJavaTopics + totalJavaProjects;

  const completedJavaTopicsCount = Object.values(javaCompletedTopics).filter(Boolean).length;
  const completedJavaProjectsCount = Object.values(javaCompletedProjects).filter(Boolean).length;
  const totalCompletedJavaItems = completedJavaTopicsCount + completedJavaProjectsCount;

  const javaProgress = totalJavaItems > 0
    ? Math.round((totalCompletedJavaItems / totalJavaItems) * 100)
    : 0;

  // Local storage state for Software Engineer track
  const [seCompletedTopics, setSeCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('se_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [seCompletedProjects, setSeCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('se_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [seExpandedMonths, setSeExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    localStorage.setItem('se_completed_topics', JSON.stringify(seCompletedTopics));
  }, [seCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('se_completed_projects', JSON.stringify(seCompletedProjects));
  }, [seCompletedProjects]);

  const toggleSeTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setSeCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSeProject = (monthNum: number) => {
    setSeCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleSeMonthExpand = (monthNum: number) => {
    setSeExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalSeTopics = softwareEngineerRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalSeProjects = softwareEngineerRoadmap.length;
  const totalSeItems = totalSeTopics + totalSeProjects;

  const completedSeTopicsCount = Object.values(seCompletedTopics).filter(Boolean).length;
  const completedSeProjectsCount = Object.values(seCompletedProjects).filter(Boolean).length;
  const totalCompletedSeItems = completedSeTopicsCount + completedSeProjectsCount;

  const seProgress = totalSeItems > 0
    ? Math.round((totalCompletedSeItems / totalSeItems) * 100)
    : 0;

  // Local storage state for DevOps track
  const [devopsCompletedTopics, setDevopsCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('devops_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [devopsCompletedProjects, setDevopsCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('devops_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [devopsExpandedMonths, setDevopsExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    localStorage.setItem('devops_completed_topics', JSON.stringify(devopsCompletedTopics));
  }, [devopsCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('devops_completed_projects', JSON.stringify(devopsCompletedProjects));
  }, [devopsCompletedProjects]);

  const toggleDevopsTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setDevopsCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDevopsProject = (monthNum: number) => {
    setDevopsCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleDevopsMonthExpand = (monthNum: number) => {
    setDevopsExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalDevopsTopics = devOpsRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalDevopsProjects = devOpsRoadmap.length;
  const totalDevopsItems = totalDevopsTopics + totalDevopsProjects;

  const completedDevopsTopicsCount = Object.values(devopsCompletedTopics).filter(Boolean).length;
  const completedDevopsProjectsCount = Object.values(devopsCompletedProjects).filter(Boolean).length;
  const totalCompletedDevopsItems = completedDevopsTopicsCount + completedDevopsProjectsCount;

  const devopsProgress = totalDevopsItems > 0
    ? Math.round((totalCompletedDevopsItems / totalDevopsItems) * 100)
    : 0;

  // Local storage state for Flutter track
  const [flutterCompletedTopics, setFlutterCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('flutter_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [flutterCompletedProjects, setFlutterCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('flutter_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [flutterExpandedMonths, setFlutterExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    localStorage.setItem('flutter_completed_topics', JSON.stringify(flutterCompletedTopics));
  }, [flutterCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('flutter_completed_projects', JSON.stringify(flutterCompletedProjects));
  }, [flutterCompletedProjects]);

  const toggleFlutterTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setFlutterCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleFlutterProject = (monthNum: number) => {
    setFlutterCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const toggleFlutterMonthExpand = (monthNum: number) => {
    setFlutterExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalFlutterTopics = flutterRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalFlutterProjects = flutterRoadmap.length;
  const totalFlutterItems = totalFlutterTopics + totalFlutterProjects;

  const completedFlutterTopicsCount = Object.values(flutterCompletedTopics).filter(Boolean).length;
  const completedFlutterProjectsCount = Object.values(flutterCompletedProjects).filter(Boolean).length;
  const totalCompletedFlutterItems = completedFlutterTopicsCount + completedFlutterProjectsCount;

  const flutterProgress = totalFlutterItems > 0
    ? Math.round((totalCompletedFlutterItems / totalFlutterItems) * 100)
    : 0;

  // Local storage state for Python Backend track
  const [pbCompletedTopics, setPbCompletedTopics] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('pb_completed_topics');
    return saved ? JSON.parse(saved) : {};
  });

  const [pbCompletedProjects, setPbCompletedProjects] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('pb_completed_projects');
    return saved ? JSON.parse(saved) : {};
  });

  const [pbExpandedMonths, setPbExpandedMonths] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    localStorage.setItem('pb_completed_topics', JSON.stringify(pbCompletedTopics));
  }, [pbCompletedTopics]);

  useEffect(() => {
    localStorage.setItem('pb_completed_projects', JSON.stringify(pbCompletedProjects));
  }, [pbCompletedProjects]);

  const togglePbTopic = (monthNum: number, topicIndex: number) => {
    const key = `m${monthNum}-t${topicIndex}`;
    setPbCompletedTopics(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePbProject = (monthNum: number) => {
    setPbCompletedProjects(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const togglePbMonthExpand = (monthNum: number) => {
    setPbExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const totalPbTopics = pythonBackendRoadmap.reduce((sum, month) => sum + month.topics.length, 0);
  const totalPbProjects = pythonBackendRoadmap.length;
  const totalPbItems = totalPbTopics + totalPbProjects;

  const completedPbTopicsCount = Object.values(pbCompletedTopics).filter(Boolean).length;
  const completedPbProjectsCount = Object.values(pbCompletedProjects).filter(Boolean).length;
  const totalCompletedPbItems = completedPbTopicsCount + completedPbProjectsCount;

  const pbProgress = totalPbItems > 0
    ? Math.round((totalCompletedPbItems / totalPbItems) * 100)
    : 0;



  const handleGenerate = async (regenerate: boolean = false) => {
    setIsGenerating(true);
    setIsError(false);
    try {
      const response = await api.post('/roadmaps/generate', { regenerate });
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        toast.success(regenerate ? 'Roadmap regenerated successfully!' : 'Your AI career roadmap is ready!');
        if (response.data.roadmap.topics?.length > 0) {
          const firstTopicId = response.data.roadmap.topics[0].id;
          setExpandedTopics({ [firstTopicId]: true });
        }
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      const errMsg = error.response?.data?.message || 'Failed to generate roadmap. Please check your profile details.';
      toast.error(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchRoadmap = async () => {
    setIsError(false);
    try {
      const response = await api.get('/roadmaps');
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
        // Expand first topic by default
        if (response.data.roadmap.topics?.length > 0) {
          const firstTopicId = response.data.roadmap.topics[0].id;
          setExpandedTopics({ [firstTopicId]: true });
        }
        if (searchParams.get('generate') === 'true') {
          setSearchParams({}, { replace: true });
        }
      } else {
        if (searchParams.get('generate') === 'true') {
          setSearchParams({}, { replace: true });
          handleGenerate(false);
        }
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggle = async (topicId: string, resourceId?: string, isCompleted?: boolean) => {
    // Optimistic UI Update
    setRoadmap((prev) => {
      if (!prev) return null;
      const updatedTopics = prev.topics.map((topic) => {
        if (topic.id !== topicId) return topic;

        if (resourceId) {
          const updatedResources = topic.resources.map((r) => {
            if (r.id !== resourceId) return r;
            return { ...r, isCompleted: !!isCompleted };
          });
          const allDone = updatedResources.length > 0 && updatedResources.every((r) => r.isCompleted);
          return { ...topic, isCompleted: allDone, resources: updatedResources };
        } else {
          const updatedResources = topic.resources.map((r) => ({ ...r, isCompleted: !!isCompleted }));
          return { ...topic, isCompleted: !!isCompleted, resources: updatedResources };
        }
      });

      const total = updatedTopics.length;
      const completed = updatedTopics.filter((t) => t.isCompleted).length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { ...prev, topics: updatedTopics, progress };
    });

    try {
      const response = await api.patch('/roadmaps/toggle', {
        topicId,
        resourceId,
        isCompleted,
      });
      if (response.data && response.data.roadmap) {
        // Sync with database response state
        setRoadmap(response.data.roadmap);
      }
    } catch (error) {
      console.error('Error toggling roadmap item:', error);
      toast.error('Failed to sync progress with server.');
      fetchRoadmap(); // rollback/reload
    }
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-400" />;
      case 'book':
        return <Book className="h-4 w-4 text-emerald-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-amber-400" />;
    }
  };

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'intermediate':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground text-sm">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen text-white font-sans flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full px-6 py-10">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center space-y-6">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertOctagon className="h-6 w-6 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Failed to Load Roadmap</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We encountered a connection or server error while loading your roadmap. Please check your network or try again.
              </p>
            </div>
            <button
              onClick={() => {
                setIsLoading(true);
                fetchRoadmap();
              }}
              className="bg-primary hover:opacity-90 transition text-primary-foreground font-semibold px-6 py-2.5 rounded-lg text-sm w-full"
            >
              Retry Connection
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 text-left">
        {isGenerating ? (
          <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">Consulting the AI Career Mentor</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Analyzing your career goals, semester timeline, skills, and interests to generate a structured, custom-fit pathway.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Unified Page Header */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {activeTab === 'personalized' ? 'AI-Powered Guides' : 'Featured Track'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {activeTab === 'personalized'
                    ? 'Updated live'
                    : (activeTab === 'data-analyst' || activeTab === 'cybersecurity' || activeTab === 'java-developer' || activeTab === 'software-engineer' || activeTab === 'devops' || activeTab === 'flutter' || activeTab === 'python-backend')
                    ? '5-Month Curriculum'
                    : '6-Month Curriculum'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading">
                {activeTab === 'personalized'
                  ? (roadmap ? roadmap.title : 'Generate Your AI Career Roadmap')
                  : activeTab === 'ai-engineer'
                  ? 'AI Engineer Roadmap — 6 Month Plan'
                  : activeTab === 'data-scientist'
                  ? 'Data Scientist Roadmap — 6 Month Plan'
                  : activeTab === 'data-analyst'
                  ? 'Data Analyst Roadmap — 5-Month Plan'
                  : activeTab === 'cybersecurity'
                  ? 'Cybersecurity Foundations Roadmap — 5 Months'
                  : activeTab === 'java-developer'
                  ? 'Java Developer — Complete 5-Month Roadmap (2026 Edition)'
                  : activeTab === 'software-engineer'
                  ? 'Software Engineer — Complete 5-Month Roadmap (2026 Edition)'
                  : activeTab === 'devops'
                  ? 'DevOps / Platform Engineer — 5-Month Roadmap (2026)'
                  : activeTab === 'flutter'
                  ? 'Mobile App Developer Roadmap (Flutter) — 5 Months'
                  : 'Backend Developer (Python — Django & FastAPI) — 5-Month Roadmap'}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {activeTab === 'personalized'
                  ? (roadmap ? roadmap.description : 'Unlock a step-by-step career path specifically curated for you. We will analyze your profile information to construct standard topics, resource lists, and progress checkers.')
                  : activeTab === 'ai-engineer'
                  ? 'A practical, project-first path from Python basics to building and deploying production AI/LLM applications.'
                  : activeTab === 'data-scientist'
                  ? 'A structured, tool-by-tool, month-by-month plan to go from beginner to job-ready data scientist in 6 months.'
                  : activeTab === 'data-analyst'
                  ? 'A structured, 5-month plan to master Excel, SQL, statistics, Python, and BI tools to get job-ready as a data analyst.'
                  : activeTab === 'cybersecurity'
                  ? 'A cybersecurity foundations roadmap built for absolute beginners to prepare for the CompTIA Security+ certification.'
                  : activeTab === 'java-developer'
                  ? 'An entry-to-mid level Java Backend / Full-Stack Developer pathway built around JDK 21 (LTS), Spring Boot, databases, microservices, and Docker.'
                  : activeTab === 'software-engineer'
                  ? 'A language-flexible entry-to-mid level Software Engineer (SDE) roadmap covering DSA, CS fundamentals, backend/web stacks, Docker, and AI-assisted programming.'
                  : activeTab === 'devops'
                  ? 'A sequential DevOps and Platform Engineering pathway covering Linux/Networking, AWS Cloud, Containers, CI/CD pipelines, IaC Terraform, Kubernetes, GitOps, and IDP Backstage.'
                  : activeTab === 'flutter'
                  ? 'A Flutter/Dart cross-platform mobile development pathway built for complete beginners to create and verify native Android apps on Windows.'
                  : 'A complete Python backend engineering pathway focused on Django/DRF, FastAPI, SQL/PostgreSQL databases, Redis cache layers, Celery task workers, and Docker.'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-px mb-8">
              <button
                onClick={() => setActiveTab('personalized')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative ${
                  activeTab === 'personalized'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Personalized Pathway
              </button>
              <button
                onClick={() => setActiveTab('ai-engineer')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'ai-engineer'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Sparkles className={`h-4 w-4 ${activeTab === 'ai-engineer' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>AI Engineer Track (6-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('data-scientist')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'data-scientist'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <TrendingUp className={`h-4 w-4 ${activeTab === 'data-scientist' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>Data Scientist Track (6-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('data-analyst')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'data-analyst'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <TrendingUp className={`h-4 w-4 ${activeTab === 'data-analyst' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>Data Analyst Track (5-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('cybersecurity')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'cybersecurity'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Target className={`h-4 w-4 ${activeTab === 'cybersecurity' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>Cybersecurity Track (5-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('java-developer')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'java-developer'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Code className={`h-4 w-4 ${activeTab === 'java-developer' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>Java Developer Track (5-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('software-engineer')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'software-engineer'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <BookOpen className={`h-4 w-4 ${activeTab === 'software-engineer' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>Software Engineer Track (5-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('devops')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'devops'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Server className={`h-4 w-4 ${activeTab === 'devops' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>DevOps Track (5-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('flutter')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'flutter'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Cpu className={`h-4 w-4 ${activeTab === 'flutter' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>Flutter Track (5-Month)</span>
              </button>
              <button
                onClick={() => setActiveTab('python-backend')}
                className={`pb-4 px-4 font-semibold text-sm transition-all relative flex items-center space-x-2 ${
                  activeTab === 'python-backend'
                    ? 'text-indigo-400 font-bold border-b-2 border-indigo-500'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Code className={`h-4 w-4 ${activeTab === 'python-backend' ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                <span>Python Backend Track (5-Month)</span>
              </button>
            </div>

            {activeTab === 'personalized' ? (
              !roadmap ? (
                /* Empty Onboarding State */
                <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl" />

                  <div className="space-y-4 max-w-xl mx-auto">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                      <Map className="h-7 w-7 text-indigo-400 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading">Create Your Custom Pathway</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Tailor a study timeline to your current semester and target job requirements.
                    </p>
                  </div>

                  {/* Profile Overview Card */}
                  <div className="glass-card rounded-xl p-6 text-left max-w-lg mx-auto border border-white/5 space-y-4 bg-white/[0.01]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <Target className="h-4 w-4" /> Based on your Profile:
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs block">Target Role</span>
                        <span className="font-semibold text-white/90">{user?.preferredCareer || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Academic Timeline</span>
                        <span className="font-semibold text-white/90">Semester {user?.currentSemester || 1} (Grad {user?.graduationYear})</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground text-xs block">Interests & Core Skills</span>
                        <span className="font-semibold text-white/90">
                          {user?.skills?.length ? user.skills.join(', ') : 'No skills input'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerate(false)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-95 transition text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/20 inline-flex items-center space-x-2.5"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Roadmap</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                /* Roadmap Timeline State */
                <div className="space-y-8 animate-fade-in">
                  {/* Overall Progress Widget */}
                  <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold">Your Progression</h3>
                        <p className="text-xs text-muted-foreground">Complete resources to progress your topics</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-64 space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{roadmap.progress}% Done</span>
                        <span className="text-muted-foreground">
                          {roadmap.topics.filter((t) => t.isCompleted).length} / {roadmap.topics.length} Topics
                        </span>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${roadmap.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reset Roadmap Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleGenerate(true)}
                      className="text-xs text-muted-foreground hover:text-white transition flex items-center space-x-1 hover:underline"
                      title="Regenerate roadmap with updated profile parameters"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Re-generate roadmap</span>
                    </button>
                  </div>

                  {/* Vertical timeline listing topics */}
                  <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                    {roadmap.topics.map((topic, index) => {
                      const isExpanded = !!expandedTopics[topic.id];
                      return (
                        <div key={topic.id} className="relative group">
                          {/* Circle Node Indicator */}
                          <button
                            onClick={() => handleToggle(topic.id, undefined, !topic.isCompleted)}
                            className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                              topic.isCompleted
                                ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                            }`}
                            title={topic.isCompleted ? 'Mark Topic Incomplete' : 'Mark Topic Complete'}
                          >
                            {topic.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                            ) : (
                              <span className="text-xs font-bold font-heading">{index + 1}</span>
                            )}
                          </button>

                          {/* Topic Content Card */}
                          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                            {/* Topic Header Summary */}
                            <div
                              onClick={() => toggleExpand(topic.id)}
                              className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                            >
                              <div className="space-y-1 pr-4 text-left">
                                <h3 className={`text-lg font-bold font-heading transition ${topic.isCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                  {topic.title}
                                </h3>
                                <p className="text-muted-foreground text-xs">
                                  {topic.resources.length} study resources • {topic.resources.filter((r) => r.isCompleted).length} completed
                                </p>
                              </div>
                              <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </button>
                            </div>

                            {/* Expandable resources details */}
                            {isExpanded && (
                              <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-4">
                                <p className="text-sm text-white/70 leading-relaxed text-left">
                                  {topic.description}
                                </p>

                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-left">
                                    Learning Resources
                                  </h4>

                                  {topic.resources.map((resource) => (
                                    <div
                                      key={resource.id}
                                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition gap-4 text-left"
                                    >
                                      <div className="flex items-center space-x-3 min-w-0">
                                        {/* Resource completion checkbox */}
                                        <button
                                          onClick={() => handleToggle(topic.id, resource.id, !resource.isCompleted)}
                                          className="p-0.5 text-muted-foreground hover:text-white transition"
                                        >
                                          {resource.isCompleted ? (
                                            <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-5 w-5 text-white/30" />
                                          )}
                                        </button>

                                        <div className="min-w-0">
                                          <h5 className={`text-sm font-semibold truncate ${resource.isCompleted ? 'text-white/40 line-through' : 'text-white/90'}`}>
                                            {resource.title}
                                          </h5>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <span className="flex items-center space-x-1 text-[10px] text-muted-foreground font-medium capitalize">
                                              {getResourceIcon(resource.type)}
                                              <span>{resource.type}</span>
                                            </span>
                                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getDifficultyStyles(resource.difficulty)}`}>
                                              {resource.difficulty}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title="Open learning link in new tab"
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : activeTab === 'ai-engineer' ? (
              /* AI Engineer Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                      <Cpu className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">AI Engineer Curriculum</h3>
                      <p className="text-xs text-muted-foreground">Practical, project-first path to production LLM apps</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{aiEngineerProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedAiTopicsCount + completedAiProjectsCount} / {totalAiItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${aiEngineerProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {aiEngineerRoadmap.map((month) => {
                    const isExpanded = !!aiEngineerExpandedMonths[month.number];
                    const completedProjectsInMonth = aiEngineerCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!aiEngineerCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setAiEngineerCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setAiEngineerCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-purple-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleAiMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-indigo-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-indigo-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!aiEngineerCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleAiTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-purple-400 fill-purple-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleAiProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    aiEngineerCompletedProjects[month.number]
                                      ? 'border-purple-500/40 bg-purple-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-indigo-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {aiEngineerCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-purple-400 fill-purple-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${aiEngineerCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${aiEngineerCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeTab === 'data-scientist' ? (
              /* Data Scientist Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Data Scientist Curriculum</h3>
                      <p className="text-xs text-muted-foreground">Comprehensive, tool-by-tool path to job readiness</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{dataScientistProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedDsTopicsCount + completedDsProjectsCount} / {totalDsItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${dataScientistProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {dataScientistRoadmap.map((month) => {
                    const isExpanded = !!dataScientistExpandedMonths[month.number];
                    const completedProjectsInMonth = dataScientistCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!dataScientistCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setDataScientistCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setDataScientistCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleDsMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-indigo-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-indigo-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!dataScientistCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleDsTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleDsProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    dataScientistCompletedProjects[month.number]
                                      ? 'border-indigo-500/40 bg-indigo-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-blue-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {dataScientistCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${dataScientistCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${dataScientistCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeTab === 'data-analyst' ? (
              /* Data Analyst Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Data Analyst Curriculum</h3>
                      <p className="text-xs text-muted-foreground">Practical, 5-month path to analytics job readiness</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{dataAnalystProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedDaTopicsCount + completedDaProjectsCount} / {totalDaItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${dataAnalystProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Guide/Disclaimer note */}
                <div className="p-5 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <AlertOctagon className="h-5 w-5" />
                    <span className="font-semibold text-sm">Roadmap Guide Note (Mid-2026 Update)</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    This is based on current (mid-2026) roadmaps, tool trends, and educator recommendations, cross-checked across multiple sources. Five months is an <strong>ambitious but doable</strong> timeline — most guides put "job-ready" at 4–9 months depending on your background and hours/week. Treat the timeline below as a strong default, not a guarantee: if a topic needs an extra week, take it. Job-market details and AI tools move fast, so it's worth spot-checking anything time-sensitive closer to when you apply.
                  </p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-bold text-white/90">Assumed effort:</span> ~15–20 hours/week. (If you can only do 8–10 hrs/week, stretch this to 8–9 months instead of compressing).
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {dataAnalystRoadmap.map((month) => {
                    const isExpanded = !!dataAnalystExpandedMonths[month.number];
                    const completedProjectsInMonth = dataAnalystCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!dataAnalystCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setDataAnalystCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setDataAnalystCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleDaMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-indigo-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-indigo-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!dataAnalystCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleDaTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleDaProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    dataAnalystCompletedProjects[month.number]
                                      ? 'border-indigo-500/40 bg-indigo-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-blue-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {dataAnalystCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${dataAnalystCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${dataAnalystCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Practice and Notes Section */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* Practice Platforms Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Recommended Practice Platforms</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">SQL Practice:</span>
                        Mode Analytics SQL tutorial, StrataScratch, LeetCode (SQL section), HackerRank
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Datasets for Projects:</span>
                        Kaggle, data.gov, Google Dataset Search
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Job Simulations:</span>
                        Forage (free virtual job simulations from companies like Deloitte, PwC, etc. for data/analytics roles)
                      </div>
                    </div>
                  </div>
                  {/* Honest Notes Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                      <span>A Few Honest Notes</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">On Timelines:</span>
                        3 months full-time or 6–9 months part-time to get fully job-ready, actual pace depends on background and hours.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">On AI Tools:</span>
                        AI copilots (ChatGPT/Claude, Power BI/Excel Copilot) speed up work, but only if you already understand SQL, pandas, and stats.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">On Job-Market Claims:</span>
                        Salary levels vary widely by city, company, and experience level. Check current local market data on Glassdoor, LinkedIn, or Naukri when applying.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'cybersecurity' ? (
              /* Cybersecurity Foundations Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                      <Target className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Cybersecurity Foundations Curriculum</h3>
                      <p className="text-xs text-muted-foreground">Practical, 5-month path to security foundations & Security+ prep</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{cyberSecurityProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedCsTopicsCount + completedCsProjectsCount} / {totalCsItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${cyberSecurityProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reality Check Note / Guide */}
                <div className="p-5 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <AlertOctagon className="h-5 w-5" />
                    <span className="font-semibold text-sm">Read This First: Reality Check</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Career Title Expectation:</strong> "Cybersecurity engineer" is a mid-level title in nearly every job posting — it typically expects 2–3 years of prior IT, networking, or systems experience. This plan will not make you an "engineer" in 5 months. It will make you <strong>foundation-ready</strong>: capable of understanding real security work, holding your own in entry-level interviews eventually, and knowing exactly what to learn next.
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Certification & Timing Note:</strong> CompTIA Security+ SY0-701 is the current exam (rolled out on July 1, 2026). Ensure any prep material is dated mid-2026 or later. Discard old SY0-601 material on sight. Avoid channel-hopping without doing hands-on labs!
                  </p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-bold text-white/90">Assumed effort:</span> 1–2 hrs/day, realistically ~25 study days/month (~150–200 total hours).
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {cyberSecurityRoadmap.map((month) => {
                    const isExpanded = !!cyberSecurityExpandedMonths[month.number];
                    const completedProjectsInMonth = cyberSecurityCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!cyberSecurityCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setCyberSecurityCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setCyberSecurityCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleCsMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-indigo-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-indigo-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!cyberSecurityCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleCsTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleCsProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    cyberSecurityCompletedProjects[month.number]
                                      ? 'border-indigo-500/40 bg-indigo-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-blue-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {cyberSecurityCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${cyberSecurityCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${cyberSecurityCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Specialization and Risks Section */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* What is Missing Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Requirements to Reach 'Engineer' Level</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Hands-On Experience:</span>
                        1–2+ years of hands-on experience, typically starting in a SOC analyst, IT support, or junior sysadmin role.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Deeper Networking & Cloud:</span>
                        CCNA-level networking depth, AWS/Azure/GCP security fundamentals, and IaC (Terraform) security automation.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Next-Step Certifications:</span>
                        Advanced certifications depending on track direction: CySA+ (blue team) or OSCP (offensive/pentest).
                      </div>
                    </div>
                  </div>

                  {/* Risks & Failure Modes Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Risks & Failure Modes to Avoid</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Skipping Fundamentals:</span>
                        Do not jump straight to "hacking" content without networking/OS basics. It produces people who cannot troubleshoot novel issues.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Documentation Gaps:</span>
                        Document as you go! Put notes and writeups in GitHub. Building a portfolio in Month 5 from memory is extremely hard.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Study Consistency:</span>
                        YouTube videos are not practice. Every tool (Nmap, Wireshark, Splunk) must be run on your own home lab keyboard.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'java-developer' ? (
              /* Java Developer Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center flex-shrink-0">
                      <Code className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Java Developer Curriculum</h3>
                      <p className="text-xs text-muted-foreground">Modern, 5-month path to Java backend job readiness</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{javaProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedJavaTopicsCount + completedJavaProjectsCount} / {totalJavaItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${javaProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reality Check Note / Guide */}
                <div className="p-5 bg-orange-500/5 border border-orange-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-orange-400">
                    <AlertOctagon className="h-5 w-5" />
                    <span className="font-semibold text-sm">Java Career Note (LTS Update)</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Current Specifications:</strong> Researched July 2026. Current LTS version is <strong>Java 21</strong> (widely used in production and by most job postings) with Java 25 as the newest LTS. <strong>Spring Boot 4.x</strong> is the latest major release, but Spring Boot 3.x is still standard in industry interviews. The concepts transfer cleanly.
                  </p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-bold text-white/90">Daily commitment:</span> 3–4 hours/day, 6 days/week (~90–100 hours/month).
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {javaDeveloperRoadmap.map((month) => {
                    const isExpanded = !!javaExpandedMonths[month.number];
                    const completedProjectsInMonth = javaCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!javaCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setJavaCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setJavaCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-orange-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleJavaMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-orange-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-orange-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!javaCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleJavaTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-orange-400 fill-orange-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleJavaProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    javaCompletedProjects[month.number]
                                      ? 'border-orange-500/40 bg-orange-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-orange-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {javaCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-orange-400 fill-orange-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${javaCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${javaCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Study Advice and Best Practices */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* Study Strategy Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-orange-400" />
                      <span>Advice for Java Backend Aspirants</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Code Daily:</span>
                        For every 1 hour of video tutorials, spend 2 hours writing code yourself. Do not code passive-style.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">VCS Habits:</span>
                        Push every small program to GitHub. A real commit history showing active coding beats any certificates.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Do Not Skip DSA:</span>
                        Most product companies still test core DSA alongside Java fundamentals and Spring Boot configuration in interviews.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : activeTab === 'software-engineer' ? (
              /* Software Engineer Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Software Engineer Curriculum</h3>
                      <p className="text-xs text-muted-foreground">General-purpose, 5-month path to software engineering roles</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{seProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedSeTopicsCount + completedSeProjectsCount} / {totalSeItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${seProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reality Check Note / Guide */}
                <div className="p-5 bg-purple-500/5 border border-purple-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <AlertOctagon className="h-5 w-5" />
                    <span className="font-semibold text-sm">SDE Track Considerations (Mid-2026 Edition)</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Language & Stack Choice:</strong> Pick one primary programming language (Python, Java, or C++) in Month 1 and stick with it. Depth beats breadth for technical interviews.
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>2026 AI Tools Expectations:</strong> This roadmap includes learning to use AI-assisted coding tools (GitHub Copilot, Cursor, Claude Code) as pair-programmers. Being able to explain and critically review any code is a core skill.
                  </p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-bold text-white/90">Daily commitment:</span> 3–4 hours/day, 6 days/week (~90–100 hours/month).
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {softwareEngineerRoadmap.map((month) => {
                    const isExpanded = !!seExpandedMonths[month.number];
                    const completedProjectsInMonth = seCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!seCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setSeCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setSeCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-purple-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleSeMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-purple-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-purple-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!seCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleSeTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-purple-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleSeProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    seCompletedProjects[month.number]
                                      ? 'border-purple-500/40 bg-purple-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-purple-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {seCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-purple-400 fill-indigo-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${seCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${seCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Study Advice and Best Practices */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* SDE General Tips */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-purple-400" />
                      <span>Advice for SDE Candidates</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Language Depth:</span>
                        Depth beats breadth for coding rounds. Master your chosen language features instead of juggling three syntaxes.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">CS Fundamentals:</span>
                        DBMS, Operating Systems, and Networking are frequently tested in technical interview loops. Don't skip them.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Leveraging AI Tools:</span>
                        Use Cursor, Copilot, or Claude Code as accelerators to query concepts, draft tests, and search codebases, but ensure you understand every line.
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : activeTab === 'devops' ? (
              /* DevOps Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                      <Server className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">DevOps / Platform Engineer Curriculum</h3>
                      <p className="text-xs text-muted-foreground">General-purpose, 5-month path to cloud operations & platform roles</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{devopsProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedDevopsTopicsCount + completedDevopsProjectsCount} / {totalDevopsItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${devopsProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reality Check Note / Guide */}
                <div className="p-5 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <AlertOctagon className="h-5 w-5" />
                    <span className="font-semibold text-sm">DevOps Track Considerations (2026 Edition)</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Hands-on Labs:</strong> Do not just watch tutorials. Tool configs, Linux commands, scripting automations, and cluster operations must be practiced locally on your own keyboard.
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Portfolio over Certifications:</strong> Building actual deployed pipelines, multi-container clusters, infrastructure-as-code manifests, and Developer portals is highly prioritized by hiring managers.
                  </p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-bold text-white/90">Daily commitment:</span> 15–20 hours/week (~2–3 hours/day).
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {devOpsRoadmap.map((month) => {
                    const isExpanded = !!devopsExpandedMonths[month.number];
                    const completedProjectsInMonth = devopsCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!devopsCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setDevopsCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setDevopsCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleDevopsMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-indigo-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-indigo-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!devopsCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleDevopsTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleDevopsProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    devopsCompletedProjects[month.number]
                                      ? 'border-indigo-500/40 bg-indigo-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-blue-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {devopsCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${devopsCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${devopsCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Study Advice and Best Practices */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* SDE General Tips */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Advice for DevOps / Platform Aspirants</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Don't tool-hop:</span>
                        Finish each month's project before moving on. Half-completed tutorials don't count, fully functioning GitHub repos do.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Write in Public:</span>
                        Write updates on LinkedIn or tech blogs explaining how you resolved tricky container configs or deployment pipelines.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Understand the 'Why':</span>
                        Don't just copy YAML config snippets. Learn why K8s sets resource limits, or why remote state is configured in Terraform.
                      </div>
                    </div>
                  </div>

                  {/* Portfolio & Interview Prep Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Job Readiness Strategy</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Re-do the Capstone:</span>
                        Clean up your Month 5 Backstage platform codebase. Presenting a professional README layout is key to passing screening rounds.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Certifications (Optional):</span>
                        Consider AWS SAA, HashiCorp Terraform Associate, or CKA to bypass automatic applicant screening filters.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">DORA Metrics awareness:</span>
                        Be prepared to explain how your platforms help shorten lead times, raise deployment frequency, and reduce MTTR.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'flutter' ? (
              /* Flutter Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center flex-shrink-0">
                      <Cpu className="h-6 w-6 text-sky-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold">Mobile App Developer (Flutter) Curriculum</h3>
                      <p className="text-xs text-muted-foreground">General-purpose, 5-month path to cross-platform mobile roles</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{flutterProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedFlutterTopicsCount + completedFlutterProjectsCount} / {totalFlutterItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${flutterProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reality Check Note / Guide */}
                <div className="p-5 bg-sky-500/5 border border-sky-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-sky-400">
                    <AlertOctagon className="h-5 w-5" />
                    <span className="font-semibold text-sm">Flutter Track Considerations (2026 Edition)</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>The Windows/iOS Constraint:</strong> You can build and test Flutter apps for <strong>Android</strong> entirely on Windows. However, you <strong>cannot</strong> compile or test for iOS without a Mac. Code will be iOS-compatible in principle, but cloud services like Codemagic are required to build release files.
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Dart Fundamentals First:</strong> Do not skip programming logic to copy layout tutorials. Building a strong Dart OOP foundations is critical to avoid layout and state issues later.
                  </p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-bold text-white/90">Daily commitment:</span> 1–2 hours/day (~150–200 total hours).
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {flutterRoadmap.map((month) => {
                    const isExpanded = !!flutterExpandedMonths[month.number];
                    const completedProjectsInMonth = flutterCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!flutterCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setFlutterCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setFlutterCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-sky-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => toggleFlutterMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-sky-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-sky-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!flutterCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => toggleFlutterTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-sky-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-cyan-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => toggleFlutterProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    flutterCompletedProjects[month.number]
                                      ? 'border-sky-500/40 bg-sky-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(56,189,248,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-sky-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {flutterCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-sky-400 fill-sky-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${flutterCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${flutterCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Study Advice and Best Practices */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* SDE General Tips */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-sky-400" />
                      <span>Advice for Flutter Candidates</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Tutorial Hell avoidance:</span>
                        Do not copy widget setups blindly. Program Dart logic patterns manually, break them, and learn the rendering tree structure.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">State Management depth:</span>
                        Start with Provider for conceptual ease. Try not to jump straight into complex Bloc or Riverpod setups until Provider flows are solid.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Asset & Assets scale:</span>
                        Configure images, custom icon fonts, and themes correctly in pubspec.yaml to avoid application build configuration failures.
                      </div>
                    </div>
                  </div>

                  {/* Portfolio & Interview Prep Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-sky-400" />
                      <span>Mobile Dev Job Readiness</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Published App:</span>
                        Publishing a simple, functional app to Google Play Store provides massive credibility to recruitment teams.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Testing & Mock APIs:</span>
                        Write clean widget tests and document async data responses using Mock utilities to showcase professional engineering habits.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Native integrations:</span>
                        Learn how to read Android Gradle and iOS CocoaPods configuration files since you will frequently configure them in native setups.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Python Backend Roadmap Track */
              <div className="space-y-8 animate-fade-in">
                {/* Overall Progress Widget */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between border border-white/10 gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                      <Code className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold font-heading">Backend Developer (Python — Django & FastAPI) Curriculum</h3>
                      <p className="text-xs text-muted-foreground">General-purpose, 5-month path to Python backend engineering roles</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{pbProgress}% Completed</span>
                      <span className="text-muted-foreground">
                        {completedPbTopicsCount + completedPbProjectsCount} / {totalPbItems} Milestones
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${pbProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Reality Check Note / Guide */}
                <div className="p-5 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <AlertOctagon className="h-5 w-5" />
                    <span className="font-semibold text-sm">Python Backend Track Considerations (2026 Edition)</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Relational Database Logic:</strong> Frameworks are just structures organizing Python code. If relational database schemas and SQL querying aren't solid, you will struggle to build real APIs. Do not skip Month 1 SQL basics.
                  </p>
                  <p className="text-xs text-white/80 leading-relaxed text-left">
                    <strong>Build and Deploy:</strong> Pure backend developer positions care about live hosted apps far more than watching videos. Ensure you deploy your Month 4 containerized stack to AWS/Render and link it on your resume.
                  </p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-bold text-white/90">Daily commitment:</span> 3–4 hours/day (~90–100 hours/month).
                  </div>
                </div>

                {/* Timeline detailing months */}
                <div className="relative border-l border-white/10 ml-4 pl-8 space-y-8 text-left">
                  {pythonBackendRoadmap.map((month) => {
                    const isExpanded = !!pbExpandedMonths[month.number];
                    const completedProjectsInMonth = pbCompletedProjects[month.number] ? 1 : 0;
                    
                    // Calculate completed topics in this month
                    const completedTopicsInMonth = month.topics.filter((_, idx) => 
                      !!pbCompletedTopics[`m${month.number}-t${idx}`]
                    ).length;
                    
                    const totalMonthItems = month.topics.length + 1;
                    const monthProgress = completedTopicsInMonth + completedProjectsInMonth;
                    const isMonthCompleted = monthProgress === totalMonthItems;

                    return (
                      <div key={month.number} className="relative group">
                        {/* Timeline Node Icon */}
                        <button
                          onClick={() => {
                            // Toggle all topics & project in this month
                            const targetState = !isMonthCompleted;
                            
                            // Toggle project
                            setPbCompletedProjects(prev => ({
                              ...prev,
                              [month.number]: targetState
                            }));

                            // Toggle all topics
                            setPbCompletedTopics(prev => {
                              const updated = { ...prev };
                              month.topics.forEach((_, idx) => {
                                updated[`m${month.number}-t${idx}`] = targetState;
                              });
                              return updated;
                            });
                          }}
                          className={`absolute -left-[45px] top-1 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all bg-background z-10 ${
                            isMonthCompleted
                              ? 'border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                              : 'border-white/15 text-muted-foreground group-hover:border-white/30'
                          }`}
                          title={isMonthCompleted ? 'Mark Month Incomplete' : 'Mark Month Complete'}
                        >
                          {isMonthCompleted ? (
                            <CheckCircle2 className="h-5 w-5 fill-indigo-500/10" />
                          ) : (
                            <span className="text-xs font-bold font-heading">{month.number}</span>
                          )}
                        </button>

                        {/* Month Content Card */}
                        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
                          {/* Header Summary */}
                          <div
                            onClick={() => togglePbMonthExpand(month.number)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.01] select-none"
                          >
                            <div className="space-y-1 pr-4 text-left">
                              <h3 className={`text-lg font-bold font-heading transition ${isMonthCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                Month {month.number}: {month.title}
                              </h3>
                              <p className="text-muted-foreground text-xs">
                                Focus: <span className="text-indigo-400 font-medium">{month.focus}</span> • {monthProgress} / {totalMonthItems} completed
                              </p>
                            </div>
                            <button className="p-1 text-muted-foreground hover:text-white transition rounded-full hover:bg-white/5">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-white/5 bg-white/[0.005] space-y-6">
                              {/* Topics List */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Code className="h-4 w-4 text-indigo-400" />
                                  <span>Core Concepts to Master</span>
                                </h4>
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {month.topics.map((topic, idx) => {
                                    const isTopicCompleted = !!pbCompletedTopics[`m${month.number}-t${idx}`];
                                    return (
                                      <div
                                        key={idx}
                                        onClick={() => togglePbTopic(month.number, idx)}
                                        className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition cursor-pointer select-none"
                                      >
                                        <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                          {isTopicCompleted ? (
                                            <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400 fill-indigo-500/10" />
                                          ) : (
                                            <Circle className="h-4.5 w-4.5 text-white/20" />
                                          )}
                                        </button>
                                        <span className={`text-xs leading-relaxed ${isTopicCompleted ? 'text-white/40 line-through' : 'text-white/80'}`}>
                                          {topic}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Tools list */}
                              <div className="space-y-2.5">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Wrench className="h-4 w-4 text-purple-400" />
                                  <span>Recommended Tools & Tech Stack</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {month.tools.map((tool, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg"
                                    >
                                      {tool}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* YouTube Channels */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <Youtube className="h-4 w-4 text-rose-500" />
                                  <span>Curated YouTube Channels</span>
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {month.youtube.map((yt, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition gap-4"
                                    >
                                      <div className="min-w-0">
                                        <h5 className="text-xs font-bold text-white/90">{yt.channel}</h5>
                                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{yt.bestFor}</p>
                                      </div>
                                      <a
                                        href={yt.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 text-muted-foreground hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                                        title={`Search ${yt.channel}`}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Month Project Card */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                  <FolderGit2 className="h-4 w-4 text-emerald-400" />
                                  <span>Monthly Build Challenge</span>
                                </h4>
                                
                                <div
                                  onClick={() => togglePbProject(month.number)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none bg-gradient-to-br from-indigo-500/[0.01] to-purple-500/[0.01] relative overflow-hidden ${
                                    pbCompletedProjects[month.number]
                                      ? 'border-indigo-500/40 bg-indigo-500/[0.02]'
                                      : 'border-white/10 hover:border-white/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.05)]'
                                  }`}
                                >
                                  {/* Light background glow effect */}
                                  <div className="absolute -right-10 -bottom-10 h-28 w-28 bg-indigo-500/5 rounded-full blur-2xl" />
                                  
                                  <div className="flex items-start space-x-4">
                                    <button className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-white transition">
                                      {pbCompletedProjects[month.number] ? (
                                        <CheckCircle2 className="h-5 w-5 text-indigo-400 fill-indigo-500/10" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-white/20" />
                                      )}
                                    </button>
                                    <div className="text-left space-y-1">
                                      <h5 className={`text-sm font-bold ${pbCompletedProjects[month.number] ? 'text-white/40 line-through' : 'text-white'}`}>
                                        {month.project.title}
                                      </h5>
                                      <p className={`text-xs leading-relaxed ${pbCompletedProjects[month.number] ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                                        {month.project.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Study Advice and Best Practices */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {/* SDE General Tips */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Advice for Python Backend Candidates</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Don't tool-hop:</span>
                        Finish each month's project before moving on. Half-completed tutorials don't count, fully functioning GitHub repos do.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Understand Asyncio & Async:</span>
                        FastAPI relies heavily on python async loops. Make sure you understand the difference between async def and normal def functions in python.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Database Indexing:</span>
                        Relational performance tuning is a top backend interview question. Learn how Postgres handles indexing and transaction locks.
                      </div>
                    </div>
                  </div>

                  {/* Portfolio & Interview Prep Card */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/5 bg-white/[0.01] text-left">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                      <span>Backend Job Readiness</span>
                    </h4>
                    <div className="space-y-3.5 text-xs text-muted-foreground leading-relaxed">
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Resume Capstone:</span>
                        Present your Month 5 microservice capstone app with a clean README, listing your architectural choices and performance details.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Testing Coverage:</span>
                        Always include tests inside your project repository. An API with tests shows that you are comfortable with engineering best practices.
                      </div>
                      <div>
                        <span className="font-semibold text-white/80 block mb-0.5">Docker Knowledge:</span>
                        Most backend roles expect Docker container orchestration. Ensure you can spin up the full backend stack via docker-compose commands.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Roadmap;
