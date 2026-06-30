/**
 * StreamFlix — API Module
 * Handles all TMDB API interactions.
 */

const TMDB_KEY = '9e2a429cc4ef82f32ce8fbd9f9203cd1';
const TMDB     = 'https://api.themoviedb.org/3';
const IMG      = 'https://image.tmdb.org/t/p/';

export const genreMap = {};

export function imgUrl(path, size = 'w500') {
  return path ? `${IMG}${size}${path}` : '';
}

async function get(endpoint, params = {}) {
  const url = new URL(`${TMDB}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  return res.json();
}

export async function fetchGenres() {
  const [mg, tg] = await Promise.all([
    get('/genre/movie/list'),
    get('/genre/tv/list'),
  ]);
  [...(mg.genres || []), ...(tg.genres || [])].forEach(g => (genreMap[g.id] = g.name));
}

export async function fetchTrending(type = 'all') {
  const data = await get(`/trending/${type}/week`);
  return data.results || [];
}

export async function fetchPopular(type = 'movie', page = 1) {
  const data = await get(`/${type}/popular`, { page });
  return data.results || [];
}

export async function fetchTopRatedTV() {
  const data = await get('/tv/top_rated');
  return data.results || [];
}

export async function searchMulti(query) {
  const data = await get('/search/multi', { query });
  return (data.results || []).filter(m => m.poster_path || m.backdrop_path);
}

export async function fetchByGenre(genreId, type = 'movie', lang = 'hi') {
  const params = {
    with_genres: genreId,
    sort_by: 'popularity.desc',
  };
  if (lang) {
    params.with_original_language = lang;
  }
  
  // Fetch 20 pages in parallel (20 pages * 20 results = 400 movies)
  const pages = Array.from({ length: 20 }, (_, i) => i + 1);
  const responses = await Promise.all(
    pages.map(page => get(`/discover/${type}`, { ...params, page }))
  );
  
  const items = [];
  for (const res of responses) {
    if (res && res.results) {
      items.push(...res.results);
    }
  }
  return items;
}

export async function fetchSeasons(tvId, numberOfSeasons) {
  const seasonNumbers = Array.from({ length: numberOfSeasons }, (_, i) => i + 1);
  const seasons = await Promise.all(
    seasonNumbers.map(n => get(`/tv/${tvId}/season/${n}`))
  );
  return seasons.filter(s => s && s.episodes && s.episodes.length);
}

export async function fetchTVDetails(tvId) {
  return get(`/tv/${tvId}`);
}

export async function fetchByLanguage(lang='en') {

    const data = await get(
        '/discover/movie',
        {
            with_original_language: lang,
            sort_by:'popularity.desc'
        }
    );

    return data.results || [];
}

export async function fetchTrendingByLanguage(lang='en') {

    const data = await get(
        '/discover/movie',
        {
            with_original_language: lang,
            sort_by:'popularity.desc'
        }
    );

    return data.results || [];
}

export async function fetchPopularByLanguage(lang='en') {

    const data = await get(
        '/discover/movie',
        {
            with_original_language: lang,
            sort_by:'vote_average.desc',
            vote_count_gte:100
        }
    );

    return data.results || [];
}

export async function fetchTVByLanguage(lang='en') {

    const data = await get(
        '/discover/tv',
        {
            with_original_language: lang,
            sort_by:'popularity.desc'
        }
    );

    return data.results || [];
}

export async function fetchAnimeSuggestions() {
    const data = await get(
        '/discover/tv',
        {
            with_genres: 16,
            with_original_language: 'ja',
            sort_by: 'popularity.desc'
        }
    );
    return data.results || [];
}

export async function fetchIndianMoviesByGenre(genreId, type = 'movie') {
  const queryType = genreId === 10764 ? 'tv' : type;
  const data = await get(`/discover/${queryType}`, {
    with_genres: genreId,
    with_origin_country: 'IN',
    sort_by: 'popularity.desc'
  });
  return data.results || [];
}

export async function fetchRecommendations(id, type = 'movie') {
    try {
        let data = await get(`/${type}/${id}/recommendations`);
        if (!data.results || data.results.length === 0) {
            data = await get(`/${type}/${id}/similar`);
        }
        return data.results || [];
    } catch (e) {
        console.warn('Failed to fetch recommendations', e);
        return [];
    }
}

export async function fetchSpiderMania() {
  try {
    const data = await get('/search/movie', { query: 'Spider-Man' });
    const results = data.results || [];
    return results.sort((a, b) => b.popularity - a.popularity);
  } catch (e) {
    console.warn('Failed to fetch Spider-Mania', e);
    return [];
  }
}

export async function fetchMarvelMultiverse() {
  try {
    const [moviesData, tvData] = await Promise.all([
      get('/discover/movie', { with_companies: '420', sort_by: 'popularity.desc' }),
      get('/discover/tv', { with_companies: '420', sort_by: 'popularity.desc' })
    ]);
    const movies = moviesData.results || [];
    const tv = (tvData.results || []).map(item => ({ ...item, media_type: 'tv' }));
    const combined = [...movies, ...tv];
    return combined.sort((a, b) => b.popularity - a.popularity);
  } catch (e) {
    console.warn('Failed to fetch Marvel Multiverse', e);
    return [];
  }
}

export async function fetchHarryPotterCollection() {
  try {
    const data = await get('/collection/1241');
    return data.parts || [];
  } catch (e) {
    console.warn('Failed to fetch Harry Potter collection', e);
    const searchData = await get('/search/movie', { query: 'Harry Potter' });
    return (searchData.results || []).filter(m => m.title && m.title.toLowerCase().includes('harry potter'));
  }
}
