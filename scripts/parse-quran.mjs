import { writeFileSync } from 'fs';

const SURAH_NAMES = [
  { number: 1,   name: "الفاتحة",    englishName: "Al-Fatiha",      verses: 7 },
  { number: 2,   name: "البقرة",     englishName: "Al-Baqara",      verses: 286 },
  { number: 3,   name: "آل عمران",  englishName: "Al-Imran",       verses: 200 },
  { number: 4,   name: "النساء",    englishName: "An-Nisa",        verses: 176 },
  { number: 5,   name: "المائدة",   englishName: "Al-Ma'ida",      verses: 120 },
  { number: 6,   name: "الأنعام",   englishName: "Al-An'am",       verses: 165 },
  { number: 7,   name: "الأعراف",   englishName: "Al-A'raf",       verses: 206 },
  { number: 8,   name: "الأنفال",   englishName: "Al-Anfal",       verses: 75 },
  { number: 9,   name: "التوبة",    englishName: "At-Tawba",       verses: 129 },
  { number: 10,  name: "يونس",      englishName: "Yunus",          verses: 109 },
  { number: 11,  name: "هود",       englishName: "Hud",            verses: 123 },
  { number: 12,  name: "يوسف",      englishName: "Yusuf",          verses: 111 },
  { number: 13,  name: "الرعد",     englishName: "Ar-Ra'd",        verses: 43 },
  { number: 14,  name: "إبراهيم",  englishName: "Ibrahim",        verses: 52 },
  { number: 15,  name: "الحجر",    englishName: "Al-Hijr",        verses: 99 },
  { number: 16,  name: "النحل",    englishName: "An-Nahl",        verses: 128 },
  { number: 17,  name: "الإسراء",  englishName: "Al-Isra",        verses: 111 },
  { number: 18,  name: "الكهف",    englishName: "Al-Kahf",        verses: 110 },
  { number: 19,  name: "مريم",     englishName: "Maryam",         verses: 98 },
  { number: 20,  name: "طه",       englishName: "Ta-Ha",          verses: 135 },
  { number: 21,  name: "الأنبياء",  englishName: "Al-Anbiya",      verses: 112 },
  { number: 22,  name: "الحج",     englishName: "Al-Hajj",        verses: 78 },
  { number: 23,  name: "المؤمنون", englishName: "Al-Mu'minun",    verses: 118 },
  { number: 24,  name: "النور",    englishName: "An-Nur",         verses: 64 },
  { number: 25,  name: "الفرقان",  englishName: "Al-Furqan",      verses: 77 },
  { number: 26,  name: "الشعراء",  englishName: "Ash-Shu'ara",    verses: 227 },
  { number: 27,  name: "النمل",    englishName: "An-Naml",        verses: 93 },
  { number: 28,  name: "القصص",    englishName: "Al-Qasas",       verses: 88 },
  { number: 29,  name: "العنكبوت", englishName: "Al-Ankabut",     verses: 69 },
  { number: 30,  name: "الروم",    englishName: "Ar-Rum",         verses: 60 },
  { number: 31,  name: "لقمان",    englishName: "Luqman",         verses: 34 },
  { number: 32,  name: "السجدة",   englishName: "As-Sajda",       verses: 30 },
  { number: 33,  name: "الأحزاب",  englishName: "Al-Ahzab",       verses: 73 },
  { number: 34,  name: "سبأ",      englishName: "Saba",           verses: 54 },
  { number: 35,  name: "فاطر",     englishName: "Fatir",          verses: 45 },
  { number: 36,  name: "يس",       englishName: "Ya-Sin",         verses: 83 },
  { number: 37,  name: "الصافات",  englishName: "As-Saffat",      verses: 182 },
  { number: 38,  name: "ص",        englishName: "Sad",            verses: 88 },
  { number: 39,  name: "الزمر",    englishName: "Az-Zumar",       verses: 75 },
  { number: 40,  name: "غافر",     englishName: "Ghafir",         verses: 85 },
  { number: 41,  name: "فصلت",     englishName: "Fussilat",       verses: 54 },
  { number: 42,  name: "الشورى",   englishName: "Ash-Shura",      verses: 53 },
  { number: 43,  name: "الزخرف",   englishName: "Az-Zukhruf",     verses: 89 },
  { number: 44,  name: "الدخان",   englishName: "Ad-Dukhan",      verses: 59 },
  { number: 45,  name: "الجاثية",  englishName: "Al-Jathiya",     verses: 37 },
  { number: 46,  name: "الأحقاف",  englishName: "Al-Ahqaf",       verses: 35 },
  { number: 47,  name: "محمد",     englishName: "Muhammad",       verses: 38 },
  { number: 48,  name: "الفتح",    englishName: "Al-Fath",        verses: 29 },
  { number: 49,  name: "الحجرات",  englishName: "Al-Hujurat",     verses: 18 },
  { number: 50,  name: "ق",        englishName: "Qaf",            verses: 45 },
  { number: 51,  name: "الذاريات", englishName: "Adh-Dhariyat",   verses: 60 },
  { number: 52,  name: "الطور",    englishName: "At-Tur",         verses: 49 },
  { number: 53,  name: "النجم",    englishName: "An-Najm",        verses: 62 },
  { number: 54,  name: "القمر",    englishName: "Al-Qamar",       verses: 55 },
  { number: 55,  name: "الرحمن",   englishName: "Ar-Rahman",      verses: 78 },
  { number: 56,  name: "الواقعة",  englishName: "Al-Waqia",       verses: 96 },
  { number: 57,  name: "الحديد",   englishName: "Al-Hadid",       verses: 29 },
  { number: 58,  name: "المجادلة", englishName: "Al-Mujadila",    verses: 22 },
  { number: 59,  name: "الحشر",    englishName: "Al-Hashr",       verses: 24 },
  { number: 60,  name: "الممتحنة", englishName: "Al-Mumtahina",   verses: 13 },
  { number: 61,  name: "الصف",     englishName: "As-Saf",         verses: 14 },
  { number: 62,  name: "الجمعة",   englishName: "Al-Jumu'a",      verses: 11 },
  { number: 63,  name: "المنافقون",englishName: "Al-Munafiqun",   verses: 11 },
  { number: 64,  name: "التغابن",  englishName: "At-Taghabun",    verses: 18 },
  { number: 65,  name: "الطلاق",   englishName: "At-Talaq",       verses: 12 },
  { number: 66,  name: "التحريم",  englishName: "At-Tahrim",      verses: 12 },
  { number: 67,  name: "الملك",    englishName: "Al-Mulk",        verses: 30 },
  { number: 68,  name: "القلم",    englishName: "Al-Qalam",       verses: 52 },
  { number: 69,  name: "الحاقة",   englishName: "Al-Haaqqa",      verses: 52 },
  { number: 70,  name: "المعارج",  englishName: "Al-Ma'arij",     verses: 44 },
  { number: 71,  name: "نوح",      englishName: "Nuh",            verses: 28 },
  { number: 72,  name: "الجن",     englishName: "Al-Jinn",        verses: 28 },
  { number: 73,  name: "المزمل",   englishName: "Al-Muzzammil",   verses: 20 },
  { number: 74,  name: "المدثر",   englishName: "Al-Muddaththir", verses: 56 },
  { number: 75,  name: "القيامة",  englishName: "Al-Qiyama",      verses: 40 },
  { number: 76,  name: "الإنسان",  englishName: "Al-Insan",       verses: 31 },
  { number: 77,  name: "المرسلات", englishName: "Al-Mursalat",    verses: 50 },
  { number: 78,  name: "النبأ",    englishName: "An-Naba",        verses: 40 },
  { number: 79,  name: "النازعات", englishName: "An-Nazi'at",     verses: 46 },
  { number: 80,  name: "عبس",      englishName: "Abasa",          verses: 42 },
  { number: 81,  name: "التكوير",  englishName: "At-Takwir",      verses: 29 },
  { number: 82,  name: "الانفطار", englishName: "Al-Infitar",     verses: 19 },
  { number: 83,  name: "المطففين", englishName: "Al-Mutaffifin",  verses: 36 },
  { number: 84,  name: "الانشقاق", englishName: "Al-Inshiqaq",    verses: 25 },
  { number: 85,  name: "البروج",   englishName: "Al-Buruj",       verses: 22 },
  { number: 86,  name: "الطارق",   englishName: "At-Tariq",       verses: 17 },
  { number: 87,  name: "الأعلى",   englishName: "Al-A'la",        verses: 19 },
  { number: 88,  name: "الغاشية",  englishName: "Al-Ghashiya",    verses: 26 },
  { number: 89,  name: "الفجر",    englishName: "Al-Fajr",        verses: 30 },
  { number: 90,  name: "البلد",    englishName: "Al-Balad",       verses: 20 },
  { number: 91,  name: "الشمس",    englishName: "Ash-Shams",      verses: 15 },
  { number: 92,  name: "الليل",    englishName: "Al-Layl",        verses: 21 },
  { number: 93,  name: "الضحى",    englishName: "Ad-Duhaa",       verses: 11 },
  { number: 94,  name: "الشرح",    englishName: "Ash-Sharh",      verses: 8 },
  { number: 95,  name: "التين",    englishName: "At-Tin",         verses: 8 },
  { number: 96,  name: "العلق",    englishName: "Al-Alaq",        verses: 19 },
  { number: 97,  name: "القدر",    englishName: "Al-Qadr",        verses: 5 },
  { number: 98,  name: "البينة",   englishName: "Al-Bayyina",     verses: 8 },
  { number: 99,  name: "الزلزلة",  englishName: "Az-Zalzala",     verses: 8 },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat",      verses: 11 },
  { number: 101, name: "القارعة",  englishName: "Al-Qari'a",      verses: 11 },
  { number: 102, name: "التكاثر",  englishName: "At-Takathur",    verses: 8 },
  { number: 103, name: "العصر",    englishName: "Al-Asr",         verses: 3 },
  { number: 104, name: "الهمزة",   englishName: "Al-Humaza",      verses: 9 },
  { number: 105, name: "الفيل",    englishName: "Al-Fil",         verses: 5 },
  { number: 106, name: "قريش",     englishName: "Quraysh",        verses: 4 },
  { number: 107, name: "الماعون",  englishName: "Al-Ma'un",       verses: 7 },
  { number: 108, name: "الكوثر",   englishName: "Al-Kawthar",     verses: 3 },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun",     verses: 6 },
  { number: 110, name: "النصر",    englishName: "An-Nasr",        verses: 3 },
  { number: 111, name: "المسد",    englishName: "Al-Masad",       verses: 5 },
  { number: 112, name: "الإخلاص",  englishName: "Al-Ikhlas",      verses: 4 },
  { number: 113, name: "الفلق",    englishName: "Al-Falaq",       verses: 5 },
  { number: 114, name: "الناس",    englishName: "An-Nas",         verses: 6 },
];

