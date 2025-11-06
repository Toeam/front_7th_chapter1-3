import { promises as fs } from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

async function clearTestingData() {
  const dbFilePath = path.resolve(process.cwd(), 'src/__mocks__/response/e2e.json');
  const initialData = { events: [] };
  await fs.writeFile(dbFilePath, JSON.stringify(initialData), 'utf-8');
}

/**
 * 검색 및 필터링 전반에 대한 CRUD 검증 E2E 테스트
 * - Create: 검색어로 찾을 수 있는 일정 생성
 * - Read: 검색 및 필터링으로 일정 조회
 * - Update: 검색 결과 내 일정 수정
 * - Delete: 검색 결과 내 일정 삭제
 */

test.describe('검색 및 필터링 CRUD 검증', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestingData();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await clearTestingData();
  });

  test('Create - 제목으로 검색 가능한 일정 생성 후 검색으로 조회 가능합니다', async ({ page }) => {
    // 1. 제목에 검색어가 포함된 일정 생성
    await page.fill('#title', '회의 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#description', '설명');
    await page.fill('#location', '회의실 A');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 검색어로 일정 조회
    await page.fill('#search', '회의');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('회의 일정')).toBeVisible({ timeout: 5000 });
  });

  test('Create - 설명으로 검색 가능한 일정 생성 후 검색으로 조회 가능합니다', async ({ page }) => {
    // 1. 설명에 검색어가 포함된 일정 생성
    await page.fill('#title', '프로젝트 일정');
    await page.fill('#date', '2025-11-11');
    await page.fill('#start-time', '14:00');
    await page.fill('#end-time', '15:00');
    await page.fill('#description', '프로젝트 계획 회의');
    await page.fill('#location', '회의실 B');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 검색어로 일정 조회 (설명 필드 검색)
    await page.fill('#search', '계획');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('프로젝트 일정')).toBeVisible({ timeout: 5000 });
  });

  test('Create - 위치로 검색 가능한 일정 생성 후 검색으로 조회 가능합니다', async ({ page }) => {
    // 1. 위치에 검색어가 포함된 일정 생성
    await page.fill('#title', '팀 미팅');
    await page.fill('#date', '2025-11-12');
    await page.fill('#start-time', '16:00');
    await page.fill('#end-time', '17:00');
    await page.fill('#description', '주간 미팅');
    await page.fill('#location', '서울 사무실');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 검색어로 일정 조회 (위치 필드 검색)
    await page.fill('#search', '서울');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 미팅')).toBeVisible({ timeout: 5000 });
  });

  test('Read - 제목으로 검색 시 일정이 조회됩니다', async ({ page }) => {
    await page.fill('#title', '검색 대상 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    await page.fill('#title', '다른 일정');
    await page.fill('#date', '2025-11-11');
    await page.fill('#start-time', '14:00');
    await page.fill('#end-time', '15:00');
    await page.click('#category');
    await page.getByRole('option', { name: '개인' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 검색어로 일정 조회
    await page.fill('#search', '검색 대상');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('검색 대상 일정')).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('다른 일정')).not.toBeVisible();
  });

  test('Read - 설명으로 검색 시 일정이 조회됩니다', async ({ page }) => {
    // 1. 일정 생성
    await page.fill('#title', '회의');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#description', '중요한 논의 사항');
    await page.fill('#location', '회의실');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 설명 필드로 검색
    await page.fill('#search', '논의');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('중요한 논의 사항')).toBeVisible({ timeout: 5000 });
  });

  test('Read - 위치로 검색 시 일정이 조회됩니다', async ({ page }) => {
    // 1. 일정 생성
    await page.fill('#title', '미팅');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#description', '팀 미팅');
    await page.fill('#location', '부산 사무실');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 위치 필드로 검색
    await page.fill('#search', '부산');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('부산 사무실')).toBeVisible({ timeout: 5000 });
  });

  test('Read - 대소문자 상관없이 검색어가 필터링됩니다.', async ({ page }) => {
    // 1. 일정 생성
    await page.fill('#title', 'Test Meeting');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 대소문자 다른 검색어로 검색
    await page.fill('#search', 'test');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('Test Meeting')).toBeVisible({ timeout: 5000 });

    // 3. 대문자로 검색
    await page.fill('#search', 'MEETING');
    await expect(eventList.getByText('Test Meeting')).toBeVisible({ timeout: 5000 });
  });

  test('Read - 검색 결과가 없을 때 "검색 결과가 없습니다" 메시지가 표시됩니다', async ({
    page,
  }) => {
    // 1. 일정 생성
    await page.fill('#title', '일정 A');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 존재하지 않는 검색어로 검색
    await page.fill('#search', '존재하지않는검색어');
    await expect(page.getByText('검색 결과가 없습니다')).toBeVisible({ timeout: 5000 });
  });

  test('Update - 검색 결과 내 일정 수정 후 수정된 내용으로 검색 가능합니다', async ({ page }) => {
    // 1. 일정 생성
    await page.fill('#title', '수정 전 제목');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#description', '기존 설명');
    await page.fill('#location', '기존 위치');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 검색으로 일정 찾기
    await page.fill('#search', '수정 전');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('수정 전 제목')).toBeVisible({ timeout: 5000 });

    // 3. 일정 수정
    await eventList.getByLabel('Edit event').first().click();
    const title = page.getByLabel('제목');
    await title.clear();
    await title.fill('수정 후 제목');
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 10000 });

    // 4. 수정된 내용으로 검색 가능한지 확인
    await page.fill('#search', '수정 후');
    await expect(eventList.getByText('수정 후 제목')).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('수정 전 제목')).not.toBeVisible();
  });

  test('Update - 일정 설명 수정 후 설명으로 검색 가능합니다', async ({ page }) => {
    // 1. 일정 생성
    await page.fill('#title', '테스트 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#description', '기존 설명');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 일정 수정 (설명 변경)
    const eventList = page.getByTestId('event-list');
    await eventList.getByLabel('Edit event').first().click();
    const description = page.getByLabel('설명');
    await description.clear();
    await description.fill('수정된 설명 내용');
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 10000 });

    // 3. 수정된 설명으로 검색 가능한지 확인
    await page.fill('#search', '수정된 설명');
    await expect(eventList.getByText('테스트 일정')).toBeVisible({ timeout: 5000 });
  });

  test('Update - 일정 위치 수정 후 위치로 검색 가능합니다', async ({ page }) => {
    // 1. 일정 생성
    await page.fill('#title', '테스트 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.fill('#location', '서울');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 일정 수정 (위치 변경)
    const eventList = page.getByTestId('event-list');
    await eventList.getByLabel('Edit event').first().click();
    const location = page.getByLabel('위치');
    await location.clear();
    await location.fill('부산');
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible({ timeout: 10000 });

    // 3. 수정된 위치로 검색 가능한지 확인
    await page.fill('#search', '부산');
    await expect(eventList.getByText('테스트 일정')).toBeVisible({ timeout: 5000 });

    // 4. 기존 위치로는 검색되지 않는지 확인
    await page.fill('#search', '서울');
    await expect(eventList.getByText('테스트 일정')).not.toBeVisible();
  });

  test('Delete - 검색 결과 내 일정 삭제 후 검색 결과에서 제외됩니다', async ({ page }) => {
    // 1. 여러 일정 생성
    await page.fill('#title', '삭제할 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    await page.fill('#title', '유지할 일정');
    await page.fill('#date', '2025-11-11');
    await page.fill('#start-time', '14:00');
    await page.fill('#end-time', '15:00');
    await page.click('#category');
    await page.getByRole('option', { name: '개인' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 검색으로 일정 찾기
    await page.fill('#search', '일정');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('삭제할 일정')).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('유지할 일정')).toBeVisible({ timeout: 5000 });

    // 3. 검색 결과 내 일정 삭제
    // "삭제할 일정"의 삭제 버튼 클릭
    const deleteButtons = eventList.getByLabel('Delete event');
    await deleteButtons.first().click();
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible({ timeout: 10000 });

    // 4. 검색 결과에서 삭제된 일정이 제외되었는지 확인
    await page.fill('#search', '일정');
    await expect(eventList.getByText('삭제할 일정')).not.toBeVisible();
    await expect(eventList.getByText('유지할 일정')).toBeVisible({ timeout: 5000 });
  });
});
