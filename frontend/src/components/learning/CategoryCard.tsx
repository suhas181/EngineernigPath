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
  Code2: <Code2 className="h-6 w-6 text-cyan-600" />,
  Binary: <Binary className="h-6 w-6 text-purple-600" />,
  Layout: <Layout className="h-6 w-6 text-blue-600" />,
  Cpu: <Cpu className="h-6 w-6 text-emerald-600" />,
  FolderGit2: <FolderGit2 className="h-6 w-6 text-amber-600" />,
  Calculator: <Calculator className="h-6 w-6 text-rose-600" />,
  FileText: <FileText className="h-6 w-6 text-teal-600" />,
  Briefcase: <Briefcase className="h-6 w-6 text-indigo-600" />,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onClick,
}) => {
  const iconNode = ICON_MAP[category.icon] || <BookOpen className="h-6 w-6 text-teal-600" />;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-left flex flex-col justify-between group ${
        isSelected
          ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
          : 'bg-white/80 border-[var(--card-border)] hover:border-slate-300 hover:bg-white'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl transition ${
              isSelected ? 'bg-teal-50 border border-teal-200' : 'bg-slate-100/80 group-hover:bg-slate-100'
            }`}
          >
            {iconNode}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {category.topicCount} Topics
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--ink-900)] font-heading group-hover:text-teal-700 transition">
            {category.title}
          </h3>
          <p className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed line-clamp-2">
            {category.description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500">{category.moduleCount} Modules</span>
        <span
          className={`flex items-center space-x-1 font-bold transition ${
            isSelected ? 'text-teal-700' : 'text-slate-600 group-hover:text-teal-700'
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
