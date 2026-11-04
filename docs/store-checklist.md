# בדיקת מוכנות לחנויות

יש להשלים את הרשימה לפני כל שליחה ל־Chrome Web Store או ל־AMO.

## מוצר ותוכן

- [ ] שם, אייקון ותיאור מתארים במדויק את הפעולה של התוסף.
- [ ] התיאור הקצר והארוך תחת `store/` מעודכנים ומתורגמים לפי הצורך.
- [ ] צילומי המסך מציגים את גרסת התוסף הנוכחית, ללא פרטים אישיים.
- [ ] נוסח ההרשאות וההצדקות תואם ל־`extension.config.json` ול־manifest שנוצר.
- [ ] כל תכונה שמוזכרת בדף החנות אכן קיימת ופועלת.

## פרטיות ואבטחה

- [ ] קיימת מדיניות פרטיות נגישה אם התוסף אוסף, מעבד או משתף מידע אישי או מידע רגיש.
- [ ] מדיניות הפרטיות מסבירה איזה מידע נאסף, למה, היכן נשמר, עם מי הוא משותף וכיצד ניתן למחוק אותו.
- [ ] לא נאסף מידע שלא נחוץ לתכונות שהובטחו.
- [ ] אין telemetry, analytics או remote code שלא תועדו ואושרו.
- [ ] אין secrets, tokens, private keys או credentials בקבצים, ב־source ZIP או ב־artifacts.
- [ ] CSP נשארת קשיחה: ללא eval, קוד מרוחק או inline scripts.

## הרשאות

- [ ] לכל permission יש תכונה ברורה שמצריכה אותו.
- [ ] הרשאות אופציונליות מבוקשות בזמן השימוש ולא מראש כשאפשר.
- [ ] אין `<all_urls>`, `tabs`, `debugger` או wildcard רחב ללא צורך והצדקה.
- [ ] `store/permissions.md` מעודכן.
- [ ] ה־manifest של Chrome ושל Firefox נבדקו בנפרד.

## טכני

- [ ] הגרסה ב־package.json הוגדלה.
- [ ] נוסף סעיף מתאים ל־CHANGELOG.
- [ ] `pnpm lint`, `pnpm test`, `pnpm validate` עברו.
- [ ] `pnpm build <slug>` עבר לשני הדפדפנים.
- [ ] Firefox `web-ext lint` עבר ללא warnings (warnings treated as errors).
- [ ] נבדקו התקנה, פתיחת popup, options page, content script ו־background לפי התכונות שנבחרו.
- [ ] XPI חתום ו־ZIP-ים נפתחים ונראים תקינים.

## חנות Firefox (AMO)

- [ ] `store/amo-metadata.json` כולל summary, category ו־license תקינים.
- [ ] בהגשה ראשונה צורף source ZIP קריא והוראות BUILD.
- [ ] Firefox Gecko ID יציב בין גרסאות של אותו תוסף.

## חנות Chrome

- [ ] פריט התוסף קיים ב־Developer Dashboard ומזהה Extension ID נכון.
- [ ] Publisher ID ו־OAuth credentials מוגדרים ב־GitHub Secrets.
- [ ] הרשאות, Privacy practices ופרטי listing מולאו ב־Developer Dashboard.
- [ ] הוגשה גרסה עם מספר גרסה גבוה יותר מהגרסה הנוכחית בחנות.
- [ ] נבדקה תוצאת ההעלאה וה־review status לאחר ה־workflow.
