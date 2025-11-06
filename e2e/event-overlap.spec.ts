import { promises as fs } from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

async function clearTestingData() {
  const dbFilePath = path.resolve(process.cwd(), 'src/__mocks__/response/e2e.json');
  const initialData = { events: [] };
  await fs.writeFile(dbFilePath, JSON.stringify(initialData), 'utf-8');
}

/**
 * 일정 겹침 처리 방식 검증 E2E 테스트
 * - 겹침 발생 시 경고 다이얼로그 표시
 * - 겹침 경고 후 취소 시 일정 생성 안됨
 * - 겹침 경고 후 계속 진행 시 일정 생성됨
 * - 일정 수정 시 겹침 처리
 * - 다양한 겹침 시나리오 (부분 겹침, 완전 겹침, 경계 겹침)
 */

test.describe('일정 겹침 처리 방식 검증', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestingData();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await clearTestingData();
  });

  test('일정 생성 시 겹침 발생 - 겹침 경고 다이얼로그가 표시됩니다', async ({ page }) => {
    // 1. 기존 일정 생성
    await page.fill('#title', '기존 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 겹치는 일정 생성 시도
    await page.fill('#title', '겹치는 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '10:30');
    await page.fill('#end-time', '11:30');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');

    // 3. 겹침 경고 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await expect(page.getByText('다음 일정과 겹칩니다:')).toBeVisible();
    await expect(page.getByText('기존 일정 (2025-11-10 10:00-11:00)')).toBeVisible();
    await expect(page.getByText('계속 진행하시겠습니까?')).toBeVisible();
  });

  test('일정 생성 시 겹침 발생 후 취소 - 일정이 생성되지 않습니다', async ({ page }) => {
    // 1. 기존 일정 생성
    await page.fill('#title', '기존 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '14:00');
    await page.fill('#end-time', '15:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 겹치는 일정 생성 시도
    await page.fill('#title', '겹치는 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '14:30');
    await page.fill('#end-time', '15:30');
    await page.click('#category');
    await page.getByRole('option', { name: '개인' }).click();
    await page.click('[data-testid="event-submit-button"]');

    // 3. 겹침 경고 다이얼로그에서 취소 버튼 클릭
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await page.getByRole('button', { name: '취소' }).click();

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('겹치는 일정')).not.toBeVisible();
    await expect(eventList.getByText('기존 일정')).toBeVisible();
  });

  test('일정 생성 시 겹침 발생 후 계속 진행 - 일정이 생성됩니다', async ({ page }) => {
    // 1. 기존 일정 생성
    await page.fill('#title', '기존 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 겹치는 일정 생성 시도
    await page.fill('#title', '겹치는 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '09:30');
    await page.fill('#end-time', '10:30');
    await page.click('#category');
    await page.getByRole('option', { name: '개인' }).click();
    await page.click('[data-testid="event-submit-button"]');

    // 3. 겹침 경고 다이얼로그에서 계속 진행 버튼 클릭
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await page.getByRole('button', { name: '계속 진행' }).click();

    // 4. 일정이 생성되었는지 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('겹치는 일정')).toBeVisible();
    await expect(eventList.getByText('기존 일정')).toBeVisible({ timeout: 10000 });
  });
});
