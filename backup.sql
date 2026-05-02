--
-- PostgreSQL database dump
--

\restrict i5hDEKdBVzeOCXi1R41xyaTxggUMnO9KbaPhRTqAUpNUgDUSAKysb2jIz2wnTaD

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    author character varying(120) NOT NULL,
    description text,
    cover_image_url text,
    file_url text NOT NULL,
    pages integer,
    language character varying(32) NOT NULL,
    category character varying(60) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.books_id_seq OWNER TO postgres;

--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: chat_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_groups (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    gender character varying(16) NOT NULL,
    cover_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_groups OWNER TO postgres;

--
-- Name: chat_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_groups_id_seq OWNER TO postgres;

--
-- Name: chat_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_groups_id_seq OWNED BY public.chat_groups.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_messages_id_seq OWNER TO postgres;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meetings (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    scholar character varying(120) NOT NULL,
    kind character varying(16) NOT NULL,
    video_url text,
    live_url text,
    scheduled_for timestamp with time zone,
    duration_minutes integer,
    cover_image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id integer
);


ALTER TABLE public.meetings OWNER TO postgres;

--
-- Name: meetings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meetings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meetings_id_seq OWNER TO postgres;

--
-- Name: meetings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meetings_id_seq OWNED BY public.meetings.id;


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    code_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- Name: password_resets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_resets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_id_seq OWNER TO postgres;

--
-- Name: password_resets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_resets_id_seq OWNED BY public.password_resets.id;


--
-- Name: password_resets_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_resets_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_resets_user_id_seq OWNER TO postgres;

--
-- Name: password_resets_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_resets_user_id_seq OWNED BY public.password_resets.user_id;


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_likes (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.post_likes OWNER TO postgres;

--
-- Name: post_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_likes_id_seq OWNER TO postgres;

--
-- Name: post_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.post_likes_id_seq OWNED BY public.post_likes.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    video_url text
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: stories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stories (
    id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    image_url text,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    video_url text
);


ALTER TABLE public.stories OWNER TO postgres;

--
-- Name: stories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stories_id_seq OWNER TO postgres;

--
-- Name: stories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stories_id_seq OWNED BY public.stories.id;


--
-- Name: test_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_attempts (
    id integer NOT NULL,
    test_id integer NOT NULL,
    user_id integer NOT NULL,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.test_attempts OWNER TO postgres;

--
-- Name: test_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_attempts_id_seq OWNER TO postgres;

--
-- Name: test_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_attempts_id_seq OWNED BY public.test_attempts.id;


--
-- Name: test_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_questions (
    id integer NOT NULL,
    test_id integer NOT NULL,
    prompt text NOT NULL,
    options jsonb NOT NULL,
    correct_index integer NOT NULL,
    explanation text,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.test_questions OWNER TO postgres;

--
-- Name: test_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_questions_id_seq OWNER TO postgres;

--
-- Name: test_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_questions_id_seq OWNED BY public.test_questions.id;


--
-- Name: tests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tests (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    level character varying(24) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tests OWNER TO postgres;

--
-- Name: tests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tests_id_seq OWNER TO postgres;

--
-- Name: tests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tests_id_seq OWNED BY public.tests.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(32) NOT NULL,
    display_name character varying(60) NOT NULL,
    gender character varying(16) NOT NULL,
    country text,
    bio text,
    avatar_url text,
    password_hash text NOT NULL,
    password_salt text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    is_main_admin boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    email character varying(254)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: chat_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_groups ALTER COLUMN id SET DEFAULT nextval('public.chat_groups_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: meetings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings ALTER COLUMN id SET DEFAULT nextval('public.meetings_id_seq'::regclass);


--
-- Name: password_resets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN id SET DEFAULT nextval('public.password_resets_id_seq'::regclass);


--
-- Name: password_resets user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets ALTER COLUMN user_id SET DEFAULT nextval('public.password_resets_user_id_seq'::regclass);


--
-- Name: post_likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes ALTER COLUMN id SET DEFAULT nextval('public.post_likes_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: stories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories ALTER COLUMN id SET DEFAULT nextval('public.stories_id_seq'::regclass);


--
-- Name: test_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_attempts ALTER COLUMN id SET DEFAULT nextval('public.test_attempts_id_seq'::regclass);


--
-- Name: test_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_questions ALTER COLUMN id SET DEFAULT nextval('public.test_questions_id_seq'::regclass);


--
-- Name: tests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests ALTER COLUMN id SET DEFAULT nextval('public.tests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, title, author, description, cover_image_url, file_url, pages, language, category, created_at) FROM stdin;
1	Kitab at-Tawheed	Shaykh Muhammad ibn 'Abd al-Wahhab	A foundational treatise on the oneness of Allah, drawing directly from the Qur'an and Sunnah.	\N	https://archive.org/download/kitab-tawheed/kitab-tawheed.pdf	220	English	Aqeedah	2026-04-29 13:17:42.206896+00
2	The Three Fundamental Principles (Al-Usool ath-Thalathah)	Shaykh Muhammad ibn 'Abd al-Wahhab	A short, essential text outlining who is your Lord, what is your religion, and who is your Prophet.	\N	https://archive.org/download/three-principles/three-principles.pdf	60	English	Aqeedah	2026-04-29 13:17:42.206896+00
3	Al-Aqeedah al-Wasitiyyah	Shaykh al-Islam Ibn Taymiyyah	A concise, classical statement of the creed of Ahl as-Sunnah on the Names and Attributes of Allah.	\N	https://archive.org/download/wasitiyyah/wasitiyyah.pdf	95	English	Aqeedah	2026-04-29 13:17:42.206896+00
4	Sharh as-Sunnah	Imam al-Barbahari	An early statement of the creed and methodology of Ahl as-Sunnah wal-Jama'ah.	\N	https://archive.org/download/sharh-sunnah/sharh-sunnah.pdf	180	English	Aqeedah	2026-04-29 13:17:42.206896+00
5	Riyad as-Saliheen	Imam an-Nawawi	A celebrated compilation of authentic hadith covering manners, worship, and character.	\N	https://archive.org/download/riyad-as-saliheen/riyad-as-saliheen.pdf	720	English	Hadith	2026-04-29 13:17:42.206896+00
6	Bulugh al-Maram	Hafidh Ibn Hajar al-'Asqalani	A core compilation of hadith on the rulings of fiqh.	\N	https://archive.org/download/bulugh-al-maram/bulugh-al-maram.pdf	480	English	Fiqh	2026-04-29 13:17:42.206896+00
7	Fiqh as-Sunnah	Sayyid Sabiq	A widely studied work on the rulings of worship grounded in the Sunnah.	\N	https://archive.org/download/fiqh-sunnah/fiqh-sunnah.pdf	850	English	Fiqh	2026-04-29 13:17:42.206896+00
8	Tafsir as-Sa'di	Shaykh 'Abd ar-Rahman as-Sa'di	A clear and beneficial commentary on the entire Qur'an by one of the great scholars of the modern era.	\N	https://archive.org/download/tafsir-sadi/tafsir-sadi.pdf	1400	English	Tafsir	2026-04-29 13:17:42.206896+00
\.


--
-- Data for Name: chat_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_groups (id, name, description, gender, cover_image_url, created_at) FROM stdin;
1	Brothers' Halaqah — General	Open discussion among brothers on matters of knowledge and daily worship.	male	\N	2026-04-29 13:17:42.178163+00
2	Brothers' Halaqah — Tawheed	Focused study circle on Tawheed and the Names and Attributes of Allah.	male	\N	2026-04-29 13:17:42.178163+00
3	Brothers' Halaqah — Hadith	Reading and discussion of authentic hadith.	male	\N	2026-04-29 13:17:42.178163+00
4	Sisters' Halaqah — General	Open discussion among sisters on matters of knowledge and daily worship.	female	\N	2026-04-29 13:17:42.178163+00
5	Sisters' Halaqah — Fiqh of Worship	Study circle on the rulings of purification, prayer, and fasting.	female	\N	2026-04-29 13:17:42.178163+00
6	Sisters' Halaqah — Quran Tadabbur	Reflection on the meanings of the Qur'an.	female	\N	2026-04-29 13:17:42.178163+00
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, group_id, user_id, content, created_at) FROM stdin;
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meetings (id, title, description, scholar, kind, video_url, live_url, scheduled_for, duration_minutes, cover_image_url, created_at, created_by_user_id) FROM stdin;
1	Live Halaqah: Explanation of Al-Usool ath-Thalathah	A weekly live class explaining the Three Fundamental Principles, line by line.	Shaykh Abu 'Abdillah	live	\N	https://meet.google.com/abc-defg-hij	2026-05-01 13:17:42.21+00	60	\N	2026-04-29 13:17:42.212821+00	\N
2	Live Sitting: The Names and Attributes of Allah	Foundations of the Salafi creed regarding al-Asma' wa as-Sifat.	Shaykh Yusuf as-Salafi	live	\N	https://meet.google.com/xyz-uvwx-yz	2026-05-04 13:17:42.21+00	90	\N	2026-04-29 13:17:42.212821+00	\N
3	Live Class: Tafsir of Surah al-Fatihah	Verse-by-verse explanation drawing from Tafsir as-Sa'di and Ibn Kathir.	Ustadh 'Abd al-Karim	live	\N	https://meet.google.com/fat-ihah-001	2026-05-07 13:17:42.21+00	75	\N	2026-04-29 13:17:42.212821+00	\N
4	Recorded Lecture: The Six Pillars of Iman	An introduction to the articles of faith for new students.	Shaykh Abu 'Abdillah	recorded	https://www.youtube.com/embed/dQw4w9WgXcQ	\N	2026-04-15 13:17:42.21+00	55	\N	2026-04-29 13:17:42.212821+00	\N
5	Recorded Series: Sharh Kitab at-Tawheed (Part 1)	Part one of a multi-part explanation of Kitab at-Tawheed.	Shaykh Yusuf as-Salafi	recorded	https://www.youtube.com/embed/M7lc1UVf-VE	\N	2026-03-30 13:17:42.21+00	80	\N	2026-04-29 13:17:42.212821+00	\N
6	Recorded Lecture: The Manhaj of the Salaf	Why the methodology of the first three generations is the criterion.	Ustadh 'Abd al-Karim	recorded	https://www.youtube.com/embed/aqz-KE-bpKQ	\N	2026-03-15 13:17:42.21+00	65	\N	2026-04-29 13:17:42.212821+00	\N
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (id, user_id, code_hash, expires_at, consumed_at, created_at) FROM stdin;
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_likes (id, post_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, user_id, content, image_url, created_at, video_url) FROM stdin;
1	1	Welcome to our forum, dear brothers and sisters. May Allah make this gathering a means of sincere knowledge and good companionship. Begin with the foundations: Tawheed, then knowledge of His Names and Attributes, then the rulings of worship.	\N	2026-04-29 13:17:42.296927+00	\N
2	1	Reminder: 'Indeed, Allah does not look at your bodies or your faces, but He looks at your hearts and your deeds.' (Sahih Muslim)	\N	2026-04-29 13:17:42.296927+00	\N
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stories (id, user_id, content, image_url, expires_at, created_at, video_url) FROM stdin;
\.


--
-- Data for Name: test_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_attempts (id, test_id, user_id, score, total_questions, completed_at) FROM stdin;
\.


--
-- Data for Name: test_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_questions (id, test_id, prompt, options, correct_index, explanation, "order") FROM stdin;
1	1	Tawheed is divided by the scholars of Ahl as-Sunnah into how many categories?	["Two", "Three", "Four", "Five"]	1	Tawheed is divided into three categories: Tawheed ar-Rububiyyah (Lordship), Tawheed al-Uluhiyyah (Worship), and Tawheed al-Asma' wa as-Sifat (Names and Attributes).	0
2	1	Tawheed al-Uluhiyyah refers to:	["Affirming that Allah is the sole Creator and Sustainer.", "Singling out Allah alone with all acts of worship.", "Affirming the Names and Attributes of Allah without distortion.", "Following the rulings of fiqh from a single madhhab."]	1	Tawheed al-Uluhiyyah is to single out Allah alone in all acts of worship — du'a, sacrifice, vows, fear, hope, reliance, and so on.	1
3	1	Which of the following nullifies a person's Islam?	["Falling into a major sin without seeking repentance immediately.", "Directing an act of worship to other than Allah.", "Missing the Friday prayer once due to forgetfulness.", "Disagreeing with a scholar on a matter of fiqh."]	1	Directing any act of worship to other than Allah is shirk akbar, which nullifies Islam, as Allah said: 'Whoever associates partners with Allah, Allah has forbidden Paradise to him.' (Surah al-Ma'idah 5:72)	2
4	1	The first obligation upon every accountable person is:	["To establish the prayer.", "To pay zakah.", "To single out Allah alone in worship (Tawheed).", "To memorize the Qur'an."]	2	The first obligation is Tawheed, as the Prophet ﷺ instructed Mu'adh ibn Jabal: 'Let the first thing you call them to be the testimony that none has the right to be worshipped but Allah.' (Bukhari and Muslim)	3
5	1	What is the meaning of 'La ilaha illa Allah'?	["There is no creator except Allah.", "There is none worthy of worship except Allah.", "There is no provider except Allah.", "There is no king except Allah."]	1	'La ilaha illa Allah' means: there is none worthy of worship in truth except Allah. The mushrikun affirmed Allah as Creator and Provider, yet they were not Muslims because they did not single Him out in worship.	4
6	1	Which act is shirk akbar (major shirk)?	["Praying behind an imam who has differing views on a fiqh matter.", "Making du'a to a deceased person to fulfill one's needs.", "Sleeping after Fajr.", "Combining two prayers while traveling."]	1	Calling upon the dead to fulfill needs is shirk akbar, since du'a is worship and worship is for Allah alone. Allah said: 'And do not invoke besides Allah that which neither benefits you nor harms you.' (Surah Yunus 10:106)	5
7	2	Regarding the Names and Attributes of Allah, the methodology of Ahl as-Sunnah is:	["To affirm them without ta'teel (denial), tahreef (distortion), takyeef (asking how), or tamtheel (likeness to creation).", "To interpret them metaphorically to avoid resemblance to creation.", "To consign their meanings entirely without affirmation.", "To accept only the names and reject the attributes."]	0	Ahl as-Sunnah affirm what Allah affirmed for Himself and what His Messenger ﷺ affirmed for Him, in a way that befits His majesty, without ta'teel, tahreef, takyeef, or tamtheel — based on Allah's statement: 'There is nothing like unto Him, and He is the All-Hearing, the All-Seeing.' (Surah ash-Shura 42:11)	0
8	2	The statement 'Istawa means istawla (took control)' is:	["The correct interpretation of Allah's rising over the Throne.", "A distortion (tahreef) of the meaning of the verse.", "An accepted interpretation among Ahl as-Sunnah.", "A statement of the early Salaf."]	1	Interpreting 'istawa' as 'istawla' is tahreef (distortion). Imam Malik said about istawa: 'The istiwa is known, the how is unknown, believing in it is obligatory, and asking about it is an innovation.'	1
9	2	Allah's attribute of 'descending to the lowest heaven in the last third of the night' is established by:	["Pure intellect.", "Authentic hadith narrated in Bukhari and Muslim.", "The consensus of the philosophers.", "Modern scholarly opinion only."]	1	The hadith of an-Nuzul is authentic and recorded in Bukhari and Muslim. Ahl as-Sunnah affirm this attribute as it befits Allah, without takyeef.	2
10	2	The Names of Allah are:	["Limited to ninety-nine names only.", "All beautiful and indicate praise and perfection.", "Open to interpretation by every individual.", "Restricted to those mentioned in the Qur'an, excluding the Sunnah."]	1	Allah said: 'And to Allah belong the most beautiful names, so call upon Him by them.' (Surah al-A'raf 7:180). The number ninety-nine refers to those whose memorization leads to Paradise, not a limit on His names.	3
11	2	Believing that Allah is everywhere by His essence is:	["The view of Ahl as-Sunnah.", "A statement of innovation contradicting the texts that establish Allah is above His Throne.", "Required for proper tawakkul.", "Mentioned in Sahih al-Bukhari."]	1	Ahl as-Sunnah believe Allah is above His Throne, above the seven heavens, separate from His creation, while His knowledge encompasses everything. The view that Allah is everywhere by His essence is an innovation contradicting many clear texts.	4
12	2	Will the believers see Allah on the Day of Resurrection?	["No, because the texts on this are metaphorical.", "Yes, with their eyes — this is a fundamental belief of Ahl as-Sunnah.", "Only the Prophets will see Him.", "Only in this world, not the next."]	1	Ahl as-Sunnah affirm the believers will see Allah with their eyes in the Hereafter. Allah said: 'Faces, that Day, will be radiant, looking at their Lord.' (Surah al-Qiyamah 75:22-23). The Prophet ﷺ said: 'You will see your Lord as you see this moon.' (Bukhari and Muslim)	5
13	3	The principle 'every innovation is misguidance' is taken from:	["An opinion of a later scholar.", "An authentic statement of the Prophet ﷺ.", "A weak narration not relied upon.", "A general philosophical maxim."]	1	The Prophet ﷺ said: 'Beware of newly invented matters, for every newly invented matter is an innovation, and every innovation is misguidance.' (Abu Dawud, at-Tirmidhi — authentic).	0
14	3	The 'saved sect' (al-Firqah an-Najiyah) is:	["Those who follow the political party closest to Islam.", "Those upon what the Prophet ﷺ and his Companions were upon.", "A specific tribe of the Arabs.", "Whoever holds the largest number of followers."]	1	When asked who the saved sect is, the Prophet ﷺ said: 'Those who are upon what I and my Companions are upon today.' (at-Tirmidhi). This is the manhaj of the Salaf as-Salih.	1
15	3	Concerning rulers, the manhaj of the Salaf is to:	["Rebel publicly when they sin.", "Hear and obey in what is good, sincerely advise them privately, and not publicly revolt against them.", "Curse them openly from the pulpits.", "Refuse to pray behind any of them."]	1	Many authentic hadith establish hearing and obeying the ruler in what is good, advising them privately, and avoiding public revolt — even if they oppress — to preserve the unity of the Muslims and avoid greater corruption.	2
16	3	Bid'ah hasanah (good innovation) in matters of religion is:	["An accepted concept by all of Ahl as-Sunnah.", "A category that contradicts the general statement 'every innovation is misguidance.'", "Found explicitly in the Qur'an.", "A teaching of the four imams."]	1	There is no such thing as bid'ah hasanah in matters of religion. The Prophet ﷺ said: 'every innovation is misguidance,' which is general and not restricted. What people sometimes call 'good innovation' either has a basis in the Sunnah (so it is not new) or it is rejected.	3
17	3	Takfir (declaring a Muslim a disbeliever) without right is:	["Permissible if many scholars agree.", "A grave matter; whoever calls his Muslim brother a disbeliever, it returns to one of them — as in the authentic hadith.", "Required when seeing a major sin.", "An innovation only if done in public."]	1	The Prophet ﷺ said: 'If a man says to his brother: O kafir! then surely one of them is such.' (Bukhari and Muslim). Takfir has strict conditions and impediments and is for the people of knowledge to apply, not the common Muslims.	4
18	3	Sources of legislation according to Ahl as-Sunnah are:	["Qur'an, Sunnah, consensus of the Ummah, and qiyas (analogy) — in that order of priority.", "Qur'an only; the Sunnah is secondary.", "Customs and traditions of one's land.", "Personal feeling and inspiration."]	0	The four agreed-upon sources are the Qur'an, the authentic Sunnah, the consensus of the Ummah (especially of the Companions), and qiyas — when employed correctly by the people of knowledge — in this order.	5
\.


--
-- Data for Name: tests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tests (id, title, description, level, created_at) FROM stdin;
1	Foundations of Tawheed	Test your understanding of the categories of Tawheed and its core principles.	beginner	2026-04-29 13:17:42.219292+00
2	The Names and Attributes of Allah	Questions on the creed of Ahl as-Sunnah regarding al-Asma' wa as-Sifat.	intermediate	2026-04-29 13:17:42.223946+00
3	The Methodology of the Salaf	Advanced questions on the manhaj of the first three generations and matters of bid'ah.	advanced	2026-04-29 13:17:42.228353+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, display_name, gender, country, bio, avatar_url, password_hash, password_salt, created_at, is_admin, is_main_admin, is_active, email) FROM stdin;
1	admin	Abu 'Abdillah	male	Madinah	Caretaker of this forum. May Allah accept from us all.	\N	594a5ec21c00c2efa103aeb45eb34763eee71229c650e8d2bf6a7eaba805da0e7f7d8ef5e0acd00492cb6bc4c3584de39b9c15268502c9c35b56bf9c71ef7893	e61e4567978b21b3a5acdb19d3e13e2e	2026-04-29 13:17:42.292222+00	t	t	t	\N
\.


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_id_seq', 8, true);


--
-- Name: chat_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_groups_id_seq', 6, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, false);


--
-- Name: meetings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meetings_id_seq', 6, true);


--
-- Name: password_resets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_resets_id_seq', 1, false);


--
-- Name: password_resets_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_resets_user_id_seq', 1, false);


--
-- Name: post_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_likes_id_seq', 1, false);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 2, true);


--
-- Name: stories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stories_id_seq', 1, false);


--
-- Name: test_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_attempts_id_seq', 1, false);


--
-- Name: test_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_questions_id_seq', 18, true);


--
-- Name: tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tests_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: chat_groups chat_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_groups
    ADD CONSTRAINT chat_groups_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_post_user_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_user_uniq UNIQUE (post_id, user_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: test_attempts test_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_pkey PRIMARY KEY (id);


--
-- Name: test_questions test_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_questions
    ADD CONSTRAINT test_questions_pkey PRIMARY KEY (id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: books_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX books_category_idx ON public.books USING btree (category);


--
-- Name: chat_groups_gender_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX chat_groups_gender_idx ON public.chat_groups USING btree (gender);


--
-- Name: chat_messages_created_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX chat_messages_created_idx ON public.chat_messages USING btree (created_at);


--
-- Name: chat_messages_group_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX chat_messages_group_idx ON public.chat_messages USING btree (group_id);


--
-- Name: meetings_kind_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meetings_kind_idx ON public.meetings USING btree (kind);


--
-- Name: meetings_scheduled_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX meetings_scheduled_idx ON public.meetings USING btree (scheduled_for);


--
-- Name: password_resets_expires_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_resets_expires_idx ON public.password_resets USING btree (expires_at);


--
-- Name: password_resets_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX password_resets_user_idx ON public.password_resets USING btree (user_id);


--
-- Name: post_likes_post_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX post_likes_post_idx ON public.post_likes USING btree (post_id);


--
-- Name: posts_created_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_created_idx ON public.posts USING btree (created_at);


--
-- Name: posts_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_user_idx ON public.posts USING btree (user_id);


--
-- Name: stories_expires_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stories_expires_idx ON public.stories USING btree (expires_at);


--
-- Name: stories_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stories_user_idx ON public.stories USING btree (user_id);


--
-- Name: test_attempts_test_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX test_attempts_test_idx ON public.test_attempts USING btree (test_id);


--
-- Name: test_attempts_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX test_attempts_user_idx ON public.test_attempts USING btree (user_id);


--
-- Name: test_questions_test_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX test_questions_test_idx ON public.test_questions USING btree (test_id);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_gender_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_gender_idx ON public.users USING btree (gender);


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: chat_messages chat_messages_group_id_chat_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_group_id_chat_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.chat_groups(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: meetings meetings_created_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_created_by_user_id_users_id_fk FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: post_likes post_likes_post_id_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stories stories_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_test_id_tests_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_test_id_tests_id_fk FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_attempts test_attempts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_attempts
    ADD CONSTRAINT test_attempts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: test_questions test_questions_test_id_tests_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_questions
    ADD CONSTRAINT test_questions_test_id_tests_id_fk FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict i5hDEKdBVzeOCXi1R41xyaTxggUMnO9KbaPhRTqAUpNUgDUSAKysb2jIz2wnTaD

