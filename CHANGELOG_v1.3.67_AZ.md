# Qaraj v1.3.67 — Dəyişikliklər (4-5 May 2026)

## Düzəlişlər (Fixes)

| # | Dəyişiklik | Təsir |
|---|-----------|-------|
| 1 | Groupmotors loqosu (asterisk) başlıq hissəsində sol tərəfdə göstərilir | Köhnə açar (wrench) ikonu əvəz edildi |
| 2 | "Qaraj" yazısı ağ rəngdə + kölgə ilə (hər fonda görünür) | Əvvəl qaranlıq fonda itirdi |
| 3 | Zəng (bell) ikonu qırmızı fonda, ağ rəngdə | Əvvəl şəffaf fonda idi, görünmürdü |
| 4 | Yenidən quraşdırmadan sonra onboarding ekranı təkrar göstərilmir | SecureStore-dan token oxunur, avtomatik keçir |
| 5 | DWH sinxronizasiya `clientdata.vehicles` (31k qeyd) cədvəlindən işləyir | Əvvəl boş `stg_vehicles` cədvəlindən oxuyurdu |
| 6 | Push token qeydiyyatı düzgün endpoint-ə göndərilir | Bildirişlər indi düzgün çatır |

## Yeni funksiyalar (New Features)

| # | Funksiya | Təsvir |
|---|---------|--------|
| 1 | Nazik halqa göstəriciləri (thin ring gauges) | Km, sağlamlıq, növbəti servis — yeni dizayn |
| 2 | Sistem bildirişlərinin sinxronizasiyası | Telefon tray-dən gələn bildirişlər tətbiq daxilində görünür |
| 3 | "Avtomobilimi tap" düyməsi | Qaraj boş olanda müştəri sorğu göndərə bilər, back-office xəbərdar olur |

## Verilənlər bazası dəyişiklikləri (Database)

| # | Əməliyyat | Status |
|---|----------|--------|
| 1 | `vehicles` cədvəlində VIN üzrə unikal index yaradıldı | ✅ Tamamlandı |
| 2 | `crm_vehicle_id` unikal constraint → adi index-ə çevrildi | ✅ Tamamlandı |
| 3 | Bulk sinxronizasiya: `clientdata.vehicles` → `public.vehicles` (8 avtomobil) | ✅ Tamamlandı |
| 4 | `vehicle_requests` cədvəli (migration 008) | ⏳ pgAdmin-də icra edilməli |

## Naibə Sultanova test nəticəsi

Telefon `994512327962` → `customer_no: TAB01198` → Toyota Land Cruiser (VIN: JTEBU25J085141297, 86,004 km, 2008) — **uğurla sinxronizasiya olundu**. Naibə tətbiqi açanda avtomobili qarajda görəcək.

## Konfiqurasiya

- `preview-v2` profili silindi, bütün build-lər indi `preview` profili ilə v2 dizaynda gəlir
- Gələcəkdə `--profile preview` yazmaq kifayətdir

## Komanda üçün tapşırıqlar

1. Migration 008-i pgAdmin-də icra edin (`expo/backend/migrations/008_vehicle_requests.sql`)
2. Server deploy edin (artıq edilib ✅)
3. v67 APK-nı yükləyib test edin
