/**
 * StreamFlix — Player Module (fixed language + side-by-side modal)
 */
import {
    addToWatchlist,
    addDownload,
    addNotification
} from './userData.js';

import {
    getAvailableLanguages,
    getLang,
    getPreferredLang,
    buildEmbedUrl,
    setServer,
    getCurrentServer
} from './language.js';

import {
    imgUrl,
    fetchSeasons,
    fetchTVDetails,
    fetchRecommendations
} from './api.js';

import { saveWatch } from './watchHistory.js';
import { genreMap } from './api.js';

// Parent redirect protection for non-sandboxed players
window.preventRedirect = false;
window.addEventListener('beforeunload', (e) => {
  if (window.preventRedirect) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
});

let currentMedia  = null;
let currentSeason = 1;
let currentEp     = 1;
let currentLang   = getPreferredLang();
let allSeasons    = [];

const backdrop    = () => document.getElementById('modalBackdrop');
const iframe      = () => document.getElementById('playerIframe');
const placeholder = () => document.getElementById('playerPlaceholder');

function isTV(media){

    return (
        media.media_type === 'tv' ||
        media.first_air_date ||
        media.number_of_seasons
    );

}

function loadEmbed(season, ep) {
  const el = iframe();
  const ph = placeholder();
  el.style.display = 'none';
  ph.style.display = 'flex';
  ph.innerHTML = '<div class="spinner"></div><div style="font-size:13px;color:var(--muted);">Loading player…</div>';
  // Re-read current lang at load time to respect latest preference
  currentLang = getPreferredLang();

  // Disable sandbox ONLY for vidfast (SER3) because it refuses to play otherwise,
  // but keep it active for all other servers to block ads.
const server = getCurrentServer();

if (
    server === "server1" || // SER-ENG
    server === "vidfast"    // SER3
) {
    // No sandbox
    el.removeAttribute("sandbox");
    window.preventRedirect = true;
} else {
    // Sandbox ON
    el.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms"
    );
    window.preventRedirect = false;
}

  el.src = buildEmbedUrl(currentMedia, currentLang, season, ep);
  setTimeout(() => {
    ph.style.display = 'none';
    el.style.display = 'block';
  }, 1500);
}

/* ---- language bar ---- */
function renderLangBar(availCodes) {
  const bar = document.getElementById('modalLangBar');
  if (!availCodes.length) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';

  // Always include preferred lang first if available
  const preferred = getPreferredLang();
  currentLang = availCodes.includes(preferred) ? preferred : availCodes[0];

  const pills = availCodes.map(code => {
    const lang = getLang(code);
    return `<button class="lang-pill ${code === currentLang ? 'active' : ''}" data-lang="${code}">
      ${lang.flag} ${lang.name}
    </button>`;
  }).join('');

  document.getElementById('modalLangPills').innerHTML = pills;
  document.querySelectorAll('.lang-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      document.querySelectorAll('.lang-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadEmbed(currentSeason, currentEp);
    });
  });
}

/* ---- season / episode panel ---- */
function renderSeasonPanel(seasons) {
  const panel = document.getElementById('seasonPanel');
  const noMsg = document.getElementById('noEpisodesMsg');
  if (!seasons || !seasons.length) {
    panel.style.display = 'none';
    if (noMsg) noMsg.style.display = 'flex';
    return;
  }
  panel.style.display = 'block';
  if (noMsg) noMsg.style.display = 'none';
  allSeasons = seasons;

  const tabsEl = document.getElementById('seasonTabs');
  tabsEl.innerHTML = seasons.map((s, i) => `
    <button class="season-tab ${i === 0 ? 'active' : ''}" data-idx="${i}">
      S${s.season_number}
    </button>
  `).join('');

  tabsEl.querySelectorAll('.season-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsEl.querySelectorAll('.season-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSeason = allSeasons[+btn.dataset.idx].season_number;
      renderEpisodes(allSeasons[+btn.dataset.idx].episodes, currentSeason);
    });
  });

  currentSeason = seasons[0].season_number;
  renderEpisodes(seasons[0].episodes, currentSeason);
}

function renderEpisodes(episodes, seasonNum) {
  const listEl = document.getElementById('episodeList');
  if (!episodes || !episodes.length) {
    listEl.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:10px;">No episodes found.</div>';
    return;
  }
  listEl.innerHTML = episodes.map(ep => `
    <div class="episode-item ${seasonNum === currentSeason && ep.episode_number === currentEp ? 'playing' : ''}"
         data-season="${seasonNum}" data-ep="${ep.episode_number}">
      <span class="ep-num">${ep.episode_number}</span>
      <div class="ep-thumb">
        <img src="${ep.still_path ? 'https://image.tmdb.org/t/p/w185' + ep.still_path : ''}"
             alt="" onerror="this.style.display='none'">
        <div class="ep-play-icon">▶</div>
      </div>
      <div class="ep-info">
        <div class="ep-title">${ep.name || 'Episode ' + ep.episode_number}</div>
        <div class="ep-meta">${ep.runtime ? ep.runtime + ' min' : ''} ${ep.air_date ? '· ' + ep.air_date.slice(0,4) : ''}</div>
      </div>
      ${seasonNum === currentSeason && ep.episode_number === currentEp ? '<span class="ep-badge">▶</span>' : ''}
    </div>
  `).join('');

  listEl.querySelectorAll('.episode-item').forEach(item => {
    item.addEventListener('click', () => {
      const s = +item.dataset.season;
      const e = +item.dataset.ep;
      currentSeason = s;
      currentEp     = e;
      renderEpisodes(episodes, s);
      loadEmbed(s, e);
    });
  });
}

