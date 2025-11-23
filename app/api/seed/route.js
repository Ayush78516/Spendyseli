// import { seedTransactions } from "@/actions/seed";

// export async function GET(){
//     const result=await seedTransactions();
//     return Response.json(result);
// }
import arcjet, { shield, detectBot } from "@arcjet/next";
import { seedTransactions } from "@/actions/seed";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

export async function GET(req) {
  // Arcjet protection
  await aj.protect(req);

  const result = await seedTransactions();
  return Response.json(result);
}
