import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "ar";

const STORAGE_KEY = "students-forum-lang";

type Dict = Record<string, string>;

const en: Dict = {
  // App identity
  "app.name.en": "Students of Islamic Law",
  "app.tagline": "A quiet majlis for seekers of knowledge",
  "app.footer": "Students of Islamic Law Forum · A quiet majlis for seekers of knowledge",

  // Common
  "common.signIn": "Sign in",
  "common.signOut": "Sign out",
  "common.signingIn": "Signing in…",
  "common.createAccount": "Create account",
  "common.creatingAccount": "Creating account…",
  "common.join": "Join",
  "common.welcome": "Welcome",
  "common.loading": "Loading…",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.submit": "Submit",
  "common.post": "Post",
  "common.posting": "Posting…",
  "common.send": "Send",
  "common.details": "Details",
  "common.download": "Download",
  "common.all": "All",
  "common.brothers": "Brothers",
  "common.sisters": "Sisters",
  "common.brother": "Brother",
  "common.sister": "Sister",
  "common.questions": "questions",
  "common.pages": "pages",
  "common.pp": "pp.",
  "common.min": "min",
  "common.explanation": "Explanation",
  "common.tba": "TBA",
  "common.languageLabel": "العربية",
  "common.languageToggleAria": "Switch to Arabic",

  // Time
  "time.secondsAgo": "{n}s ago",
  "time.minutesAgo": "{n}m ago",
  "time.hoursAgo": "{n}h ago",
  "time.daysAgo": "{n}d ago",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.feed": "Feed",
  "nav.halaqah": "Halaqah",
  "nav.sessions": "Sessions",
  "nav.library": "Library",
  "nav.tests": "Aqeedah Tests",
  "nav.members": "Members",

  // Landing
  "landing.heroTitleLine1": "A quiet majlis for seekers of knowledge,",
  "landing.heroTitleLine2": "grounded in the Salafi methodology.",
  "landing.heroBody":
    "A gathering place for students of Islamic law from around the world — to study authentic books, attend scholarly sittings, and benefit one another upon what the Prophet ﷺ and his Companions were upon.",
  "landing.enterMajlis": "Enter the majlis",
  "landing.iHaveAccount": "I have an account",
  "landing.featuresHeading": "What you will find here",
  "landing.feature.libraryTitle": "A library of beneficial books",
  "landing.feature.libraryBody":
    "Classical works of Aqeedah, Hadith, Tafsir, and Fiqh — available to read and download.",
  "landing.feature.sittingsTitle": "Live & recorded sittings",
  "landing.feature.sittingsBody":
    "Attend scholarly halaqahs as they happen, or revisit recorded explanations on your time.",
  "landing.feature.halaqahTitle": "Brothers' & sisters' halaqahs",
  "landing.feature.halaqahBody":
    "Quiet, focused chat circles for sincere companionship in seeking knowledge.",
  "landing.feature.testsTitle": "Aqeedah tests on the Salafi creed",
  "landing.feature.testsBody":
    "Test your understanding with carefully written multiple-choice questions and explanations.",
  "landing.quote":
    "“Whoever takes a path in pursuit of knowledge, Allah will make easy for him a path to Paradise.”",
  "landing.quoteSource": "— Sahih Muslim",
  "landing.beginJourney": "Begin the journey",

  // Login
  "login.welcomeBack": "Welcome back to the majlis",
  "login.username": "Username",
  "login.usernamePlaceholder": "your username",
  "login.password": "Password",
  "login.failed": "Sign in failed",
  "login.newHere": "New here?",
  "login.createAccountLink": "Create an account",
  "login.forgotPassword": "Forgot your password?",

  // Forgot / reset password
  "forgot.title": "Reset your password",
  "forgot.intro": "Enter the email linked to your account and we'll send a 6-digit code.",
  "forgot.email": "Email",
  "forgot.send": "Send code",
  "forgot.sending": "Sending…",
  "forgot.sentNotice": "If that email is registered, a 6-digit code has been sent. Enter it below with your new password.",
  "forgot.notConfiguredNotice": "Email delivery is not configured on this server. The code was logged to the server console — ask the administrator for it.",
  "forgot.code": "6-digit code",
  "forgot.newPassword": "New password",
  "forgot.reset": "Set new password",
  "forgot.resetting": "Updating…",
  "forgot.success": "Your password has been updated. You can now sign in.",
  "forgot.failed": "Could not reset password. Check the code and try again.",
  "forgot.backToLogin": "Back to sign in",

  // Profile editing
  "profile.editButton": "Edit profile",
  "profile.editTitle": "Edit your profile",
  "profile.fieldDisplayName": "Display name",
  "profile.fieldEmail": "Email",
  "profile.fieldCountry": "Country",
  "profile.fieldBio": "Short bio",
  "profile.fieldAvatar": "Avatar URL",
  "profile.save": "Save changes",
  "profile.saving": "Saving…",
  "profile.saved": "Profile updated.",
  "profile.saveFailed": "Could not save profile.",

  // Register
  "register.title": "Create your account",
  "register.username": "Username",
  "register.displayName": "Display name",
  "register.email": "Email",
  "register.emailPlaceholder": "you@example.com",
  "register.emailHint": "Used for sign-in recovery only.",
  "register.password": "Password",
  "register.passwordHint": "At least 6 characters.",
  "register.iAmA": "I am a",
  "register.select": "Select",
  "register.selectGender": "Please select your gender (used to assign halaqah groups).",
  "register.genderHint":
    "Used to place you in the brothers' or sisters' halaqah.",
  "register.country": "Country (optional)",
  "register.countryPlaceholder": "e.g. Egypt",
  "register.bio": "A short note (optional)",
  "register.bioPlaceholder": "Tell the brothers and sisters a little about yourself.",
  "register.failed": "Registration failed",
  "register.alreadyMember": "Already a member?",

  // Home / dashboard
  "home.greeting": "As-salamu 'alaykum, {name}",
  "home.subtitle":
    "Your majlis at a glance — recent benefits, upcoming sittings, and the state of the gathering.",
  "home.stat.members": "Members",
  "home.stat.posts": "Posts",
  "home.stat.books": "Books",
  "home.stat.sittings": "Sittings",
  "home.recentBenefits": "Recent benefits from the brothers and sisters",
  "home.viewFeed": "View feed",
  "home.upcomingSittings": "Upcoming live sittings",
  "home.noPostsYet": "No posts yet. Be the first to share a benefit.",
  "home.noLiveScheduled": "No live sittings scheduled.",

  // Feed
  "feed.title": "The Feed",
  "feed.subtitle":
    "Beneficial posts from members of the majlis. Stories above are visible to all for 24 hours.",
  "feed.composerPlaceholder":
    "Share a beneficial reminder, an ayah, a hadith, or a question for the brothers and sisters…",
  "feed.empty": "No posts yet — be the first to share a benefit.",

  // Stories
  "stories.your": "Your story",
  "stories.loading": "Loading stories…",
  "stories.share": "Share a story",
  "stories.dialogHelp": "Stories are visible to all members for 24 hours.",
  "stories.placeholder": "A beneficial reminder, an ayah, a hadith…",
  "stories.postStory": "Post story",
  "stories.singular": "story",
  "stories.plural": "stories",

  // Halaqah list
  "halaqah.brothersTitle": "Brothers' Halaqahs",
  "halaqah.sistersTitle": "Sisters' Halaqahs",
  "halaqah.subtitle":
    "Quiet study circles — choose a halaqah to enter the discussion.",
  "halaqah.contributing": "{n} contributing",
  "halaqah.lastMessage": "Last message {time}",
  "halaqah.empty": "No halaqahs available yet.",

  // Halaqah room
  "halaqah.allHalaqahs": "All halaqahs",
  "halaqah.fallbackName": "Halaqah",
  "halaqah.messagePlaceholder": "Write a message…",
  "halaqah.noMessages": "No messages yet. Be the first to share a benefit.",

  // Sessions
  "sessions.title": "Scholarly Sittings",
  "sessions.subtitle":
    "Live halaqahs and recorded explanations from scholars and students of knowledge.",
  "sessions.tabLive": "Live & Upcoming",
  "sessions.tabRecorded": "Recorded",
  "sessions.kind.live": "live",
  "sessions.kind.recorded": "recorded",
  "sessions.empty": "No sittings here yet.",
  "sessions.allSittings": "All sittings",
  "sessions.liveLink": "Live sitting link",
  "sessions.liveHelp":
    "Join when the sitting begins. The link below opens in a new tab.",
  "sessions.joinSitting": "Join the sitting",

  // Library
  "library.title": "The Library",
  "library.subtitle":
    "Classical works in Aqeedah, Hadith, Tafsir, and Fiqh — for reading and download.",
  "library.empty": "No books in this category yet.",
  "library.backToLibrary": "Back to library",

  // Tests
  "tests.title": "Aqeedah Tests",
  "tests.subtitle":
    "Test your understanding of the creed of Ahl as-Sunnah upon the methodology of the Salaf.",
  "tests.leaderboard": "Leaderboard",
  "tests.leaderboardEmpty": "No attempts yet — be the first.",
  "tests.bestLine": "Best: {pct}% · {attempts} attempts",
  "tests.allTests": "All tests",
  "tests.answeredOf": "Answered {answered} of {total}",
  "tests.grading": "Grading…",
  "tests.submit": "Submit answers",
  "tests.question": "Question {n}",
  "tests.yourResult": "Your result",
  "tests.barakAllah": "بارك الله فيك",
  "tests.backToTests": "Back to tests",
  "tests.retake": "Retake test",
  "tests.level.beginner": "beginner",
  "tests.level.intermediate": "intermediate",
  "tests.level.advanced": "advanced",

  // Members
  "members.title": "The Members",
  "members.subtitle": "Brothers and sisters who have joined this majlis.",
  "members.allMembers": "All members",

  // Profile
  "profile.joined": "Joined {date}",

  // Not found
  "notFound.title": "404 Page Not Found",
  "notFound.body": "Did you forget to add the page to the router?",

  // Decorative Arabic labels (kept in Arabic in both languages, but provided as keys)
  "ar.welcomeBack": "أهلاً بكم",
  "ar.joinMajlis": "انضم إلى المجلس",
  "ar.salam": "السلام عليكم",
  "ar.feedHeading": "الفوائد",
  "ar.brothersHalaqahs": "حلقات الإخوة",
  "ar.sistersHalaqahs": "حلقات الأخوات",
  "ar.sittings": "المجالس العلمية",
  "ar.library": "المكتبة",
  "ar.tests": "اختبارات العقيدة",
  "ar.members": "الأعضاء",
  "ar.whatYoullFind": "ما تجده هنا",
  "ar.majlisFull": "مَجْلِسُ طُلَّابِ العِلْمِ",
  "ar.studentsOfIlm": "طلاب علم",

  // Navigation
  "nav.admin": "Admin",

  // Uploads
  "upload.image": "Add image",
  "upload.videoOk": "Video also welcome",
  "upload.uploading": "Uploading…",
  "upload.tooBig": "File is too large. Maximum is 50 MB.",
  "upload.remove": "Remove attachment",

  // Sessions creation
  "sessions.create.button": "Start a live broadcast",
  "sessions.create.title": "Start a live broadcast",
  "sessions.create.help":
    "Open Google Meet in another tab, copy the meeting link, and paste it here. Brothers and sisters will be able to join from the sessions page.",
  "sessions.create.titleField": "Title",
  "sessions.create.scholar": "Speaker",
  "sessions.create.description": "Description",
  "sessions.create.link": "Google Meet link",
  "sessions.create.linkHelp":
    "Must be a meet.google.com link. Other providers are not allowed.",
  "sessions.create.when": "When (optional)",
  "sessions.create.duration": "Duration (minutes)",
  "sessions.create.publish": "Publish broadcast",
  "sessions.create.publishing": "Publishing…",
  "sessions.create.invalidLink":
    "The link must be a valid Google Meet URL (meet.google.com).",
  "sessions.create.failed": "Could not publish the broadcast.",

  // Halaqah gender separation
  "halaqah.brothersBanner":
    "Brothers' lounge — only brothers can read and write here.",
  "halaqah.sistersBanner":
    "Sisters' lounge — only sisters can read and write here.",

  // Admin
  "admin.title": "Admin control panel",
  "admin.subtitle":
    "Grant or revoke admin access, deactivate accounts, and moderate content.",
  "admin.gate.title": "Admin access required",
  "admin.gate.subtitle":
    "Enter the admin password to unlock the control panel.",
  "admin.gate.password": "Admin password",
  "admin.gate.unlock": "Unlock",
  "admin.gate.invalid": "Incorrect admin password.",
  "admin.role.main": "Main admin",
  "admin.role.admin": "Admin",
  "admin.role.inactive": "Deactivated",
  "admin.role.onlyMain": "Only the main admin can grant or revoke admin access.",
  "admin.role.cannotChangeMain": "The main admin cannot be changed.",
  "admin.action.grantAdmin": "Grant admin",
  "admin.action.revokeAdmin": "Revoke admin",
  "admin.action.activate": "Activate",
  "admin.action.deactivate": "Deactivate",
  "admin.deletePost": "Delete post",
  "admin.tabs.members": "Members",
  "admin.tabs.lessons": "Recorded lessons",
  "admin.tabs.books": "Library books",
  "admin.lessons.heading": "Recorded lessons",
  "admin.lessons.subtitle": "Attach, edit, or remove links to recorded sittings.",
  "admin.lessons.add": "Add recorded lesson",
  "admin.lessons.empty": "No recorded lessons yet.",
  "admin.lessons.title": "Title",
  "admin.lessons.scholar": "Scholar",
  "admin.lessons.description": "Description",
  "admin.lessons.videoUrl": "Recording URL",
  "admin.lessons.coverImageUrl": "Cover image URL",
  "admin.lessons.scheduledFor": "Date (optional)",
  "admin.lessons.durationMinutes": "Duration (minutes)",
  "admin.lessons.create": "Add lesson",
  "admin.lessons.update": "Save changes",
  "admin.lessons.delete": "Delete",
  "admin.lessons.confirmDelete": "Delete this recorded lesson?",
  "admin.lessons.editTitle": "Edit recorded lesson",
  "admin.books.heading": "Library books",
  "admin.books.subtitle": "Add, edit, or remove book download links.",
  "admin.books.add": "Add book",
  "admin.books.empty": "No books yet.",
  "admin.books.title": "Title",
  "admin.books.author": "Author",
  "admin.books.description": "Description",
  "admin.books.fileUrl": "Download URL",
  "admin.books.coverImageUrl": "Cover image URL",
  "admin.books.pages": "Pages",
  "admin.books.language": "Language",
  "admin.books.category": "Category",
  "admin.books.create": "Add book",
  "admin.books.update": "Save changes",
  "admin.books.delete": "Delete",
  "admin.books.confirmDelete": "Delete this book?",
  "admin.books.editTitle": "Edit book",
  "admin.books.addTitle": "Add book",
  "admin.lessons.addTitle": "Add recorded lesson",
  "admin.confirmDeletePost":
    "Delete this post? This cannot be undone.",
};

