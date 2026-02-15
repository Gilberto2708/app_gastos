"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting database seed...');
    const existingAuth = await prisma.auth.findFirst();
    if (!existingAuth) {
        const hashedPin = await bcrypt.hash('0000', 10);
        await prisma.auth.create({
            data: {
                pinhash: hashedPin,
            },
        });
        console.log('✓ Default PIN created (0000)');
    }
    else {
        console.log('✓ Auth already exists, skipping PIN creation');
    }
    const existingCategories = await prisma.categories.count();
    if (existingCategories === 0) {
        const defaultCategories = [
            { name: 'Food', color: '#FF5733', icon: 'restaurant' },
            { name: 'Transport', color: '#3498DB', icon: 'directions_car' },
            { name: 'Entertainment', color: '#9B59B6', icon: 'movie' },
            { name: 'Bills', color: '#E74C3C', icon: 'receipt' },
            { name: 'Shopping', color: '#F39C12', icon: 'shopping_bag' },
            { name: 'Others', color: '#95A5A6', icon: 'category' },
        ];
        for (const category of defaultCategories) {
            await prisma.categories.create({
                data: category,
            });
        }
        console.log('✓ Default categories created (6 categories)');
    }
    else {
        console.log('✓ Categories already exist, skipping category creation');
    }
    console.log('Database seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map