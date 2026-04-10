<<<<<<< HEAD
import client from "./redis.connection.js";
=======
import {client } from "./redis.connection.js";
>>>>>>> d87b6255634dc811d34db1dbe5e27cb8b08c4c2f


export function getBlackListToken({userId,tokenId}) {
    return `blackListToken::${userId}::${tokenId}`
}
export function getOtpKey({email,emailType}) {
    return `OTP::${email}::${emailType}`
}
export function getOtpSendNO({email,emailType}) {
    return `OTP::${email}::${emailType}::NO`
}
export function getOtpBlockedKey({email,emailType}) {
    return `OTP::${email}::${emailType}::Blocked`
}


export function getLoginFailKey({ email }) {
    return `LOGIN::FAIL::${email}`;
  }
  
  export function getLoginBlockedKey({ email }) {
    return `LOGIN::BLOCKED::${email}`;
  }

  export function getPasswordResetJtiKey(jti) {
    return `PWD_RESET_JTI::${jti}`;
  }
export async function set({key,value,exType="EX",exValue=120}) {

    return await client.set(key,value,{
        expiration:{type:exType  , value:Math.floor(exValue)
        },
    })
    
}
export async function incr(key) {

    return await client.incr(key)
    
}


export async function get(key) {
    return await client.get(key)
}
export async function Mget(key) {
    const keys = Array.isArray(key) ? key : [key];
    return await client.mGet(keys)
}

export async function ttl(key) {
    return await client.ttl(key)
}

export async function exists(key) {
    return await client.exists(key)
}

export async function persist(key) {
    return await client.persist(key)
}

export async function del(key) {
    return await client.del(key)
}
export async function update(key,value) {
    if (!await exists(key)){
        return 0;
    }
    await set({key, value})
    return 1; 
}
export async function setExpire(key, seconds) {
    return await client.expire(key, seconds);
  }
export async function decr(key) {
    return await client.decr(key)
}