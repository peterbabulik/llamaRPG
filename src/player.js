// src/player.js
export class Player {
    constructor(name) {
        this.name = name;
        this.inventory = {};
        this.skills = {
            mining: { level: 1, exp: 0 },
            woodcutting: { level: 1, exp: 0 },
            crafting: { level: 1, exp: 0 }
        };
    }

    addItem(item, quantity = 1) {
        this.inventory[item] = (this.inventory[item] || 0) + quantity;
    }

    removeItem(item, quantity = 1) {
        if (this.inventory[item] >= quantity) {
            this.inventory[item] -= quantity;
            if (this.inventory[item] === 0) delete this.inventory[item];
            return true;
        }
        return false;
    }

    gainExp(skill, amount) {
        this.skills[skill].exp += amount;
        while (this.skills[skill].exp >= 100 * this.skills[skill].level) {
            this.skills[skill].exp -= 100 * this.skills[skill].level;
            this.skills[skill].level += 1;
            console.log(`Congratulations! Your ${skill} level is now ${this.skills[skill].level}!`);
        }
    }
}
