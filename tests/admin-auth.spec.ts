import { test, expect } from '@playwright/test';

// These tests require ADMIN_USER and ADMIN_PASSWORD to be set in the environment.
// By default they match the values in .env: admin / change_me_in_production

const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '123n';

test.describe('Admin auth flow', () => {
  test('redirects unauthenticated user from /bigbos to /bigbos/login', async ({ page }) => {
    await page.goto('/bigbos');
    await expect(page).toHaveURL(/\/bigbos\/login/);
  });

  test('login page renders form correctly', async ({ page }) => {
    await page.goto('/bigbos/login');
    await expect(page.getByLabel('Логин')).toBeVisible();
    await expect(page.getByLabel('Пароль')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible();
  });

  test('shows error message on wrong credentials', async ({ page }) => {
    await page.goto('/bigbos/login');
    await page.getByLabel('Логин').fill('wronguser');
    await page.getByLabel('Пароль').fill('wrongpass');
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page.getByText('Неверный логин или пароль')).toBeVisible();
  });

  test('redirects to /bigbos on successful login', async ({ page }) => {
    await page.goto('/bigbos/login');
    await page.getByLabel('Логин').fill(ADMIN_USER);
    await page.getByLabel('Пароль').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL(/\/bigbos$/);
    await expect(page.getByText('Панель управления клуба')).toBeVisible();
  });

  test('sign out button returns to login page', async ({ page }) => {
    await page.goto('/bigbos/login');
    await page.getByLabel('Логин').fill(ADMIN_USER);
    await page.getByLabel('Пароль').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Войти' }).click();
    await expect(page).toHaveURL(/\/bigbos$/);

    await page.getByRole('button', { name: 'Выйти' }).click();
    await expect(page).toHaveURL(/\/bigbos\/login/);
  });
});
