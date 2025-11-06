import { DragEndEvent } from '@dnd-kit/core';
import { Box } from '@mui/material';
import React from 'react';

import CalendarPanel from './CalendarPanel';
import { Event } from '../types';
export default {
  // 스토리북 좌측 트리 이름
  title: '타입에 따른 캘린더 뷰 렌더링',
  component: CalendarPanel,
  // layout: 캔버스(미리보기 영역)를 전체 화면으로 넓힘
  parameters: { layout: 'fullscreen' },
};

// [중요] 스크린샷(시각적 회귀) 안정성을 위해 고정 크기 Wrapper를 둡니다.
// 이렇게 하면 뷰포트/컨테이너 크기가 고정되어 픽셀 차이로 인한 오탐지(false positive)를 줄일 수 있습니다.
function Wrapper(props: { children: React.ReactNode }) {
  return (
    <Box sx={{ width: '1200px', height: '800px', p: 5, boxSizing: 'border-box' }}>
      {props.children}
    </Box>
  );
}

// 스토리에서 사용할 최소 예시 이벤트
// - 시각적 회귀 테스트에서는 데이터가 바뀌면 스냅샷이 달라지므로, 고정값을 권장.
const sampleEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2025-11-12',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: 'A-회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '개발',
    date: '2025-11-13',
    startTime: '13:00',
    endTime: '15:00',
    description: '매주 화요일 개발 회의',
    location: '재택',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 60,
  },
];

// [공휴일 예시]
const holidays: Record<string, string> = {
  '2025-12-25': '크리스마스',
};

// 기준 날짜 설정
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
 * 빈 월간 뷰
 */
const currentDate = new Date('2025-10-01');

export const Empty = () => (
  <Wrapper>
    <CalendarPanel
      view="month"
      setView={setViewHandler}
      currentDate={currentDate}
      holidays={{}}
      filteredEvents={[]}
      notifiedEvents={[]}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

// [Month View 스토리]
export const MonthView = () => (
  <Wrapper>
    <CalendarPanel
      view="month"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={sampleEvents}
      notifiedEvents={['2']}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

// [긴 제목 일정 시각적 회귀 테스트용 이벤트]
const longTitleEvents: Event[] = [
  {
    id: 'long-1',
    title:
      '매우 긴 제목의 일정입니다. 이 제목은 캘린더 셀의 너비를 초과하여 잘려야 합니다. 시각적 회귀 테스트를 위한 긴 제목입니다.',
    date: '2025-11-12',
    startTime: '09:00',
    endTime: '10:00',
    description: '긴 제목 일정 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

/**
 * 긴 제목 일정 - 월간 뷰
 * 시각적 회귀 테스트: 긴 제목이 올바르게 잘리고 레이아웃이 깨지지 않는지 확인
 */
export const MonthViewLongTitles = () => (
  <Wrapper>
    <CalendarPanel
      view="month"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={longTitleEvents}
      notifiedEvents={['long-2']}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);

/**
 * 긴 제목 일정 - 주간 뷰
 * 시각적 회귀 테스트: 주간 뷰에서도 긴 제목이 올바르게 잘리고 레이아웃이 깨지지 않는지 확인
 */
export const WeekViewLongTitles = () => (
  <Wrapper>
    <CalendarPanel
      view="week"
      setView={setViewHandler}
      currentDate={baseDate}
      holidays={holidays}
      filteredEvents={longTitleEvents}
      notifiedEvents={['long-2']}
      navigate={navigateHandler}
      onDragEnd={onDragEndHandler}
      setDate={setDateHandler}
    />
  </Wrapper>
);
