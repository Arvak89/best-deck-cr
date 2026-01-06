import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { BestDeckModule } from './best-deck/best-deck.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { RedisHealthService } from './common/health/redis-health.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        CacheModule.register({
            isGlobal: true,
            stores: [
                createKeyv('redis://localhost:6379', {
                    throwOnConnectError: true,
                    throwOnErrors: true,
                }),
            ],
        }),
        BestDeckModule,
        BotModule,
    ],
    providers: [RedisHealthService],
})
export class AppModule {}
