// index.js
import { createInterface } from 'readline';
import { NPCManager } from './src/npcManager.js';
import chalk from 'chalk';

class Simulation {
    constructor() {
        this.npcManager = new NPCManager();
        this.gameState = {
            timeOfDay: 'day',
            nearbyPlayers: [],
            availableResources: [
                'copper_ore', 'iron_ore', 'gold_ore',
                'oak_wood', 'maple_wood', 'yew_wood'
            ]
        };
        
        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.cyan('observer> ')
        });

        this.isRunning = true;
    }

    showHelp() {
        console.log(chalk.yellow('\nAvailable Commands:'));
        console.log(chalk.green('  status      ') + '- Show current status of all NPCs');
        console.log(chalk.green('  history [n] ') + '- Show last n events (default: 10)');
        console.log(chalk.green('  follow <id> ') + '- Follow specific NPC\'s activities');
        console.log(chalk.green('  near <id>   ') + '- Show NPCs near specified NPC');
        console.log(chalk.green('  inv <id>    ') + '- Show detailed inventory of an NPC');
        console.log(chalk.green('  rel <id>    ') + '- Show relationships of an NPC');
        console.log(chalk.green('  map         ') + '- Show simplified world map');
        console.log(chalk.green('  clear       ') + '- Clear the console');
        console.log(chalk.green('  help        ') + '- Show this help message');
        console.log(chalk.green('  quit        ') + '- Exit simulation\n');
    }

    showStatus() {
        console.log(chalk.yellow('\nWorld Status:'));
        const status = this.npcManager.getWorldStatus();
        
        status.forEach(npc => {
            console.log(chalk.cyan(`\n${npc.name} (${npc.role})`));
            console.log(`  Location: ${npc.location}`);
            console.log(`  Task: ${npc.currentTask || 'Idle'}`);
            
            const inventoryItems = Object.entries(npc.inventory);
            if (inventoryItems.length > 0) {
                console.log('  Inventory:');
                inventoryItems.forEach(([item, quantity]) => {
                    console.log(`    - ${item}: ${quantity}`);
                });
            } else {
                console.log('  Inventory: Empty');
            }
        });
        console.log('');
    }

    showHistory(count = 10) {
        const events = this.npcManager.getRecentEvents(count);
        console.log(chalk.yellow('\nRecent Events:'));
        events.forEach(event => console.log(event));
        console.log('');
    }

    async followNPC(npcId) {
        const npc = this.npcManager.npcs.get(npcId);
        if (!npc) {
            console.log(chalk.red(`\nNPC with ID ${npcId} not found.\n`));
            return;
        }

        console.log(chalk.yellow(`\nFollowing ${npc.name}. Press any key to stop following.\n`));
        
        const followInterval = setInterval(() => {
            console.clear();
            console.log(chalk.cyan(`\nFollowing ${npc.name}:`));
            console.log(`Location: ${Math.floor(npc.location.x)}, ${Math.floor(npc.location.y)}`);
            console.log(`Current Task: ${npc.currentTask || 'Idle'}`);
            console.log(`Inventory: ${JSON.stringify(npc.inventory)}`);
            console.log('\nRecent memories:');
            npc.memories.slice(-3).forEach(memory => console.log(`- ${memory}`));
            console.log('\nPress any key to stop following...');
        }, 1000);

        // Wait for any key press
        process.stdin.setRawMode(true);
        await new Promise(resolve => {
            process.stdin.once('data', () => {
                process.stdin.setRawMode(false);
                clearInterval(followInterval);
                console.clear();
                this.rl.prompt();
                resolve();
            });
        });
    }

    showNearbyNPCs(npcId) {
        const npc = this.npcManager.npcs.get(npcId);
        if (!npc) {
            console.log(chalk.red(`\nNPC with ID ${npcId} not found.\n`));
            return;
        }

        const nearbyNPCs = this.npcManager.getNearbyNPCs(npc.location, 20);
        console.log(chalk.yellow(`\nNPCs near ${npc.name}:`));
        
        nearbyNPCs
            .filter(nearNpc => nearNpc.id !== npcId)
            .forEach(nearNpc => {
                const distance = Math.floor(npc.getDistance(nearNpc));
                console.log(chalk.cyan(`\n${nearNpc.name} (${nearNpc.role})`));
                console.log(`  Distance: ${distance} units`);
                console.log(`  Location: (${Math.floor(nearNpc.location.x)}, ${Math.floor(nearNpc.location.y)})`);
            });
        console.log('');
    }

    showInventory(npcId) {
        const npc = this.npcManager.npcs.get(npcId);
        if (!npc) {
            console.log(chalk.red(`\nNPC with ID ${npcId} not found.\n`));
            return;
        }

        console.log(chalk.yellow(`\n${npc.name}'s Inventory:`));
        const items = Object.entries(npc.inventory);
        
        if (items.length === 0) {
            console.log('Empty inventory');
        } else {
            items.forEach(([item, quantity]) => {
                console.log(chalk.cyan(`${item}: `) + `${quantity}`);
            });
        }
        console.log('');
    }

    showRelationships(npcId) {
        const npc = this.npcManager.npcs.get(npcId);
        if (!npc) {
            console.log(chalk.red(`\nNPC with ID ${npcId} not found.\n`));
            return;
        }

        console.log(chalk.yellow(`\n${npc.name}'s Relationships:`));
        
        Object.entries(npc.relationships).forEach(([targetId, value]) => {
            const targetNpc = this.npcManager.npcs.get(targetId);
            if (targetNpc) {
                const relationColor = value >= 75 ? chalk.green :
                                    value >= 50 ? chalk.yellow :
                                    value >= 25 ? chalk.red :
                                    chalk.gray;
                console.log(`${targetNpc.name}: ${relationColor(value + '%')}`);
            }
        });
        console.log('');
    }

    showMap() {
        console.log(chalk.yellow('\nWorld Map (simplified):'));
        
        const mapSize = 20; // Show 20x20 grid
        const grid = Array(mapSize).fill().map(() => Array(mapSize).fill('.'));
        
        // Place NPCs on grid
        this.npcManager.npcs.forEach(npc => {
            const x = Math.floor(npc.location.x / 5) % mapSize;
            const y = Math.floor(npc.location.y / 5) % mapSize;
            grid[y][x] = chalk.cyan(npc.name[0]);
        });
        
        // Draw map
        console.log('  ' + Array(mapSize).fill().map((_, i) => i % 5 === 0 ? (i/5).toString().padStart(4) : '    ').join(''));
        grid.forEach((row, i) => {
            if (i % 5 === 0) {
                console.log(i/5 + ' ' + row.join(' '));
            } else {
                console.log('  ' + row.join(' '));
            }
        });
        console.log('\nLegend: Each character represents the first letter of an NPC\'s name\n');
    }

    processCommand(input) {
        const [command, ...args] = input.trim().toLowerCase().split(' ');

        switch (command) {
            case 'status':
                this.showStatus();
                break;

            case 'history':
                const count = parseInt(args[0]) || 10;
                this.showHistory(count);
                break;

            case 'follow':
                if (!args[0]) {
                    console.log(chalk.red('\nPlease specify an NPC ID to follow.\n'));
                    break;
                }
                this.followNPC(args[0]);
                break;

            case 'near':
                if (!args[0]) {
                    console.log(chalk.red('\nPlease specify an NPC ID to check nearby NPCs.\n'));
                    break;
                }
                this.showNearbyNPCs(args[0]);
                break;

            case 'inv':
                if (!args[0]) {
                    console.log(chalk.red('\nPlease specify an NPC ID to view inventory.\n'));
                    break;
                }
                this.showInventory(args[0]);
                break;

            case 'rel':
                if (!args[0]) {
                    console.log(chalk.red('\nPlease specify an NPC ID to view relationships.\n'));
                    break;
                }
                this.showRelationships(args[0]);
                break;

            case 'map':
                this.showMap();
                break;

            case 'clear':
                console.clear();
                break;

            case 'help':
                this.showHelp();
                break;

            case 'quit':
                console.log(chalk.yellow('\nEnding simulation...\n'));
                this.isRunning = false;
                this.rl.close();
                process.exit(0);
                break;

            default:
                console.log(chalk.red('\nUnknown command. Type "help" for available commands.\n'));
        }
    }

    async start() {
        console.clear();
        console.log(chalk.cyan('\n=== Welcome to LlamaRPG NPC Simulation ==='));
        console.log(chalk.yellow('Type "help" to see available commands.\n'));

        // Handle commands
        this.rl.on('line', (input) => {
            if (input.trim()) {
                this.processCommand(input);
            }
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            if (this.isRunning) {
                console.log(chalk.yellow('\nEnding simulation...\n'));
                process.exit(0);
            }
        });

        // Start simulation loop
        this.simulationLoop();

        // Show initial prompt
        this.rl.prompt();
    }

    async simulationLoop() {
        while (this.isRunning) {
            try {
                await this.npcManager.updateNPCs(this.gameState);
                
                // Update time of day every hour
                const hour = new Date().getHours();
                this.gameState.timeOfDay = (hour >= 6 && hour < 18) ? 'day' : 'night';
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error in simulation loop:', error);
            }
        }
    }
}

// Start the simulation
try {
    const simulation = new Simulation();
    simulation.start().catch(console.error);
} catch (error) {
    console.error('Fatal error starting simulation:', error);
    process.exit(1);
}