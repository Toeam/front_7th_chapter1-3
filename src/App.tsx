import { DragEndEvent } from '@dnd-kit/core';
import { Box, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState, type ReactNode } from 'react';

import CalendarPanel from './components/CalendarPanel';
import DialogsPanel from './components/DialogsPanel';
import EventFormPanel from './components/EventFormPanel';
import EventListPanel from './components/EventListPanel';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';

const categories = ['업무', '개인', '가족', '기타'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

// 스타일 상수
const eventBoxStyles = {
  notified: {
    backgroundColor: '#ffebee',
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  normal: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'normal',
    color: 'inherit',
  },
  common: {
    p: 0.5,
    my: 0.5,
    borderRadius: 1,
    minHeight: '18px',
    width: '100%',
    overflow: 'hidden',
  },
};

const getRepeatTypeLabel = (type: RepeatType): string => {
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

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent, createRepeatEvent, fetchEvents } = useEventOperations(
    Boolean(editingEvent),
    () => setEditingEvent(null)
  );

  const { handleRecurringEdit, handleRecurringDelete } = useRecurringEventOperations(
    events,
    async () => {
      // After recurring edit, refresh events from server
      await fetchEvents();
    }
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null); // true = single, false = all
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete'>('edit');
  const [pendingMoveDate, setPendingMoveDate] = useState<string | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  // 드롭 시 이벤트 날짜를 갱신하는 핸들러
  // - 단일 일정: 즉시 해당 날짜로 이동 (PUT)
  // - 반복 일정: 모달로 단일(예)/전체(아니오) 적용 여부를 먼저 확인
  //   - 예(해당 일정만): 현재 인스턴스만 날짜를 바꿔 개별 이벤트로 저장
  //   - 아니오(전체 일정): 시리즈 전체를 동일한 일수만큼 이동(일괄 업데이트)
  const handleDragEnd = async (event: DragEndEvent) => {
    const overId = event.over?.id as string | undefined;
    const activeId = event.active?.id as string | undefined;
    if (!overId || !activeId) return;

    const eventToMove = events.find((e) => e.id === activeId);
    if (!eventToMove) return;

    // 같은 날짜로 드롭하면 무시
    if (eventToMove.date === overId) return;
    // 반복 일정이면 모달로 단일/전체 적용 여부 확인
    // (모달에서 사용자의 선택 결과는 handleRecurringConfirm에서 실제 이동으로 반영)
    if (isRecurringEvent(eventToMove)) {
      setPendingRecurringEdit(eventToMove);
      setPendingMoveDate(overId);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
      return;
    }

    // 단일 일정은 즉시 이동
    const updated: Event = { ...eventToMove, date: overId };
    await saveEvent(updated);
    enqueueSnackbar('일정이 이동되었습니다.', { variant: 'success' });
  };

  // 반복 일정 편집/삭제 확정 시 동작
  // - 드래그로 이동이 대기 중(pendingMoveDate)이면 즉시 이동 실행
  //   - editSingleOnly === true(예): 해당 인스턴스만 이동
  //   - editSingleOnly === false(아니오): 시리즈 전체를 동일한 일수로 이동
  // - 드래그 컨텍스트가 아니면 기존 편집/삭제 플로우 유지
  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    // 드래그로 이동 예약된 반복 일정 즉시 반영
    if (recurringDialogMode === 'edit' && pendingRecurringEdit && pendingMoveDate) {
      try {
        const updated: Event = { ...pendingRecurringEdit, date: pendingMoveDate };
        await handleRecurringEdit(updated, editSingleOnly);
        enqueueSnackbar('반복 일정이 이동되었습니다.', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 이동 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
      setPendingMoveDate(null);
      return;
    }

    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      // 편집 모드 저장하고 편집 폼으로 이동
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
    } else if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      // 반복 일정 삭제 처리
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    }
  };

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? editingEvent.repeat // Keep original repeat settings for recurring event detection
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    // 수정
    if (editingEvent) {
      if (hasOverlapEvent) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }

      if (
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.interval > 0 &&
        recurringEditMode !== null
      ) {
        await handleRecurringEdit(eventData as Event, recurringEditMode);
        setRecurringEditMode(null);
      } else {
        await saveEvent(eventData);
      }

      resetForm();
      return;
    }

    // 생성
    if (isRepeating) {
      // 반복 생성은 반복 일정을 고려하지 않는다.
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    if (hasOverlapEvent) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <EventFormPanel
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          startTime={startTime}
          endTime={endTime}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          category={category}
          setCategory={setCategory}
          isRepeating={isRepeating}
          setIsRepeating={setIsRepeating}
          repeatType={repeatType}
          setRepeatType={setRepeatType}
          repeatInterval={repeatInterval}
          setRepeatInterval={setRepeatInterval}
          repeatEndDate={repeatEndDate}
          setRepeatEndDate={setRepeatEndDate}
          notificationTime={notificationTime}
          setNotificationTime={setNotificationTime}
          startTimeError={startTimeError}
          endTimeError={endTimeError}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          onSubmit={addOrUpdateEvent}
          editingEvent={editingEvent}
          categories={categories}
          notificationOptions={notificationOptions}
        />

        <CalendarPanel
          view={view}
          setView={setView}
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          navigate={navigate}
          onDragEnd={handleDragEnd}
          setDate={setDate}
        />

        <EventListPanel
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notificationOptions={notificationOptions}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      </Stack>

      <DialogsPanel
        overlap={{
          open: isOverlapDialogOpen,
          overlappingEvents,
          onClose: () => setIsOverlapDialogOpen(false),
          onProceed: () => {
            setIsOverlapDialogOpen(false);
            saveEvent({
              id: editingEvent ? editingEvent.id : undefined,
              title,
              date,
              startTime,
              endTime,
              description,
              location,
              category,
              repeat: {
                type: isRepeating ? repeatType : 'none',
                interval: repeatInterval,
                endDate: repeatEndDate || undefined,
              },
              notificationTime,
            });
          },
        }}
        recurring={{
          open: isRecurringDialogOpen,
          onClose: () => {
            setIsRecurringDialogOpen(false);
            setPendingRecurringEdit(null);
            setPendingRecurringDelete(null);
            setPendingMoveDate(null);
          },
          onConfirm: handleRecurringConfirm,
          event: recurringDialogMode === 'edit' ? pendingRecurringEdit : pendingRecurringDelete,
          mode: recurringDialogMode,
        }}
        notifications={notifications}
        onDismissNotification={(index) => {
          setNotifications((prev) => prev.filter((_, i) => i !== index));
        }}
      />
    </Box>
  );
}

export default App;
