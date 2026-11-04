# הקמת סביבת פיתוח מאפס

## דרישות

- Node.js 26 LTS — השורש כולל `.nvmrc` עם `26` ו־`engines` שמגבילים את הגרסה ל־26.x.
- pnpm 12 — גרסת מנהל החבילות המוצהרת היא `12.16.1`.
- Git.
- חשבונות מפתח ב־AMO וב־Chrome Web Store נדרשים רק לחתימה/פרסום.

## התקנה

### Windows

1. התקן Node.js 26 LTS מאתר [Node.js Downloads](https://nodejs.org/en/download).
2. פתח PowerShell או Terminal בתיקיית המאגר.
3. התקן pnpm בגרסה המוגדרת:

```powershell
npm install --global pnpm@12.16.1
node --version
pnpm --version
```

### macOS / Linux

אם מותקן nvm:

```bash
nvm install
nvm use
npm install --global pnpm@12.16.1
```

אחרת התקן Node.js 26 LTS מאתר Node.js ואז התקן pnpm באותה פקודת npm.

### התקנת workspace

מתיקיית השורש:

```bash
pnpm install
```

ה־CI מייצר את `pnpm-lock.yaml` בהתקנה הראשונה ושומר אותו ב־commit אוטומטי לאחר שכל בדיקות האיכות עוברות. לאחר שהקובץ קיים, יש להפעיל התקנות עם `pnpm install --frozen-lockfile` כדי להבטיח התקנות שחוזרות על עצמן. עד אז ה־CI משתמש ב־`--no-frozen-lockfile`.

## אימות

```bash
pnpm lint
pnpm test
pnpm audit
pnpm validate
pnpm validate:workflows
pnpm build hello-factory
pnpm zip hello-factory
```

הפקודה `pnpm build hello-factory` בונה גם Chrome/Chromium וגם Firefox, בודקת את שני ה־manifests ומריצה Firefox `web-ext lint`.

## הערת audit זמנית

ה־workspace אוכף `minimatch >=11.0.1` כדי לתקן את GHSA-g3hv-75wg-m249. כרגע קיימת החרגה יחידה ומנומקת ל־GHSA-gcqx-w48m-w2h4: `deepmerge@4.3.1` מגיע כתלות build-only של `web-ext > addons-linter`, ולפי מאגר הייעוץ אין לו כרגע גרסה מתוקנת. ההחרגה נמצאת ב־`pnpm-workspace.yaml`, לא מעלימה התראות אחרות, ויש להסירה ברגע שהספק יפרסם תיקון. אין להוסיף החרגות audit נוספות ללא נימוק מתועד.

## IDE

מומלץ להשתמש בעורך עם תמיכה ב־TypeScript, ESLint ו־Prettier. אין צורך להגדיר manifest ידנית; WXT יוצר אותו מהגדרות התוסף.
