import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '../mosaic/Badge';

export interface PlannerEventItem {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface CalendarPlannerSectionProps {
  events: PlannerEventItem[];
  onAddEvent: (eventData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  onToggleEvent: (eventId: string, currentStatus: boolean) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
}

export function CalendarPlannerSection({
  events,
  onAddEvent,
  onToggleEvent,
  onDeleteEvent,
}: CalendarPlannerSectionProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');
  const [category, setCategory] = useState('Interview / Exam');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (dayNum: number) => {
    const today = new Date();
    return (
      dayNum === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (dayNum: number) => {
    return (
      dayNum === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const formatYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getEventsForDay = (dayNum: number) => {
    const targetYMD = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return events.filter((ev) => {
      const evDate = new Date(ev.startTime);
      const evYMD = `${evDate.getFullYear()}-${String(evDate.getMonth() + 1).padStart(2, '0')}-${String(evDate.getDate()).padStart(2, '0')}`;
      return evYMD === targetYMD;
    });
  };

  const selectedDateEvents = events.filter((ev) => {
    const evDate = new Date(ev.startTime);
    return (
      evDate.getDate() === selectedDate.getDate() &&
      evDate.getMonth() === selectedDate.getMonth() &&
      evDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const handleOpenAddModalForDay = (dayNum?: number) => {
    if (dayNum) {
      const newSel = new Date(year, month, dayNum);
      setSelectedDate(newSel);
    }
    setIsModalOpen(true);
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) {
      toast.error('Please enter a plan title');
      return;
    }

    const ymd = formatYMD(selectedDate);
    const startIso = `${ymd}T${startTimeStr}:00`;
    const endIso = `${ymd}T${endTimeStr}:00`;

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddEvent({
        title: planTitle,
        description: planDescription ? `[${category}] ${planDescription}` : `[${category}]`,
        startTime: startIso,
        endTime: endIso,
      });
      setPlanTitle('');
      setPlanDescription('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeRange = (startIso: string, endIso: string) => {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const sStr = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const eStr = e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${sStr} - ${eStr}`;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Month Header Control */}
      <div className="mosaic-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-bold font-heading text-[var(--ink-900)]">
                Interactive Calendar Planner
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-muted)]">
              Click any date to schedule key milestones, exam deadlines, and interview plans.
            </p>
          </div>

          <button
            onClick={() => handleOpenAddModalForDay()}
            className="mosaic-btn-brand !py-2 !px-4 !text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Important Plan</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
          <div className="flex items-center space-x-3">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold text-[var(--ink-900)] min-w-[160px] text-center font-heading">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDate(now);
            }}
            className="text-xs font-bold text-teal-700 hover:underline"
          >
            Jump to Today
          </button>
        </div>
      </div>

      {/* Main Grid & Selected Date Details Split View */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Calendar Month Grid */}
        <div className="lg:col-span-8 mosaic-card p-5 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-3">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`prev-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50 opacity-40 pointer-events-none" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayEvents = getEventsForDay(dayNum);
              const today = isToday(dayNum);
              const selected = isSelected(dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                  className={`h-20 sm:h-24 p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between group relative ${
                    selected
                      ? 'border-teal-600 bg-teal-50 shadow-md'
                      : today
                      ? 'border-blue-400 bg-blue-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                        today
                          ? 'bg-blue-600 text-white shadow-sm'
                          : selected
                          ? 'bg-teal-700 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <Badge tone="purple">{dayEvents.length}</Badge>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden flex-1 mt-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev._id}
                        className={`text-[9px] truncate px-1.5 py-0.5 rounded font-semibold ${
                          ev.isCompleted
                            ? 'bg-emerald-100 text-emerald-800 line-through'
                            : 'bg-indigo-100 text-indigo-900'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAddModalForDay(dayNum);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition absolute bottom-1 right-1 p-1 rounded-full bg-teal-600 text-white shadow"
                    title={`Add plan for ${monthNames[month]} ${dayNum}`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="lg:col-span-4 mosaic-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                Selected Date
              </span>
              <h3 className="text-lg font-bold text-[var(--ink-900)] font-heading">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
              </h3>
            </div>

            <button
              onClick={() => handleOpenAddModalForDay()}
              className="p-2 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition border border-teal-200"
              title="Add Plan for Selected Date"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <CalendarIcon className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-[var(--ink-muted)]">No plans scheduled for this date yet.</p>
                <button
                  onClick={() => handleOpenAddModalForDay()}
                  className="text-xs font-bold text-teal-700 hover:underline"
                >
                  + Add Important Plan
                </button>
              </div>
            ) : (
              selectedDateEvents.map((ev) => (
                <div
                  key={ev._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-left hover:border-teal-400 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <button
                        onClick={() => onToggleEvent(ev._id, ev.isCompleted)}
                        className="mt-0.5 text-slate-400 hover:text-teal-600 transition flex-shrink-0"
                      >
                        {ev.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold ${ev.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {ev.title}
                        </h4>
                        <div className="flex items-center space-x-1.5 text-[11px] text-[var(--ink-muted)] pt-0.5">
                          <Clock className="h-3 w-3 text-teal-600" />
                          <span>{formatTimeRange(ev.startTime, ev.endTime)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteEvent(ev._id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-600 pt-1 leading-relaxed border-t border-slate-200/60">
                      {ev.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="mosaic-card max-w-md w-full p-6 relative shadow-2xl space-y-5 text-left border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-100" />
                <h3 className="text-lg font-bold font-heading text-[var(--ink-900)]">
                  Add Important Plan
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--ink-muted)]">
              Scheduling for: <strong className="text-teal-700">{monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}</strong>
            </p>

            <form onSubmit={handleSubmitPlan} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                  Plan Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Campus Interview / Final Project Submission"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-sm focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                  Category Tag
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-900 text-sm focus:outline-none focus:border-teal-600"
                >
                  <option value="Interview / Exam">Interview / Placement Exam</option>
                  <option value="Deadline">Project / Assignment Deadline</option>
                  <option value="Roadmap Target">Roadmap Chapter Milestone</option>
                  <option value="Personal Study Goal">Personal Study Goal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 text-xs focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 text-xs focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider">
                  Details / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add preparation notes, links, or requirements..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mosaic-btn-outline !py-2 !px-4 !text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mosaic-btn-brand !py-2 !px-5 !text-xs"
                >
                  {isSubmitting ? 'Saving Plan...' : 'Save Important Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPlannerSection;
