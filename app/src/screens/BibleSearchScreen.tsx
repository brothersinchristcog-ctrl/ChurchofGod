import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, BookOpen, CheckSquare, Square, BookMarked } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const LOCAL_TELUGU_BIBLE: any = require('../../assets/telugu_bible.json');

const ENGLISH_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const TELUGU_NAMES = [
  'ఆదికాండము', 'నిర్గమకాండము', 'లేవీయకాండము', 'సంఖ్యాకాండము', 'ద్వితీయోపదేశకాండము',
  'యెహోషువ', 'న్యాయాధిపతులు', 'రూతు', '1 సమూయేలు', '2 సమూయేలు',
  '1 రాజులు', '2 రాజులు', '1 దినవృత్తాంతములు', '2 దినవృత్తాంతములు', 'ఎజ్రా',
  'నెహెమ్యా', 'ఎస్తేరు', 'యోబు', 'కీర్తనల గ్రంథము', 'సామెతలు',
  'ప్రసంగి', 'పరమగీతము', 'యెషయా', 'యిర్మియా', 'విలాపవాక్యములు',
  'యెహెజ్కేలు', 'దానియేలు', 'హోషేయ', 'యోవేలు', 'ఆమోసు',
  'ఓబద్యా', 'యోనా', 'మీకా', 'నహూము', 'హబక్కూకు',
  'జెఫన్యా', 'హగ్గయి', 'జెకర్యా', 'మలాకీ',
  'మత్తయి సువార్త', 'మార్కు సువార్త', 'లూకా సువార్త', 'యోహాను సువార్త', 'అపొస్తలుల కార్యములు',
  'రోమీయులకు వ్రాసిన పత్రిక', '1 కొరింథీయులకు', '2 కొరింథీయులకు', 'గలతీయులకు', 'ఎఫెసీయులకు',
  'ఫిలిప్పీయులకు', 'కొలొస్సయులకు', '1 థెస్సలొనీకయులకు', '2 థెస్సలొనీకయులకు', '1 తిమోతికి',
  '2 తిమోతికి', 'తీతుకు', 'ఫిలేమోనుకు', 'హెబ్రీయులకు', 'యాకోబు',
  '1 పేతురు', '2 పేతురు', '1 యోహాను', '2 యోహాను', '3 యోహాను',
  'యూదా', 'ప్రకటన గ్రంథము'
];

