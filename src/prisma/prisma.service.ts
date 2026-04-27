import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
// import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // versi 7
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });

    super({ adapter });
  }

  async onModuleInit() {
    // console.log('DATABASE_URL:', process.env.DATABASE_URL);
    await this.$connect();
    console.log('✅ Prisma connected to database');
  }
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🛑 Prisma disconnected from database');
  }
}
