import React, { useState, useEffect, useRef } from 'react';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronDown, ChevronRight, Calendar, Users, AlertCircle, CheckCircle, Clock, Square, CheckSquare } from 'lucide-react';
import { ProjectMilestone, ProjectTask, GanttChartData, Deliverable } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface GanttChartProps {
  data: GanttChartData;
  onMilestoneClick?: (milestone: ProjectMilestone) => void;
  onTaskClick?: (task: ProjectTask) => void;
  onDeliverableToggle?: (milestoneId: string, deliverableId: string) => void;
  showTasks?: boolean;
  interactive?: boolean;
}

const GanttChart: React.FC<GanttChartProps> = ({
  data,
  onMilestoneClick,
  onTaskClick,
  onDeliverableToggle,
  showTasks = true,
  interactive = true
}) => {
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>(data.viewMode || 'month');
  const chartRef = useRef<HTMLDivElement>(null);

  // DEBUG: Log props on every render
  useEffect(() => {
    console.log('=== GanttChart Render Debug ===');
    console.log('onDeliverableToggle prop:', onDeliverableToggle);
    console.log('onDeliverableToggle type:', typeof onDeliverableToggle);
    console.log('onDeliverableToggle is function:', typeof onDeliverableToggle === 'function');
    console.log('All props:', { data, onMilestoneClick, onTaskClick, onDeliverableToggle, showTasks, interactive });
  }, [onDeliverableToggle, data, onMilestoneClick, onTaskClick, showTasks, interactive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'blocked': return 'bg-red-600';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'delayed':
      case 'blocked': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const toggleMilestone = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  const calculatePosition = (startDate: Date, endDate: Date, itemStart: Date, itemEnd: Date) => {
    // Use the actual project dates without overriding
    const totalDays = differenceInDays(endDate, startDate);
    const startDay = differenceInDays(itemStart, startDate);
    const duration = differenceInDays(itemEnd, itemStart) + 1;

    const left = Math.max(0, (startDay / totalDays) * 100);
    const width = Math.min(100 - left, (duration / totalDays) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  const generateDateHeaders = () => {
    const headers = [];
    // Use actual project dates
    const actualStartDate = data.startDate;
    const actualEndDate = data.endDate;
    const totalDays = differenceInDays(actualEndDate, actualStartDate);

    if (viewMode === 'week') {
      let currentDate = startOfWeek(actualStartDate);
      while (currentDate <= actualEndDate) {
        headers.push({
          label: format(currentDate, 'MMM dd'),
          date: currentDate,
          width: (7 / totalDays) * 100
        });
        currentDate = addDays(currentDate, 7);
      }
    } else if (viewMode === 'month') {
      let currentDate = startOfMonth(actualStartDate);
      while (currentDate <= actualEndDate) {
        const daysInMonth = differenceInDays(endOfMonth(currentDate), currentDate) + 1;
        headers.push({
          label: format(currentDate, 'MMM yyyy'),
          date: currentDate,
          width: (daysInMonth / totalDays) * 100
        });
        currentDate = addDays(endOfMonth(currentDate), 1);
      }
    } else if (viewMode === 'quarter') {
      // Quarter view - show 3-month periods
      let currentDate = startOfMonth(actualStartDate);
      while (currentDate <= actualEndDate) {
        const quarterEnd = addDays(addDays(endOfMonth(currentDate), 1), 59); // ~2 months ahead
        const quarterDays = differenceInDays(
          quarterEnd > actualEndDate ? actualEndDate : quarterEnd,
          currentDate
        ) + 1;
        headers.push({
          label: `Q${Math.ceil((currentDate.getMonth() + 1) / 3)} ${format(currentDate, 'yyyy')}`,
          date: currentDate,
          width: (quarterDays / totalDays) * 100
        });
        currentDate = addDays(quarterEnd, 1);
      }
    }

    return headers;
  };

  const renderMilestoneBar = (milestone: ProjectMilestone) => {
    const position = calculatePosition(data.startDate, data.endDate, milestone.startDate, milestone.endDate);
    const isHovered = hoveredItem === milestone.id;

    return (
      <div
        className="relative h-10 mb-2"
        onMouseEnter={() => setHoveredItem(milestone.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="flex items-center gap-2 w-80 pr-4">
            {showTasks && (
              <button
                onClick={() => toggleMilestone(milestone.id)}
                className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
              >
                {expandedMilestones.has(milestone.id) ?
                  <ChevronDown className="w-4 h-4" /> :
                  <ChevronRight className="w-4 h-4" />
                }
              </button>
            )}
            <span className="font-semibold text-sm flex-1 min-w-0" title={milestone.name}>
              {milestone.name}
            </span>
            <div className="flex-shrink-0">
              {getStatusIcon(milestone.status)}
            </div>
          </div>
        </div>

        <div className="absolute left-80 right-0 h-full flex items-center">
          <motion.div
            className={`absolute h-8 rounded-lg ${getStatusColor(milestone.status)} ${
              interactive ? 'cursor-pointer hover:shadow-lg' : ''
            } transition-all`}
            style={position}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: milestone.order * 0.1 }}
            onClick={() => interactive && onMilestoneClick?.(milestone)}
          >
            <div className="absolute inset-0 bg-white bg-opacity-20 rounded-lg flex items-center justify-between px-2">
              <span className="text-xs text-white font-medium">{milestone.progress}%</span>
              {milestone.assignedTo.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-white" />
                  <span className="text-xs text-white">{milestone.assignedTo.length}</span>
                </div>
              )}
            </div>

            {milestone.progress > 0 && (
              <div
                className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded-l-lg transition-all"
                style={{ width: `${milestone.progress}%` }}
              />
            )}
          </motion.div>

          {isHovered && interactive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 bg-white shadow-lg rounded-lg p-3 text-sm"
              style={{ top: '-80px', left: position.left }}
            >
              <div className="font-semibold mb-1">{milestone.name}</div>
              <div className="text-xs text-gray-600">
                {format(milestone.startDate, 'MMM dd')} - {format(milestone.endDate, 'MMM dd')}
              </div>
              <div className="text-xs mt-1">Progress: {milestone.progress}%</div>
              <div className="text-xs">Deliverables: {milestone.deliverables.length}</div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderTaskBar = (task: ProjectTask) => {
    const position = calculatePosition(data.startDate, data.endDate, task.startDate, task.endDate);
    const priorityColor = {
      low: 'bg-gray-400',
      medium: 'bg-yellow-400',
      high: 'bg-orange-400',
      critical: 'bg-red-400'
    }[task.priority];

    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="relative h-8 mb-1 ml-8"
        onMouseEnter={() => setHoveredItem(task.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="absolute inset-0 flex items-center">
          <div className="flex items-center gap-2 w-56 pr-4">
            <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
            <span className="text-xs truncate">{task.name}</span>
          </div>
        </div>

        <div className="absolute left-64 right-0 h-full flex items-center">
          <div
            className={`absolute h-6 rounded ${getStatusColor(task.status)} ${
              interactive ? 'cursor-pointer hover:shadow-md' : ''
            } transition-all opacity-80`}
            style={position}
            onClick={() => interactive && onTaskClick?.(task)}
          >
            <div className="absolute inset-0 flex items-center px-2">
              <span className="text-xs text-white">{task.progress}%</span>
            </div>

            {task.progress > 0 && (
              <div
                className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded-l transition-all"
                style={{ width: `${task.progress}%` }}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderDeliverables = (milestone: ProjectMilestone) => {
    if (!milestone.deliverables || milestone.deliverables.length === 0) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="ml-8 mb-4 bg-gray-50 rounded-lg p-4 relative z-20"
      >
        <h4 className="text-sm font-semibold mb-3 text-gray-700">Deliverables</h4>
        <div className="space-y-2">
          {milestone.deliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className="flex items-start gap-3 group"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('=== DELIVERABLE CHECKBOX CLICKED ===');
                  console.log('Milestone ID:', milestone.id);
                  console.log('Deliverable ID:', deliverable.id);
                  console.log('Deliverable current state:', deliverable.completed);
                  console.log('onDeliverableToggle at click time:', onDeliverableToggle);
                  console.log('onDeliverableToggle type at click:', typeof onDeliverableToggle);
                  console.log('onDeliverableToggle truthiness:', !!onDeliverableToggle);

                  if (onDeliverableToggle) {
                    console.log('CALLING onDeliverableToggle with:', milestone.id, deliverable.id);
                    try {
                      onDeliverableToggle(milestone.id, deliverable.id);
                      console.log('onDeliverableToggle CALLED SUCCESSFULLY');
                    } catch (error) {
                      console.error('ERROR calling onDeliverableToggle:', error);
                    }
                  } else {
                    console.error('CRITICAL: onDeliverableToggle is NOT PROVIDED at click time!');
                    console.error('Props object:', { onMilestoneClick, onTaskClick, onDeliverableToggle });
                  }
                }}
                className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                type="button"
              >
                {deliverable.completed ? (
                  <CheckSquare className="w-5 h-5 text-green-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <span
                className={`text-sm flex-1 ${
                  deliverable.completed
                    ? 'text-gray-500 line-through'
                    : 'text-gray-900'
                }`}
              >
                {typeof deliverable === 'string' ? deliverable : deliverable.text}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Project Timeline</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto" ref={chartRef}>
        <div className="min-w-[1200px]">
          {/* Date Headers */}
          <div className="flex border-b-2 border-gray-200 pb-2 mb-4">
            <div className="w-80" />
            <div className="flex-1 flex">
              {generateDateHeaders().map((header, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-medium text-gray-600 border-l border-gray-200"
                  style={{ width: `${header.width}%` }}
                >
                  {header.label}
                </div>
              ))}
            </div>
          </div>

          {/* Milestones and Tasks */}
          <div className="relative">
            {/* Today Line */}
            {(() => {
              const actualStartDate = data.startDate;
              const actualEndDate = data.endDate;
              const today = new Date();

              // Only show today line if it's within the project timeline
              if (today >= actualStartDate && today <= actualEndDate) {
                const totalDays = differenceInDays(actualEndDate, actualStartDate);
                const daysFromStart = differenceInDays(today, actualStartDate);
                const leftPosition = (daysFromStart / totalDays) * 100;

                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                    style={{
                      left: `calc(20rem + ${leftPosition}%)`
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-400 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Today
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Render Milestones */}
            {data.milestones.map((milestone) => (
              <div key={milestone.id}>
                {renderMilestoneBar(milestone)}

                {/* Render Deliverables */}
                {expandedMilestones.has(milestone.id) && (
                  <AnimatePresence>
                    {renderDeliverables(milestone)}
                  </AnimatePresence>
                )}

                {/* Render Tasks */}
                {showTasks && expandedMilestones.has(milestone.id) && (
                  <AnimatePresence>
                    {data.tasks
                      .filter(task => task.milestoneId === milestone.id)
                      .map(task => renderTaskBar(task))}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded" />
          <span className="text-xs">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded" />
          <span className="text-xs">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-xs">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-xs">Delayed/Blocked</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;