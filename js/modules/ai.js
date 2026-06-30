/**
 * StreamFlix — AI Movie Suggestion Module
 * Handles conversational queries, movie discovery, and layout management.
 */

import { imgUrl, searchMulti } from './api.js';
import { openPlayer } from './player.js';

// TMDB constants
const TMDB_KEY = '9e2a429cc4ef82f32ce8fbd9f9203cd1';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Keyword Map for Languages
const LANGUAGES = {
  hindi: 'hi', indian: 'hi', bollywood: 'hi', punjabi: 'pa',
  japanese: 'ja', japan: 'ja',
  korean: 'ko', korea: 'ko', kdrama: 'ko',
  spanish: 'es', spain: 'es',
  french: 'fr', france: 'fr',
  english: 'en', hollywood: 'en',
  tamil: 'ta', telugu: 'te'
};

// Keyword Map for Genres
const GENRES = {
  action: 28, fight: 28, combat: 28, war: 28,
  adventure: 12, quest: 12, journey: 12,
  animation: 16, animated: 16, cartoon: 16, disney: 16, pixar: 16,
  comedy: 35, funny: 35, laugh: 35, hilarious: 35,
  crime: 80, police: 80, detective: 80, heist: 80,
  documentary: 99,
  drama: 18, sad: 18, emotional: 18, tragedy: 18,
  kids: 10751,
  fantasy: 14, magic: 14, wizard: 14, witch: 14, spell: 14,
  history: 36, historical: 36,
  horror: 27, scary: 27, ghost: 27, zombie: 27, spooky: 27, demon: 27,
  music: 10402, musical: 10402,
  mystery: 9648, puzzle: 9648, solve: 9648,
  romance: 10749, love: 10749, romantic: 10749,
  'sci-fi': 878, scifi: 878, 'science fiction': 878, space: 878, alien: 878, galaxy: 878, stars: 878,
  thriller: 53, suspense: 53, tension: 53
};

// Popular Franchises / Characters Matcher
const FRANCHISES = [
  { keywords: ['harry potter', 'hogwarts', 'hermione', 'voldemort', 'dumbledore'], query: 'Harry Potter' },
  { keywords: ['spider-man', 'spiderman', 'peter parker', 'miles morales', 'spider man'], query: 'Spider-Man' },
  { keywords: ['jack sparrow', 'pirates of the caribbean', 'barbossa', 'black pearl'], query: 'Pirates of the Caribbean' },
  { keywords: ['iron man', 'tony stark', 'avengers', 'marvel', 'captain america', 'thor'], query: 'Avengers' },
  { keywords: ['batman', 'bruce wayne', 'joker', 'gotham', 'dark knight'], query: 'Batman' },
  { keywords: ['lord of the rings', 'frodo', 'gandalf', 'sauron', 'hobbit', 'middle earth'], query: 'Lord of the Rings' },
  { keywords: ['star wars', 'luke skywalker', 'darth vader', 'jedi', 'yoda'], query: 'Star Wars' },
  { keywords: ['shrek', 'donkey', 'fiona'], query: 'Shrek' }
];

// Conversational filler cleanup patterns
const FILLERS = [
  'suggest a movie like', 'suggest a movie about', 'suggest movies about',
  'suggest a movie', 'suggest movies', 'show me a movie where',
  'show me movies where', 'show me movies about', 'show me a movie about',
  'tell me a movie about', 'tell me movies about', 'give me a hint of',
  'a movie like', 'movies like', 'a movie about', 'movies about',
  'movie where', 'movies where', 'i want to watch', 'i want a movie',
  'can you suggest', 'can you show', 'find a movie', 'find movies', 'find me'
];

/**
 * Clean up conversational phrases to extract search keywords
 */
function cleanQueryText(query) {
  let cleaned = query.toLowerCase();
  for (const filler of FILLERS) {
    cleaned = cleaned.replace(filler, '');
  }
  return cleaned.trim();
}

/**
 * Fetch discovery items from TMDB based on genres and languages
 */
