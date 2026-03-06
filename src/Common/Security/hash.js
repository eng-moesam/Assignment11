import { compare, hash } from "bcrypt";

export async function hashOperation({plaintext , round = SALT_ROUNDS}) {

   return await hash( plaintext , round )
    
}
export async function compareOperation({plaintext,hashedvalue}) {

    return await compare(plaintext,hashedvalue)
    
}