const ar: Dict = {
  // App identity
  "app.name.en": "طلاب العلم الشرعي",
  "app.tagline": "مجلس هادئ لطلاب العلم",
  "app.footer": "منتدى طلاب العلم الشرعي · مجلس هادئ لطلاب العلم",

  // Common
  "common.signIn": "تسجيل الدخول",
  "common.signOut": "تسجيل الخروج",
  "common.signingIn": "جارٍ تسجيل الدخول…",
  "common.createAccount": "إنشاء حساب",
  "common.creatingAccount": "جارٍ إنشاء الحساب…",
  "common.join": "انضم",
  "common.welcome": "مرحبًا",
  "common.loading": "جارٍ التحميل…",
  "common.cancel": "إلغاء",
  "common.back": "رجوع",
  "common.submit": "إرسال",
  "common.post": "نشر",
  "common.posting": "جارٍ النشر…",
  "common.send": "إرسال",
  "common.details": "التفاصيل",
  "common.download": "تحميل",
  "common.all": "الكل",
  "common.brothers": "الإخوة",
  "common.sisters": "الأخوات",
  "common.brother": "أخ",
  "common.sister": "أخت",
  "common.questions": "أسئلة",
  "common.pages": "صفحة",
  "common.pp": "ص.",
  "common.min": "دقيقة",
  "common.explanation": "الشرح",
  "common.tba": "يُحدَّد لاحقًا",
  "common.languageLabel": "English",
  "common.languageToggleAria": "Switch to English",

  // Time
  "time.secondsAgo": "منذ {n} ث",
  "time.minutesAgo": "منذ {n} د",
  "time.hoursAgo": "منذ {n} س",
  "time.daysAgo": "منذ {n} ي",

  // Navigation
  "nav.dashboard": "اللوحة الرئيسية",
  "nav.feed": "الفوائد",
  "nav.halaqah": "الحلقات",
  "nav.sessions": "المجالس",
  "nav.library": "المكتبة",
  "nav.tests": "اختبارات العقيدة",
  "nav.members": "الأعضاء",

  // Landing
  "landing.heroTitleLine1": "مجلس هادئ لطلاب العلم،",
  "landing.heroTitleLine2": "على منهج السلف الصالح.",
  "landing.heroBody":
    "ملتقى لطلاب العلم الشرعي من شتى البلاد — لقراءة الكتب المعتمدة، وحضور المجالس العلمية، والاستفادة بعضهم من بعض على ما كان عليه النبي ﷺ وأصحابه الكرام.",
  "landing.enterMajlis": "ادخل المجلس",
  "landing.iHaveAccount": "لديّ حساب",
  "landing.featuresHeading": "ما تجده هنا",
  "landing.feature.libraryTitle": "مكتبة من الكتب النافعة",
  "landing.feature.libraryBody":
    "كتب أصيلة في العقيدة والحديث والتفسير والفقه — للقراءة والتحميل.",
  "landing.feature.sittingsTitle": "مجالس مباشرة ومسجّلة",
  "landing.feature.sittingsBody":
    "احضر الحلقات العلمية وقت بثّها، أو راجع شروحها المسجّلة في وقت يناسبك.",
  "landing.feature.halaqahTitle": "حلقات للإخوة وحلقات للأخوات",
  "landing.feature.halaqahBody":
    "مجالس نقاش هادئة وصحبة صادقة في طلب العلم.",
  "landing.feature.testsTitle": "اختبارات في عقيدة السلف",
  "landing.feature.testsBody":
    "اختبر فهمك بأسئلة اختيار من متعدد مكتوبة بعناية مع شرح الإجابات.",
  "landing.quote":
    "«من سلك طريقًا يلتمس فيه علمًا سهّل الله له به طريقًا إلى الجنة».",
  "landing.quoteSource": "— صحيح مسلم",
  "landing.beginJourney": "ابدأ المسير",

  // Login
  "login.welcomeBack": "أهلاً بكم في المجلس",
  "login.username": "اسم المستخدم",
  "login.usernamePlaceholder": "اسم المستخدم",
  "login.password": "كلمة المرور",
  "login.failed": "تعذّر تسجيل الدخول",
  "login.newHere": "جديد هنا؟",
  "login.createAccountLink": "أنشئ حسابًا",
  "login.forgotPassword": "هل نسيت كلمة المرور؟",

  "forgot.title": "إعادة تعيين كلمة المرور",
  "forgot.intro": "أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل إليك رمزًا من 6 أرقام.",
  "forgot.email": "البريد الإلكتروني",
  "forgot.send": "أرسل الرمز",
  "forgot.sending": "جاري الإرسال…",
  "forgot.sentNotice": "إن كان البريد مسجّلًا، فقد أُرسل رمز من 6 أرقام. أدخله أدناه مع كلمة المرور الجديدة.",
  "forgot.notConfiguredNotice": "خدمة البريد غير مفعّلة على الخادم. الرمز مدوّن في سجلّ الخادم — اطلبه من المسؤول.",
  "forgot.code": "الرمز (6 أرقام)",
  "forgot.newPassword": "كلمة المرور الجديدة",
  "forgot.reset": "تعيين كلمة المرور",
  "forgot.resetting": "جاري التحديث…",
  "forgot.success": "تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.",
  "forgot.failed": "تعذّر تعيين كلمة المرور. تحقّق من الرمز وحاول مجددًا.",
  "forgot.backToLogin": "الرجوع إلى تسجيل الدخول",

  "profile.editButton": "تعديل الملف الشخصي",
  "profile.editTitle": "تعديل ملفك الشخصي",
  "profile.fieldDisplayName": "الاسم الظاهر",
  "profile.fieldEmail": "البريد الإلكتروني",
  "profile.fieldCountry": "البلد",
  "profile.fieldBio": "نبذة قصيرة",
  "profile.fieldAvatar": "رابط الصورة الشخصية",
  "profile.save": "حفظ التغييرات",
  "profile.saving": "جاري الحفظ…",
  "profile.saved": "تم تحديث الملف الشخصي.",
  "profile.saveFailed": "تعذّر حفظ الملف الشخصي.",

  // Register
  "register.title": "إنشاء حسابك",
  "register.username": "اسم المستخدم",
  "register.displayName": "الاسم الظاهر",
  "register.email": "البريد الإلكتروني",
  "register.emailPlaceholder": "you@example.com",
  "register.emailHint": "يُستخدم لاستعادة تسجيل الدخول فقط.",
  "register.password": "كلمة المرور",
  "register.passwordHint": "ستة أحرف على الأقل.",
  "register.iAmA": "أنا",
  "register.select": "اختر",
  "register.selectGender": "اختر الجنس (للفصل بين حلقات الإخوة والأخوات).",
  "register.genderHint":
    "يُستخدم لإلحاقك بحلقات الإخوة أو الأخوات.",
  "register.country": "البلد (اختياري)",
  "register.countryPlaceholder": "مثال: مصر",
  "register.bio": "نبذة قصيرة (اختياري)",
  "register.bioPlaceholder": "عرّف الإخوة والأخوات بنفسك بإيجاز.",
  "register.failed": "تعذّر إنشاء الحساب",
  "register.alreadyMember": "عضو من قبل؟",

  // Home / dashboard
  "home.greeting": "السلام عليكم، {name}",
  "home.subtitle":
    "نظرة سريعة على مجلسك — أحدث الفوائد، والمجالس القادمة، وحال الجماعة.",
  "home.stat.members": "الأعضاء",
  "home.stat.posts": "المنشورات",
  "home.stat.books": "الكتب",
  "home.stat.sittings": "المجالس",
  "home.recentBenefits": "أحدث فوائد الإخوة والأخوات",
  "home.viewFeed": "عرض الفوائد",
  "home.upcomingSittings": "المجالس المباشرة القادمة",
  "home.noPostsYet": "لا توجد منشورات بعد. كن أول من يشارك فائدة.",
  "home.noLiveScheduled": "لا توجد مجالس مباشرة مجدولة.",

  // Feed
  "feed.title": "الفوائد",
  "feed.subtitle":
    "منشورات نافعة من أعضاء المجلس. الحالات في الأعلى تظهر للجميع لمدة ٢٤ ساعة.",
  "feed.composerPlaceholder":
    "شارك فائدة، أو آية، أو حديثًا، أو سؤالًا للإخوة والأخوات…",
  "feed.empty": "لا توجد منشورات بعد — كن أول من يشارك فائدة.",

  // Stories
  "stories.your": "حالتك",
  "stories.loading": "جارٍ تحميل الحالات…",
  "stories.share": "شارك حالة",
  "stories.dialogHelp": "تظهر الحالات للجميع لمدة ٢٤ ساعة.",
  "stories.placeholder": "تذكير نافع، أو آية، أو حديث…",
  "stories.postStory": "نشر الحالة",
  "stories.singular": "حالة",
  "stories.plural": "حالات",

  // Halaqah list
  "halaqah.brothersTitle": "حلقات الإخوة",
  "halaqah.sistersTitle": "حلقات الأخوات",
  "halaqah.subtitle":
    "حلقات دراسية هادئة — اختر حلقة للدخول والمشاركة.",
  "halaqah.contributing": "{n} مشاركًا",
  "halaqah.lastMessage": "آخر رسالة {time}",
  "halaqah.empty": "لا توجد حلقات متاحة بعد.",

  // Halaqah room
  "halaqah.allHalaqahs": "جميع الحلقات",
  "halaqah.fallbackName": "حلقة",
  "halaqah.messagePlaceholder": "اكتب رسالة…",
  "halaqah.noMessages": "لا توجد رسائل بعد. كن أول من يشارك فائدة.",

  // Sessions
  "sessions.title": "المجالس العلمية",
  "sessions.subtitle":
    "حلقات علمية مباشرة وشروح مسجّلة من العلماء وطلاب العلم.",
  "sessions.tabLive": "المباشر والقادم",
  "sessions.tabRecorded": "المسجَّل",
  "sessions.kind.live": "مباشر",
  "sessions.kind.recorded": "مسجَّل",
  "sessions.empty": "لا توجد مجالس هنا بعد.",
  "sessions.allSittings": "جميع المجالس",
  "sessions.liveLink": "رابط المجلس المباشر",
  "sessions.liveHelp":
    "انضم عند بدء المجلس. سيُفتح الرابط أدناه في نافذة جديدة.",
  "sessions.joinSitting": "انضم إلى المجلس",

  // Library
  "library.title": "المكتبة",
  "library.subtitle":
    "كتب أصيلة في العقيدة والحديث والتفسير والفقه — للقراءة والتحميل.",
  "library.empty": "لا توجد كتب في هذا التصنيف بعد.",
  "library.backToLibrary": "العودة إلى المكتبة",

  // Tests
  "tests.title": "اختبارات العقيدة",
  "tests.subtitle":
    "اختبر فهمك لعقيدة أهل السنة على منهج السلف الصالح.",
  "tests.leaderboard": "لوحة المتميّزين",
  "tests.leaderboardEmpty": "لا توجد محاولات بعد — كن أول المتقدّمين.",
  "tests.bestLine": "أفضل: {pct}٪ · {attempts} محاولة",
  "tests.allTests": "جميع الاختبارات",
  "tests.answeredOf": "أجبت عن {answered} من {total}",
  "tests.grading": "جارٍ التصحيح…",
  "tests.submit": "إرسال الإجابات",
  "tests.question": "السؤال {n}",
  "tests.yourResult": "نتيجتك",
  "tests.barakAllah": "بارك الله فيك",
  "tests.backToTests": "العودة إلى الاختبارات",
  "tests.retake": "إعادة الاختبار",
  "tests.level.beginner": "مبتدئ",
  "tests.level.intermediate": "متوسط",
  "tests.level.advanced": "متقدّم",

  // Members
  "members.title": "الأعضاء",
  "members.subtitle": "إخوة وأخوات انضموا إلى هذا المجلس.",
  "members.allMembers": "جميع الأعضاء",

  // Profile
  "profile.joined": "انضم في {date}",

  // Not found
  "notFound.title": "٤٠٤ — الصفحة غير موجودة",
  "notFound.body": "هل نسيت إضافة الصفحة إلى المسار؟",

  // Decorative Arabic labels (same in both languages)
  "ar.welcomeBack": "أهلاً بكم",
  "ar.joinMajlis": "انضم إلى المجلس",
  "ar.salam": "السلام عليكم",
  "ar.feedHeading": "الفوائد",
  "ar.brothersHalaqahs": "حلقات الإخوة",
  "ar.sistersHalaqahs": "حلقات الأخوات",
  "ar.sittings": "المجالس العلمية",
  "ar.library": "المكتبة",
  "ar.tests": "اختبارات العقيدة",
  "ar.members": "الأعضاء",
  "ar.whatYoullFind": "ما تجده هنا",
  "ar.majlisFull": "مَجْلِسُ طُلَّابِ العِلْمِ",
  "ar.studentsOfIlm": "طلاب علم",

  // Navigation
  "nav.admin": "الإدارة",

  // Uploads
  "upload.image": "إضافة صورة",
  "upload.videoOk": "ويمكن أيضًا رفع مقطع فيديو",
  "upload.uploading": "جارٍ الرفع…",
  "upload.tooBig": "حجم الملف كبير جدًا. الحد الأقصى ٥٠ ميجابايت.",
  "upload.remove": "حذف المرفق",

  // Sessions creation
  "sessions.create.button": "ابدأ بثًا مباشرًا",
  "sessions.create.title": "ابدأ بثًا مباشرًا",
  "sessions.create.help":
    "افتح Google Meet في علامة تبويب أخرى، وانسخ رابط الاجتماع، ثم الصقه هنا. سيتمكن الإخوة والأخوات من الانضمام من صفحة المجالس.",
  "sessions.create.titleField": "العنوان",
  "sessions.create.scholar": "المتحدث",
  "sessions.create.description": "الوصف",
  "sessions.create.link": "رابط Google Meet",
  "sessions.create.linkHelp":
    "يجب أن يكون الرابط من meet.google.com، الروابط الأخرى غير مسموح بها.",
  "sessions.create.when": "الموعد (اختياري)",
  "sessions.create.duration": "المدة (بالدقائق)",
  "sessions.create.publish": "نشر البث",
  "sessions.create.publishing": "جارٍ النشر…",
  "sessions.create.invalidLink":
    "يجب أن يكون الرابط من Google Meet (meet.google.com).",
  "sessions.create.failed": "تعذّر نشر البث المباشر.",

  // Halaqah gender separation
  "halaqah.brothersBanner":
    "مجلس الإخوة — لا يقرأ ولا يكتب هنا إلا الإخوة.",
  "halaqah.sistersBanner":
    "مجلس الأخوات — لا تقرأ ولا تكتب هنا إلا الأخوات.",

  // Admin
  "admin.title": "لوحة تحكّم الإدارة",
  "admin.subtitle":
    "منح صلاحية الإدارة أو سحبها، وتعطيل الحسابات، والإشراف على المحتوى.",
  "admin.gate.title": "يلزم الدخول الإداري",
  "admin.gate.subtitle":
    "أدخل كلمة سر الإدارة لفتح لوحة التحكّم.",
  "admin.gate.password": "كلمة سرّ الإدارة",
  "admin.gate.unlock": "فتح",
  "admin.gate.invalid": "كلمة سرّ الإدارة غير صحيحة.",
  "admin.role.main": "المدير الرئيس",
  "admin.role.admin": "مدير",
  "admin.role.inactive": "موقوف",
  "admin.role.onlyMain":
    "لا يمكن منح صلاحية الإدارة أو سحبها إلا للمدير الرئيس.",
  "admin.role.cannotChangeMain": "لا يمكن تعديل المدير الرئيس.",
  "admin.action.grantAdmin": "منح الإدارة",
  "admin.action.revokeAdmin": "سحب الإدارة",
  "admin.action.activate": "تفعيل",
  "admin.action.deactivate": "تعطيل",
  "admin.deletePost": "حذف المنشور",
  "admin.tabs.members": "الأعضاء",
  "admin.tabs.lessons": "الدروس المسجَّلة",
  "admin.tabs.books": "كتب المكتبة",
  "admin.lessons.heading": "الدروس المسجَّلة",
  "admin.lessons.subtitle": "إضافة وتعديل وحذف روابط الجلسات المسجَّلة.",
  "admin.lessons.add": "إضافة درس مسجَّل",
  "admin.lessons.empty": "لا توجد دروس مسجَّلة بعد.",
  "admin.lessons.title": "العنوان",
  "admin.lessons.scholar": "الشيخ",
  "admin.lessons.description": "الوصف",
  "admin.lessons.videoUrl": "رابط التسجيل",
  "admin.lessons.coverImageUrl": "رابط صورة الغلاف",
  "admin.lessons.scheduledFor": "التاريخ (اختياري)",
  "admin.lessons.durationMinutes": "المدّة (دقائق)",
  "admin.lessons.create": "أضِف الدرس",
  "admin.lessons.update": "حفظ التعديلات",
  "admin.lessons.delete": "حذف",
  "admin.lessons.confirmDelete": "حذف هذا الدرس المسجَّل؟",
  "admin.lessons.editTitle": "تعديل درس مسجَّل",
  "admin.lessons.addTitle": "إضافة درس مسجَّل",
  "admin.books.heading": "كتب المكتبة",
  "admin.books.subtitle": "إضافة وتعديل وحذف روابط تحميل الكتب.",
  "admin.books.add": "إضافة كتاب",
  "admin.books.empty": "لا توجد كتب بعد.",
  "admin.books.title": "العنوان",
  "admin.books.author": "المؤلّف",
  "admin.books.description": "الوصف",
  "admin.books.fileUrl": "رابط التحميل",
  "admin.books.coverImageUrl": "رابط صورة الغلاف",
  "admin.books.pages": "الصفحات",
  "admin.books.language": "اللغة",
  "admin.books.category": "التصنيف",
  "admin.books.create": "أضِف الكتاب",
  "admin.books.update": "حفظ التعديلات",
  "admin.books.delete": "حذف",
  "admin.books.confirmDelete": "حذف هذا الكتاب؟",
  "admin.books.editTitle": "تعديل كتاب",
  "admin.books.addTitle": "إضافة كتاب",
  "admin.confirmDeletePost":
    "هل تريد حذف هذا المنشور؟ لا يمكن التراجع عن ذلك.",
};

const dictionaries: Record<Language, Dict> = { en, ar };

type I18nContextValue = {
  lang: Language;
  dir: "ltr" | "rtl";
  setLang: (l: Language) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLang(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ar") return stored;
  const browser = window.navigator.language?.toLowerCase() ?? "";
  if (browser.startsWith("ar")) return "ar";
  return "en";
}

function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "ar" : "en");
  }, [lang, setLang]);

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", dir);
  }, [lang, dir]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const value = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
      return format(value, vars);
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, dir, setLang, toggleLang, t }),
    [lang, dir, setLang, toggleLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useTranslation() {
  const { t, lang, dir } = useI18n();
  return { t, lang, dir };
}
