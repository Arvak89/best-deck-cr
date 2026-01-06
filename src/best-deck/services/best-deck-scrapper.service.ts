import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BestDeckScrapperService {
    private readonly cacheTtlSeconds = 1000 * 60 * 10;

    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

    public async getHtmlFromRoyaleApi(path: string) {
        const url = `https://royaleapi.com${path}`;
        const cacheKey = `html:${url}`;

        const cached = await this.cache.get<string>(cacheKey);

        if (cached) {
            return cached;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'text/html',
                'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
            },
        });

        console.log(response.status);

        if (!response.ok) {
            throw new Error(`Произошла ошибка на сервере`);
        }

        const html = await response.text();

        await this.cache.set(cacheKey, html, this.cacheTtlSeconds);

        return html;
    }
}