async function discoverMovies(genreIds, langCode, sortBy = 'popularity.desc', minVoteCount = 0, page = 1) {
  try {
    const url = new URL(`${TMDB_BASE}/discover/movie`);
    url.searchParams.set('api_key', TMDB_KEY);
    url.searchParams.set('sort_by', sortBy);
    url.searchParams.set('page', page);
    
    if (minVoteCount > 0) {
      url.searchParams.set('vote_count.gte', minVoteCount);
    }
    if (genreIds && genreIds.length > 0) {
      url.searchParams.set('with_genres', genreIds.join(','));
    }
    if (langCode) {
      url.searchParams.set('with_original_language', langCode);
    }
    
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Discover error:', err);
    return [];
  }
}

/**
 * Setup navigation and event listeners
 */
export function initAI() {
  const aiSidebarBtn = document.getElementById('aiSidebarBtn');
  const homeBtn = document.getElementById('homeBtn');
  const libraryPage = document.getElementById('libraryPage');
  const homeContent = document.querySelector('.home-content');
  const aiPage = document.getElementById('aiPage');
  const aiInput = document.getElementById('aiInput');
  const aiSubmitBtn = document.getElementById('aiSubmitBtn');
  const aiChatLog = document.getElementById('aiChatLog');

  if (!aiSidebarBtn) return;

  // Navigation: Go to AI Suggestion Page
  aiSidebarBtn.addEventListener('click', () => {
    // Hide home content and library content
    if (homeContent) homeContent.style.display = 'none';
    if (libraryPage) libraryPage.style.display = 'none';
    if (aiPage) aiPage.style.display = 'flex'; // Use flex to match responsive flex styling

    // Toggle active classes on sidebar
    document.querySelectorAll('.sicon').forEach(btn => btn.classList.remove('active'));
    aiSidebarBtn.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Wire up home button to deactivate AI button
  if (homeBtn) {
    const originalHomeClick = homeBtn.onclick;
    homeBtn.onclick = async (e) => {
      if (aiPage) aiPage.style.display = 'none';
      aiSidebarBtn.classList.remove('active');
      if (originalHomeClick) {
        await originalHomeClick(e);
      }
    };
    
    homeBtn.addEventListener('click', () => {
      if (aiPage) aiPage.style.display = 'none';
      aiSidebarBtn.classList.remove('active');
    });
  }

  // Handle setting input value from quick suggestion chips
  window.setAiInput = (text) => {
    if (aiInput) {
      aiInput.value = text;
      aiInput.focus();
    }
  };

  // Chat Submission Trigger
  const submitMessage = async () => {
    const text = aiInput.value.trim();
    if (!text) return;

    // Clear input
    aiInput.value = '';

    // Append User Message to Log
    appendMessage(text, 'user');

    // Append Bot Typing Indicator
    const typingId = appendTypingIndicator();

    try {
      // Process Suggestion Query
      const { responseText, movies } = await processQuery(text);

      // Remove typing indicator
      removeTypingIndicator(typingId);

      // Append Bot Response Text
      appendMessage(responseText, 'bot');

      // Render Movies Grid
      renderMoviesGrid(movies);
    } catch (err) {
      console.error(err);
      removeTypingIndicator(typingId);
      appendMessage("I ran into an issue connecting to the movie database. Please try again in a moment!", 'bot');
    }
  };

  if (aiSubmitBtn) {
    aiSubmitBtn.addEventListener('click', submitMessage);
  }

  if (aiInput) {
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitMessage();
      }
    });
  }
}

/**
 * Appends a message bubble to the chat log
 */
