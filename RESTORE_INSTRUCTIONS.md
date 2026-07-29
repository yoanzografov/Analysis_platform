# 🛠️ ИНСТРУКЦИИ ЗА ПЪЛНО ВЪЗСТАНОВЯВАЩО ВРЪЩАНЕ (RESTORE INSTRUCTIONS)
> **Запечатана Стабилна Версия:** `v2.0-STABLE-GOLD`  
> **Дата на архивиране:** 29 Юли 2026  
> **Репозитория:** `yoanzografov/Analysis_platform`

---

## 📋 ВАРИАНТ 1: За изпращане към AI Агент (Copy & Paste в чата)

Ако в бъдеще възникне бъг и работите с AI Агент (Antigravity, ChatGPT, Claude или друг), просто копирайте и поставете целия следващ текст в чата:

```text
СПЕШНО ВЪЗСТАНОВЯВАНЕ: Моля, върни целия проект към запечатаната стабилна версия v2.0-STABLE-GOLD.
Изпълни следнитеTerminal команди:

git fetch origin --tags
git reset --hard v2.0-STABLE-GOLD
git push origin main --force

След това стартирай тестова компилация с npx tsc --noEmit && npx vite build за потвърждение.
```

---

## 💻 ВАРИАНТ 2: Команда за изпълнение в Терминала (За 1 секунда)

Ако искате сами да възстановите проекта през терминала, копирайте и изпълнете тази единична команда:

```bash
git fetch origin --tags && git reset --hard v2.0-STABLE-GOLD && git push origin main --force
```

---

## 📦 ВАРИАНТ 3: Възстановяване от Локалния Архивиран Файл (`.tar.gz`)

Ако нямате достъп до интернет или искате да презапишете всичко от физическия архив:

```bash
tar -xzf STABLE_SNAPSHOT_v2.0.tar.gz && git add . && git commit -m "feat: restore from physical STABLE_SNAPSHOT_v2.0" && git push origin main --force
```

---

### 🔍 Забележка:
Тази процедура връща 100% от кода, функциите, ценовите известия, мапинга на TradingView графиките и интерактивната таблица към идеалното работещо състояние.
