/**
 * StreamFlix — Render Module
 */

import { imgUrl, genreMap } from './api.js';
import { openPlayer } from './player.js';
import {
    getWatchHistory,
    removeWatchHistory
}
from './watchHistory.js';


/* ---- Hero ---- */
export function setHero(movie) {

  document.getElementById('heroBg').style.backgroundImage =
    movie.backdrop_path
      ? `url(${imgUrl(movie.backdrop_path,'w1280')})`
      : '';

  document.getElementById('heroTitle').textContent =
    movie.title || movie.name || '';

  const genres =
    (movie.genre_ids || [])
    .slice(0,3)
    .map(id=>genreMap[id])
    .filter(Boolean);

  document.getElementById('heroTags').innerHTML =
    genres.map(
      g=>`<span class="tag">${g}</span>`
    ).join('');

  document.getElementById('heroDesc').textContent =
    movie.overview || '';

  document.getElementById('heroWatch').onclick =
    ()=>openPlayer(movie);

  document.getElementById('heroMore').onclick =
    ()=>openPlayer(movie);
}


/* ---- Generic row ---- */
export function renderRow(listId,items){

  const el =
  document.getElementById(listId);

  if(!el) return;

  if(!items?.length) return;


  el.innerHTML =
  items.slice(0,15).map((m,i)=>{

    const rating =
    m.vote_average
      ? m.vote_average.toFixed(1)
      : null;

return `

<div class="hcard" data-idx="${i}">

<div class="hcard-img-wrap">

<img
src="${imgUrl(m.poster_path,'w342')}"
alt="${m.title || m.name || ''}"
>

${
rating
?
`
<div class="hcard-rating">
<span class="hstar">★</span>
${rating}
</div>
`
:
''
}

<div class="hcard-play-overlay">
▶
</div>

</div>

<div class="hcard-title">
${m.title || m.name || ''}
</div>

</div>

`;

}).join('');



el.querySelectorAll('.hcard')
.forEach((card,i)=>{

card.addEventListener(
'click',
()=>openPlayer(items[i])
);

});

}



/* ---- Continue Watching ---- */
export function renderContinueWatching(){

const picks =
getWatchHistory();

const el =
document.getElementById(
'cwList'
);

if(!el) return;


if(!picks.length){

el.innerHTML=`
<p style="padding:20px">
No watch history
</p>
`;

return;

}


el.innerHTML =
picks.map((m,i)=>`

<div class="hcard cw-hcard">

<button
class="remove-history"
data-index="${i}">
✕
</button>

<div class="hcard-img-wrap">

<img
src="${imgUrl(
m.poster_path,
'w342'
)}"
alt="${m.title || m.name}"
>

</div>

<div class="hcard-title">
${m.title || m.name}
</div>

</div>

`).join('');



// open player
el.querySelectorAll(
'.cw-hcard'
)
.forEach((card,i)=>{

card.addEventListener(
'click',
()=>openPlayer(
picks[i]
)
);

});



el.querySelectorAll('.remove-history')
.forEach(btn=>{

    btn.onclick=(e)=>{

        e.stopPropagation();

        const index =
        Number(btn.dataset.index);

        removeWatchHistory(index);

        renderContinueWatching();

    };

});

}



/* ---- Search ---- */
export function renderSearchResults(results){

const panel =
document.getElementById(
'searchPanel'
);

if(!results.length){

panel.classList.remove(
'open'
);

return;

}

panel.innerHTML=
results.map((m,i)=>`

<div class="sr-item"
data-sri="${i}">

<div class="sr-thumb">

<img
src="${imgUrl(
m.poster_path,
'w92'
)}"
alt=""
>

</div>

<div>

<div class="sr-title">
${m.title || m.name || ''}
</div>

<div class="sr-year">
${(m.release_date || m.first_air_date || '').slice(0,4)}
·
${m.media_type==='tv' ? 'TV':'Movie'}
</div>

</div>

</div>

`).join('');


panel.classList.add(
'open'
);


panel.querySelectorAll(
'.sr-item'
)
.forEach((item,i)=>{

item.addEventListener(
'click',
()=>{

openPlayer(
results[i]
);

panel.classList.remove(
'open'
);

}

);

});

}



/* ---- Compatibility ---- */
export function renderTop10(items){
renderRow(
'trendingList',
items
);
}

export function renderMovieGrid(items){
renderRow(
'moviesList',
items
);
}

export function showGridSkeleton(){}