function appendMessage(text, sender) {
  const aiChatLog = document.getElementById('aiChatLog');
  if (!aiChatLog) return;

  const bubble = document.createElement('div');
  bubble.className = `ai-msg ai-msg-${sender}`;
  
  // Custom sender styling
  if (sender === 'user') {
    bubble.style.alignSelf = 'flex-end';
    bubble.style.maxWidth = '80%';
    bubble.style.background = 'linear-gradient(135deg, var(--accent), var(--accent2))';
    bubble.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    bubble.style.borderRadius = '16px 16px 4px 16px';
    bubble.style.padding = '12px 16px';
    bubble.style.fontSize = '14px';
    bubble.style.lineHeight = '1.5';
    bubble.style.color = 'white';
    bubble.style.boxShadow = '0 4px 12px var(--accent-glow)';
  } else {
    bubble.style.alignSelf = 'flex-start';
    bubble.style.maxWidth = '80%';
    bubble.style.background = 'rgba(255,255,255,0.05)';
    bubble.style.border = '1px solid rgba(255, 255, 255, 0.08)';
    bubble.style.borderRadius = '16px 16px 16px 4px';
    bubble.style.padding = '12px 16px';
    bubble.style.fontSize = '14px';
    bubble.style.lineHeight = '1.5';
    bubble.style.color = 'var(--text)';
  }

  bubble.innerHTML = text;
  aiChatLog.appendChild(bubble);
  aiChatLog.scrollTop = aiChatLog.scrollHeight;
}

/**
 * Appends a typing animation bubble
 */
function appendTypingIndicator() {
  const aiChatLog = document.getElementById('aiChatLog');
  if (!aiChatLog) return null;

  const typingId = 'typing-' + Date.now();
  const bubble = document.createElement('div');
  bubble.id = typingId;
  bubble.className = 'ai-msg ai-msg-bot typing-indicator';
  bubble.style.alignSelf = 'flex-start';
  bubble.style.maxWidth = '80%';
  bubble.style.background = 'rgba(255,255,255,0.05)';
  bubble.style.border = '1px solid rgba(255, 255, 255, 0.08)';
  bubble.style.borderRadius = '16px 16px 16px 4px';
  bubble.style.padding = '12px 16px';
  bubble.style.display = 'flex';
  bubble.style.gap = '4px';
  bubble.style.alignItems = 'center';

  bubble.innerHTML = `
    <span class="dot" style="width: 6px; height: 6px; background: var(--muted); border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both;"></span>
    <span class="dot" style="width: 6px; height: 6px; background: var(--muted); border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></span>
    <span class="dot" style="width: 6px; height: 6px; background: var(--muted); border-radius: 50%; display: inline-block; animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></span>
  `;

  aiChatLog.appendChild(bubble);
  aiChatLog.scrollTop = aiChatLog.scrollHeight;
  return typingId;
}

/**
 * Removes the typing bubble
 */
function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * Correct common typos before parsing
 */
function autocorrectTypos(text) {
  let corrected = text.toLowerCase();
  corrected = corrected.replace(/\bsugest\b/g, 'suggest');
  corrected = corrected.replace(/\bsugestion\b/g, 'suggestion');
  corrected = corrected.replace(/\breleated\b/g, 'related');
  corrected = corrected.replace(/\baprox\b/g, 'approx');
  corrected = corrected.replace(/\bcollagerichest\b/g, 'college richest');
  corrected = corrected.replace(/\bcollegerichest\b/g, 'college richest');
  corrected = corrected.replace(/\bcollage\b/g, 'college');
  corrected = corrected.replace(/\bcolage\b/g, 'college');
  corrected = corrected.replace(/\bcollge\b/g, 'college');
  corrected = corrected.replace(/\bakas[ha]+y\b/g, 'akshay');
  corrected = corrected.replace(/\bshahrukh\b/g, 'shah rukh');
  corrected = corrected.replace(/\bcalss\b/g, 'class');
  return corrected;
}

/**
 * Remove actor-specific phrase noise and prefixes recursively to isolate actor names
 */
