// import { createClient } from "redis"
import { REDIS_URL } from "../../../../config/config.service.js";

// export const client = createClient({
//   url: REDIS_URL
// });

// // client.on("error", function(err) {
// //   throw err;
// // });
// // await client.connect()
// // await client.set('foo','bar');

// // // Disconnect after usage
// // await client.disconnect();

// export async function testRedisConnection() {
//     try {
//       await  client.connect()
//       console.log("redis connect");
      
//     } catch (error) {
//         console.log("redis connection err",error);
        
//     }
// }

import { createClient } from 'redis';

const client = createClient({  url: REDIS_URL });
client.connect();

export default client;