const HighlightText = ({ text, highlight, style, highlightStyle }: any) => {
  if (!highlight || !highlight.trim() || !text) return <Text style={style}>{text}</Text>;
  
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));
  
  return (
    <Text style={style}>
      {parts.map((part: string, i: number) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={i} style={highlightStyle}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
};

export default function BibleSearchScreen({ route, navigation }: any) {
  const { initialQuery, initialLang } = route.params || {};
  const { isDark } = useTheme();
  
  const [query, setQuery] = useState(initialQuery || '');
  const [lang, setLang] = useState<'English' | 'Telugu'>(initialLang || 'Telugu');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<Set<string>>(new Set());

  const toggleVerseSelection = (id: string) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSelectedVersesText = () => {
    return results
      .filter(r => selectedVerses.has(r.id))
      .map(r => {
        const ref = `${r.book} ${r.chapter}:${r.verse}`;
        const en = r.textEn ? `${r.textEn}` : '';
        const te = r.textTe ? `${r.textTe}` : '';
        return `📖 ${ref}\n${en}${en && te ? '\n' : ''}${te}`;
      })
      .join('\n\n');
  };

  const saveToSermonNotes = () => {
    const content = getSelectedVersesText();
    if (!content) return;
    navigation.navigate('MemberNotes', { prefillTitle: 'Bible Study Notes', prefillContent: content });
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      
      const isEnglishQuery = /[a-zA-Z]/.test(query);
      if (isEnglishQuery) {
        try {
          const transResponse = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(query)}&itc=te-t-i0-und&num=5`);
          if (transResponse.ok) {
            const transData = await transResponse.json();
            const suggestionsList = transData?.[1]?.[0]?.[1] || [];
            setSuggestions(suggestionsList);
          }
        } catch (e) {
          // silently ignore suggestion fetch errors
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const performSearch = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedVerses(new Set());

    try {
      let mergedResults: any[] = [];
      const isEnglishQuery = /[a-zA-Z]/.test(searchStr);

      if (isEnglishQuery) {
        // 1. Fetch English Meaning Search (Bolls API)
        try {
          const response = await fetch(`https://bolls.life/search/KJV/?search=${encodeURIComponent(searchStr)}&match_case=false&match_whole=false`);
          if (response.ok) {
            const data = await response.json();
            const mapped = data.map((item: any) => {
              const bookIndex = item.book - 1;
              const chapterIndex = item.chapter - 1;
              const verseIndex = item.verse - 1;
              
              let teluguText = '';
              if (LOCAL_TELUGU_BIBLE?.Book?.[bookIndex]?.Chapter?.[chapterIndex]?.Verse?.[verseIndex]) {
                teluguText = LOCAL_TELUGU_BIBLE.Book[bookIndex].Chapter[chapterIndex].Verse[verseIndex].Verse;
              }

              const bookNameEn = ENGLISH_NAMES[bookIndex] || `Book ${item.book}`;
              const bookNameTe = TELUGU_NAMES[bookIndex] || `Book ${item.book}`;
              const cleanEnText = item.text
                ? item.text.replace(/<S>\d*<\/S>/gi, '').replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim() 
                : '';

              return {
                id: `en-${item.book}-${item.chapter}-${item.verse}`,
                book: bookNameEn,
                bookTe: bookNameTe,
                bookIndex: item.book,
                chapter: item.chapter,
                verse: item.verse,
                textEn: cleanEnText,
                textTe: teluguText,
                langMatched: 'English',
                highlightEn: searchStr,
                highlightTe: ''
              };
            });
            mergedResults = [...mergedResults, ...mapped];
          }
        } catch (e) {
          console.warn("English search failed", e);
        }

        // 2. Transliterate and Search Local Telugu (Handles 'devudu' -> 'దేవుడు')
        try {
          const transResponse = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(searchStr)}&itc=te-t-i0-und&num=1`);
          if (transResponse.ok) {
            const transData = await transResponse.json();
            const transliteratedWord = transData?.[1]?.[0]?.[1]?.[0];
            
            if (transliteratedWord) {
              const localHits = searchLocalTelugu(transliteratedWord);
              // Merge but avoid duplicates
              localHits.forEach(hit => {
                if (!mergedResults.find(r => r.bookIndex === hit.bookIndex && r.chapter === hit.chapter && r.verse === hit.verse)) {
                  mergedResults.push(hit);
                }
              });
            }
          }
        } catch (e) {
          console.warn("Transliteration failed", e);
        }

        setResults(mergedResults);
      } else {
        // Search locally in Telugu directly
        setResults(searchLocalTelugu(searchStr));
      }
    } catch (err: any) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchLocalTelugu = (queryText: string) => {
    const localResults: any[] = [];
    const limit = 100;
    
    for (let b = 0; b < LOCAL_TELUGU_BIBLE.Book.length; b++) {
      const bookData = LOCAL_TELUGU_BIBLE.Book[b];
      for (let c = 0; c < bookData.Chapter.length; c++) {
        const chapterData = bookData.Chapter[c];
        for (let v = 0; v < chapterData.Verse.length; v++) {
          const verseData = chapterData.Verse[v];
          if (verseData.Verse.includes(queryText)) {
            localResults.push({
              id: `te-${b + 1}-${c + 1}-${v + 1}`,
              book: ENGLISH_NAMES[b] || `Book ${b + 1}`,
              bookTe: TELUGU_NAMES[b] || `Book ${b + 1}`,
              bookIndex: b + 1,
              chapter: c + 1,
              verse: v + 1,
              textEn: '', 
              textTe: verseData.Verse,
              langMatched: 'Telugu',
              highlightEn: '',
              highlightTe: queryText
            });
            if (localResults.length >= limit) return localResults;
          }
        }
      }
    }
    return localResults;
  };

  const handleVerseClick = (item: any) => {
    navigation.navigate('BibleReader', {
      bookName: item.book,
      chapter: item.chapter,
      lang: lang,
      targetVerse: item.verse
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Bible');
          }
        }}>
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verse Search</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#fff' : '#0f172a' }]}
          placeholder="Search words or phrases..."
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => performSearch(query)}
          returnKeyType="search"
          autoFocus={!initialQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Text style={styles.clearBtn}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View style={{ marginHorizontal: 20, marginBottom: 15 }}>
          <TouchableOpacity 
            style={[{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} 
            onPress={() => { setQuery(suggestions[0]); performSearch(suggestions[0]); setSuggestions([]); }}
          >
            <Text style={[styles.suggestionTxt, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
              {lang === 'English' ? 'Translate to Telugu: ' : ''}{suggestions[0]}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1a2d5a" />
            <Text style={[styles.loadingText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Searching scriptures...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : results.length > 0 ? (
          <View style={styles.resultsList}>
            <Text style={[styles.resultsCount, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Found {results.length} results
            </Text>
            {results.map((item) => {
              const isSelected = selectedVerses.has(item.id);
              return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.resultCard, { backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderWidth: isSelected ? 2 : 0, borderColor: isSelected ? '#1a2d5a' : 'transparent' }]}
                onPress={() => handleVerseClick(item)}
                onLongPress={() => toggleVerseSelection(item.id)}
                delayLongPress={300}
              >
                {/* Selection Checkbox */}
                <TouchableOpacity
                  style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
                  onPress={() => toggleVerseSelection(item.id)}
                >
                  {isSelected
                    ? <CheckSquare size={20} color="#1a2d5a" />
                    : <Square size={20} color="#cbd5e1" />}
                </TouchableOpacity>
                <View style={styles.referenceBadge}>
                  <BookOpen size={14} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.referenceText}>{item.book} {item.chapter}:{item.verse} · {item.bookTe} {item.chapter}:{item.verse}</Text>
                </View>
                
                {item.langMatched === 'English' && item.textEn ? (
                  <HighlightText 
                    text={item.textEn}
                    highlight={item.highlightEn}
                    style={[styles.verseTextEn, { color: isDark ? '#e2e8f0' : '#1e293b' }]}
                    highlightStyle={{ backgroundColor: 'rgba(250, 204, 21, 0.4)', color: isDark ? '#fde047' : '#854d0e', fontWeight: 'bold' }}
                  />
                ) : null}
                
                {item.textTe ? (
                  <HighlightText 
                    text={item.textTe}
                    highlight={item.highlightTe}
                    style={[styles.verseTextTe, { color: isDark ? '#cbd5e1' : '#475569', marginTop: item.langMatched === 'English' ? 8 : 0 }]}
                    highlightStyle={{ backgroundColor: 'rgba(250, 204, 21, 0.4)', color: isDark ? '#fde047' : '#854d0e', fontWeight: 'bold' }}
                  />
                ) : null}
              </TouchableOpacity>
              );
            })}
          </View>
        ) : query.length > 0 && !loading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.noResultsText, { color: isDark ? '#94a3b8' : '#64748b' }]}>No verses found.</Text>
          </View>
        ) : null}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Save to Sermon Notes Floating Button ── */}
      {selectedVerses.size > 0 && (
        <View style={styles.saveNotesBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.saveNotesCount}>{selectedVerses.size} verse{selectedVerses.size > 1 ? 's' : ''} selected</Text>
            <Text style={styles.saveNotesHint}>Tap to save to Sermon Notes</Text>
          </View>
          <TouchableOpacity style={styles.saveNotesBtn} onPress={saveToSermonNotes}>
            <BookMarked size={18} color="#fff" />
            <Text style={styles.saveNotesBtnTxt}>Save to Notes</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#1a2d5a',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600'
  },
  clearBtn: {
    fontSize: 20,
    color: '#94a3b8',
    paddingHorizontal: 5
  },
  emptySub: { fontSize: 13, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  suggestionTxt: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  centerContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600'
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600'
  },
  noResultsText: {
    fontSize: 15,
    fontWeight: '600'
  },
  resultsList: {
    marginTop: 10,
    gap: 15
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5
  },
  resultCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  referenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12
  },
  referenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800'
  },
  verseTextEn: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500'
  },
  verseTextTe: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '600'
  },
  saveNotesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2d5a',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  saveNotesCount: { color: '#fff', fontSize: 14, fontWeight: '800' },
  saveNotesHint: { color: '#aac4e8', fontSize: 11, marginTop: 2 },
  saveNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#c0392b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveNotesBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' }
});