function extractPotentialActorName(text) {
  let cleaned = text.toLowerCase().trim();
  
  // Clean conversational prefixes iteratively
  let prev = '';
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(/^(suggest me|suggest|give me|give|show me|show|find me|find|search|list of|list|approx|aprox|approx\.|aprox\.|approximate|approximately|about|\d+)\b/g, '').trim();
  }
  
  // Match patterns like "movies of [Actor]" or "films starring [Actor]"
  const afterPatterns = [
    /\b(movies of|films of|movies starring|films starring|movies with|films with|movies featuring|films featuring|acted by|featuring|starring|with|by)\s+(.+)$/i
  ];
  
  for (const regex of afterPatterns) {
    const match = cleaned.match(regex);
    if (match && match[2]) {
      return match[2].trim();
    }
  }
  
  // Match patterns like "[Actor] movies" or "[Actor] films"
  const beforePatterns = [
    /^(.+?)\s+\b(movies|movie|films|film|shows|show|series)\b$/i
  ];
  
  for (const regex of beforePatterns) {
    const match = cleaned.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Clean general noise words
  const noise = ['movies', 'movie', 'films', 'film', 'shows', 'show', 'series', 'actor', 'actress'];
  let remaining = cleaned;
  for (const word of noise) {
    remaining = remaining.replace(new RegExp('\\b' + word + '\\b', 'g'), '');
  }
  
  return remaining.trim();
}

/**
 * Call TMDB person search and credits endpoint
 */
async function searchActorMovies(name) {
  try {
    const searchUrl = new URL(`${TMDB_BASE}/search/person`);
    searchUrl.searchParams.set('api_key', TMDB_KEY);
    searchUrl.searchParams.set('query', name);
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (searchData.results && searchData.results.length > 0) {
      const person = searchData.results[0];
      // Only treat as high-confidence if popularity is substantial (>0.5)
      if (person.popularity > 0.5) {
        const creditsUrl = new URL(`${TMDB_BASE}/person/${person.id}/movie_credits`);
        creditsUrl.searchParams.set('api_key', TMDB_KEY);
        const creditsRes = await fetch(creditsUrl);
        const creditsData = await creditsRes.json();
        return {
          actorName: person.name,
          movies: creditsData.cast || []
        };
      }
    }
  } catch (err) {
    console.error('Error searching actor movies:', err);
  }
  return null;
}

// Stop words to clean conversational structure
const STOP_WORDS = new Set([
  'in', 'which', 'is', 'a', 'and', 'have', 'on', 'him', 'to', 'of', 'movie', 
  'movies', 'show', 'shows', 'series', 'the', 'for', 'about', 'with', 
  'starring', 'by', 'an', 'at', 'from', 'who', 'has', 'i', 'want', 'like',
  'suggest', 'find', 'some', 'he', 'she', 'they', 'are', 'go', 'goes', 'me', 'approx', 'aprox'
]);

/**
 * Filter out stop words and extract key terms
 */
