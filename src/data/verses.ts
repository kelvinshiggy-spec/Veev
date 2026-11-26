// Scripture: King James Version (public domain in the United States).
// Reflections are written for ELEVATE as gentle encouragement, not doctrine.

export type VerseTheme = "strength" | "temptation" | "peace" | "grace" | "anger" | "renewal" | "joy" | "wisdom" | "together" | "rest";

export interface Verse {
  ref: string;
  text: string;
  theme: VerseTheme;
  reflection: string;
  prayer: string;
}

export const VERSES: Verse[] = [
  {
    ref: "Lamentations 3:22–23",
    text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
    theme: "renewal",
    reflection: "Every morning is a clean page. Yesterday doesn't get the final word on today.",
    prayer: "Thank you for a new morning. Help me use it well.",
  },
  {
    ref: "Psalm 121:1–2",
    text: "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.",
    theme: "strength",
    reflection: "The same mountains you love have always been a picture of help that's bigger than the moment you're in.",
    prayer: "When I feel small, lift my eyes.",
  },
  {
    ref: "1 Corinthians 10:13",
    text: "There hath no temptation taken you but such as is common to man: but God is faithful, who will not suffer you to be tempted above that ye are able; but will with the temptation also make a way to escape, that ye may be able to bear it.",
    theme: "temptation",
    reflection: "A craving is not a command. There is always a way through, and sometimes it's as simple as waiting, calling someone, or walking away.",
    prayer: "Show me the way out tonight, and give me the courage to take it.",
  },
  {
    ref: "2 Timothy 1:7",
    text: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
    theme: "strength",
    reflection: "A sound mind is something worth protecting. Clear mornings are part of it.",
    prayer: "Give me power, love and a clear mind today.",
  },
  {
    ref: "Philippians 4:13",
    text: "I can do all things through Christ which strengtheneth me.",
    theme: "strength",
    reflection: "You don't have to find all the strength on your own. You only need to take the next right step.",
    prayer: "Strengthen me for the one thing in front of me.",
  },
  {
    ref: "Isaiah 41:10",
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
    theme: "strength",
    reflection: "Feeling alone and being alone are different things. Help is closer than the feeling says.",
    prayer: "Hold me up when I can't hold myself.",
  },
  {
    ref: "Psalm 46:1",
    text: "God is our refuge and strength, a very present help in trouble.",
    theme: "peace",
    reflection: "A refuge is a place you go, not a feeling you wait for. Prayer, a walk, a call to someone safe can all be refuge.",
    prayer: "Be my refuge right now.",
  },
  {
    ref: "Psalm 34:18",
    text: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
    theme: "grace",
    reflection: "Hurting doesn't push God away. Pain is often where people say they felt Him closest.",
    prayer: "Stay close while my heart heals.",
  },
  {
    ref: "Matthew 11:28",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    theme: "rest",
    reflection: "Alcohol promises rest and borrows it from tomorrow. Real rest doesn't send a bill.",
    prayer: "Give me real rest tonight.",
  },
  {
    ref: "Isaiah 40:31",
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    theme: "strength",
    reflection: "Waiting is a skill, not a weakness. Twenty minutes of waiting can change a whole night.",
    prayer: "Teach me to wait well.",
  },
  {
    ref: "Proverbs 3:5–6",
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    theme: "wisdom",
    reflection: "When a story in your head feels certain, it's worth holding it a little more loosely. You don't have to know everything tonight.",
    prayer: "Guide me where my own view is too narrow.",
  },
  {
    ref: "Jeremiah 29:11",
    text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
    theme: "renewal",
    reflection: "The future you're building, the family, the mountains, the peaceful home, is worth protecting one decision at a time.",
    prayer: "Help me trust that good things are ahead.",
  },
  {
    ref: "2 Corinthians 5:17",
    text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
    theme: "renewal",
    reflection: "You are not your worst night. You're allowed to become someone new.",
    prayer: "Make me new, and help me believe it.",
  },
  {
    ref: "Galatians 5:22–23",
    text: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.",
    theme: "peace",
    reflection: "Temperance sits right next to joy and peace. Self-control isn't the opposite of a good life; it's part of one.",
    prayer: "Grow these things in me today.",
  },
  {
    ref: "Psalm 23:1–3",
    text: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.",
    theme: "rest",
    reflection: "Still waters. A quiet evening can be a gift rather than something to escape.",
    prayer: "Lead me to still waters tonight.",
  },
  {
    ref: "Philippians 4:6–7",
    text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
    theme: "peace",
    reflection: "Name what's worrying you, and name one thing you're thankful for. Both at once is powerful.",
    prayer: "Here is what's on my heart. Please guard my mind.",
  },
  {
    ref: "John 14:27",
    text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.",
    theme: "peace",
    reflection: "The world's peace comes in a glass and wears off by morning. This kind lasts.",
    prayer: "Give me the peace that lasts.",
  },
  {
    ref: "Psalm 139:14",
    text: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.",
    theme: "joy",
    reflection: "Taking care of your body, your sleep, your mind, is a way of honoring how you were made.",
    prayer: "Help me treat myself with the care You do.",
  },
  {
    ref: "1 John 1:9",
    text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
    theme: "grace",
    reflection: "Honesty opens the door to a fresh start. Shame keeps it closed.",
    prayer: "I'm being honest. Help me start again.",
  },
  {
    ref: "Micah 7:8",
    text: "Rejoice not against me, O mine enemy: when I fall, I shall arise; when I sit in darkness, the LORD shall be a light unto me.",
    theme: "grace",
    reflection: "When I fall, I shall arise. A stumble is part of the story, not the end of it.",
    prayer: "Help me get back up.",
  },
  {
    ref: "Proverbs 24:16",
    text: "For a just man falleth seven times, and riseth up again.",
    theme: "grace",
    reflection: "Getting back up is what makes someone strong, not never falling.",
    prayer: "Give me grace to rise again.",
  },
  {
    ref: "James 1:5",
    text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
    theme: "wisdom",
    reflection: "You can ask for wisdom without being scolded for needing it.",
    prayer: "Give me wisdom for the decision in front of me.",
  },
  {
    ref: "James 1:19",
    text: "Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to wrath.",
    theme: "anger",
    reflection: "Swift to hear, slow to send. The message can wait until tomorrow morning.",
    prayer: "Slow me down before I speak.",
  },
  {
    ref: "Proverbs 15:1",
    text: "A soft answer turneth away wrath: but grievous words stir up anger.",
    theme: "anger",
    reflection: "Firm and soft can go together. You can protect yourself without escalating.",
    prayer: "Help my words build, not burn.",
  },
  {
    ref: "Ephesians 4:26",
    text: "Be ye angry, and sin not: let not the sun go down upon your wrath.",
    theme: "anger",
    reflection: "Anger is allowed. What you do with it is the choice.",
    prayer: "Let me feel this without being ruled by it.",
  },
  {
    ref: "Psalm 30:5",
    text: "Weeping may endure for a night, but joy cometh in the morning.",
    theme: "joy",
    reflection: "Hard nights end. Protecting tonight protects the morning.",
    prayer: "Carry me to the morning.",
  },
  {
    ref: "Romans 12:2",
    text: "And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
    theme: "renewal",
    reflection: "You don't have to celebrate the way everyone else does. Your way can be better.",
    prayer: "Renew my mind today.",
  },
  {
    ref: "Hebrews 4:16",
    text: "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.",
    theme: "grace",
    reflection: "Asking for help, from God or from people, is bold, not weak.",
    prayer: "I need help right now. Thank you that I can ask.",
  },
  {
    ref: "2 Corinthians 12:9",
    text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.",
    theme: "grace",
    reflection: "You don't have to be perfect to be loved, or to keep going.",
    prayer: "Let Your strength show up in my weak spots.",
  },
  {
    ref: "Isaiah 43:18–19",
    text: "Remember ye not the former things, neither consider the things of old. Behold, I will do a new thing; now it shall spring forth; shall ye not know it?",
    theme: "renewal",
    reflection: "Something new is already growing. Look for one sign of it today.",
    prayer: "Help me notice the new thing.",
  },
  {
    ref: "Psalm 118:24",
    text: "This is the day which the LORD hath made; we will rejoice and be glad in it.",
    theme: "joy",
    reflection: "Ordinary days are worth enjoying clear-headed.",
    prayer: "Help me enjoy today as it is.",
  },
  {
    ref: "Joshua 1:9",
    text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
    theme: "strength",
    reflection: "Wherever you go today, the dinner, the party, the hard conversation, you don't go alone.",
    prayer: "Go with me today.",
  },
  {
    ref: "Psalm 147:3",
    text: "He healeth the broken in heart, and bindeth up their wounds.",
    theme: "grace",
    reflection: "Healing usually happens slowly and quietly. It still counts.",
    prayer: "Heal what hurts.",
  },
  {
    ref: "Romans 8:1",
    text: "There is therefore now no condemnation to them which are in Christ Jesus.",
    theme: "grace",
    reflection: "Accountability, yes. Condemnation, no. Those are different things.",
    prayer: "Help me own my choices without hating myself.",
  },
  {
    ref: "Galatians 6:9",
    text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    theme: "strength",
    reflection: "The gym sessions, the early nights, the savings, the sober weekends: they're all adding up.",
    prayer: "Keep me going when progress feels slow.",
  },
  {
    ref: "Proverbs 16:32",
    text: "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.",
    theme: "anger",
    reflection: "Ruling your own spirit is a kind of strength most people never build.",
    prayer: "Help me rule my spirit today.",
  },
  {
    ref: "1 Peter 5:7",
    text: "Casting all your care upon him; for he careth for you.",
    theme: "rest",
    reflection: "You can set some of it down. You don't have to carry it into tonight.",
    prayer: "I'm setting this down with You.",
  },
  {
    ref: "Ecclesiastes 4:9–10",
    text: "Two are better than one; because they have a good reward for their labour. For if they fall, the one will lift up his fellow.",
    theme: "together",
    reflection: "Recovery isn't meant to be done alone. Who could you lean on this week?",
    prayer: "Thank you for the people who lift me up.",
  },
  {
    ref: "Zephaniah 3:17",
    text: "The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.",
    theme: "joy",
    reflection: "You are someone worth rejoicing over, today, as you are.",
    prayer: "Let me feel how loved I am.",
  },
  {
    ref: "Romans 15:13",
    text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
    theme: "joy",
    reflection: "Hope is allowed to grow. Let today add a little to it.",
    prayer: "Fill me with hope.",
  },
  {
    ref: "Deuteronomy 31:6",
    text: "Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.",
    theme: "strength",
    reflection: "He will not forsake thee. Fear of being abandoned is loud, but it isn't the whole truth.",
    prayer: "When I fear being left, remind me I'm held.",
  },
];

export const FAITH_IN_RECOVERY = [
  "Many people in recovery describe faith as a reminder that they don't have to carry everything alone.",
  "Prayer can be a pause: a few honest sentences before a decision gives your wiser self a chance to speak.",
  "Grace doesn't remove accountability. It removes the shame that makes it hard to start again.",
  "Gratitude is one of the oldest spiritual practices, and one of the most practical ways to shift a mood.",
  "Faith communities can be a source of sober friendship, service and celebration.",
  "Some days faith feels strong and some days it doesn't. Showing up still counts.",
];

export function verseFor(dayIndex: number, tone: "default" | "hard" | "lapse" | "craving" | "anger" = "default"): Verse {
  const pool =
    tone === "lapse"
      ? VERSES.filter((v) => v.theme === "grace")
      : tone === "craving"
        ? VERSES.filter((v) => v.theme === "temptation" || v.theme === "strength")
        : tone === "anger"
          ? VERSES.filter((v) => v.theme === "anger" || v.theme === "wisdom")
          : tone === "hard"
            ? VERSES.filter((v) => ["peace", "rest", "grace", "strength"].includes(v.theme))
            : VERSES;
  return pool[Math.abs(dayIndex) % pool.length];
}
