import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Building2, HelpCircle, Edit3 } from 'lucide-react';
import { POPULAR_COLLEGES } from '../../constants/colleges';

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CollegeAutocomplete: React.FC<CollegeAutocompleteProps> = ({
  value,
  onChange,
  error,
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isManualEntry, setIsManualEntry] = useState(
    Boolean(value && !POPULAR_COLLEGES.includes(value))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on query
  const filteredColleges = POPULAR_COLLEGES.filter((college) =>
    college.toLowerCase().includes(query.toLowerCase().trim())
  );

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (collegeName: string) => {
    onChange(collegeName);
    setQuery(collegeName);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onChange(newQuery);
    if (!isManualEntry) {
      setIsOpen(true);
    }
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isManualEntry) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
        return;
      }
      setHighlightedIndex((prev) =>
        prev < filteredColleges.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) return;
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredColleges.length) {
        e.preventDefault();
        handleSelect(filteredColleges[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="space-y-1.5 text-left relative w-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-blue-400" />
          <span>College Name</span>
        </label>
        <button
          type="button"
          onClick={() => {
            setIsManualEntry(!isManualEntry);
            setIsOpen(false);
            if (inputRef.current) inputRef.current.focus();
          }}
          className="text-[11px] text-blue-400 hover:text-blue-300 transition font-medium flex items-center gap-1"
        >
          {isManualEntry ? (
            <>
              <Search className="h-3 w-3" />
              <span>Select from list</span>
            </>
          ) : (
            <>
              <Edit3 className="h-3 w-3" />
              <span>Can't find your college?</span>
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          value={query}
          onChange={handleInputChange}
          onFocus={() => !isManualEntry && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            isManualEntry
              ? 'Type your full college or university name...'
              : 'Search college (e.g., IIT Bombay, NIT Trichy, RVCE)...'
          }
          className={`w-full bg-slate-900/80 border ${
            error ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
          } rounded-xl py-3 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-400 outline-none transition duration-150 shadow-inner`}
        />

        {!isManualEntry && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Suggestions Dropdown */}
        {!isManualEntry && isOpen && (
          <div className="absolute z-50 mt-1.5 w-full bg-slate-900/95 border border-slate-700/90 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            <ul ref={listRef} className="max-h-56 overflow-y-auto py-1 text-xs sm:text-sm divide-y divide-slate-800/50">
              {filteredColleges.length > 0 ? (
                filteredColleges.map((college, idx) => {
                  const isSelected = value === college;
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <li
                      key={college}
                      onClick={() => handleSelect(college)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition duration-150 ${
                        isHighlighted
                          ? 'bg-blue-600/20 text-white font-medium pl-5'
                          : isSelected
                          ? 'bg-blue-500/10 text-blue-300 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate pr-3">{college}</span>
                      {isSelected && <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-4 text-center space-y-2">
                  <div className="text-slate-400 text-xs flex items-center justify-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                    <span>No matching college found</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualEntry(true);
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold hover:underline"
                  >
                    <span>Click here to enter manually</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-400 font-medium pt-0.5 animate-fadeIn">{error}</p>
      ) : (
        <p className="text-[11px] text-slate-400 italic">
          {isManualEntry
            ? 'Manual entry mode active. Type your college name.'
            : 'Type to filter from top engineering colleges or enter manually.'}
        </p>
      )}
    </div>
  );
};
