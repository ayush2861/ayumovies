/**
 * StreamFlix — App Entry Point

import {
imgUrl,
fetchGenres,
fetchTrending,
fetchPopular,
fetchTopRatedTV,
fetchByGenre,
searchMulti,
fetchTrendingByLanguage,
fetchPopularByLanguage,
fetchTVByLanguage,
fetchAnimeSuggestions
}
from './modules/api.js';
import { login, signup, demoLogin, logout, getSession } from './modules/auth.js';
import { openPlayer, closePlayer } from './modules/player.js';
import { setHero, renderRow, renderContinueWatching, renderSearchResults } from './modules/render.js';
import { SUPPORTED_LANGUAGES, getPreferredLang, setPreferredLang, getLang } from './modules/language.js';
/* ============================================================
   LOGIN
  
   ============================================================ */

   import {
  imgUrl,
  fetchGenres,
  fetchTrending,
  fetchPopular,
  fetchTopRatedTV,
  fetchByGenre,
  searchMulti,
  fetchTrendingByLanguage,
  fetchPopularByLanguage,
  fetchTVByLanguage,
  fetchAnimeSuggestions,
  fetchIndianMoviesByGenre,
  fetchSpiderMania,
  fetchMarvelMultiverse,
  fetchHarryPotterCollection
}
from './modules/api.js';

import {
login,
signup,
demoLogin,
logout,
getSession
}
from './modules/auth.js';

import {
openPlayer,
closePlayer
}
from './modules/player.js';

import {
setHero,
renderRow,
renderContinueWatching,
renderSearchResults
}
from './modules/render.js';

import {
SUPPORTED_LANGUAGES,
getPreferredLang,
setPreferredLang,
getLang
}
from './modules/language.js';

import { initAI } from './modules/ai.js';

function showApp() {

  document.getElementById(
    'loginPage'
  ).style.display='none';

  document.getElementById(
    'appShell'
  ).style.display='block';

  const session =
  getSession();

  if(session){

    document.getElementById(
      'userNameDisplay'
    ).textContent=
    session.name;

    document.getElementById(
      'avatarDisplay'
    ).textContent=
    session.avatar || session.initials;

  }

  // HOME BUTTON
  const homeBtn =
  document.querySelector(
    '.sicon[title="Home"]'
  );

  if(homeBtn){

    homeBtn.onclick =
    async ()=>{

      window.scrollTo({
        top:0,
        behavior:'smooth'
      });

      document.getElementById('libraryPage').style.display = 'none';
      document.querySelector('.home-content').style.display = 'block';

      await init();
    };

  }

}

function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('appShell').style.display  = 'none';
}

function initLogin() {
  const form    = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const demoBtn = document.getElementById('demoBtn');
  const signupBtn =
document.querySelector('.login-link');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const result   = login(email, password);
    if (result.ok) {
      errorEl.style.display = 'none';
      showApp();
      initLangPicker();
      initUserMenu();
      initProfileModal();
      init();
    } else {
      errorEl.textContent   = result.error;
      errorEl.style.display = 'block';
    }
  });
  signupBtn.addEventListener('click', () => {

    const email =
    document.getElementById(
        'loginEmail'
    ).value.trim();

    const password =
    document.getElementById(
        'loginPassword'
    ).value;

    const result =
    signup(email,password);

    if(result.ok){

        errorEl.style.display='block';

        errorEl.style.color='#22c55e';

        errorEl.textContent=
        'Account created successfully! Now sign in.';
    }

    else{

        errorEl.style.display='block';

        errorEl.style.color='#ef4444';

        errorEl.textContent=
        result.error;
    }

});

  demoBtn.addEventListener('click', () => {
    demoLogin();
    errorEl.style.display = 'none';
    showApp();
    initLangPicker();
    initUserMenu();
    initProfileModal();
    init();
  });
}

/* ============================================================
   LANGUAGE PICKER
   ============================================================ */