/* ---- open player ---- */
export async function openPlayer(media) {

    saveWatch(media);

    currentMedia = media;

    currentLang = getPreferredLang();
    currentSeason = 1;
    currentEp = 1;

   

    const bd = backdrop();

    bd.classList.add('open');

    iframe().style.display='none';

    placeholder().style.display='flex';

    placeholder().innerHTML=
    `
    <div class="spinner"></div>
    <div style="font-size:13px;color:var(--muted);">
    Loading...
    </div>
    `;

    document.getElementById(
        'modalTitle'
    ).textContent =
    media.title || media.name || '';

    const year =
    (
        media.release_date ||
        media.first_air_date ||
        ''
    ).slice(0,4);

    const rating =
    media.vote_average ?
    media.vote_average.toFixed(1)
    : 'N/A';

    const genres =
    (media.genre_ids || [])
    .map(
        id => genreMap[id]
    )
    .filter(Boolean)
    .join(', ');

    document.getElementById(
        'modalMeta'
    ).innerHTML =
    `
    <span>${year}</span>
    <span>|</span>
    <span class="star-badge">
    ⭐ ${rating}
    </span>
    <span>|</span>
    <span>
    ${genres || (isTV(media) ? 'TV Series':'Movie')}
    </span>
    `;

    document.getElementById(
        'modalOverview'
    ).textContent =
    media.overview || '';

    // Language bar
   const availLangs = [
    "en",
    "hi"
];

    renderLangBar(
        availLangs
    );

    document.querySelectorAll(".server-btn")
.forEach(btn => {

    btn.onclick = () => {

        setServer(btn.dataset.server);

        document
            .querySelectorAll(".server-btn")
            .forEach(b =>
                b.classList.remove("active")
            );

        btn.classList.add("active");

        loadEmbed(
            currentSeason,
            currentEp
        );
    };

});

    // Season panel reset
    // reset old episodes completely
const panel = document.getElementById('seasonPanel');
const noMsg = document.getElementById('noEpisodesMsg');
const episodeList = document.getElementById('episodeList');
const seasonTabs = document.getElementById('seasonTabs');
const recPanel = document.getElementById('modalRecommendations');

if(panel) panel.style.display='none';
if(recPanel) recPanel.style.display='none';

if(episodeList){
    episodeList.innerHTML='';
}

if(seasonTabs){
    seasonTabs.innerHTML='';
}

if(noMsg){
    noMsg.style.display='flex';
}


// Only load seasons for TV
if(isTV(media)){

    try{

        const details =
        await fetchTVDetails(media.id);

        const n =
        details.number_of_seasons || 1;

        const seasons =
        await fetchSeasons(
            media.id,
            Math.min(n,5)
        );

        renderSeasonPanel(seasons);

        panel.style.display='block';

    }catch(e){

        console.warn(
            'Could not load seasons',
            e
        );

    }

}else{

    // Movie → keep episode section hidden, but show Recommendations
    if(panel) panel.style.display='none';
    if(noMsg) noMsg.style.display='none';
    if(recPanel) {
        recPanel.style.display='flex';
        loadModalRecommendations(media);
    }
}

loadEmbed(1,1);

}

async function loadModalRecommendations(media) {
  const recPanel = document.getElementById('modalRecommendations');
  const recListEl = document.getElementById('modalRecommendationsList');
  if (!recPanel || !recListEl) return;

  recListEl.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div>';
  
  try {
    const type = isTV(media) ? 'tv' : 'movie';
    const recList = await fetchRecommendations(media.id, type);
    if (!recList || !recList.length) {
      recListEl.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:10px;">No recommendations found.</div>';
      return;
    }

    recListEl.innerHTML = recList.slice(0, 10).map(item => {
      const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      return `
        <div class="episode-item recommendation-item" style="margin-bottom: 8px;">
          <div class="ep-thumb" style="width: 70px; height: 40px; border-radius: 8px; overflow: hidden; background: #222; position: relative;">
            <img src="${item.poster_path ? 'https://image.tmdb.org/t/p/w185' + item.poster_path : ''}" alt="" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">
          </div>
          <div class="ep-info" style="flex: 1; min-width: 0;">
            <div class="ep-title" style="font-size: 13px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title || item.name}</div>
            <div class="ep-meta" style="font-size: 11px; color: var(--muted);">⭐ ${rating} · ${year}</div>
          </div>
        </div>
      `;
    }).join('');

    recListEl.querySelectorAll('.recommendation-item').forEach((element, idx) => {
      element.addEventListener('click', () => {
        const recommendedMedia = recList[idx];
        if (!recommendedMedia.media_type) {
          recommendedMedia.media_type = recommendedMedia.first_air_date || recommendedMedia.number_of_seasons ? 'tv' : 'movie';
        }
        openPlayer(recommendedMedia);
      });
    });
  } catch (err) {
    console.error('Failed to load recommendations for modal', err);
    recListEl.innerHTML = '<div style="font-size:13px;color:var(--muted);padding:10px;">Failed to load recommendations.</div>';
  }
}

/* ---- close ---- */
export function closePlayer() {
  window.preventRedirect = false; // Reset redirect prevention
  backdrop().classList.remove('open');
  iframe().src = '';
  iframe().style.display = 'none';
  placeholder().style.display = 'flex';
  placeholder().innerHTML = '<div class="spinner"></div><div style="font-size:13px;color:var(--muted);">Loading player…</div>';
  const panel = document.getElementById('seasonPanel');
  if (panel) panel.style.display = 'none';
}
