// src/npcManager.js
import { NPC } from './npc.js';
import { RESOURCES, NPC_CONFIGS } from './constants.js';

export class NPCManager {
    constructor() {
        this.npcs = new Map();
        this.eventLog = [];
        this.setupNPCs();
    }

    setupNPCs() {
        for (const config of NPC_CONFIGS) {
            this.npcs.set(config.id, new NPC(
                config.id,
                config.name,
                config.role,
                config.personality
            ));
        }
    }

    logEvent(event) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${event}`;
        this.eventLog.push(logEntry);
        console.log(logEntry);

        // Keep only last 100 events
        if (this.eventLog.length > 100) {
            this.eventLog.shift();
        }
    }

    async executeNPCAction(npc, decision) {
        const { action, target, reason } = decision;

        // Add cooldown check
        if (Date.now() - npc.lastAction < 2000) {
            return; // Skip if action was too recent
        }

        try {
            switch (action) {
                case 'mine':
                    await this.handleMining(npc, target, reason);
                    break;

                case 'woodcut':
                    await this.handleWoodcutting(npc, target, reason);
                    break;

                case 'move':
                    await this.handleMovement(npc, target, reason);
                    break;

                case 'trade':
                    await this.handleTrading(npc, target, reason);
                    break;

                case 'chat':
                    await this.handleChat(npc, target, reason);
                    break;

                default:
                    this.logEvent(`${npc.name} is idle (${reason})`);
            }
        } catch (error) {
            console.error(`Error executing action for ${npc.name}:`, error);
            this.logEvent(`${npc.name} failed to ${action} (Error occurred)`);
        }

        npc.lastAction = Date.now();
    }

    async handleMining(npc, resource, reason) {
        if (RESOURCES.mining[resource]) {
            const successChance = npc.specialization.mining;
            if (Math.random() < successChance) {
                const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 resources
                npc.addItem(resource, quantity);
                this.logEvent(`${npc.name} successfully mined ${quantity}x ${resource} (${reason})`);
            } else {
                this.logEvent(`${npc.name} failed to mine ${resource} (${reason})`);
            }
        } else {
            this.logEvent(`${npc.name} tried to mine invalid resource: ${resource}`);
        }
    }

    async handleWoodcutting(npc, resource, reason) {
        if (RESOURCES.woodcutting[resource]) {
            const successChance = npc.specialization.woodcutting;
            if (Math.random() < successChance) {
                const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 resources
                npc.addItem(resource, quantity);
                this.logEvent(`${npc.name} successfully cut ${quantity}x ${resource} (${reason})`);
            } else {
                this.logEvent(`${npc.name} failed to cut ${resource} (${reason})`);
            }
        } else {
            this.logEvent(`${npc.name} tried to cut invalid resource: ${resource}`);
        }
    }

    async handleMovement(npc, target, reason) {
        try {
            const [targetX, targetY] = target.split(',').map(Number);
            const oldX = Math.floor(npc.location.x);
            const oldY = Math.floor(npc.location.y);
            
            npc.moveTowards(targetX, targetY);
            
            const newX = Math.floor(npc.location.x);
            const newY = Math.floor(npc.location.y);

            if (oldX !== newX || oldY !== newY) {
                this.logEvent(`${npc.name} moved from (${oldX}, ${oldY}) to (${newX}, ${newY}) (${reason})`);
            }
        } catch (error) {
            this.logEvent(`${npc.name} failed to move (Invalid coordinates)`);
        }
    }

    async handleTrading(npc1, targetId, reason) {
        const npc2 = this.npcs.get(targetId);
        if (!npc2) {
            this.logEvent(`${npc1.name} couldn't find trading partner ${targetId}`);
            return;
        }

        if (npc1.getDistance(npc2) > 10) {
            this.logEvent(`${npc1.name} is too far from ${npc2.name} to trade`);
            return;
        }

        const trade = this.calculateTrade(npc1, npc2);
        if (trade) {
            this.executeTrade(npc1, npc2, trade);
            this.logEvent(`${npc1.name} traded ${trade.item1} for ${trade.item2} with ${npc2.name} (${reason})`);
        } else {
            this.logEvent(`${npc1.name} couldn't find suitable trade with ${npc2.name}`);
        }
    }

    calculateTrade(npc1, npc2) {
        const npc1Items = Object.entries(npc1.inventory).filter(([_, qty]) => qty > 1);
        const npc2Items = Object.entries(npc2.inventory).filter(([_, qty]) => qty > 1);

        if (npc1Items.length === 0 || npc2Items.length === 0) {
            return null;
        }

        // Select random items that each NPC has more than 1 of
        const [item1] = npc1Items[Math.floor(Math.random() * npc1Items.length)];
        const [item2] = npc2Items[Math.floor(Math.random() * npc2Items.length)];

        return { item1, item2, quantity: 1 };
    }

    executeTrade(npc1, npc2, trade) {
        const { item1, item2, quantity } = trade;
        
        npc1.removeItem(item1, quantity);
        npc2.removeItem(item2, quantity);
        npc1.addItem(item2, quantity);
        npc2.addItem(item1, quantity);

        // Update relationships
        npc1.updateRelationship(npc2.id, 5);
        npc2.updateRelationship(npc1.id, 5);
    }

    async handleChat(npc, targetId, message) {
        const targetNpc = this.npcs.get(targetId);
        if (!targetNpc) {
            this.logEvent(`${npc.name} tried to chat with non-existent NPC ${targetId}`);
            return;
        }

        if (npc.getDistance(targetNpc) > 10) {
            this.logEvent(`${npc.name} is too far from ${targetNpc.name} to chat`);
            return;
        }

        this.logEvent(`${npc.name} chats with ${targetNpc.name}: "${message}"`);
        npc.updateRelationship(targetId, 2);
        targetNpc.updateRelationship(npc.id, 2);
    }

    async updateNPCs(gameState) {
        const promises = Array.from(this.npcs.values()).map(async (npc) => {
            try {
                // Only update if enough time has passed since last action
                if (Date.now() - npc.lastAction > 3000) {
                    const decision = await npc.think(gameState, this.npcs);
                    await this.executeNPCAction(npc, decision);
                }
            } catch (error) {
                console.error(`Error updating NPC ${npc.name}:`, error);
            }
        });

        await Promise.all(promises);
    }

    getWorldStatus() {
        return Array.from(this.npcs.values()).map(npc => ({
            name: npc.name,
            role: npc.role,
            location: `(${Math.floor(npc.location.x)}, ${Math.floor(npc.location.y)})`,
            inventory: npc.inventory,
            currentTask: npc.currentTask,
            specializations: npc.specialization,
            relationships: Object.entries(npc.relationships)
                .map(([id, value]) => `${this.npcs.get(id)?.name}: ${value}%`)
        }));
    }

    getNearbyNPCs(location, radius) {
        return Array.from(this.npcs.values())
            .filter(npc => {
                const distance = Math.sqrt(
                    Math.pow(npc.location.x - location.x, 2) +
                    Math.pow(npc.location.y - location.y, 2)
                );
                return distance <= radius;
            });
    }

    getRecentEvents(count = 10) {
        return this.eventLog.slice(-count);
    }
}