/* global RequestInit */

import { Event } from '../types';

/**
 * API endpoints for recurring event operations
 */
const API_ENDPOINTS = {
  events: '/api/events',
  recurringEvents: '/api/recurring-events',
  eventsList: '/api/events-list',
} as const;

/**
 * HTTP method constants
 */
const HTTP_METHODS = {
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

/**
 * Default event repeat configuration for non-recurring events
 */
const DEFAULT_REPEAT_CONFIG = {
  type: 'none' as const,
  interval: 0,
};

/**
 * Custom hook for managing recurring event operations
 * Provides functionality for editing and deleting recurring events
 */
export const useRecurringEventOperations = (
  events: Event[],
  updateEvents: (events: Event[]) => void
) => {
  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const isSameRecurringSeries = (eventA: Event, eventB: Event): boolean => {
    return (
      eventA.repeat.type === eventB.repeat.type &&
      eventA.repeat.interval === eventB.repeat.interval &&
      eventA.title === eventB.title &&
      eventA.startTime === eventB.startTime &&
      eventA.endTime === eventB.endTime &&
      eventA.description === eventB.description &&
      eventA.location === eventB.location &&
      eventA.category === eventB.category
    );
  };

  const findRelatedRecurringEvents = (targetEvent: Event): Event[] => {
    if (!isRecurringEvent(targetEvent)) {
      return [];
    }

    // Find ALL events that are part of the same recurring series
    const seriesEvents = events.filter(
      (event) => isRecurringEvent(event) && isSameRecurringSeries(event, targetEvent)
    );

    // If there's only one event in the series (just the target event itself), return empty array
    // If there are multiple events in the series, return all events including the target
    return seriesEvents.length > 1 ? seriesEvents : [];
  };

  /**
   * Generic API request handler with error handling
   */
  const makeApiRequest = async (url: string, method: string, body?: unknown): Promise<boolean> => {
    try {
      const config: RequestInit = { method };

      if (body !== undefined) {
        config.headers = { 'Content-Type': 'application/json' };
        config.body = JSON.stringify(body);
      }

      const response = await fetch(url, config);
      return response.ok;
    } catch (error) {
      console.error(`API request failed: ${method} ${url}`, error);
      return false;
    }
  };

  const updateEventOnServer = async (event: Event): Promise<boolean> => {
    return makeApiRequest(`${API_ENDPOINTS.events}/${event.id}`, HTTP_METHODS.PUT, event);
  };

  const deleteEventOnServer = async (eventId: string): Promise<boolean> => {
    return makeApiRequest(`${API_ENDPOINTS.events}/${eventId}`, HTTP_METHODS.DELETE);
  };

  const deleteRecurringEventOnServer = async (repeatId: string): Promise<boolean> => {
    return makeApiRequest(`${API_ENDPOINTS.recurringEvents}/${repeatId}`, HTTP_METHODS.DELETE);
  };

  const updateRecurringEventOnServer = async (
    repeatId: string,
    updateData: Partial<Event>
  ): Promise<boolean> => {
    return makeApiRequest(
      `${API_ENDPOINTS.recurringEvents}/${repeatId}`,
      HTTP_METHODS.PUT,
      updateData
    );
  };

  const createSingleEditEvent = (updatedEvent: Event): Event => ({
    ...updatedEvent,
    repeat: DEFAULT_REPEAT_CONFIG,
  });

  /**
   * Prefers recurring API when repeatId is available, falls back to individual updates
   */
  // 반복 일정 시리즈 편집 처리
  // - 드래그&드랍으로 날짜가 바뀐 경우: 원본과 변경된 날짜의 차이(일 단위)를 계산해
  //   같은 시리즈의 모든 이벤트 날짜를 동일하게 이동시킨 후, 일괄 업데이트 엔드포인트에 반영
  // - 날짜가 바뀌지 않은 경우: 시리즈 메타(제목/설명/위치/카테고리/알림)만 시리즈 API로 갱신
  // - repeatId가 없는 경우에는 개별 이벤트들로 순회 업데이트
  const updateRecurringSeries = async (
    originalEvent: Event,
    updatedEvent: Event,
    relatedEvents: Event[]
  ): Promise<boolean> => {
    const repeatId = originalEvent.repeat.id;

    // 드래그로 날짜가 변경된 경우: 시리즈 전체를 동일한 간격으로 이동 (일괄 업데이트 사용)
    const originalDate = new Date(originalEvent.date);
    const targetDate = new Date(updatedEvent.date);
    const deltaMs = targetDate.getTime() - originalDate.getTime();

    if (deltaMs !== 0) {
      const movedEvents = relatedEvents.map((event) => {
        const current = new Date(event.date);
        const moved = new Date(current.getTime() + deltaMs);
        const yyyy = moved.getFullYear();
        const mm = String(moved.getMonth() + 1).padStart(2, '0');
        const dd = String(moved.getDate()).padStart(2, '0');
        const newDate = `${yyyy}-${mm}-${dd}`;
        return {
          ...event,
          // Preserve other potential edits (title, etc.) from updatedEvent if provided
          title: updatedEvent.title,
          description: updatedEvent.description,
          location: updatedEvent.location,
          category: updatedEvent.category,
          notificationTime: updatedEvent.notificationTime,
          date: newDate,
        } as Event;
      });

      // 서버는 /api/events-list PUT으로 여러 이벤트를 한 번에 갱신함
      return await makeApiRequest(API_ENDPOINTS.eventsList, HTTP_METHODS.PUT, {
        events: movedEvents,
      });
    }

    // 날짜 이동이 아니면 시리즈 메타데이터만 갱신
    if (repeatId) {
      const updateData = {
        title: updatedEvent.title,
        description: updatedEvent.description,
        location: updatedEvent.location,
        category: updatedEvent.category,
        notificationTime: updatedEvent.notificationTime,
      };
      return await updateRecurringEventOnServer(repeatId, updateData);
    }

    // repeatId가 없을 때: 같은 시리즈로 판단된 개별 이벤트들을 각각 업데이트
    const results = await Promise.all(
      relatedEvents.map((event) => updateEventOnServer({ ...event, title: updatedEvent.title }))
    );
    return results.every((result) => result);
  };

  /**
   * Handles editing of recurring events with user choice for scope
   * @param updatedEvent - The event with updated information
   * @param editSingleOnly - true for single event edit, false for series edit
   */
  const handleRecurringEdit = async (
    updatedEvent: Event,
    editSingleOnly: boolean
  ): Promise<void> => {
    const originalEvent = events.find((e) => e.id === updatedEvent.id);

    if (!originalEvent) {
      await updateEventOnServer(updatedEvent);
      updateEvents([]);
      return;
    }

    const relatedEvents = findRelatedRecurringEvents(originalEvent);

    if (relatedEvents.length === 0 || editSingleOnly) {
      const singleEvent = createSingleEditEvent(updatedEvent);
      await updateEventOnServer(singleEvent);
      updateEvents([]);
      return;
    }

    await updateRecurringSeries(originalEvent, updatedEvent, relatedEvents);
    updateEvents([]);
  };

  /**
   * Prefers recurring API when repeatId is available, falls back to individual deletion
   */
  const deleteRecurringSeries = async (
    eventToDelete: Event,
    relatedEvents: Event[]
  ): Promise<boolean> => {
    const repeatId = eventToDelete.repeat.id;

    if (repeatId) {
      return await deleteRecurringEventOnServer(repeatId);
    } else {
      const results = await Promise.all(
        relatedEvents.map((event) => deleteEventOnServer(event.id))
      );
      return results.every((result) => result);
    }
  };

  const executeDeleteAndRefresh = async (
    deleteOperation: () => Promise<boolean>
  ): Promise<void> => {
    await deleteOperation();
    updateEvents([]);
  };

  /**
   * Handles deletion of recurring events with user choice for scope
   * @param eventToDelete - The event to be deleted
   * @param deleteSingleOnly - true for single event deletion, false for series deletion
   */
  const handleRecurringDelete = async (
    eventToDelete: Event,
    deleteSingleOnly: boolean
  ): Promise<void> => {
    const relatedEvents = findRelatedRecurringEvents(eventToDelete);

    if (relatedEvents.length === 0) {
      await executeDeleteAndRefresh(() => deleteEventOnServer(eventToDelete.id));
      return;
    }

    if (deleteSingleOnly) {
      await executeDeleteAndRefresh(() => deleteEventOnServer(eventToDelete.id));
    } else {
      await executeDeleteAndRefresh(() => deleteRecurringSeries(eventToDelete, relatedEvents));
    }
  };

  return {
    handleRecurringEdit,
    handleRecurringDelete,
    findRelatedRecurringEvents,
  };
};