function extractKeywords(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Main Suggestion matching logic
 */
async function processQuery(prompt) {
  // 1. Autocorrect common typos
  const correctedPrompt = autocorrectTypos(prompt);
  const lowerText = correctedPrompt.toLowerCase();

  // 2. Comma-separated Multiple Movies Search
  if (correctedPrompt.includes(',')) {
    // Clean and split by comma
    const parts = correctedPrompt.split(',').map(p => {
      let cleaned = p.toLowerCase().trim();
      // Strip common prefixes
      cleaned = cleaned.replace(/^(classic|legendary|best|popular)?\s*(sci-fi|action|comedy|horror|drama|thriller)?\s*(movies|films|shows)?\s*(like|such as|starring|with|featuring)\b/gi, '');
      cleaned = cleaned.replace(/^(suggest|give|show|find|search|list)\b/gi, '');
      return cleaned.trim();
    }).filter(p => p.length > 1);

    if (parts.length >= 2) {
      // Execute searches for each part in parallel
      const searchPromises = parts.map(q => searchMulti(q));
      const resultsArrays = await Promise.all(searchPromises);
      
      let uniqueMovies = [];
      const seenIds = new Set();
      
      // Merge results, prioritizing the top match of each part first to ensure variety!
      const maxResultsPerPart = 5;
      for (let i = 0; i < maxResultsPerPart; i++) {
        for (const results of resultsArrays) {
          if (results[i]) {
            const m = results[i];
            if (!m.id || seenIds.has(m.id)) continue;
            if (!m.poster_path) continue;
            seenIds.add(m.id);
            uniqueMovies.push(m);
          }
        }
      }

      // Add remaining results up to 50
      for (const results of resultsArrays) {
        for (const m of results) {
          if (!m.id || seenIds.has(m.id)) continue;
          if (!m.poster_path) continue;
          seenIds.add(m.id);
          uniqueMovies.push(m);
        }
      }

      uniqueMovies = uniqueMovies.slice(0, 100);

      if (uniqueMovies.length > 0) {
        return {
          responseText: `I found these movie recommendations matching your list! Tap on any poster to start watching.`,
          movies: uniqueMovies
        };
      }
    }
  }

  // 3. Actor / Person Search
  const potentialActor = extractPotentialActorName(correctedPrompt);
  if (potentialActor.length > 2) {
    const actorData = await searchActorMovies(potentialActor);
    if (actorData && actorData.movies.length > 0) {
      let uniqueMovies = [];
      const seenIds = new Set();
      for (const m of actorData.movies) {
        if (!m.id || seenIds.has(m.id)) continue;
        if (!m.poster_path) continue;
        seenIds.add(m.id);
        uniqueMovies.push(m);
      }
      uniqueMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      uniqueMovies = uniqueMovies.slice(0, 100); // Return up to 100 movies
      
      if (uniqueMovies.length > 0) {
        return {
          responseText: `I found these movies starring the actor **${actorData.actorName}**! Tap on any poster below to start watching.`,
          movies: uniqueMovies
        };
      }
    }
  }

  // 3. Detect language codes
  let detectedLang = null;
  let langName = '';
  for (const [key, code] of Object.entries(LANGUAGES)) {
    if (lowerText.includes(key)) {
      detectedLang = code;
      langName = key.charAt(0).toUpperCase() + key.slice(1);
      break;
    }
  }

  // 4. Detect genre IDs
  const detectedGenres = [];
  const genreNames = [];
  for (const [key, id] of Object.entries(GENRES)) {
    if (lowerText.includes(key) && !detectedGenres.includes(id)) {
      detectedGenres.push(id);
      genreNames.push(key.charAt(0).toUpperCase() + key.slice(1));
    }
  }

  // 5. Detect franchise keywords
  let franchiseQuery = null;
  for (const f of FRANCHISES) {
    for (const kw of f.keywords) {
      if (lowerText.includes(kw)) {
        franchiseQuery = f.query;
        break;
      }
    }
    if (franchiseQuery) break;
  }

  // Check if we have specific content keywords (words that are not stop-words, languages, or genres)
  const allKeywords = extractKeywords(correctedPrompt);
  const genreWords = new Set([
    'action', 'fight', 'combat', 'war', 'adventure', 'quest', 'journey',
    'animation', 'animated', 'cartoon', 'disney', 'pixar', 'comedy', 'funny',
    'laugh', 'hilarious', 'crime', 'police', 'detective', 'heist', 'documentary',
    'drama', 'sad', 'emotional', 'tragedy', 'kids', 'fantasy', 'magic', 'wizard',
    'witch', 'spell', 'history', 'historical', 'horror', 'scary', 'ghost', 'zombie',
    'spooky', 'demon', 'music', 'musical', 'mystery', 'romance', 'love', 'romantic',
    'sci-fi', 'scifi', 'science fiction', 'space', 'alien', 'galaxy', 'stars', 'thriller', 'suspense', 'tension',
    'hindi', 'indian', 'bollywood', 'punjabi', 'japanese', 'japan', 'korean', 'korea',
    'kdrama', 'spanish', 'spain', 'french', 'france', 'english', 'hollywood', 'tamil', 'telugu'
  ]);
  
  const contentKeywords = allKeywords.filter(word => !genreWords.has(word));
  const hasContentKeywords = contentKeywords.length > 0;

  // 6. Fetch movies from multiple endpoints
  let movieResults = [];
  const cleanedKeywords = cleanQueryText(correctedPrompt);

  // If a specific franchise matches, search for it first
  if (franchiseQuery) {
    const results = await searchMulti(franchiseQuery);
    movieResults.push(...results);
  }

  // Search using cleaned user keywords (if any remain)
  if (cleanedKeywords.length > 2) {
    const results = await searchMulti(cleanedKeywords);
    movieResults.push(...results);
  }

  // Run discover call if genre or language is specified
  // We run it if there are no content keywords, OR if a language is explicitly specified (so language discovery isn't bypassed)
  if ((detectedGenres.length > 0 || detectedLang) && (!hasContentKeywords || detectedLang)) {
    // Fetch pages 1, 2, and 3 in parallel for both popular and top-rated lists to include deeper search results (like classic comedy GOATs Hera Pheri, Dhamaal, etc.)
    const minVotes = (detectedLang === 'hi' || detectedLang === 'ta' || detectedLang === 'te') ? 15 : 150;
    
    const [pop1, pop2, pop3, best1, best2, best3] = await Promise.all([
      discoverMovies(detectedGenres, detectedLang, 'popularity.desc', 0, 1),
      discoverMovies(detectedGenres, detectedLang, 'popularity.desc', 0, 2),
      discoverMovies(detectedGenres, detectedLang, 'popularity.desc', 0, 3),
      discoverMovies(detectedGenres, detectedLang, 'vote_average.desc', minVotes, 1),
      discoverMovies(detectedGenres, detectedLang, 'vote_average.desc', minVotes, 2),
      discoverMovies(detectedGenres, detectedLang, 'vote_average.desc', minVotes, 3)
    ]);
    
    const latestPopular = [...pop1, ...pop2, ...pop3];
    const overallBest = [...best1, ...best2, ...best3];
    
    // 3. Alternate/Merge them to ensure a balanced grid of both latest and overall best!
    const discoverResults = [];
    const maxLen = Math.max(latestPopular.length, overallBest.length);
    const seenDiscoverIds = new Set();
    
    for (let i = 0; i < maxLen; i++) {
      if (latestPopular[i]) {
        const m = latestPopular[i];
        if (!seenDiscoverIds.has(m.id)) {
          seenDiscoverIds.add(m.id);
          discoverResults.push(m);
        }
      }
      if (overallBest[i]) {
        const m = overallBest[i];
        if (!seenDiscoverIds.has(m.id)) {
          seenDiscoverIds.add(m.id);
          discoverResults.push(m);
        }
      }
    }
    
    movieResults.push(...discoverResults);
  }

  // Deduplicate and filter results
  let uniqueMovies = [];
  const seenIds = new Set();
  
  for (const m of movieResults) {
    if (!m.id || seenIds.has(m.id)) continue;
    if (!m.poster_path) continue;
    const type = m.media_type || (m.title ? 'movie' : 'tv');
    if (type !== 'movie' && type !== 'tv') continue;
    
    seenIds.add(m.id);
    uniqueMovies.push(m);
  }

  // 7. Conversational Plot Fallback (Fuzzy Keyword Search)
  // Always run fallback if query is describing a plot or has content keywords
  const isPlotQuery = correctedPrompt.length > 20 || correctedPrompt.includes('crush') || correctedPrompt.includes('rich') || correctedPrompt.includes('poor') || correctedPrompt.includes('class') || hasContentKeywords;
  
  if (uniqueMovies.length === 0 || isPlotQuery) {
    const keywords = extractKeywords(correctedPrompt);
    if (keywords.length > 0) {
      const fallbackQueries = [];
      
      // Smart trope-specific query generation
      if (keywords.includes('college') || keywords.includes('school')) {
        const place = keywords.includes('college') ? 'college' : 'school';
        if (keywords.includes('rich') || keywords.includes('richest')) {
          fallbackQueries.push(`${place} rich girl`);
        }
        if (keywords.includes('poor') || keywords.includes('middle') || keywords.includes('class')) {
          fallbackQueries.push(`${place} poor boy`);
          fallbackQueries.push(`${place} middle class`);
        }
        fallbackQueries.push(`${place} crush`);
        fallbackQueries.push(`${place} romance`);
        fallbackQueries.push(`${place} love`);
      }
      if ((keywords.includes('rich') || keywords.includes('richest')) && (keywords.includes('poor') || keywords.includes('middle') || keywords.includes('class'))) {
        fallbackQueries.push('rich girl poor boy');
        fallbackQueries.push('rich girl middle class boy');
        fallbackQueries.push('rich poor romance');
      }
      
      // General fallbacks based on pairs of keywords
      if (keywords.length >= 2) {
        fallbackQueries.push(`${keywords[0]} ${keywords[1]}`);
        if (keywords.length >= 3) {
          fallbackQueries.push(`${keywords[0]} ${keywords[2]}`);
        }
      } else {
        fallbackQueries.push(keywords[0]);
      }

      // Execute fallback queries in parallel
      const fallbackPromises = fallbackQueries.map(q => searchMulti(q));
      const fallbackResultsArrays = await Promise.all(fallbackPromises);
      
      for (const results of fallbackResultsArrays) {
        for (const m of results) {
          if (!m.id || seenIds.has(m.id)) continue;
          if (!m.poster_path) continue;
          seenIds.add(m.id);
          uniqueMovies.push(m);
        }
      }
    }
  }

  // Filter by language strictly if specified
  if (detectedLang) {
    uniqueMovies = uniqueMovies.filter(m => {
      if (detectedLang === 'hi') {
        return m.original_language === 'hi' || 
               (m.origin_country && m.origin_country.includes('IN')) ||
               m.original_language === 'ta' || 
               m.original_language === 'te' || 
               m.original_language === 'ml' || 
               m.original_language === 'kn';
      }
      return m.original_language === detectedLang;
    });
  }

  // Sort by popularity only if it is a specific keyword search query
  // Keeps the alternated trending/classic order for general category suggestions
  if (hasContentKeywords || uniqueMovies.length === 0) {
    uniqueMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }
  uniqueMovies = uniqueMovies.slice(0, 100); // Return up to 100 movies

  // 8. Generate conversational AI text response
  let responseText = '';
  if (uniqueMovies.length === 0) {
    responseText = "I searched the database for matches but couldn't find anything matching that description. Could you try rephrasing or giving other details?";
  } else if (franchiseQuery) {
    responseText = `Aha! 🎬 I've pulled up the movies matching the **${franchiseQuery}** universe for you. Click on any card below to start watching!`;
  } else {
    const elements = [];
    if (langName) elements.push(`**${langName}** language`);
    if (genreNames.length > 0) elements.push(`**${genreNames.join(', ')}** genres`);
    
    if (elements.length > 0) {
      responseText = `I've scanned the archives for ${elements.join(' and ')} matches. Here are the top suggestions matching your description!`;
    } else {
      responseText = `I analyzed your prompt and found these movie recommendations matching your description. Tap on any poster to launch the player!`;
    }
  }

  return {
    responseText,
    movies: uniqueMovies
  };
}

/**
 * Render movies in the AI result grid
 */
function renderMoviesGrid(movies) {
  const grid = document.getElementById('aiMoviesGrid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; color: var(--muted); text-align: center; padding: 40px 0; font-size: 14px;">
        No movies found. Try describing something else!
      </div>
    `;
    return;
  }

  grid.innerHTML = movies.map((m, i) => {
    const rating = m.vote_average ? m.vote_average.toFixed(1) : null;
    return `
      <div class="hcard library-hcard" data-idx="${i}" style="margin: 0;">
        <div class="hcard-img-wrap">
          <img src="${imgUrl(m.poster_path, 'w342')}" alt="${m.title || m.name || ''}">
          ${rating ? `<div class="hcard-rating"><span class="hstar">★</span>${rating}</div>` : ''}
          <div class="hcard-play-overlay">▶</div>
        </div>
        <div class="hcard-title" style="text-align: left; max-width: 100%;">${m.title || m.name || ''}</div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.hcard').forEach((card, i) => {
    card.addEventListener('click', () => openPlayer(movies[i]));
  });
}
