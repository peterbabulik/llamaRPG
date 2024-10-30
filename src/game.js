// src/game.js
import { Player } from './player.js';
import { NPCManager } from './npcManager.js';
import { RESOURCES, RECIPES } from './constants.js';

export class Game {
    constructor() {
        this.player = null;
        this.npcManager = new NPCManager(this);
        this.gameState = {
            timeOfDay: 'day',
            nearbyPlayers: [],
            availableResources: Object.keys(RESOURCES.mining).concat(Object.keys(RESOURCES.woodcutting))
        };
    }

    createPlayer(name) {
        this.player = new Player(name);
        console.log(`Welcome, ${name}!`);
    }

    mine(ore) {
        const resource = RESOURCES.mining[ore];
        if (!resource) {
            console.log('This ore does not exist!');
            return;
        }

        if (this.player.skills.mining.level < resource.level) {
            console.log(`You need level ${resource.level} mining to mine ${ore}!`);
            return;
        }

        this.player.addItem(ore);
        this.player.gainExp('mining', resource.exp);
        console.log(`You mined 1 ${ore}!`);
    }

    // Add other game methods as needed
}