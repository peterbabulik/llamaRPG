// src/constants.js
export const RESOURCES = {
    mining: {
        'copper_ore': { level: 1, exp: 10 },
        'iron_ore': { level: 5, exp: 20 },
        'gold_ore': { level: 10, exp: 40 }
    },
    woodcutting: {
        'oak_wood': { level: 1, exp: 10 },
        'maple_wood': { level: 5, exp: 20 },
        'yew_wood': { level: 10, exp: 40 }
    }
};

export const NPC_CONFIGS = [
    {
        id: 'trader_joe',
        name: 'Trader Joe',
        role: 'Merchant',
        personality: 'Friendly and fair trader who specializes in rare resources'
    },
    {
        id: 'miner_mike',
        name: 'Miner Mike',
        role: 'Master Miner',
        personality: 'Gruff but knowledgeable about ores, prefers to work alone'
    },
    {
        id: 'woodie',
        name: 'Woodie',
        role: 'Lumberjack',
        personality: 'Nature-loving woodcutter who sustainably harvests trees'
    },
    {
        id: 'smith_sara',
        name: 'Smith Sara',
        role: 'Blacksmith',
        personality: 'Skilled craftswoman always looking for quality materials'
    },
    {
        id: 'wandering_will',
        name: 'Wandering Will',
        role: 'Explorer',
        personality: 'Adventurous soul who loves discovering new resource locations'
    }
];