function initLangPicker() {

  const picker = document.getElementById('langPicker');
  const dropdown = document.getElementById('langDropdown');
  const flagEl = document.getElementById('langFlag');
  const codeEl = document.getElementById('langCode');

  const current = getLang(
    getPreferredLang()
  );

  flagEl.textContent =
  current.flag;

  codeEl.textContent =
  current.code.toUpperCase();

  dropdown.innerHTML =
  SUPPORTED_LANGUAGES.map(lang => `

    <div
      class="lang-option"
      data-code="${lang.code}"
    >

      <span>${lang.flag}</span>

      <span>
      ${lang.name}
      </span>

    </div>

  `).join('');

  // open/close dropdown
  picker.onclick = (e) => {

      e.stopPropagation();

      dropdown.classList.toggle(
        'open'
      );

  };

  // select language
  dropdown
  .querySelectorAll(
    '.lang-option'
  )
  .forEach(opt => {

    opt.onclick =
    async () => {

      const code =
      opt.dataset.code;

      setPreferredLang(
        code
      );

      const lang =
      getLang(code);

      flagEl.textContent =
      lang.flag;

      codeEl.textContent =
      lang.code.toUpperCase();

      await init();

      dropdown.classList.remove(
        'open'
      );

    };

  });

  document.onclick =
  () => {

      dropdown.classList.remove(
        'open'
      );

  };

}

/* ============================================================
   USER DROPDOWN
   ============================================================ */
function initUserMenu() {
  const chip     = document.getElementById('userChip');
  const dropdown = document.getElementById('userDropdown');

  const newChip = chip.cloneNode(true);
  chip.parentNode.replaceChild(newChip, chip);

  document.getElementById('userChip').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('userDropdown').classList.toggle('open');
  });
  document.addEventListener('click', () => {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('open');
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    showLogin();
  });
}

/* ============================================================
   HOME BUTTON
============================================================ */

/* ============================================================
   HOME BUTTON
============================================================ */

function initHomeButton(){

    const homeBtn =
    document.getElementById(
        'homeBtn'
    );

    if(!homeBtn){
        return;
    }

    homeBtn.addEventListener(
        'click',
        async ()=>{

            document.getElementById('libraryPage').style.display = 'none';
            document.querySelector('.home-content').style.display = 'block';

            await init();

            window.scrollTo({
                top:0,
                behavior:'smooth'
            });

        }
    );

}
/* ============================================================
   MODAL
   ============================================================ */
function initModal() {
  document.getElementById('modalClose').addEventListener('click', closePlayer);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBackdrop')) closePlayer();
  });
}

/* ============================================================
   HERO ROTATION
   ============================================================ */
let trendingMovies = [], heroIdx = 0, heroInterval;

function startHeroRotation() {
  clearInterval(heroInterval);
  heroInterval = setInterval(() => {
    heroIdx = (heroIdx + 1) % Math.min(trendingMovies.length, 8);
    setHero(trendingMovies[heroIdx]);
  }, 6000);
}

function initHeroNav() {
  document.getElementById('heroPrev').addEventListener('click', () => {
    heroIdx = (heroIdx - 1 + trendingMovies.length) % Math.min(trendingMovies.length, 8);
    setHero(trendingMovies[heroIdx]);
    startHeroRotation();
  });
  document.getElementById('heroNext').addEventListener('click', () => {
    heroIdx = (heroIdx + 1) % Math.min(trendingMovies.length, 8);
    setHero(trendingMovies[heroIdx]);
    startHeroRotation();
  });
}

/* ============================================================
   ROW ARROWS
   ============================================================ */
