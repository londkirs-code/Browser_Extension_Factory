# חתימה ופרסום

חתימה ופרסום לחנויות הם תהליכים נפרדים מבנייה. אין פרסום אוטומטי בעקבות push או tag. ה־workflow `publish.yml` מופעל ידנית ומחייב סימון אישור; אפשר להוסיף ב־GitHub Environment גם אישור של reviewer.

## 1. Firefox — AMO API

### יצירת מפתחות

1. התחבר לחשבון Firefox Add-ons Developer Hub: [AMO Developer Hub](https://addons.mozilla.org/developers/).
2. פתח את [API Keys](https://addons.mozilla.org/developers/addon/api/key/).
3. צור API credentials ושמור את שני הערכים במקום מאובטח.
4. הוסף ב־GitHub: Settings → Secrets and variables → Actions → New repository secret:
   - `AMO_JWT_ISSUER` — API key / JWT issuer.
   - `AMO_JWT_SECRET` — API secret / JWT secret.

ה־CLI ממפה אותם למשתני הסביבה ש־`web-ext` מצפה להם: `WEB_EXT_API_KEY` ו־`WEB_EXT_API_SECRET`. אין לשמור אותם בקובץ או ב־repository.

### ערוצי חתימה

```bash
pnpm sign:firefox hello-factory --channel unlisted
pnpm sign:firefox hello-factory --channel listed
```

- `unlisted`: מבקש חתימה ומקבל XPI להפצה עצמית.
- `listed`: מגיש ל־AMO לפרסום ציבורי. למסלול הזה מצורפים אוטומטית source ZIP קריא ו־`store/amo-metadata.json`.

להגשה הראשונה ל־AMO נדרשים metadata כמו summary, category ו־license. קובץ metadata לדוגמה נוצר בתבנית וב־`hello-factory`; יש לבדוק ולעדכן אותו לפני פרסום אמיתי. פרטי החנות והתיאור הארוך נשמרים גם תחת `store/`.

`pnpm publish:firefox <slug>` הוא קיצור דרך לערוץ `listed`.

## 2. Chrome Web Store — API v2

### הכנה חד־פעמית

1. הירשם ב־[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) והשלם את תהליך אימות חשבון המפתח.
2. צור Google Cloud project והפעל בו את Chrome Web Store API. פעל לפי [המדריך הרשמי לשימוש ב־API](https://developer.chrome.com/docs/webstore/using-api).
3. ב־Google Cloud Console פתח APIs & Services → Credentials → Create Credentials → OAuth client ID.
4. בחר Web application והוסף Authorized redirect URI:
   `https://developers.google.com/oauthplayground`.
5. שמור את OAuth Client ID ו־Client Secret.
6. פתח את [OAuth 2.0 Playground](https://developers.google.com/oauthplayground), פתח Settings וסמן Use your own OAuth credentials. הזן את ה־client ID וה־secret.
7. בשדה scopes הזן:
   `https://www.googleapis.com/auth/chromewebstore`.
8. לחץ Authorize APIs, התחבר לחשבון Google שמחזיק את פריטי התוספים בחנות, ואז Exchange authorization code for tokens. שמור את ה־refresh token.
9. ב־Developer Dashboard פתח Publisher → Settings והעתק את **Publisher ID**. API v2 משתמש בו כחלק מנתיב ה־API.

### Secrets ב־GitHub

הוסף ב־Settings → Secrets and variables → Actions:

| Secret | תוכן |
|---|---|
| `CHROME_CLIENT_ID` | OAuth Client ID |
| `CHROME_CLIENT_SECRET` | OAuth Client Secret |
| `CHROME_REFRESH_TOKEN` | OAuth refresh token |
| `CHROME_PUBLISHER_ID` | Publisher ID מתוך Developer Dashboard |
| `CHROME_EXTENSION_ID` | מזהה פריט החנות, אם רוצים ערך ברירת מחדל יחיד לכל המאגר |

**שימו לב:** `CHROME_PUBLISHER_ID` הוא secret נוסף שנדרש לנתיבי Chrome Web Store API v2; הוא לא מופיע ברשימת ארבעת הערכים המקורית אך בלעדיו לא ניתן להרכיב את כתובת ה־API. ב־workflow אפשר להזין Extension ID ידנית בזמן ההפעלה. בהרצה מקומית אפשר להגדיר גם `CHROME_EXTENSION_ID_<SLUG>`, למשל `CHROME_EXTENSION_ID_HELLO_FACTORY`, כמשתנה סביבה.

ה־API v2 מעלה ZIP לפריט קיים ומבקש פרסום/בדיקה. את הפריט הראשון יש ליצור ולהגדיר ב־Developer Dashboard לפני שימוש במסלול ההעלאה האוטומטי. אין להשתמש בדוגמאות ישנות של API v1.

### הרצה ידנית

1. פתח Actions → Publish to Browser Stores → Run workflow.
2. הזן את slug של התוסף.
3. בחר Chrome, Firefox או both.
4. עבור Firefox בחר `unlisted` או `listed`.
5. עבור Chrome הזן את Extension ID של הפריט הקיים.
6. סמן `I approve this manual store submission` והפעל.
7. אם הוגדר Environment בשם `store-publishing` עם Required reviewers, יש להשלים גם את אישור ה־reviewer.

פרסום מקומי ל־Chrome אפשר לבצע באמצעות `pnpm publish:chrome <slug>` אחרי שהוגדרו אותם משתני סביבה.

## 3. הגדרת GitHub Environment

1. פתח את המאגר ב־GitHub.
2. Settings → Environments → New environment.
3. צור סביבה בשם המדויק `store-publishing`.
4. מומלץ להגדיר Required reviewers כדי שאדם יאשר את ההגשה לפני שה־workflow משתמש במפתחות.
5. אפשר להוסיף environment secrets במקום repository secrets אם רוצים להגביל את הסודות לפרסום בלבד.

ה־workflow לא רץ על push או על release tag; הוא מופעל רק דרך `workflow_dispatch` ובתנאי שאישור המשתמש סומן.

## 4. Releases ב־GitHub

תג בפורמט `<slug>-v<semver>`, לדוגמה `hello-factory-v1.2.0`, מפעיל את `release.yml`. הוא בונה את שני הדפדפנים, יוצר ZIP לכל אחד, יוצר source ZIP, חותם Firefox בערוץ `unlisted`, ומצרף את כל הקבצים ל־GitHub Release עם הערות מתוך CHANGELOG.

ה־release workflow אינו מפרסם לחנויות. פרסום Chrome או AMO נעשה רק ב־workflow הידני.

## 5. למה אין CRX מקומי כברירת מחדל?

ל־Chrome Web Store יש מסלול העלאה ופרסום שבו Google מטפלת בהפצה/חתימה של הפריט. CRX מקומי אינו תחליף לחנות ואינו מסלול ההתקנה הרגיל של תוסף ציבורי. הפצה עצמאית של CRX כפופה להגבלות התקנה של Chrome ולמדיניות הארגונית; אם יידרש תרחיש Enterprise ספציפי, יש לתכנן אותו בנפרד ולא להוסיף חתימה מקומית בלי דרישה מפורשת.
