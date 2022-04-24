import { Client, Collection, IntentsBitField, Partials } from "discord.js";
import emojiManager from "./client/emojiManager";
import events from "./client/events";
import menus from "./client/menus";
import { token } from "./config/secrets.json";
import Command from "./lib/command";
import { registerCommands } from "./lib/createCommands";
import { init } from "discord-modals";
import initLevels from "./client/levels";
import initLeaderboards from "./client/leaderboards";
import "reflect-metadata"
import { initExpress } from "./api";
import { GuildSettingsCache } from "./client/settings";
import { AllIntents, AllPartials } from "./lib/all";
const IFlags = IntentsBitField.Flags;

const client = new Client({
    intents: [
        ...AllIntents({
            guildVoice: false,
            typing: false,
            guildBots: false
        })
    ],
    partials: [
        ...AllPartials()
    ]
});

//Create client varibles
client.commands = {
    private: [],
    public: [],
    all: []
};
client.events = new Collection();
client.customEmojis = new Collection();
client.customEmojisReady = false;
client.menus = new Collection();

//init events
events(client);

//init menus
menus(client);

//init modals
init(client);

//init mongo db
//[DEPRECATED] Now using sqlite instead
//initDB();

//init discord xp
initLevels(client);

//Wait for when the bot is ready
client.on("ready", async () => {
    //Request commands on Discord API
    await registerCommands(client);
    //Log that the bots ready
    console.log(`[CLIENT] Ready as ${client.user.username}...`)
    //Wait for client to be FULLY ready (for emojis, caches, etc...)
    setTimeout(async () => {
        //Init emoji manager
        await emojiManager(client);
        //Log that they are ready
        console.log(`[CLIENT] Emojis ready`)
        //Update client status
        client.customEmojisReady = true;
        //init api
        //only needed if you have the dashboard
        await initExpress(client)
    }, 4000);
    //for every 5s update all leaderboards
    setInterval(async () => {
        //init leaderboard editing
        initLeaderboards(client);
    });
    client.settingsCache = await new GuildSettingsCache(client).init();
});

//Login with our super secret token!
client.login(token);