function initRowArrows() {
  document.querySelectorAll('.row-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const rowId = btn.dataset.row;
      const row = document.getElementById(rowId);
      if (!row) return;
      const dir = btn.classList.contains('row-arrow-right') ? 1 : -1;
      row.scrollBy({ left: dir * 700, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   NAV TABS
   ============================================================ */
function initNavTabs() {

  document.querySelectorAll('.nav-tab')
  .forEach(btn=>{

    btn.addEventListener(
      'click',
      async function(){

        document
        .querySelectorAll('.nav-tab')
        .forEach(
          b=>b.classList.remove('active')
        );

        this.classList.add('active');

        const type =
        this.dataset.type;
        const lang = getPreferredLang();

        // TV Series
        if(type==="tv"){

          const trending =
          await fetchTVByLanguage(lang);

          const popular =
          await fetchTVByLanguage(lang);

          renderRow(
            "trendingList",
            trending
          );

          renderRow(
            "seriesList",
            popular
          );

        }

        // Animation
        else if(type==="animation"){

          const animation =
          await fetchByGenre(
            16,
            "movie",
            lang
          );

          renderRow(
            "trendingList",
            animation
          );

          renderRow(
            "moviesList",
            animation
          );

        }

        // Anime
        else if(type==="anime"){

          const anime =
          await fetchAnimeSuggestions();

          renderRow(
            "trendingList",
            anime
          );

          renderRow(
            "moviesList",
            anime
          );

        }

        // Movies
        else{

          const trending =
          await fetchTrendingByLanguage(
            lang
          );

          const popular =
          await fetchPopularByLanguage(
            lang
          );

          renderRow(
            "trendingList",
            trending
          );

          renderRow(
            "moviesList",
            popular
          );

        }

      }
    );

  });

}

/* ============================================================
   CATEGORY CARDS
   ============================================================ */
function initCategoryCards() {
  const cards = document.querySelectorAll('.category-card');
  const libraryPage = document.getElementById('libraryPage');
  const homeContent = document.querySelector('.home-content');
  const libraryTitle = document.getElementById('libraryTitle');
  const libraryMovies = document.getElementById('libraryMovies');
  const backBtn = document.getElementById('backHomeBtn');

  cards.forEach(card => {
    card.addEventListener('click', async () => {
      const genreId = card.dataset.genre;
      const genreName = card.dataset.name;
      const type = card.dataset.type || 'movie';

      // Show library page and hide home page
      homeContent.style.display = 'none';
      libraryPage.style.display = 'block';
      libraryTitle.textContent = `${genreName} Movies`;
      
      // Render skeleton/loading text
      libraryMovies.innerHTML = '<div style="color:var(--muted); padding:20px;">Loading...</div>';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const lang = getPreferredLang();
        let items = [];
        if (genreId === '878') {
          items = await fetchByGenre(genreId, 'movie', '');
          libraryTitle.textContent = `${genreName} Movies`;
        } else if (card.classList.contains('reality') || type === 'tv') {
          items = await fetchByGenre(genreId, 'tv', lang);
          libraryTitle.textContent = `${genreName} Shows`;
        } else {
          items = await fetchByGenre(genreId, 'movie', lang);
          libraryTitle.textContent = `${genreName} Movies`;
        }

        if (!items || items.length === 0) {
          libraryMovies.innerHTML = '<div style="color:var(--muted); padding:20px;">No content found</div>';
          return;
        }

        libraryMovies.innerHTML = items.map((m, i) => {
          const rating = m.vote_average ? m.vote_average.toFixed(1) : null;
          return `
            <div class="hcard library-hcard" data-idx="${i}">
              <div class="hcard-img-wrap">
                <img src="${imgUrl(m.poster_path, 'w342')}" alt="${m.title || m.name || ''}">
                ${rating ? `<div class="hcard-rating"><span class="hstar">★</span>${rating}</div>` : ''}
                <div class="hcard-play-overlay">▶</div>
              </div>
              <div class="hcard-title">${m.title || m.name || ''}</div>
            </div>
          `;
        }).join('');

        libraryMovies.querySelectorAll('.hcard').forEach((cardEl, i) => {
          cardEl.addEventListener('click', () => openPlayer(items[i]));
        });
      } catch (err) {
        console.error(err);
        libraryMovies.innerHTML = '<div style="color:red; padding:20px;">Error loading content</div>';
      }
    });
  });

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      libraryPage.style.display = 'none';
      homeContent.style.display = 'block';
    });
  }
}

