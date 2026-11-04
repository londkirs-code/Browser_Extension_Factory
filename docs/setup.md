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

**הערת bootstrap:** הקבצים נכתבו ונשמרו ב־GitHub ללא סביבת Node 26 מחוברת לרשת, ולכן עדיין אין במאגר `pnpm-lock.yaml` שנוצר מהרצה אמיתית. ההתקנה הראשונה תיצור אותו. יש להוסיף את הקובץ ל־Git ולבצע commit. עד שה־lockfile ייכנס למאגר, ה־CI משתמש ב־`--no-frozen-lockfile`; לאחר מכן אפשר להקשיח התקנות ל־`--frozen-lockfile`.

## אימות

```bash
pnpm lint
pnpm test
pnpm validate
pnpm validate:workflows
pnpm build hello-factory
pnpm zip hello-factory
```

הפקודה `pnpm build hello-factory` בונה גם Chrome/Chromium וגם Firefox, בודקת את שני ה־manifests ומריצה Firefox `web-ext lint`.

## IDE

מומלץ להשתמש בעורך עם תמיכה ב־TypeScript, ESLint ו־Prettier. אין צורך להגדיר manifest ידנית; WXT יוצר אותו מהגדרות התוסף.
