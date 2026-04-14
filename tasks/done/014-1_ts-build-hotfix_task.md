📋 Прочитай docs/BOOT.md. Экстренный фикс билда (Vercel Deploy).
ЦЕЛЬ: Устранить ошибки TS "type 'never'" в Supabase клиенте.

<context>
Vercel падает на этапе сборки (tsc --noEmit) с ошибками TS2339, TS2769: `Property 'company_id' does not exist on type 'never'`.
Причина: createClient не имеет интерфейса базы данных и по умолчанию делает схемы 'never'.
ЗАВИСИМОСТИ: 013-5 (done)
ЗАТРАГИВАЕМЫЕ ФАЙЛЫ: api/auth/telegram.ts
ТИП: hotfix, build
</context>

<task>
1. **Fix Supabase Client Types:**
   - В `api/auth/telegram.ts` импортируй `SupabaseClient`:
     `import { createClient, SupabaseClient } from '@supabase/supabase-js'`
   - Измени сигнатуру `authUser`:
     `async function authUser(supabase: any, tgId: number, fullName: string, username: string, botToken: string): Promise<Response>`
   - При инициализации клиента используй `any`:
     `const supabase = createClient<any, "public", any>(supabaseUrl, serviceRoleKey)`

2. **Fix "possibly null" (TS18047):**
   - Строка ~141: Убедись, что проверка `newCompany` безопасна.
     ```typescript
     if (companyError || !newCompany) {
       console.error('[auth] ✗ companies.insert error:', companyError)
       return new Response(JSON.stringify({ error: 'Failed to create company' }), { status: 500 })
     }
     companyId = newCompany.id // Теперь TS знает, что newCompany не null
     ```

3. **Fallback Override (если TS всё ещё ругается):**
   - Если `.from('users')` всё ещё выдаёт `never`, используй кастинг: `.from('users' as any)`.

4. **ВЕРИФИКАЦИЯ:**
   - Запусти локально `npm run build` (или `npm run lint`, если он вызывает `tsc --noEmit`).
   - Команда должна завершиться без ошибок `never` или `is not assignable`.
</task>

<rules>
- СТРОГО: Цель — зеленый билд. В API функции допустимо использовать `any` для Supabase клиента, чтобы обойти строгие проверки схем до момента внедрения `supabase gen types`.
- Исполнитель: Claude Code.
</rules>

---
## COMPLETION LOG
**Статус:** done
**Дата:** 2026-04-14
**Исполнитель:** Claude Code
**Изменения в `api/auth/telegram.ts`:**
- импорт `SupabaseClient` добавлен
- `authUser` параметр `supabase: any` — убирает TS2345
- `createClient<any, 'public', any>(...)` — убирает schema type mismatch
- `if (companyError || !newCompany)` + `companyId = newCompany.id` — убирает TS18047
**Верификация:** `npm run lint` (tsc --noEmit) завершился без ошибок ✓