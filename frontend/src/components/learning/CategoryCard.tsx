import React from 'react';
import {
  Code2,
  Binary,
  Layout,
  Cpu,
  FolderGit2,
  Calculator,
  FileText,
  Briefcase,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { CurriculumCategory } from '../../services/curriculumServiceTypes';

interface CategoryCardProps {
  category: CurriculumCategory;
  isSelected: boolean;
  onClick: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Code2: <Code2 className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
  Binary: <Binary className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
  Layout: <Layout className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  Cpu: <Cpu className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
  FolderGit2: <FolderGit2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
  Calculator: <Calculator className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
  FileText: <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
  Briefcase: <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onClick,
}) => {
  const iconNode = ICON_MAP[category.icon] || (
    <BookOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" />
  );

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-left flex flex-col justify-between group ${
        isSelected
          ? 'bg-teal-50/40 dark:bg-slate-900 border-teal-500 dark:border-teal-500 shadow-md ring-2 ring-teal-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl transition ${
              isSelected
                ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800'
                : 'bg-slate-100/80 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-750'
            }`}
          >
            {iconNode}
          </div>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isSelected
                ? 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800'
                : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            {category.topicCount} Topics
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
            {category.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 dark:text-slate-400">{category.moduleCount} Modules</span>
        <span
          className={`flex items-center space-x-1 font-bold transition ${
            isSelected
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
          }`}
        >
          <span>Explore Modules</span>
          <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;
