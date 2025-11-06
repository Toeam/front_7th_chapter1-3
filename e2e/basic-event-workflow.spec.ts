import { promises as fs } from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

async function clearTestingData() {
  // process.cwd() => 현재 작업 디렉토리의 경로를 반환
  const dbFilePath = path.resolve(process.cwd(), 'src/__mocks__/response/e2e.json');
  const initialData = { events: [] };

  // 새롭게 알게 된 것 => fs.writeFile
  // fs => Node.js의 File System 모듈
  // write file (대상파일 , 내용, 옵션, 콜백함수)
  await fs.writeFile(dbFilePath, JSON.stringify(initialData), 'utf-8');
}

/**
 * 기본 일정 관리 워크플로우 전반을 검증하는 E2E 테스트
 * - Create: 일정 생성
 * - Read: 일정 조회 (캘린더 뷰, 리스트 뷰)
 * - Update: 일정 수정
 * - Delete: 일정 삭제
 */

test.describe('기본 일정 관리 워크플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 테스트 시작 전에 페이지로 이동
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await clearTestingData();
  });
  test.afterEach(async () => {
    await clearTestingData();
  });

  test('일정 생성 (Create) - 폼에 정보를 입력하고 일정 추가 버튼 클릭 시 일정이 추가됩니다.', async ({
    page,
  }) => {
    // 1. 일정 폼에 정보 입력
    await page.fill('#title', 'e2e 테스트 회의');
    await page.fill('#date', '2025-11-03');
    await page.fill('#start-time', '14:00');
    await page.fill('#end-time', '15:00');
    await page.fill('#description', '테스트 회의 설명');
    await page.fill('#location', '회의실 B');

    // 카테고리 선택
    await page.click('#category');
    await expect(page.getByRole('option', { name: '업무' })).toBeVisible();
    await page.getByRole('option', { name: '업무' }).click();

    // 알림 설정
    await page.click('#notification');
    const notifOption = page.getByRole('option', { name: '1시간 전' });
    await expect(notifOption).toBeVisible();
    await notifOption.click();

    // 2. 일정 추가 버튼 클릭
    await page.click('[data-testid="event-submit-button"]');

    const eventList = page.getByTestId('event-list');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
    await expect(eventList.getByText('e2e 테스트 회의')).toBeVisible();
    await expect(eventList.getByText('2025-11-03')).toBeVisible();
    await expect(eventList.getByText('테스트 회의 설명')).toBeVisible();

    // 5. 일정이 캘린더에도 표시되는지 확인
    await expect(page.getByText('e2e 테스트 회의').first()).toBeVisible();
  });

  test('일정 조회 (Read) - 월 뷰- 폼에 정보를 입력하고 일정 추가 버튼 클릭 시 일정이 월뷰 캘린더에 표시됩니다.', async ({
    page,
  }) => {
    // 테스트용 일정 생성
    await page.fill('#title', '조회테스트');
    await page.fill('#date', '2025-11-05');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');

    const monthView = page.getByTestId('month-view');
    await expect(monthView).toBeVisible();
    await expect(monthView.getByText('조회테스트')).toBeVisible({ timeout: 10000 });
  });

  test('일정 조회 (Read) - 주 뷰 - 폼에 정보를 입력하고 일정 추가 버튼 클릭 시 일정이 주뷰 캘린더에 표시됩니다.', async ({
    page,
  }) => {
    // 테스트용 일정 생성
    await page.fill('#title', '주뷰테스트');
    await page.fill('#date', '2025-11-06');
    await page.fill('#start-time', '14:00');
    await page.fill('#end-time', '15:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');

    // 주 뷰로 전환
    await page.click('[aria-label="뷰 타입 선택"]');
    await page.click('[aria-label="week-option"]');

    const weekView = page.getByTestId('week-view');
    await expect(weekView).toBeVisible();
    await expect(weekView.getByText('주뷰테스트')).toBeVisible();
  });

  test('일정 조회 (Read) - 리스트 뷰 - 추가된 일정들이 리스트 뷰에 표시됩니다.', async ({
    page,
  }) => {
    // 일정 리스트가 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toBeVisible({ timeout: 10000 });
  });

  test('일정 수정 (Update) - 등록된 일정의 편집버튼 클릭 후 일정 수정 폼에 정보를 입력하고 일정 수정 버튼 클릭 시 일정이 수정됩니다.', async ({
    page,
  }) => {
    // 먼저 일정을 생성
    await page.fill('#title', '수정 전 제목');
    await page.fill('#date', '2025-11-03');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#description', '수정 전 설명');
    await page.fill('#location', '수정 전 위치');

    await page.click('#category');
    await page.click('[aria-label="개인-option"]');

    await page.click('[data-testid="event-submit-button"]');

    // 일정 리스트에서 편집 버튼 클릭
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toBeVisible();

    await eventList.getByLabel('Edit event').first().click();
    // 제목 수정
    const title = page.getByLabel('제목');
    await title.clear();
    await title.fill('수정 후 제목');

    // 수정 버튼 클릭
    await page.getByTestId('event-submit-button').click();

    // 성공 메시지 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 10000 });
  });

  test('일정 삭제 (Delete) - 등록된 일정의 삭제 버튼 클릭 시 일정이 삭제됩니다.', async ({
    page,
  }) => {
    // 먼저 일정을 생성
    await page.fill('#title', '삭제할 일정');
    await page.fill('#date', '2025-11-02');
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');
    await page.fill('#description', '이 일정은 삭제됩니다');

    await page.click('#category');
    await page.getByRole('option', { name: '기타' }).click();

    await page.getByTestId('event-submit-button').click();

    // 일정 리스트에서 삭제 버튼 클릭
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toBeVisible();
    await eventList.getByLabel('Delete event').first().click();

    // 성공 메시지 확인
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible({ timeout: 10000 });
  });
});
