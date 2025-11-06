import { promises as fs } from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

async function clearTestingData() {
  const dbFilePath = path.resolve(process.cwd(), 'src/__mocks__/response/e2e.json');
  const initialData = { events: [] };
  await fs.writeFile(dbFilePath, JSON.stringify(initialData), 'utf-8');
}

/**
 * 알람 시스템 노출 조건 검증 E2E 테스트
 * - 알림 시간 조건 충족 시 알림 표시
 * - 알림 시간 조건 미충족 시 알림 미표시
 * - 알림 시간이 지나간 이벤트는 표시되지 않음
 */

test.describe('알람 시스템 노출 조건 검증', () => {
  // 고정된 테스트 시작 시간
  const TEST_BASE_TIME = new Date('2025-11-10T09:00:00');

  test.beforeEach(async ({ page }) => {
    await clearTestingData();

    // Playwright Clock API를 사용하여 시간을 고정
    await page.clock.install({ time: TEST_BASE_TIME });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await clearTestingData();
  });

  test('알림 시간 조건 충족 시 알림이 표시됩니다', async ({ page }) => {
    // 현재 시간: 2025-11-10 09:00:00
    // 알림 시간: 1분 전
    // 일정 시작 시간: 2025-11-10 09:01:00 (1분 후)

    // 1. 알림 설정이 1분 전인 일정 생성
    await page.fill('#title', '알림 테스트 일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '09:01');
    await page.fill('#end-time', '09:30');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();

    // 알림 설정: 1분 전
    await page.click('#notification');
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 현재 시간을 2025 11월 10일 9시로 설정
    await page.clock.setSystemTime(new Date('2025-11-10T09:00:00'));

    // 3. 알림이 표시되는지 확인
    await expect(page.getByText('1분 후 알림 테스트 일정 일정이 시작됩니다.')).toBeVisible({
      timeout: 3000,
    });
  });

  test('알림 시간 조건 미충족 시 알림이 표시되지 않습니다', async ({ page }) => {
    // 현재 시간: 2025-11-10 09:00:00
    // 알림 시간: 10분 전
    // 일정 시작 시간: 2025-11-10 09:20:00 (20분 후) - 아직 알림 시간이 아님

    // 1. 알림 설정이 10분 전인 일정 생성
    await page.fill('#title', '알림 미표시 테스트');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '09:20');
    await page.fill('#end-time', '09:30');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();

    // 알림 설정: 10분 전
    await page.click('#notification');
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 시간을 진행하지만 아직 알림 시간이 아님
    await page.clock.setSystemTime(new Date('2025-11-10T09:05:00'));
    await page.clock.runFor(2000);

    // 3. 알림이 표시되지 않는지 확인
    await expect(page.getByText('10분 후 알림 미표시 테스트 일정이 시작됩니다.')).not.toBeVisible();
  });

  test('알림 시간이 지나간 이벤트는 표시되지 않습니다', async ({ page }) => {
    // 현재 시간: 2025-11-10 09:00:00
    // 알림 시간: 10분 전
    // 일정 시작 시간: 2025-11-10 09:10:00

    // 1. 알림 설정이 10분 전인 일정 생성
    await page.fill('#title', '지나간 알림 테스트');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '09:10');
    await page.fill('#end-time', '09:30');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();

    await page.click('#notification');
    await page.getByRole('option', { name: '10분 전' }).click();

    await page.click('[data-testid="event-submit-button"]');
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // 2. 일정 시작 시간이 지나감 (09:11:00 이후)
    await page.clock.setSystemTime(new Date('2025-11-10T09:11:00'));
    await page.clock.runFor(1000);

    // 3. 알림이 표시되지 않는지 확인 (일정 시작 시간이 지났으므로)
    await expect(page.getByText('10분 후 지나간 알림 테스트 일정이 시작됩니다.')).not.toBeVisible();
  });
});
