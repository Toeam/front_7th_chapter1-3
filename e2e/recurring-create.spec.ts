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

test.describe('반복 일정 검증(Create - Recurring)', () => {
  test.beforeEach(async ({ page }) => {
    await clearTestingData();
    // 테스트 시작 전에 페이지로 이동
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    await clearTestingData();
  });

  test('반복일정 Create - 폼에 정보를 입력하고 매주 반복 일정 생성 간격은 1주일이고 종료일은 2025-11-29', async ({
    page,
  }) => {
    // 1) 기본 폼 입력
    await page.fill('#title', '반복 e2e 테스트 일정');
    await page.fill('#date', '2025-11-04');
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');
    await page.fill('#description', '반복 e2e 테스트 일정 설명');
    await page.fill('#location', '반복 e2e 테스트 일정 위치');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('#notification');
    await page.getByRole('option', { name: '1시간 전' }).click();

    // 2) 반복일정 체크
    await page.getByLabel('반복 일정').click();

    // 3) 반복 유형 선택?
    await page.getByLabel('반복 유형').click();
    await page.getByText('매주').click();

    // 4) 반복 간격/종료일 입력
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2025-11-29');

    // 5) 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 성공 메시지 확인 (API 응답 대기)
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });

    // 7) 월 뷰에서 반복일정 갯수 체크 => 여기서 Read도 동일하게 체크된다고 봅니다.
    const monthView = page.getByTestId('month-view');
    await expect(monthView).toBeVisible();
    const repeatText = monthView.getByText('반복 e2e 테스트 일정');
    await expect(repeatText.first()).toBeVisible({ timeout: 10000 });
    const repeatCount = await repeatText.count();
    expect(repeatCount).toBe(4); // 반복 일정 갯수확인
  });

  test('반복일정 Update - 등록한 반복일정이 단일 수정됩니다.', async ({ page }) => {
    // 1) 기본 폼 입력
    await page.fill('#title', '반복 e2e 테스트 단일 수정');
    await page.fill('#date', '2025-11-06');
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');
    await page.fill('#description', '반복 e2e 테스트 단일 수정');
    await page.fill('#location', '반복 e2e 테스트 단일 수정');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('#notification');
    await page.getByRole('option', { name: '1시간 전' }).click();

    // 2) 반복일정 체크
    await page.getByLabel('반복 일정').click();

    // 3) 반복 유형 선택?
    await page.getByLabel('반복 유형').click();
    await page.getByText('매주').click();

    // 4) 반복 간격/종료일 입력
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2025-11-13');

    // 5) 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 성공 메시지 확인 (API 응답 대기)
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });

    // 6) 단일 수정
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toBeVisible();
    await eventList.getByRole('button', { name: 'Edit event' }).first().click();
    await page.getByRole('button', { name: '예' }).click();
    await page.getByLabel('제목').fill('반복 e2e 테스트 단일 수정 후');
    await page.getByTestId('event-submit-button').click();

    await expect(eventList.getByText('반복 e2e 테스트 단일 수정 후')).toBeVisible({
      timeout: 10000,
    });
  });

  test('반복일정 Update - 등록한 반복일정이 전체 수정됩니다.', async ({ page }) => {
    // 1) 기본 폼 입력
    await page.fill('#title', '반복전체수정');
    await page.fill('#date', '2025-11-07');
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');
    await page.fill('#description', '111');
    await page.fill('#location', '111');
    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('#notification');
    await page.getByRole('option', { name: '1시간 전' }).click();

    // 2) 반복일정 체크
    await page.getByLabel('반복 일정').click();

    // 3) 반복 유형 선택?
    await page.getByLabel('반복 유형').click();
    await page.getByText('매주').click();

    // 4) 반복 간격/종료일 입력
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2025-11-13');

    // 5) 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 성공 메시지 확인 (API 응답 대기)
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });

    // 6) 전체수정
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toBeVisible();

    // 원래 제목이 표시되는지 확인
    await expect(eventList.getByText('반복전체수정').first()).toBeVisible();

    // 편집 버튼 클릭
    await eventList.getByRole('button', { name: 'Edit event' }).first().click();

    // 반복 일정 수정 다이얼로그 확인 및 전체 수정 선택
    await expect(page.getByText('반복 일정 수정')).toBeVisible();
    await page.getByRole('button', { name: '아니오' }).click();

    // 제목 수정
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정된 제목');
    await page.getByTestId('event-submit-button').click();

    await expect(eventList.getByText('반복전체수정')).not.toBeVisible({
      timeout: 10000,
    });

    // 수정된 제목이 모든 반복 일정 인스턴스에 표시되는지 확인
    const updatedTitle = eventList.getByText('수정된 제목');
    await expect(updatedTitle.first()).toBeVisible({ timeout: 10000 });

    // 반복 일정이 여러 개 생성되었으므로 모든 인스턴스 확인
    const updatedCount = await updatedTitle.count();
    expect(updatedCount).toBeGreaterThan(0);
  });

  test('반복일정 Delete - 등록한 반복일정이 단일 삭제됩니다.', async ({ page }) => {
    // 1) 기본 폼 입력
    await page.fill('#title', '반복 e2e 삭제일정');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');
    await page.fill('#description', '단일 삭제');
    await page.fill('#location', '단일 삭제');

    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('#notification');
    await page.getByRole('option', { name: '1시간 전' }).click();

    // 2) 반복일정 체크
    await page.getByLabel('반복 일정').click();

    // 3) 반복 유형 선택?
    await page.getByLabel('반복 유형').click();
    await page.getByText('매주').click();

    // 4) 반복 간격/종료일 입력
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2025-11-25');

    // 5) 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 성공 메시지 확인 (API 응답 대기)
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });

    // 6) 단일 삭제
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toBeVisible();
    await eventList.getByRole('button', { name: 'Delete event' }).first().click();
    await page.getByRole('button', { name: '예' }).click();

    // 삭제 완료 대기
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('반복 e2e 삭제일정')).toHaveCount(2, { timeout: 10000 });
  });

  test('반복일정 Delete - 등록한 반복일정이 전체 삭제됩니다.', async ({ page }) => {
    // 1) 기본 폼 입력
    await page.fill('#title', '반복 e2e 전체삭제');
    await page.fill('#date', '2025-11-10');
    await page.fill('#start-time', '09:00');
    await page.fill('#end-time', '10:00');
    await page.fill('#description', '삭제');
    await page.fill('#location', '삭제');

    await page.click('#category');
    await page.getByRole('option', { name: '업무' }).click();
    await page.click('#notification');
    await page.getByRole('option', { name: '1시간 전' }).click();

    // 2) 반복일정 체크
    await page.getByLabel('반복 일정').click();

    // 3) 반복 유형 선택?
    await page.getByLabel('반복 유형').click();
    await page.getByText('매주').click();

    // 4) 반복 간격/종료일 입력
    await page.getByLabel('반복 간격').fill('1');
    await page.getByLabel('반복 종료일').fill('2025-11-25');

    // 5) 일정 추가
    await page.getByTestId('event-submit-button').click();

    // 성공 메시지 확인 (API 응답 대기)
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible({ timeout: 10000 });

    // 6) 전체 삭제
    const eventList = page.getByTestId('event-list');
    await expect(eventList).toBeVisible();
    await eventList.getByRole('button', { name: 'Delete event' }).first().click();
    await page.getByRole('button', { name: '아니오' }).click();

    // 삭제 완료 대기
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible({ timeout: 10000 });
    await expect(eventList.getByText('반복 e2e 전체삭제')).toHaveCount(0, { timeout: 10000 });
  });
});
