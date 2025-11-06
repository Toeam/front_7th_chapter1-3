import { DragEndEvent } from '@dnd-kit/core';
import { Box } from '@mui/material';
import React from 'react';

import CalendarPanel from './CalendarPanel';
import { Event } from '../types';

export default {
  title: '일정 상태별 시각적 표현 (반복/일반)',
  component: CalendarPanel,

  parameters: { layout: 'fullscreen' },
};

function Wrapper(props: { children: React.ReactNode }) {
  return (
    <Box sx={{ width: '1200px', height: '800px', p: 5, boxSizing: 'border-box' }}>
      {props.children}
    </Box>
  );
}

// [중요] 시각적 회귀 테스트에서는 데이터가 바뀌면 스냅샷이 달라지므로, 고정값을 권장합니다.

// 1. 일반 일정 (알림 없음, 반복 없음)
const normalEvent: Event = {
  id: '1',
  title: '일반 회의',
  date: '2025-11-10',
  startTime: '10:00',
  endTime: '11:00',
  description: '일반 일정',
  location: 'A-회의실',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

// 2. 알림이 있는 일반 일정
const notifiedEvent: Event = {
  id: '2',
  title: '중요 회의',
  date: '2025-11-11',
  startTime: '14:00',
  endTime: '15:00',
  description: '알림이 있는 일정',
  location: 'B-회의실',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 30,
};

// 3. 반복 일정 (알림 없음)
const repeatingEvent: Event = {
  id: '3',
  title: '주간 스터디',
  date: '2025-11-12',
  startTime: '13:00',
  endTime: '18:00',
  description: '매주 반복 일정',
  location: '집',
  category: '학습',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-11-30',
    id: 'repeat-id-1',
  },
  notificationTime: 0,
};

// 4. 알림이 있는 반복 일정
const notifiedRepeatingEvent: Event = {
  id: '4',
  title: '중요 반복 회의',
  date: '2025-11-13',
  startTime: '09:00',
  endTime: '10:30',
  description: '알림이 있는 반복 일정',
  location: '온라인',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-id-2',
  },
  notificationTime: 60,
};

const holidays: Record<string, string> = {
  '2025-12-25': '크리스마스',
};

// 기준 날짜 설정 (2025년 11월 10일 월요일)
const baseDate = new Date('2025-11-10');

const setViewHandler = (view: 'week' | 'month') => {
  void view;
};
const navigateHandler = (dir: 'prev' | 'next') => {
  void dir;
};
const setDateHandler = (date: string) => {
  void date;
};
const onDragEndHandler = (e: DragEndEvent) => {
  void e;
};

/**
 * 월간 뷰 - 일반 일정
 */
export const MonthView_NormalEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="month"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[normalEvent]}
      notifiedEvents={[]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 월간 뷰 - 알림이 있는 일반 일정
 */
export const MonthView_NotifiedEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="month"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[notifiedEvent]}
      notifiedEvents={[notifiedEvent.id]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 월간 뷰 - 반복 일정 (알림 없음)
 */
export const MonthView_RepeatingEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="month"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[repeatingEvent]}
      notifiedEvents={[]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 월간 뷰 - 알림이 있는 반복 일정
 */
export const MonthView_NotifiedRepeatingEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="month"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[notifiedRepeatingEvent]}
      notifiedEvents={[notifiedRepeatingEvent.id]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 주간 뷰 - 일반 일정
 */
export const WeekView_NormalEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="week"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[normalEvent]}
      notifiedEvents={[]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 주간 뷰 - 알림이 있는 일반 일정
 */
export const WeekView_NotifiedEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="week"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[notifiedEvent]}
      notifiedEvents={[notifiedEvent.id]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 주간 뷰 - 반복 일정
 */
export const WeekView_RepeatingEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="week"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[repeatingEvent]}
      notifiedEvents={[]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 주간 뷰 - 알림이 있는 반복 일정
 */
export const WeekView_NotifiedRepeatingEvent = () => (
  <Wrapper>
    <CalendarPanel
      view="week"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={[notifiedRepeatingEvent]}
      notifiedEvents={[notifiedRepeatingEvent.id]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);