/* ============================================================
   SEARCH
   ============================================================ */
function initSearch() {
  const input = document.getElementById('searchInput');
  const panel = document.getElementById('searchPanel');
  let timer;

  input.addEventListener('input', function () {
    clearTimeout(timer);
    const q = this.value.trim();
    if (!q) { panel.classList.remove('open'); return; }
    timer = setTimeout(async () => {
      const results = await searchMulti(q);
      renderSearchResults(results.slice(0, 6));
    }, 400);
  });

  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && e.target !== input) panel.classList.remove('open');
  });
}

/* ============================================================
   MAIN INIT
   ============================================================ */
async function init() {
  await fetchGenres();
  const langCode = getPreferredLang();
  const langName = getLang(langCode).name;

  const [trending, popular, topTV, popularTV, thrillerMovies, romanceMovies, comedyMovies, scaryMovies, spiderMania, marvelMultiverse, harryPotter] = await Promise.all([
    fetchTrendingByLanguage(langCode),
    fetchPopularByLanguage(langCode),
    fetchTopRatedTV(),
    fetchTVByLanguage(langCode),
    fetchByGenre(53, 'movie', langCode),      // Thriller (53)
    fetchByGenre(10749, 'movie', langCode),   // Romance (10749)
    fetchByGenre(35, 'movie', langCode),      // Comedy (35)
    fetchByGenre(27, 'movie', langCode),      // Horror (27)
    fetchSpiderMania(),
    fetchMarvelMultiverse(),
    fetchHarryPotterCollection()
  ]);

  trendingMovies = trending;
  heroIdx = 0;
  if (trendingMovies.length) {
    setHero(trendingMovies[0]);
    startHeroRotation();
  }

  // Update header titles dynamically
  const thrillerTitle = document.getElementById('thrillerSectionTitle');
  if (thrillerTitle) thrillerTitle.innerHTML = `<span class="row-bar"></span> ${langName} Thrillers`;

  const romanceTitle = document.getElementById('romanceSectionTitle');
  if (romanceTitle) romanceTitle.innerHTML = `<span class="row-bar"></span> ${langName} Romance`;

  const comedyTitle = document.getElementById('comedySectionTitle');
  if (comedyTitle) comedyTitle.innerHTML = `<span class="row-bar"></span> ${langName} Comedy`;

  const scaryTitle = document.getElementById('scarySectionTitle');
  if (scaryTitle) scaryTitle.innerHTML = `<span class="row-bar"></span> Oof, That's Scary (${langName})`;

  renderRow('trendingList', trending);
  renderRow('seriesList', popularTV);
  renderRow('moviesList', popular);
  renderRow('indianThrillerList', thrillerMovies);
  renderRow('indianRomanceList', romanceMovies);
  renderRow('indianComedyList', comedyMovies);
  renderRow('scaryList', scaryMovies);
  renderRow('spiderManiaList', spiderMania);
  renderRow('marvelMultiverseList', marvelMultiverse);
  renderRow('harryPotterList', harryPotter);
  renderContinueWatching(trending);
}

/* ============================================================
   PROFILE EDITING MODAL
   ============================================================ */
