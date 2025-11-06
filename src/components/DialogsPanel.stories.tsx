import { Box } from '@mui/material';
import React from 'react';

import DialogsPanel from './DialogsPanel';
import RecurringEventDialog from './RecurringEventDialog';
import { Event } from '../types';

export default {
  title: '다이얼로그 및 모달 시각적 표현',
  component: DialogsPanel,
  parameters: { layout: 'fullscreen' },
};

function Wrapper(props: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: '1200px',
        height: '800px',
        p: 5,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {props.children}
    </Box>
  );
}

// 테스트용 이벤트 데이터
const sampleEvent1: Event = {
  id: '1',
  title: '기존 회의',
  date: '2025-11-10',
  startTime: '10:00',
  endTime: '11:00',
  description: '기존 일정',
  location: 'A-회의실',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

const sampleEvent2: Event = {
  id: '2',
  title: '다른 회의',
  date: '2025-11-10',
  startTime: '10:30',
  endTime: '11:30',
  description: '겹치는 일정',
  location: 'B-회의실',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

const sampleEvent3: Event = {
  id: '3',
  title: '세 번째 회의',
  date: '2025-11-10',
  startTime: '10:15',
  endTime: '11:15',
  description: '또 다른 겹치는 일정',
  location: 'C-회의실',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
};

const repeatingEvent: Event = {
  id: '4',
  title: '반복 일정',
  date: '2025-11-10',
  startTime: '14:00',
  endTime: '15:00',
  description: '반복되는 일정',
  location: '온라인',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-id-1',
  },
  notificationTime: 30,
};

/**
 * 일정 겹침 경고 - 단일 겹침 이벤트
 */
export const OverlapDialog_SingleEvent = () => (
  <Wrapper>
    <DialogsPanel
      overlap={{
        open: true,
        overlappingEvents: [sampleEvent1],
        onClose: () => {},
        onProceed: () => {},
      }}
      recurring={{
        open: false,
        onClose: () => {},
        onConfirm: () => {},
        event: null,
        mode: 'edit',
      }}
      notifications={[]}
      onDismissNotification={() => {}}
    />
  </Wrapper>
);

/**
 * 반복 일정 수정 다이얼로그
 */
export const RecurringDialog_EditMode = () => (
  <Wrapper>
    <RecurringEventDialog
      open={true}
      onClose={() => {}}
      onConfirm={() => {}}
      event={repeatingEvent}
      mode="edit"
    />
  </Wrapper>
);

/**
 * 반복 일정 삭제 다이얼로그
 */
export const RecurringDialog_DeleteMode = () => (
  <Wrapper>
    <RecurringEventDialog
      open={true}
      onClose={() => {}}
      onConfirm={() => {}}
      event={repeatingEvent}
      mode="delete"
    />
  </Wrapper>
);

/**
 * 알림 스낵바 - 단일 알림
 */
export const Notification_Single = () => (
  <Wrapper>
    <DialogsPanel
      overlap={{
        open: false,
        overlappingEvents: [],
        onClose: () => {},
        onProceed: () => {},
      }}
      recurring={{
        open: false,
        onClose: () => {},
        onConfirm: () => {},
        event: null,
        mode: 'edit',
      }}
      notifications={[{ message: '일정이 추가되었습니다.' }]}
      onDismissNotification={() => {}}
    />
  </Wrapper>
);
