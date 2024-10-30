// src/npc.js
import fetch from 'node-fetch';

export class NPC {
    constructor(id, name, role, personality) {
        // Basic information
        this.id = id;
        this.name = name;
        this.role = role;
        this.personality = personality;

        // State
        this.inventory = {};
        this.location = { 
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100)
        };
        this.currentTask = null;
        this.memories = [];
        this.relationships = {};

        // Skills and specializations (0.5-1.0 efficiency)
        this.specialization = {
            mining: Math.random() * 0.5 + 0.5,
            woodcutting: Math.random() * 0.5 + 0.5,
            crafting: Math.random() * 0.5 + 0.5,
            trading: Math.random() * 0.5 + 0.5
        };

        // Action timing
        this.lastAction = Date.now();
        this.failedAttempts = 0;
        this.maxConsecutiveFailures = 3;
    }

    async think(gameState, npcs) {
        if (this.failedAttempts >= this.maxConsecutiveFailures) {
            console.log(`${this.name} is taking a break due to too many failed attempts`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            this.failedAttempts = 0;
        }

        try {
            const nearbyNPCs = Array.from(npcs.values())
                .filter(npc => npc.id !== this.id && this.getDistance(npc) < 20)
                .map(npc => `${npc.name} (${npc.role})`);

            const needsResources = Object.keys(this.inventory).length < 3;
            const hasExcessResources = Object.values(this.inventory).some(amount => amount > 10);

            const prompt = `You are ${this.name}, a ${this.role} NPC in a game. Respond ONLY with a JSON object in this exact format:
{
    "action": "mine OR woodcut OR move OR trade OR chat",
    "target": "specific resource name OR coordinates OR NPC id",
    "reason": "brief explanation"
}

Current situation:
- Your personality: ${this.personality}
- Location: (${Math.floor(this.location.x)}, ${Math.floor(this.location.y)})
- Current task: ${this.currentTask || 'None'}
- Recent memories: ${this.memories.slice(-3).join(', ') || 'No recent memories'}
- Nearby NPCs: ${nearbyNPCs.length > 0 ? nearbyNPCs.join(', ') : 'None'}
- Inventory: ${JSON.stringify(this.inventory) || 'Empty'}
- Time of day: ${gameState.timeOfDay}
${needsResources ? "- You're low on resources" : ""}
${hasExcessResources ? "- You have excess resources to trade" : ""}

Available actions and targets:
1. mine: copper_ore, iron_ore, gold_ore
2. woodcut: oak_wood, maple_wood, yew_wood
3. move: "x,y" coordinates (0-99 range)
4. trade: nearby NPC id
5. chat: nearby NPC id

Respond with ONLY a valid JSON object matching the format above. No additional text.`;

            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3.2:latest',
                    prompt: prompt,
                    stream: false,
                    temperature: 0.7,
                    system: "You are a logic engine that only responds with valid JSON objects. Never include explanations or additional text."
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let jsonResponse;

            try {
                // Try to extract JSON from the response
                const jsonMatch = data.response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonResponse = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                this.failedAttempts++;
                console.log(`Parse error for ${this.name}, falling back to default action`);
                return this.getDefaultAction();
            }

            // Validate the response format
            if (!this.isValidAction(jsonResponse)) {
                this.failedAttempts++;
                return this.getDefaultAction();
            }

            this.failedAttempts = 0; // Reset failed attempts on success
            return jsonResponse;

        } catch (error) {
            this.failedAttempts++;
            console.error(`NPC ${this.name} thinking error:`, error.message);
            return this.getDefaultAction();
        }
    }

    isValidAction(action) {
        // Validate action format
        if (!action || typeof action !== 'object') return false;
        if (!action.action || !action.target || !action.reason) return false;

        // Validate action type
        const validActions = ['mine', 'woodcut', 'move', 'trade', 'chat'];
        if (!validActions.includes(action.action)) return false;

        // Validate target based on action
        switch (action.action) {
            case 'mine':
                return ['copper_ore', 'iron_ore', 'gold_ore'].includes(action.target);
            case 'woodcut':
                return ['oak_wood', 'maple_wood', 'yew_wood'].includes(action.target);
            case 'move':
                const [x, y] = action.target.split(',').map(Number);
                return !isNaN(x) && !isNaN(y) && x >= 0 && x < 100 && y >= 0 && y < 100;
            case 'trade':
            case 'chat':
                return typeof action.target === 'string' && action.target.length > 0;
            default:
                return false;
        }
    }

    getDefaultAction() {
        const actions = ['mine', 'woodcut', 'move'];
        const resources = {
            mine: ['copper_ore', 'iron_ore', 'gold_ore'],
            woodcut: ['oak_wood', 'maple_wood', 'yew_wood']
        };

        const action = actions[Math.floor(Math.random() * actions.length)];
        let target;

        if (action === 'move') {
            // Move towards center if at edges, otherwise random movement
            let newX = this.location.x;
            let newY = this.location.y;
            
            if (this.location.x < 10) newX += 10;
            else if (this.location.x > 90) newX -= 10;
            else newX += Math.floor(Math.random() * 21) - 10;

            if (this.location.y < 10) newY += 10;
            else if (this.location.y > 90) newY -= 10;
            else newY += Math.floor(Math.random() * 21) - 10;

            // Ensure coordinates stay within bounds
            newX = Math.max(0, Math.min(99, Math.floor(newX)));
            newY = Math.max(0, Math.min(99, Math.floor(newY)));
            
            target = `${newX},${newY}`;
        } else {
            const resourceList = resources[action];
            target = resourceList[Math.floor(Math.random() * resourceList.length)];
        }

        return {
            action,
            target,
            reason: `Falling back to default ${action} behavior`
        };
    }

    getDistance(otherNpc) {
        return Math.sqrt(
            Math.pow(this.location.x - otherNpc.location.x, 2) +
            Math.pow(this.location.y - otherNpc.location.y, 2)
        );
    }

    moveTowards(targetX, targetY, speed = 5) {
        // Convert target coordinates to numbers if they're strings
        targetX = Number(targetX);
        targetY = Number(targetY);

        // Validate coordinates
        if (isNaN(targetX) || isNaN(targetY)) {
            console.error(`Invalid coordinates for ${this.name}: x=${targetX}, y=${targetY}`);
            return;
        }

        // Ensure coordinates are within bounds
        targetX = Math.max(0, Math.min(99, targetX));
        targetY = Math.max(0, Math.min(99, targetY));

        const dx = targetX - this.location.x;
        const dy = targetY - this.location.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= speed) {
            this.location.x = targetX;
            this.location.y = targetY;
        } else {
            const ratio = speed / distance;
            this.location.x += dx * ratio;
            this.location.y += dy * ratio;
        }

        // Ensure location stays within bounds after movement
        this.location.x = Math.max(0, Math.min(99, this.location.x));
        this.location.y = Math.max(0, Math.min(99, this.location.y));
    }

    addItem(item, quantity = 1) {
        this.inventory[item] = (this.inventory[item] || 0) + quantity;
        this.updateMemory(`Acquired ${quantity}x ${item}`);
    }

    removeItem(item, quantity = 1) {
        if (this.inventory[item] >= quantity) {
            this.inventory[item] -= quantity;
            if (this.inventory[item] === 0) {
                delete this.inventory[item];
            }
            this.updateMemory(`Used ${quantity}x ${item}`);
            return true;
        }
        return false;
    }

    updateMemory(event) {
        const timestamp = new Date().toLocaleTimeString();
        this.memories.push(`[${timestamp}] ${event}`);
        if (this.memories.length > 10) {
            this.memories.shift();
        }
    }

    updateRelationship(entityId, delta) {
        this.relationships[entityId] = (this.relationships[entityId] || 50) + delta;
        this.relationships[entityId] = Math.max(0, Math.min(100, this.relationships[entityId]));
    }
}