import { Injectable } from '@nestjs/common';
import { BestDeckScrapperService } from './best-deck-scrapper.service';
import { load } from 'cheerio';
import type { Element } from 'domhandler';

@Injectable()
export class BestDeckParserService {
    constructor(private bestDeckScrapperService: BestDeckScrapperService) {}

    public async parsePopularDecks(includeCards: string[], excludeEvoCards?: string[]) {
        const includeCardsQuery = includeCards.map((card) => `inc=${card}`).join('&') ?? '';
        const excludeEvoCardsQuery = excludeEvoCards?.map((card) => `exc=${card}-ev1`).join('&') ?? '';

        const url = '/decks/popular?' + includeCardsQuery + excludeEvoCardsQuery + '&size=30';

        const html = await this.bestDeckScrapperService.getHtmlFromRoyaleApi(url);

        const $ = load(html);

        const $decks = $('div[id^="deck_"][id$="_container"]');

        const getAvgElixir = (deckEl: Element) => {
            const avgElixirText = $(deckEl).find('div[data-content="Avg Elixir"] div.value').text().trim();
            const match = avgElixirText.match(/\d+(\.\d+)?/);
            const avgElixir = match ? parseFloat(match[0]) : null;

            return avgElixir;
        };

        const getCardIds = (url: string | undefined) => {
            const match = url?.match(/deck=([\d;]+)/);

            return match?.[1].split(';').map(Number) ?? [];
        };

        const parseDeckRank = (deckEl: Element) => {
            return $(deckEl).find('div[class="detail"]').text().trim();
        };

        const parseDeckCards = (el: Element) => {
            return $(el)
                .attr('data-name')
                ?.split(',')
                .map((card) => {
                    return card.includes('ev')
                        ? { name: card.replaceAll('-ev1', ''), evo: true }
                        : { name: card, evo: false };
                });
        };

        return $decks
            .map((i, deckEl) => {
                const deckRank = parseDeckRank(deckEl);
                const deckName = $(deckEl).find('h4.deck_human_name-desktop').text();
                const linkDeck = $(deckEl).find('a[href^="https://link.clashroyale.com"]').attr('href');
                const avgElixir = getAvgElixir(deckEl);
                const cardIds = getCardIds(linkDeck);
                const cards = parseDeckCards(deckEl);

                if (!cards || cards.length === 0) {
                    throw new Error(`Произошла ошибка на сервере, не удалось получить лучшие деки`);
                }

                return { deckRank, deckName, linkDeck, avgElixir, cardIds, cards };
            })
            .get();
    }
}
