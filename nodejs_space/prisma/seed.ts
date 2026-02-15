import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Check if auth already exists
  const existingAuth = await prisma.auth.findFirst();
  if (!existingAuth) {
    // Create default PIN: 0000
    const hashedPin = await bcrypt.hash('0000', 10);
    await prisma.auth.create({
      data: {
        pinhash: hashedPin,
      },
    });
    console.log('✓ Default PIN created (0000)');
  } else {
    console.log('✓ Auth already exists, skipping PIN creation');
  }

  // Check if categories already exist
  const existingCategories = await prisma.categories.count();
  if (existingCategories === 0) {
    // Create default categories
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
  } else {
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
