const crypto = require('crypto')
const secret = "12345678123456781234567812345678"
const iv = crypto.randomBytes(16);


const encrypt = (encryption)=>{
    const cipher = crypto.createCipheriv("aes-256-ctr",secret,iv)
    let encrypted = cipher.update(encryption,'utf8','hex')
    encrypted+=cipher.final('hex')
    const key = (iv.toString('hex'))
    return {encrypted, key}
}


const decrypt = (decryption)=>{
    const {message,newiv} = decryption
    // console.log(message,newiv)
    const bufiv = Buffer.from(newiv,'hex')
    const decipher = crypto.createDecipheriv('aes-256-ctr',secret,bufiv)
    let decrypted = decipher.update(message,'hex','utf8')
    decrypted+= decipher.final('utf8')
    // console.log(decrypted)
    return decrypted
}

module.exports = {encrypt,decrypt}