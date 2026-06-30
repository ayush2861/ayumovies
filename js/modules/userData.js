import { getSession } from './auth.js';

function getKey(type){

    const user = getSession();

    if(!user){
        return null;
    }

    // use email if id missing
    const uid =
    user.id ||
    user.email;

    return `${type}_${uid}`;
}
/* WATCHLIST */

export function addToWatchlist(movie){

    const key=getKey('watchlist');

    let items=
    JSON.parse(
        localStorage.getItem(key)
    ) || [];

    if(
        !items.find(
            x=>x.id===movie.id
        )
    ){
        items.push(movie);
    }

    localStorage.setItem(
        key,
        JSON.stringify(items)
    );
}

export function getWatchlist(){

    const key=getKey('watchlist');

    return JSON.parse(
        localStorage.getItem(key)
    ) || [];
}


/* DOWNLOADS */



export function addDownload(movie){

    const key=getKey(
        'downloads'
    );

    let items=
    JSON.parse(
        localStorage.getItem(key)
    ) || [];

    // avoid duplicates
    if(
        !items.find(
            x=>x.id===movie.id
        )
    ){

        items.push({
            ...movie,
            progress:100
        });

    }

    localStorage.setItem(
        key,
        JSON.stringify(items)
    );
}

export function getDownloads(){

    const key =
    getKey(
        'downloads'
    );

    return JSON.parse(
        localStorage.getItem(key)
    ) || [];

}

/* NOTIFICATIONS */

export function addNotification(text){

    const key =
    getKey(
        'notifications'
    );

    let items =
    JSON.parse(
        localStorage.getItem(key)
    ) || [];

    items.unshift({

        text:text,
        time:Date.now()

    });

    items =
    items.slice(0,20);

    localStorage.setItem(
        key,
        JSON.stringify(items)
    );

}

export function getNotifications(){

    const key =
    getKey(
        'notifications'
    );

    return JSON.parse(
        localStorage.getItem(key)
    ) || [];

}

export function removeWatchlist(id){

const key=getKey('watchlist');

let items=
JSON.parse(
localStorage.getItem(key)
)||[];

items=
items.filter(
x=>x.id!==id
);

localStorage.setItem(
key,
JSON.stringify(items)
);

}





export function removeDownload(id){

const key=getKey("downloads");

let items=
JSON.parse(
localStorage.getItem(key)
)||[];

items=
items.filter(
x=>x.id!==id
);

localStorage.setItem(
key,
JSON.stringify(items)
);

}

export function removeFromWatchlist(id){

const key=getKey(
'watchlist'
);

let items=
JSON.parse(
localStorage.getItem(key)
)||[];

items=
items.filter(
m=>m.id!==id
);

localStorage.setItem(
key,
JSON.stringify(items)
);

}