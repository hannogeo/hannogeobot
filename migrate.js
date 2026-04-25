import { db } from './firebase-config.js';
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const currentCommands = [
  // Main Grid
  { name: "!ahw", args: "[Google Maps link]", description: "Submit a location to A Hanno World, our community map.", category: "main", order: 1 },
  { name: "!pb", args: "", description: "See what my current peak elo is on ranked duels.", category: "main", order: 2 },
  { name: "!weather", args: "[city name]", description: "Check the current weather. Default is Tallinn.", category: "main", order: 3 },
  { name: "!time", args: "", description: "See the current time in Tallinn right now.", category: "main", order: 4 },
  { name: "!hug", args: "[name]", description: "Give someone in chat a nice warm hug!", category: "main", order: 5 },
  { name: "!slap", args: "[name]", description: "Slap someone (or the bot when it's acting up).", category: "main", order: 6 },
  { name: "!song", args: "", description: "See what song is playing right now.", category: "main", order: 7 },
  { name: "!discord", args: "", description: "Get the invite link to our awesome Discord server.", category: "main", order: 8 },
  { name: "!iq", args: "[name]", description: "Find out your (or someone else's) extremely accurate IQ.", category: "main", order: 9 },
  { name: "!lurk", args: "", description: "Let us know you're actively supporting by lurking.", category: "main", order: 10 },
  { name: "!skip", args: "", description: "If 3 people use this command, the currently playing song will be automatically skipped.", category: "main", order: 11 },
  { name: "!pc", args: "", description: "See my amazing PC specs powering the stream.", category: "main", order: 12 },
  { name: "!setup", args: "", description: "Check out the devices I use for my streaming setup.", category: "main", order: 13 },
  { name: "!commands", args: "", description: "See all the available commands. If you're here, you probably used this one already.", category: "main", order: 14 },
  { name: "!dihsize", args: "[name]", description: "erm", category: "main", order: 15 },
  
  // Gamble Section
  { name: "!gamble", args: "[amount of points]", description: "You either win some points or you lose some points.", category: "gamble", order: 16 },
  { name: "!givepoints", args: "[username] [amount of points]", description: "Give away some of your points to another user.", category: "gamble", order: 17 },
  { name: "!leaderboard", args: "", description: "Shows a top 5 of the people with the most points.", category: "gamble", order: 18 },
  { name: "!points", args: "[username]", description: "See how many points you or someone else have.", category: "gamble", order: 19 },
  { name: "!raffle", args: "", description: "Creates a raffle for 1000 points.", category: "gamble", order: 20 },
  { name: "!join", args: "", description: "Join an active raffle.", category: "gamble", order: 21 }
];

export async function migrate() {
  const snapshot = await getDocs(collection(db, "commands"));
  if (!snapshot.empty) {
    if (!confirm("Your database already has commands. Should we clear it first to reset the order? (Recommended)")) {
      return;
    }
    // Delete existing
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, "commands", d.id));
    }
  }

  console.log("Starting migration...");
  for (const cmd of currentCommands) {
    await addDoc(collection(db, "commands"), {
      ...cmd,
      createdAt: new Date()
    });
    console.log(`Added: ${cmd.name}`);
  }
  alert("Migration complete! The order is now restored.");
}
