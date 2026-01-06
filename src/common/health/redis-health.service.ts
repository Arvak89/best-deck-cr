import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RedisHealthService implements OnModuleInit {
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

    private readonly logger = new Logger(RedisHealthService.name);

    async onModuleInit() {
        // Достаём Keyv (он лежит в cacheManager.store)
        const keyv = this.cache.stores[0];

        if (!keyv) {
            console.error('❌ CacheManager does not contain Keyv store.');
            return;
        }

        // обязательно включаем throwOnErrors, иначе Keyv проглотит ошибку!
        keyv.throwOnErrors = true;

        // подписываемся на ошибки Keyv (иначе они остаются незамеченными)
        keyv.on('error', (err: any) => {
            console.error('❌ Keyv/Redis store error:', err);
        });

        try {
            // вызываем операцию — она запускает подключение к Redis
            await keyv.set('__redis_health__', 'ok', 1000);

            // для уверенности
            await keyv.get('__redis_health__');

            this.logger.log('✅ Redis healthcheck via CacheManager: OK');
        } catch (err) {
            this.logger.error('❌ Redis healthcheck FAILED (CacheManager):', err);
            throw err; // Nest не поднимется
        }
    }
}