function initProfileModal() {
  const profileModal = document.getElementById('profileModal');
  const profileModalClose = document.getElementById('profileModalClose');
  const profileNameInput = document.getElementById('profileNameInput');
  const profileCustomAvatarInput = document.getElementById('profileCustomAvatarInput');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const avatarOptions = document.querySelectorAll('.avatar-option-circle');

  // Trigger buttons: Profile in sidebar, Profile in dropdown
  const profileSidebarBtn = document.getElementById('profileBtn');
  const profileDropdownBtn = document.getElementById('myProfileDropdownBtn');

  let selectedAvatar = '';

  // Handle avatar selection clicks
  avatarOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      avatarOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedAvatar = opt.dataset.avatar;
      if (profileCustomAvatarInput) profileCustomAvatarInput.value = '';
    });
  });

  // Handle keyboard custom avatar typing
  if (profileCustomAvatarInput) {
    profileCustomAvatarInput.addEventListener('input', () => {
      const val = profileCustomAvatarInput.value.trim();
      if (val) {
        avatarOptions.forEach(o => o.classList.remove('selected'));
        selectedAvatar = val;
      } else {
        const items = Array.from(avatarOptions);
        if (items.length) {
          items[0].classList.add('selected');
          selectedAvatar = items[0].dataset.avatar;
        }
      }
    });
  }

  // Handle keyboard arrow keys preset navigation
  document.addEventListener('keydown', (e) => {
    if (profileModal.style.display !== 'flex') return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      if (document.activeElement === profileNameInput || document.activeElement === profileCustomAvatarInput) {
        return;
      }
      e.preventDefault();
      const items = Array.from(avatarOptions);
      let idx = items.findIndex(opt => opt.classList.contains('selected'));
      if (idx === -1) {
        idx = 0;
      } else {
        if (e.key === 'ArrowRight') {
          idx = (idx + 1) % items.length;
        } else {
          idx = (idx - 1 + items.length) % items.length;
        }
      }
      items.forEach(o => o.classList.remove('selected'));
      items[idx].classList.add('selected');
      selectedAvatar = items[idx].dataset.avatar;
      if (profileCustomAvatarInput) profileCustomAvatarInput.value = '';
    }
  });

  function openProfile() {
    const session = getSession();
    if (!session) return;

    profileNameInput.value = session.name || '';
    selectedAvatar = session.avatar || '';

    const presetAvatars = ['👨‍💻', '👩‍🎨', '🧑‍🚀', '🧔', '👧', '🦊'];
    if (selectedAvatar && !presetAvatars.includes(selectedAvatar)) {
      if (profileCustomAvatarInput) profileCustomAvatarInput.value = selectedAvatar;
      avatarOptions.forEach(opt => opt.classList.remove('selected'));
    } else {
      if (profileCustomAvatarInput) profileCustomAvatarInput.value = '';
      avatarOptions.forEach(opt => {
        if (opt.dataset.avatar === selectedAvatar) {
          opt.classList.add('selected');
        } else {
          opt.classList.remove('selected');
        }
      });
    }

    profileModal.style.display = 'flex';
  }

  if (profileSidebarBtn) {
    profileSidebarBtn.addEventListener('click', openProfile);
  }

  if (profileDropdownBtn) {
    profileDropdownBtn.addEventListener('click', openProfile);
  }

  if (profileModalClose) {
    profileModalClose.addEventListener('click', () => {
      profileModal.style.display = 'none';
    });
  }

  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
      profileModal.style.display = 'none';
    }
  });

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const session = getSession();
      if (!session) return;

      const newName = profileNameInput.value.trim();
      if (!newName) {
        alert('Please enter a name');
        return;
      }

      session.name = newName;
      session.avatar = selectedAvatar;

      // Extract initials from new name
      const parts = newName.split(' ');
      const initials = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
      session.initials = initials || 'DU';

      localStorage.setItem('sf_session', JSON.stringify(session));

      // Update UI displays
      document.getElementById('userNameDisplay').textContent = session.name;
      document.getElementById('avatarDisplay').textContent = session.avatar || session.initials;

      profileModal.style.display = 'none';
    });
  }
}

/* ============================================================
   BOOT
   ============================================================ */

document.addEventListener('DOMContentLoaded',()=>{

    initLogin();
    initModal();
    initHeroNav();
    initNavTabs();
    initCategoryCards();
    initSearch();
    initRowArrows();
    initHomeButton();
    initAI();

    if(getSession()){

        showApp();
        initLangPicker();
        initUserMenu();
        initProfileModal();
        init();

    }
    else{

        showLogin();

    }

});
