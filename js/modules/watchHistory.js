import { getSession } from './auth.js';

function getUserKey() {

    const user = getSession();

    if (!user) return null;

    return `watch_${user.id}`;
}

export function saveWatch(movie) {

    const key = getUserKey();

    if (!key) return;

    let history =
        JSON.parse(localStorage.getItem(key))
        || [];

    // remove duplicates
    history = history.filter(
        m => m.id !== movie.id
    );

    // add latest movie at top
    history.unshift(movie);

    // keep only 10 movies
    history = history.slice(0,10);

    localStorage.setItem(
        key,
        JSON.stringify(history)
    );
}

export function getWatchHistory() {

    const key = getUserKey();

    return JSON.parse(
        localStorage.getItem(key)
    ) || [];
}

export function removeWatchHistory(index){

    const key = getUserKey();

    if(!key) return;

    let history =
    getWatchHistory();

    history.splice(index,1);

    localStorage.setItem(
        key,
        JSON.stringify(history)
    );

}