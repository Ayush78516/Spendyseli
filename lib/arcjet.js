import arcjet, { tokenBucket } from "@arcjet/next";

console.log("Arcjet key:", process.env.ARCJET_KEY);

const aj=arcjet({
    key: process.env.ARCJET_KEY,
    characteristics:["userId"],  //track based on clerk userId
    rules:[
        tokenBucket({
            mode: "LIVE",
            refillRate: 10,
            interval: "3600s",
            capacity: 10,
        })
    ]
})

export default aj;