import {
  db,
  usersTable,
  chatGroupsTable,
  booksTable,
  meetingsTable,
  testsTable,
  testQuestionsTable,
  postsTable,
} from "@workspace/db";
import { hashPassword } from "./lib/auth";
import { sql, eq } from "drizzle-orm";

async function ensureMainAdmin(): Promise<void> {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, "admin"))
    .limit(1);
  if (existing) {
    if (!existing.isMainAdmin || !existing.isAdmin) {
      await db
        .update(usersTable)
        .set({ isAdmin: true, isMainAdmin: true, isActive: true })
        .where(eq(usersTable.id, existing.id));
      console.log("Promoted existing 'admin' user to main administrator.");
    }
  }
}

async function main(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(testsTable);
  if ((count ?? 0) > 0) {
    console.log("Seed already applied. Ensuring main admin role.");
    await ensureMainAdmin();
    return;
  }

  console.log("Seeding chat groups...");
  await db.insert(chatGroupsTable).values([
    {
      name: "Brothers' Halaqah — General",
      description:
        "Open discussion among brothers on matters of knowledge and daily worship.",
      gender: "male",
    },
    {
      name: "Brothers' Halaqah — Tawheed",
      description: "Focused study circle on Tawheed and the Names and Attributes of Allah.",
      gender: "male",
    },
    {
      name: "Brothers' Halaqah — Hadith",
      description: "Reading and discussion of authentic hadith.",
      gender: "male",
    },
    {
      name: "Sisters' Halaqah — General",
      description:
        "Open discussion among sisters on matters of knowledge and daily worship.",
      gender: "female",
    },
    {
      name: "Sisters' Halaqah — Fiqh of Worship",
      description: "Study circle on the rulings of purification, prayer, and fasting.",
      gender: "female",
    },
    {
      name: "Sisters' Halaqah — Quran Tadabbur",
      description: "Reflection on the meanings of the Qur'an.",
      gender: "female",
    },
  ]);

  console.log("Seeding books...");
  await db.insert(booksTable).values([
    {
      title: "Kitab at-Tawheed",
      author: "Shaykh Muhammad ibn 'Abd al-Wahhab",
      description:
        "A foundational treatise on the oneness of Allah, drawing directly from the Qur'an and Sunnah.",
      fileUrl: "https://archive.org/download/kitab-tawheed/kitab-tawheed.pdf",
      pages: 220,
      language: "English",
      category: "Aqeedah",
    },
    {
      title: "The Three Fundamental Principles (Al-Usool ath-Thalathah)",
      author: "Shaykh Muhammad ibn 'Abd al-Wahhab",
      description:
        "A short, essential text outlining who is your Lord, what is your religion, and who is your Prophet.",
      fileUrl: "https://archive.org/download/three-principles/three-principles.pdf",
      pages: 60,
      language: "English",
      category: "Aqeedah",
    },
    {
      title: "Al-Aqeedah al-Wasitiyyah",
      author: "Shaykh al-Islam Ibn Taymiyyah",
      description:
        "A concise, classical statement of the creed of Ahl as-Sunnah on the Names and Attributes of Allah.",
      fileUrl: "https://archive.org/download/wasitiyyah/wasitiyyah.pdf",
      pages: 95,
      language: "English",
      category: "Aqeedah",
    },
    {
      title: "Sharh as-Sunnah",
      author: "Imam al-Barbahari",
      description:
        "An early statement of the creed and methodology of Ahl as-Sunnah wal-Jama'ah.",
      fileUrl: "https://archive.org/download/sharh-sunnah/sharh-sunnah.pdf",
      pages: 180,
      language: "English",
      category: "Aqeedah",
    },
    {
      title: "Riyad as-Saliheen",
      author: "Imam an-Nawawi",
      description:
        "A celebrated compilation of authentic hadith covering manners, worship, and character.",
      fileUrl: "https://archive.org/download/riyad-as-saliheen/riyad-as-saliheen.pdf",
      pages: 720,
      language: "English",
      category: "Hadith",
    },
    {
      title: "Bulugh al-Maram",
      author: "Hafidh Ibn Hajar al-'Asqalani",
      description: "A core compilation of hadith on the rulings of fiqh.",
      fileUrl: "https://archive.org/download/bulugh-al-maram/bulugh-al-maram.pdf",
      pages: 480,
      language: "English",
      category: "Fiqh",
    },
    {
      title: "Fiqh as-Sunnah",
      author: "Sayyid Sabiq",
      description: "A widely studied work on the rulings of worship grounded in the Sunnah.",
      fileUrl: "https://archive.org/download/fiqh-sunnah/fiqh-sunnah.pdf",
      pages: 850,
      language: "English",
      category: "Fiqh",
    },
    {
      title: "Tafsir as-Sa'di",
      author: "Shaykh 'Abd ar-Rahman as-Sa'di",
      description:
        "A clear and beneficial commentary on the entire Qur'an by one of the great scholars of the modern era.",
      fileUrl: "https://archive.org/download/tafsir-sadi/tafsir-sadi.pdf",
      pages: 1400,
      language: "English",
      category: "Tafsir",
    },
  ]);

  console.log("Seeding meetings...");
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  await db.insert(meetingsTable).values([
    {
      title: "Live Halaqah: Explanation of Al-Usool ath-Thalathah",
      description:
        "A weekly live class explaining the Three Fundamental Principles, line by line.",
      scholar: "Shaykh Abu 'Abdillah",
      kind: "live",
      liveUrl: "https://meet.google.com/abc-defg-hij",
      scheduledFor: new Date(now + 2 * day),
      durationMinutes: 60,
    },
    {
      title: "Live Sitting: The Names and Attributes of Allah",
      description: "Foundations of the Salafi creed regarding al-Asma' wa as-Sifat.",
      scholar: "Shaykh Yusuf as-Salafi",
      kind: "live",
      liveUrl: "https://meet.google.com/xyz-uvwx-yz",
      scheduledFor: new Date(now + 5 * day),
      durationMinutes: 90,
    },
    {
      title: "Live Class: Tafsir of Surah al-Fatihah",
      description: "Verse-by-verse explanation drawing from Tafsir as-Sa'di and Ibn Kathir.",
      scholar: "Ustadh 'Abd al-Karim",
      kind: "live",
      liveUrl: "https://meet.google.com/fat-ihah-001",
      scheduledFor: new Date(now + 8 * day),
      durationMinutes: 75,
    },
    {
      title: "Recorded Lecture: The Six Pillars of Iman",
      description: "An introduction to the articles of faith for new students.",
      scholar: "Shaykh Abu 'Abdillah",
      kind: "recorded",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      scheduledFor: new Date(now - 14 * day),
      durationMinutes: 55,
    },
    {
      title: "Recorded Series: Sharh Kitab at-Tawheed (Part 1)",
      description: "Part one of a multi-part explanation of Kitab at-Tawheed.",
      scholar: "Shaykh Yusuf as-Salafi",
      kind: "recorded",
      videoUrl: "https://www.youtube.com/embed/M7lc1UVf-VE",
      scheduledFor: new Date(now - 30 * day),
      durationMinutes: 80,
    },
    {
      title: "Recorded Lecture: The Manhaj of the Salaf",
      description: "Why the methodology of the first three generations is the criterion.",
      scholar: "Ustadh 'Abd al-Karim",
      kind: "recorded",
      videoUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
      scheduledFor: new Date(now - 45 * day),
      durationMinutes: 65,
    },
  ]);

  console.log("Seeding tests...");
  const [beginner] = await db
    .insert(testsTable)
    .values({
      title: "Foundations of Tawheed",
      description:
        "Test your understanding of the categories of Tawheed and its core principles.",
      level: "beginner",
    })
    .returning();
  const [intermediate] = await db
    .insert(testsTable)
    .values({
      title: "The Names and Attributes of Allah",
      description:
        "Questions on the creed of Ahl as-Sunnah regarding al-Asma' wa as-Sifat.",
      level: "intermediate",
    })
    .returning();
  const [advanced] = await db
    .insert(testsTable)
    .values({
      title: "The Methodology of the Salaf",
      description:
        "Advanced questions on the manhaj of the first three generations and matters of bid'ah.",
      level: "advanced",
    })
    .returning();

  if (!beginner || !intermediate || !advanced) {
    throw new Error("Failed to insert tests");
  }

  await db.insert(testQuestionsTable).values([
    {
      testId: beginner.id,
      order: 0,
      prompt: "Tawheed is divided by the scholars of Ahl as-Sunnah into how many categories?",
      options: ["Two", "Three", "Four", "Five"],
      correctIndex: 1,
      explanation:
        "Tawheed is divided into three categories: Tawheed ar-Rububiyyah (Lordship), Tawheed al-Uluhiyyah (Worship), and Tawheed al-Asma' wa as-Sifat (Names and Attributes).",
    },
    {
      testId: beginner.id,
      order: 1,
      prompt: "Tawheed al-Uluhiyyah refers to:",
      options: [
        "Affirming that Allah is the sole Creator and Sustainer.",
        "Singling out Allah alone with all acts of worship.",
        "Affirming the Names and Attributes of Allah without distortion.",
        "Following the rulings of fiqh from a single madhhab.",
      ],
      correctIndex: 1,
      explanation:
        "Tawheed al-Uluhiyyah is to single out Allah alone in all acts of worship — du'a, sacrifice, vows, fear, hope, reliance, and so on.",
    },
    {
      testId: beginner.id,
      order: 2,
      prompt: "Which of the following nullifies a person's Islam?",
      options: [
        "Falling into a major sin without seeking repentance immediately.",
        "Directing an act of worship to other than Allah.",
        "Missing the Friday prayer once due to forgetfulness.",
        "Disagreeing with a scholar on a matter of fiqh.",
      ],
      correctIndex: 1,
      explanation:
        "Directing any act of worship to other than Allah is shirk akbar, which nullifies Islam, as Allah said: 'Whoever associates partners with Allah, Allah has forbidden Paradise to him.' (Surah al-Ma'idah 5:72)",
    },
    {
      testId: beginner.id,
      order: 3,
      prompt: "The first obligation upon every accountable person is:",
      options: [
        "To establish the prayer.",
        "To pay zakah.",
        "To single out Allah alone in worship (Tawheed).",
        "To memorize the Qur'an.",
      ],
      correctIndex: 2,
      explanation:
        "The first obligation is Tawheed, as the Prophet ﷺ instructed Mu'adh ibn Jabal: 'Let the first thing you call them to be the testimony that none has the right to be worshipped but Allah.' (Bukhari and Muslim)",
    },
    {
      testId: beginner.id,
      order: 4,
      prompt: "What is the meaning of 'La ilaha illa Allah'?",
      options: [
        "There is no creator except Allah.",
        "There is none worthy of worship except Allah.",
        "There is no provider except Allah.",
        "There is no king except Allah.",
      ],
      correctIndex: 1,
      explanation:
        "'La ilaha illa Allah' means: there is none worthy of worship in truth except Allah. The mushrikun affirmed Allah as Creator and Provider, yet they were not Muslims because they did not single Him out in worship.",
    },
    {
      testId: beginner.id,
      order: 5,
      prompt: "Which act is shirk akbar (major shirk)?",
      options: [
        "Praying behind an imam who has differing views on a fiqh matter.",
        "Making du'a to a deceased person to fulfill one's needs.",
        "Sleeping after Fajr.",
        "Combining two prayers while traveling.",
      ],
      correctIndex: 1,
      explanation:
        "Calling upon the dead to fulfill needs is shirk akbar, since du'a is worship and worship is for Allah alone. Allah said: 'And do not invoke besides Allah that which neither benefits you nor harms you.' (Surah Yunus 10:106)",
    },
  ]);

  await db.insert(testQuestionsTable).values([
    {
      testId: intermediate.id,
      order: 0,
      prompt:
        "Regarding the Names and Attributes of Allah, the methodology of Ahl as-Sunnah is:",
      options: [
        "To affirm them without ta'teel (denial), tahreef (distortion), takyeef (asking how), or tamtheel (likeness to creation).",
        "To interpret them metaphorically to avoid resemblance to creation.",
        "To consign their meanings entirely without affirmation.",
        "To accept only the names and reject the attributes.",
      ],
      correctIndex: 0,
      explanation:
        "Ahl as-Sunnah affirm what Allah affirmed for Himself and what His Messenger ﷺ affirmed for Him, in a way that befits His majesty, without ta'teel, tahreef, takyeef, or tamtheel — based on Allah's statement: 'There is nothing like unto Him, and He is the All-Hearing, the All-Seeing.' (Surah ash-Shura 42:11)",
    },
    {
      testId: intermediate.id,
      order: 1,
      prompt: "The statement 'Istawa means istawla (took control)' is:",
      options: [
        "The correct interpretation of Allah's rising over the Throne.",
        "A distortion (tahreef) of the meaning of the verse.",
        "An accepted interpretation among Ahl as-Sunnah.",
        "A statement of the early Salaf.",
      ],
      correctIndex: 1,
      explanation:
        "Interpreting 'istawa' as 'istawla' is tahreef (distortion). Imam Malik said about istawa: 'The istiwa is known, the how is unknown, believing in it is obligatory, and asking about it is an innovation.'",
    },
    {
      testId: intermediate.id,
      order: 2,
      prompt: "Allah's attribute of 'descending to the lowest heaven in the last third of the night' is established by:",
      options: [
        "Pure intellect.",
        "Authentic hadith narrated in Bukhari and Muslim.",
        "The consensus of the philosophers.",
        "Modern scholarly opinion only.",
      ],
      correctIndex: 1,
      explanation:
        "The hadith of an-Nuzul is authentic and recorded in Bukhari and Muslim. Ahl as-Sunnah affirm this attribute as it befits Allah, without takyeef.",
    },
    {
      testId: intermediate.id,
      order: 3,
      prompt: "The Names of Allah are:",
      options: [
        "Limited to ninety-nine names only.",
        "All beautiful and indicate praise and perfection.",
        "Open to interpretation by every individual.",
        "Restricted to those mentioned in the Qur'an, excluding the Sunnah.",
      ],
      correctIndex: 1,
      explanation:
        "Allah said: 'And to Allah belong the most beautiful names, so call upon Him by them.' (Surah al-A'raf 7:180). The number ninety-nine refers to those whose memorization leads to Paradise, not a limit on His names.",
    },
    {
      testId: intermediate.id,
      order: 4,
      prompt: "Believing that Allah is everywhere by His essence is:",
      options: [
        "The view of Ahl as-Sunnah.",
        "A statement of innovation contradicting the texts that establish Allah is above His Throne.",
        "Required for proper tawakkul.",
        "Mentioned in Sahih al-Bukhari.",
      ],
      correctIndex: 1,
      explanation:
        "Ahl as-Sunnah believe Allah is above His Throne, above the seven heavens, separate from His creation, while His knowledge encompasses everything. The view that Allah is everywhere by His essence is an innovation contradicting many clear texts.",
    },
    {
      testId: intermediate.id,
      order: 5,
      prompt: "Will the believers see Allah on the Day of Resurrection?",
      options: [
        "No, because the texts on this are metaphorical.",
        "Yes, with their eyes — this is a fundamental belief of Ahl as-Sunnah.",
        "Only the Prophets will see Him.",
        "Only in this world, not the next.",
      ],
      correctIndex: 1,
      explanation:
        "Ahl as-Sunnah affirm the believers will see Allah with their eyes in the Hereafter. Allah said: 'Faces, that Day, will be radiant, looking at their Lord.' (Surah al-Qiyamah 75:22-23). The Prophet ﷺ said: 'You will see your Lord as you see this moon.' (Bukhari and Muslim)",
    },
  ]);

  await db.insert(testQuestionsTable).values([
    {
      testId: advanced.id,
      order: 0,
      prompt: "The principle 'every innovation is misguidance' is taken from:",
      options: [
        "An opinion of a later scholar.",
        "An authentic statement of the Prophet ﷺ.",
        "A weak narration not relied upon.",
        "A general philosophical maxim.",
      ],
      correctIndex: 1,
      explanation:
        "The Prophet ﷺ said: 'Beware of newly invented matters, for every newly invented matter is an innovation, and every innovation is misguidance.' (Abu Dawud, at-Tirmidhi — authentic).",
    },
    {
      testId: advanced.id,
      order: 1,
      prompt: "The 'saved sect' (al-Firqah an-Najiyah) is:",
      options: [
        "Those who follow the political party closest to Islam.",
        "Those upon what the Prophet ﷺ and his Companions were upon.",
        "A specific tribe of the Arabs.",
        "Whoever holds the largest number of followers.",
      ],
      correctIndex: 1,
      explanation:
        "When asked who the saved sect is, the Prophet ﷺ said: 'Those who are upon what I and my Companions are upon today.' (at-Tirmidhi). This is the manhaj of the Salaf as-Salih.",
    },
    {
      testId: advanced.id,
      order: 2,
      prompt: "Concerning rulers, the manhaj of the Salaf is to:",
      options: [
        "Rebel publicly when they sin.",
        "Hear and obey in what is good, sincerely advise them privately, and not publicly revolt against them.",
        "Curse them openly from the pulpits.",
        "Refuse to pray behind any of them.",
      ],
      correctIndex: 1,
      explanation:
        "Many authentic hadith establish hearing and obeying the ruler in what is good, advising them privately, and avoiding public revolt — even if they oppress — to preserve the unity of the Muslims and avoid greater corruption.",
    },
    {
      testId: advanced.id,
      order: 3,
      prompt: "Bid'ah hasanah (good innovation) in matters of religion is:",
      options: [
        "An accepted concept by all of Ahl as-Sunnah.",
        "A category that contradicts the general statement 'every innovation is misguidance.'",
        "Found explicitly in the Qur'an.",
        "A teaching of the four imams.",
      ],
      correctIndex: 1,
      explanation:
        "There is no such thing as bid'ah hasanah in matters of religion. The Prophet ﷺ said: 'every innovation is misguidance,' which is general and not restricted. What people sometimes call 'good innovation' either has a basis in the Sunnah (so it is not new) or it is rejected.",
    },
    {
      testId: advanced.id,
      order: 4,
      prompt: "Takfir (declaring a Muslim a disbeliever) without right is:",
      options: [
        "Permissible if many scholars agree.",
        "A grave matter; whoever calls his Muslim brother a disbeliever, it returns to one of them — as in the authentic hadith.",
        "Required when seeing a major sin.",
        "An innovation only if done in public.",
      ],
      correctIndex: 1,
      explanation:
        "The Prophet ﷺ said: 'If a man says to his brother: O kafir! then surely one of them is such.' (Bukhari and Muslim). Takfir has strict conditions and impediments and is for the people of knowledge to apply, not the common Muslims.",
    },
    {
      testId: advanced.id,
      order: 5,
      prompt: "Sources of legislation according to Ahl as-Sunnah are:",
      options: [
        "Qur'an, Sunnah, consensus of the Ummah, and qiyas (analogy) — in that order of priority.",
        "Qur'an only; the Sunnah is secondary.",
        "Customs and traditions of one's land.",
        "Personal feeling and inspiration.",
      ],
      correctIndex: 0,
      explanation:
        "The four agreed-upon sources are the Qur'an, the authentic Sunnah, the consensus of the Ummah (especially of the Companions), and qiyas — when employed correctly by the people of knowledge — in this order.",
    },
  ]);

  console.log("Seeding sample admin user and posts...");
  const { hash, salt } = hashPassword("password123");
  const [admin] = await db
    .insert(usersTable)
    .values({
      username: "admin",
      displayName: "Abu 'Abdillah",
      gender: "male",
      country: "Madinah",
      bio: "Caretaker of this forum. May Allah accept from us all.",
      passwordHash: hash,
      passwordSalt: salt,
      isAdmin: true,
      isMainAdmin: true,
      isActive: true,
    })
    .returning();
  if (admin) {
    await db.insert(postsTable).values([
      {
        userId: admin.id,
        content:
          "Welcome to our forum, dear brothers and sisters. May Allah make this gathering a means of sincere knowledge and good companionship. Begin with the foundations: Tawheed, then knowledge of His Names and Attributes, then the rulings of worship.",
      },
      {
        userId: admin.id,
        content:
          "Reminder: 'Indeed, Allah does not look at your bodies or your faces, but He looks at your hearts and your deeds.' (Sahih Muslim)",
      },
    ]);
  }

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
