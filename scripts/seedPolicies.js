import { config } from "dotenv";
import { connect, disconnect } from "mongoose";
import { PolicyChunkModel } from "../models/PolicyChunk.model.js";
import { DeskModel } from "../models/Desk.model.js";
import { generateEmbedding } from "../services/embedding.service.js";
config();
const policies = [
  { title: "Claim submission", source: "Campus Lost and Found Policy - demo seed", text: "A claimant must sign in with a verified campus email, select the found item, and provide private evidence describing details that are not visible in the public listing. A claim is only a request for review; it does not prove ownership." },
  { title: "Evidence privacy", source: "Campus Lost and Found Policy - demo seed", text: "Do not post serial numbers, hidden markings, exact storage locations, or other private identifiers in public listings or public chat. Provide distinguishing details privately to the assigned desk officer." },
  { title: "Review and handover", source: "Campus Lost and Found Policy - demo seed", text: "An assigned desk officer reviews private evidence and records an approval or rejection. An AI match score cannot establish ownership. Only an approved claim can proceed to handover, and the officer records the handover in the system." },
  { title: "Public item listings", source: "Campus Lost and Found Policy - demo seed", text: "Public listings may show a short description, category, broad campus area, approximate report date, and status. They must not expose private identifiers, exact storage location, claimant identity, or claim evidence." },
  { title: "Uncertain match", source: "Campus Lost and Found Policy - demo seed", text: "If no strong match exists, ask for category, broad location, or approximate date and time. Do not promise that an item is found. Direct users to the campus lost-and-found desk when policy information is unavailable." }
];
async function seed() {
  await connect(process.env.DB_URL);
  for (const item of policies) {
    const embedding = await generateEmbedding(`${item.title}. ${item.text}`);
    await PolicyChunkModel.updateOne({ title: item.title, source: item.source }, { $set: { ...item, embedding, active: true } }, { upsert: true });
  }
  await DeskModel.updateOne({ name: "Main Campus Lost and Found Desk" }, { $setOnInsert: { name: "Main Campus Lost and Found Desk", broadLocation: "Main administration block", openingHours: "Add official opening hours", contactInstructions: "Contact the campus administration desk", active: true } }, { upsert: true });
  console.log(`Seeded ${policies.length} policy chunks and a demo desk`);
  await disconnect();
}
seed().catch(async (err) => { console.error(err); await disconnect(); process.exit(1); });