async function fetchQuranText() {
  const docId = "1RguTQMRU13IMVvYjkuE28zWNbzIJnqvG";
  const res = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
  return await res.text();
}

function parseQuranText(rawText) {
  // Clean up markdown links and extra whitespace
  let text = rawText
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '')  // Remove markdown links
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const surahs = [];

  // Split by surah headers "سورة ..."
  const surahPattern = /سورة\s+[\u0600-\u06FF\s]+/g;
  const surahMatches = [...text.matchAll(/\nسورة\s+([\u0600-\u06FF\u0020]+)/g)];

  // Find positions of each surah
  const positions = [];
  for (const match of surahMatches) {
    positions.push({ index: match.index, name: match[1].trim() });
  }
  // Add start of text for surah 1
  const firstSurah = text.indexOf('سورة الفاتحة');
  positions.unshift({ index: firstSurah, name: 'الفاتحة' });

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    const surahBlock = text.slice(start, end);

    const surahInfo = SURAH_NAMES[i];
    if (!surahInfo) continue;

    // Extract verses using pattern: text followed by (number)
    const verses = [];
    const versePattern = /(.+?)\s*\((\d+)\)/gs;
    let verseMatch;
    
    // Get the content after the surah header line and bismillah
    const lines = surahBlock.split('\n').filter(l => l.trim());
    const contentLines = lines.slice(1); // Skip surah header
    const content = contentLines.join(' ');
    
    // Parse verses - each verse ends with (number)
    const verseRegex = /([^(]+)\((\d+)\)/g;
    let lastIndex = 0;
    
    while ((verseMatch = verseRegex.exec(content)) !== null) {
      const verseText = verseMatch[1].trim();
      const verseNum = parseInt(verseMatch[2]);
      
      if (verseText && verseNum > 0) {
        // Skip bismillah line (it appears as verse 0 effectively for non-fatiha)
        if (verseText.includes('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ') && verseNum === 1 && i > 0) {
          verses.push({ number: verseNum, text: verseText.replace('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ', '').trim() || verseText });
        } else {
          verses.push({ number: verseNum, text: verseText });
        }
      }
    }

    if (verses.length > 0) {
      surahs.push({
        number: surahInfo.number,
        name: surahInfo.name,
        englishName: surahInfo.englishName,
        totalVerses: surahInfo.verses,
        verses: verses.slice(0, surahInfo.verses) // Cap at expected verse count
      });
    }
  }

  return { surahs, totalSurahs: surahs.length };
}

async function main() {
  console.log('Fetching Quran text...');
  const rawText = await fetchQuranText();
  console.log(`Fetched ${rawText.length} characters`);
  
  console.log('Parsing...');
  const quranData = parseQuranText(rawText);
  
  console.log(`Parsed ${quranData.totalSurahs} surahs`);
  quranData.surahs.forEach(s => {
    console.log(`  Surah ${s.number}: ${s.name} - ${s.verses.length} verses (expected ${s.totalVerses})`);
  });
  
  const outputPath = './client/public/data/quran.json';
  writeFileSync(outputPath, JSON.stringify(quranData, null, 2), 'utf8');
  console.log(`\nSaved to ${outputPath}`);
}

main().catch(console.error);
