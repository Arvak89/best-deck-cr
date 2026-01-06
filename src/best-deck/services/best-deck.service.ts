import { Inject, Injectable } from '@nestjs/common';
import { BestDeckParserService } from './best-deck-parser.service';
import { normalizeCardName } from '../helpers/normalizeCardName';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { PlayerCard } from '../types/PlayerCard';
import { DeckCard } from '../types/DeckCard';
import { PlayerInfo } from '../types/PlayerInfo';

@Injectable()
export class BestDeckService {
    constructor(
        private bestDeckParserService: BestDeckParserService,
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    private clashRoyalProxyUrl = 'https://proxy.royaleapi.dev/v1';

    public async getTopDecksByPlayerTag(tag: string) {
        const playerInfo = await this.getPlayerInfo(tag);

        const excludeEvoCards = playerInfo.cards
            .filter((card) => !card.evolutionLevel)
            .map((card) => card.name.toLowerCase().replaceAll(' ', '-').replaceAll('.', ''));

        const includeCards = playerInfo.cards.map((card) =>
            card.name.toLowerCase().replaceAll(' ', '-').replaceAll('.', ''),
        );

        const popularDecks = await this.getCardsFromPopularDeck(includeCards, excludeEvoCards);

        console.log(popularDecks.length);

        const playerCardsByName = new Map<string, PlayerCard>(
            playerInfo.cards.map((card) => [normalizeCardName(card.name), card] as const),
        );

        return popularDecks.flatMap(({ cards, ...other }) => {
            const deckCards: DeckCard[] = cards
                .flatMap(({ name, evo }) => {
                    const card = playerCardsByName.get(normalizeCardName(name));

                    if (!card) return [];

                    const { iconUrls, ...deckCard } = card;

                    return [{ ...deckCard, evo, icon: evo ? iconUrls['evolutionMedium'] : iconUrls['medium'] }];
                })
                .sort((a, b) => (a.evo === b.evo ? 0 : a.evo ? -1 : 1));

            if (deckCards.length !== 8) return [];

            const levelSum = deckCards.reduce((sum, card) => sum + (card?.level ?? 0), 0);

            const levels = deckCards.map((card) => card.level);

            const minLevel = Math.min(...levels);
            const maxLevel = Math.max(...levels);

            const levelRange = maxLevel - minLevel;

            return {
                deckCards,
                levelSum,
                levelRange,
                ...other,
            };
        });
    }

    private getCardsFromPopularDeck(includeCards: string[], excludeEvoCards?: string[]) {
        return this.bestDeckParserService.parsePopularDecks(includeCards, excludeEvoCards);
    }

    private async getPlayerInfo(tag: string) {
        const url = this.clashRoyalProxyUrl + '/players' + `/%23${tag.slice(1)}`;
        const cacheKey = `fetch:${url}`;

        const cached = await this.cache.get<PlayerInfo>(cacheKey);

        if (cached) {
            return cached;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.CLASH_ROYAL_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Не удалось информацию об игроке с тегом ${tag}`);
        }

        const playerInfo = (await response.json()) as PlayerInfo;

        await this.cache.set(cacheKey, playerInfo, 1000 * 60 * 10);

        return playerInfo;
    }
}
