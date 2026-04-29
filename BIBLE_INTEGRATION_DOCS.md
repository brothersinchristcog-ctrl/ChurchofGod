# Church of God Mobile - Bible Integration Architecture

This document outlines the complete technical architecture and steps implemented for the Bible integration feature inside the COG Mobile app. It ensures high reliability, instant load times, and a premium reading experience for both Telugu and English speakers.

## 1. Overall Architecture: The "Hybrid Model"
To guarantee that the app never fails (even when external APIs are down or buggy), we implemented a **Hybrid Architecture**:
- **English Bible**: Uses an external, highly reliable API (`bolls.life`) to fetch scripture dynamically.
- **Telugu Bible**: Uses a complete, locally bundled offline database (`assets/telugu_bible.json`) containing all 66 books.

This architecture ensures maximum uptime, instant load speeds for local congregants, and fallback mechanisms.

---

## 2. English Implementation Steps (API Based)
1. **API Selection**: We used the `https://bolls.life/get-text/KJV/{book_id}/{chapter}/` endpoint.
2. **Book Mapping**: Mapped all 66 English book names (Genesis -> Revelation) to integer IDs (1 -> 66) using the `BOOK_MAP` dictionary.
3. **Data Cleaning (Strong's Numbers)**: 
   - The KJV API returns "Strong's Numbers" used by biblical scholars (e.g., `<S>7225</S>`).
   - We implemented a Regex cleaner (`text.replace(/<S>\d*<\/S>/gi, '').replace(/\s{2,}/g, ' ').trim()`) during the fetch process to strip these tags out instantly, presenting clean, beautiful text to the user.

---

## 3. Telugu Implementation Steps (Offline Local DB)
Since multiple Telugu APIs proved unreliable, we built a bulletproof local solution:
1. **Database Acquisition**: We downloaded the complete 66-book Telugu BSI Bible from a reliable GitHub repository.
2. **Local Bundling**: The full database was saved as `app/assets/telugu_bible.json`. This file is bundled inside the app, meaning it requires **zero internet connection** to read Telugu scriptures.
3. **Data Structure Parsing**:
   - The JSON is structured as an Array of 66 Books (`LOCAL_TELUGU_BIBLE.Book[0-65]`).
   - Each Book contains an Array of Chapters.
   - Each Chapter contains an Array of Verses (`Verseid`, `Verse`).
4. **Index Mapping**: We created `BOOK_INDEX_MAP` to connect the exact Telugu book names (e.g., "మత్తయి సువార్త") and English names directly to their 0-based array index (e.g., Matthew = 39).
5. **Instant Loading**: When a user selects a Telugu chapter, the app instantly reads from the device memory instead of waiting for a network request.

---

## 4. UI & Navigation Flow
1. **BibleScreen**: Displays the grid of 66 books, fully localized.
2. **BibleChaptersScreen**: Displays the exact number of chapters for the selected book (e.g., 50 for Genesis).
3. **BibleReaderScreen**: 
   - **Dual-Language Headers**: We updated the UI to show the full English name alongside the Telugu name (e.g., `Matthew · మత్తయి సువార్త`) so users always know exactly what book they are reading in full context.
   - **Loading/Error States**: Includes clear, localized loading spinners and retry buttons in case the English API is slow.

---

## 5. How to Maintain / Update
- **If English API fails**: The `BibleReaderScreen.tsx` has an array `versions = ['KJV', 'ASV']`. It will automatically fall back to another version if one fails.
- **Telugu Database**: It is permanently stored in `assets/telugu_bible.json` and will not break unless the file is deleted.
- **Book Mappings**: If you ever change the spelling of a Telugu book in `BibleScreen.tsx`, you must also update the exact spelling in the `BOOK_MAP` and `BOOK_INDEX_MAP` inside `BibleReaderScreen.tsx`.
