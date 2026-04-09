import* as redisMethods from "../Redis/redis.service.js"
export  const createOtp = () => {
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
}

// export async function maxRequistSendAfterBlocked({email}){
//   const failKey = redisMethods.getLoginFailKey({ email });
//   const blockedKey = redisMethods.getLoginBlockedKey({ email });
//     const tryLoginNo = await redisMethods.incr(failKey);

//     if (tryLoginNo == 1) {
//       await redisMethods.set({
//         key: failKey,
//         value: tryLoginNo,
//         exValue: 60 * 5
//       });
//     }

//     if (tryLoginNo >= 5) {
//       await redisMethods.set({
//         key: blockedKey,
//         value: 1,
//         exValue: 60 * 5
//       });

//       await redisMethods.del(failKey);

//       throw new Error("account blocked for 5 minutes", {
//         cause: { statuscode: 409 }
//       });
//     }
// }

export async function isBlockedSendOtp({email,emailType}) {
  const isBloked = await redisMethods.exists(redisMethods.getOtpBlockedKey({email,emailType}))
  
   if (isBloked) {
  
   const blockTime = await redisMethods.ttl(redisMethods.getOtpBlockedKey({email,emailType})) /60
    
     throw new Error(`you have ablock you can send after ${Math.floor(blockTime)} M` );
     
     
   }
}