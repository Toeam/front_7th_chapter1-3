import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

import { Event } from '../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const eventBoxStyles = {
  notified: { backgroundColor: '#ffebee', fontWeight: 'bold', color: '#d32f2f' },
  normal: { backgroundColor: '#f5f5f5', fontWeight: 'normal', color: 'inherit' },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

const getRepeatTypeLabel = (type: Event['repeat']['type']): string => {
  switch (type) {
    case 'daily':
      return '일';
    case 'weekly':
      return '주';
    case 'monthly':
      return '월';
    case 'yearly':
      return '년';
    default:
      return '';
  }
};

type CalendarPanelProps = {
  view: 'week' | 'month';
  setView: (v: 'week' | 'month') => void;
  currentDate: Date;
  holidays: Record<string, string>;
  filteredEvents: Event[];
  notifiedEvents: string[];
  navigate: (dir: 'prev' | 'next') => void;
  onDragEnd: (e: DragEndEvent) => void | Promise<void>;
  setDate: (date: string) => void;
};

type DroppableDayProps = { dateString: string; children: ReactNode; onClick: () => void };
const DroppableDay = ({ dateString, children, onClick }: DroppableDayProps) => {
  const { setNodeRef } = useDroppable({ id: dateString });
  return (
    <Box
      ref={setNodeRef}
      sx={{ height: '100%', width: '100%', cursor: 'pointer' }}
      onClick={onClick}
    >
      {children}
    </Box>
  );
};

type DraggableEventProps = { id: string; children: ReactNode };
const DraggableEvent = ({ id, children }: DraggableEventProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, cursor: 'grab' }
    : { cursor: 'grab' };
  return (
    <Box ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </Box>
  );
};

const CalendarPanel = ({
  view,
  setView,
  currentDate,
  holidays,
  filteredEvents,
  notifiedEvents,
  navigate,
  onDragEnd,
  setDate,
}: CalendarPanelProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => (
                  <TableCell
                    key={date.toISOString()}
                    sx={{
                      height: '120px',
                      verticalAlign: 'top',
                      width: '14.28%',
                      padding: 1,
                      border: '1px solid #e0e0e0',
                      overflow: 'hidden',
                    }}
                  >
                    <DroppableDay
                      dateString={formatDate(date)}
                      onClick={() => setDate(formatDate(date))}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {date.getDate()}
                      </Typography>
                      {filteredEvents
                        .filter(
                          (event) => new Date(event.date).toDateString() === date.toDateString()
                        )
                        .map((event) => {
                          const isNotified = notifiedEvents.includes(event.id);
                          const isRepeating = event.repeat.type !== 'none';
                          return (
                            <DraggableEvent key={event.id} id={event.id}>
                              <Box
                                sx={{
                                  ...eventBoxStyles.common,
                                  ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {isNotified && <Notifications fontSize="small" />}
                                  {isRepeating && (
                                    <Tooltip
                                      title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''}`}
                                    >
                                      <Repeat fontSize="small" />
                                    </Tooltip>
                                  )}
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                  >
                                    {event.title}
                                  </Typography>
                                </Stack>
                              </Box>
                            </DraggableEvent>
                          );
                        })}
                    </DroppableDay>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);
    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];
                    return (
                      <TableCell
                        key={dayIndex}
                        sx={{
                          height: '120px',
                          verticalAlign: 'top',
                          width: '14.28%',
                          padding: 1,
                          border: '1px solid #e0e0e0',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {day && (
                          <DroppableDay dateString={dateString} onClick={() => setDate(dateString)}>
                            <Typography variant="body2" fontWeight="bold">
                              {day}
                            </Typography>
                            {holiday && (
                              <Typography variant="body2" color="error">
                                {holiday}
                              </Typography>
                            )}
                            {getEventsForDay(filteredEvents, day).map((event) => {
                              const isNotified = notifiedEvents.includes(event.id);
                              const isRepeating = event.repeat.type !== 'none';
                              return (
                                <DraggableEvent key={event.id} id={event.id}>
                                  <Box
                                    sx={{
                                      p: 0.5,
                                      my: 0.5,
                                      backgroundColor: isNotified ? '#ffebee' : '#f5f5f5',
                                      borderRadius: 1,
                                      fontWeight: isNotified ? 'bold' : 'normal',
                                      color: isNotified ? '#d32f2f' : 'inherit',
                                      minHeight: '18px',
                                      width: '100%',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {isNotified && <Notifications fontSize="small" />}
                                      {isRepeating && (
                                        <Tooltip
                                          title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''}`}
                                        >
                                          <Repeat fontSize="small" />
                                        </Tooltip>
                                      )}
                                      <Typography
                                        variant="caption"
                                        noWrap
                                        sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                      >
                                        {event.title}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                </DraggableEvent>
                              );
                            })}
                          </DroppableDay>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  return (
    <Stack flex={1} spacing={5}>
      <Typography variant="h4">일정 보기</Typography>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
          <ChevronLeft />
        </IconButton>
        <Select
          size="small"
          aria-label="뷰 타입 선택"
          value={view}
          onChange={(e) => setView(e.target.value as 'week' | 'month')}
        >
          <MenuItem value="week" aria-label="week-option">
            Week
          </MenuItem>
          <MenuItem value="month" aria-label="month-option">
            Month
          </MenuItem>
        </Select>
        <IconButton aria-label="Next" onClick={() => navigate('next')}>
          <ChevronRight />
        </IconButton>
      </Stack>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </DndContext>
    </Stack>
  );
};

export default CalendarPanel;
