import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    PrismaModule,

    ConfigModule.forRoot({
      // config service bisa di akses darimanapun
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
