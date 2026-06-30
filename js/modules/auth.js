/**
 * StreamFlix — Auth Module
 * Real signup + login using localStorage
 */

const SESSION_KEY = 'sf_session';
const USERS_KEY = 'sf_users';


/**
 * SIGN UP
 */
export async function signup(username,email,password){

try{

const res = await fetch(
"http://127.0.0.1:5000/api/auth/login",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
}
);

const data = await res.json();

if(!res.ok){
throw new Error(data.message);
}

return data;

}
catch(err){

console.log(err);
alert(err.message);

}

}

/**
 * LOGIN
 */
export async function login(email,password){

try{

const res = await fetch(
"http://127.0.0.1:5000/api/auth/login",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
}
);

const data = await res.json();

if(!res.ok){

throw new Error(data.message);

}

localStorage.setItem(
SESSION_KEY,
JSON.stringify(data.user)
);

return data;

}
catch(err){

console.log(err);

alert(err.message);

}

}

/**
 * DEMO LOGIN
 */
export function demoLogin(){

    const session={

        id:'demo-user',
        email:'demo@streamflix.com',
        name:'Demo User',
        initials:'DU',
        ts:Date.now()

    };

    try{

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(session)
        );

    }
    catch(_){}

    return session;
}


/**
 * LOGOUT
 */
export function logout(){

    try{

        localStorage.removeItem(
            SESSION_KEY
        );

    }
    catch(_){}
}


/**
 * GET SESSION
 */
export function getSession(){

    try{

        const raw=
        localStorage.getItem(
            SESSION_KEY
        );

        if(!raw)
            return null;

        const session=
        JSON.parse(raw);

        if(

            Date.now()
            -
            session.ts
            >
            7*24*60*60*1000

        ){

            logout();

            return null;
        }

        return session;

    }

    catch(_){

        return null;
    }

}


/**
 * CHECK LOGIN
 */
export function isLoggedIn(){

    return getSession() !== null;

}