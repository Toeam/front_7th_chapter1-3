import { Box } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import EventFormPanel from './EventFormPanel';
import { Event } from '../types';


// 테스트용 고정 데이터
const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 0, label: '알림 없음' },
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

const meta: Meta<typeof EventFormPanel> = {
  title: '폼 컨트롤 상태별 시각적 표현',
  component: EventFormPanel,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: React.ComponentType) => (
      <Box
        sx={{
          width: '1200px',
          height: '800px',
          p: 5,
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Story />
      </Box>
    ),
  ],
  args: {
    // 기본 폼 상태
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    location: '',
    category: '',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 0,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
  },
};

export default meta;
type Story = StoryObj<typeof EventFormPanel>;

// ========== 일정 추가 모드 ==========

/**
 * 빈 폼 - 일정 추가 모드
 */
export const EmptyForm_AddMode: Story = {};

/**
 * 채워진 폼 - 일정 추가 모드
 */
export const FilledForm_AddMode: Story = {
  args: {
    title: '중요 회의',
    date: '2025-11-10',
    startTime: '10:00',
    endTime: '11:30',
    description: '주간 회의 및 프로젝트 진행 상황 공유',
    location: 'A-회의실',
    category: '업무',
    notificationTime: 10,
  },
};

/**
 * 반복 일정 활성화 - 매주 반복
 */
export const RepeatingEvent_Weekly: Story = {
  args: {
    title: '주간 스터디',
    date: '2025-11-10',
    startTime: '19:00',
    endTime: '21:00',
    description: '매주 월요일 스터디',
    location: '온라인',
    category: '학습',
    isRepeating: true,
    repeatType: 'weekly',
    repeatInterval: 1,
    repeatEndDate: '2025-12-31',
    notificationTime: 120,
  },
};


/**
 * 일정 수정 모드
 */
export const EditMode: Story = {
  args: {
    title: '기존 회의',
    date: '2025-11-10',
    startTime: '10:00',
    endTime: '11:00',
    description: '수정할 일정',
    location: 'A-회의실',
    category: '업무',
    notificationTime: 10,
    editingEvent: {
      id: '1',
      title: '기존 회의',
      date: '2025-11-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정할 일정',
      location: 'A-회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    } as Event,
  },
};

/**
 * 1분 전 알림 설정
 */
export const Notification_1Minute: Story = {
  args: {
    title: '긴급 회의',
    date: '2025-11-10',
    startTime: '10:00',
    endTime: '11:00',
    category: '업무',
    notificationTime: 1,
  },
};

