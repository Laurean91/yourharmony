import { test, expect } from '@playwright/test';

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '123n';

async function login(page: any) {
  await page.goto('/bigbos/login');
  await page.getByLabel('Логин').fill(ADMIN_USER);
  await page.getByLabel('Пароль').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page).toHaveURL(/\/bigbos$/, { timeout: 10000 });
}

test.describe('Bookings management', () => {
  test('booking form on landing page submits successfully', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Записаться на пробное занятие' }).first().click();

    await page.getByPlaceholder('Ваше Имя').fill('Тест Тестович');
    await page.getByPlaceholder('Возраст').fill('7');
    await page.getByPlaceholder('Телефон').fill('+79001234567');
    await page.getByRole('button', { name: 'Записаться', exact: true }).click();

    await expect(page.getByText('Заявка успешно отправлена!')).toBeVisible({ timeout: 10000 });
  });

  test('admin dashboard shows bookings table', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Новые заявки')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Имя' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Телефон' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Статус' })).toBeVisible();
  });

  test('can delete a booking', async ({ page }) => {
    // Create a booking via the landing page
    await page.goto('/');
    await page.getByRole('button', { name: 'Записаться на пробное занятие' }).first().click();

    const uniqueName = `Удаляемый ${Date.now()}`;
    await page.getByPlaceholder('Ваше Имя').fill(uniqueName);
    await page.getByPlaceholder('Возраст').fill('5');
    await page.getByPlaceholder('Телефон').fill('+79009999999');
    await page.getByRole('button', { name: 'Записаться', exact: true }).click();
    await expect(page.getByText('Заявка успешно отправлена!')).toBeVisible({ timeout: 10000 });

    // Go to admin and find the booking
    await login(page);
    const row = page.getByRole('row').filter({ hasText: uniqueName });
    await expect(row).toBeVisible();

    // Click delete and confirm dialog
    page.once('dialog', dialog => dialog.accept());
    await row.getByTitle('Удалить заявку').click();

    // Row should disappear
    await expect(row).not.toBeVisible({ timeout: 5000 });
  });

  test('delete button triggers confirmation dialog', async ({ page }) => {
    await login(page);

    const deleteButtons = page.getByTitle('Удалить заявку');
    const count = await deleteButtons.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Dismiss the dialog (cancel) — row count must remain
    let dialogShown = false;
    page.once('dialog', dialog => {
      dialogShown = true;
      dialog.dismiss();
    });

    await deleteButtons.first().click();
    expect(dialogShown).toBe(true);
    await expect(page.getByTitle('Удалить заявку')).toHaveCount(count);
  });

  test('can toggle booking status', async ({ page }) => {
    // Create a dedicated booking for this test
    await page.goto('/');
    await page.getByRole('button', { name: 'Записаться на пробное занятие' }).first().click();
    const toggleName = `СтатусТест ${Date.now()}`;
    await page.getByPlaceholder('Ваше Имя').fill(toggleName);
    await page.getByPlaceholder('Возраст').fill('8');
    await page.getByPlaceholder('Телефон').fill('+79001112233');
    await page.getByRole('button', { name: 'Записаться', exact: true }).click();
    await expect(page.getByText('Заявка успешно отправлена!')).toBeVisible({ timeout: 10000 });

    await login(page);

    // Find our booking row (it's fresh, so status is "Новая")
    const row = page.getByRole('row').filter({ hasText: toggleName });
    await expect(row).toBeVisible();

    const statusButton = row.getByRole('button').filter({ hasText: /Новая|Обработана/ });
    await expect(statusButton).toHaveText('Новая');

    // Toggle to "Обработана"
    await statusButton.click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('row').filter({ hasText: toggleName })
        .getByRole('button').filter({ hasText: 'Обработана' })
    ).toBeVisible({ timeout: 10000 });

    // Toggle back to "Новая"
    await page.getByRole('row').filter({ hasText: toggleName })
      .getByRole('button').filter({ hasText: 'Обработана' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('row').filter({ hasText: toggleName })
        .getByRole('button').filter({ hasText: 'Новая' })
    ).toBeVisible({ timeout: 10000 });

    // Cleanup: delete the test booking
    page.once('dialog', d => d.accept());
    await page.getByRole('row').filter({ hasText: toggleName }).getByTitle('Удалить заявку').click();
    await expect(page.getByRole('row').filter({ hasText: toggleName })).not.toBeVisible({ timeout: 5000 });
  });
});
