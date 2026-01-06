import { Ctx, Help, On, Start, Update } from 'nestjs-telegraf';
import { Context, Input } from 'telegraf';
import { BestDeckService } from '../../best-deck/services/best-deck.service';
import { UseFilters } from '@nestjs/common';
import { TelegrafExceptionFilter } from '../../common/filters/telegram-exception.filter';
import path from 'path';
import { DeckCollageService } from '../services/deck-collage.service';

@Update()
@UseFilters(TelegrafExceptionFilter)
export class UpdateHandlers {
    constructor(
        private bestDeckService: BestDeckService,
        private readonly deckCollageService: DeckCollageService,
    ) {}

    @Start()
    async onStart(@Ctx() ctx: Context) {
        await ctx.reply(`Привет! Этот бот подберёт лучшие деки по тегу твоего аккаунта в Clash Royal`);

        await ctx.sendChatAction('upload_photo');

        await ctx.replyWithMediaGroup([
            {
                type: 'photo',
                media: Input.fromLocalFile(path.resolve(__dirname, '../../../public/step1.png')),
                caption:
                    'Так можно найти тег своего аккаунта. Просто введи его и получи лучшие деки по твоему аккаунту',
            },
            { type: 'photo', media: Input.fromLocalFile(path.resolve(__dirname, '../../../public/step2.png')) },
            { type: 'photo', media: Input.fromLocalFile(path.resolve(__dirname, '../../../public/step3.png')) },
        ]);
    }

    @Help()
    async onHelp(@Ctx() ctx: Context) {
        await ctx.reply(['/start — приветствие', '/help — помощь', '/id — показать твой chat id'].join('\n'));
    }

    @On('text')
    async onText(@Ctx() ctx: Context) {
        const text = ctx.text;

        if (!text) {
            return ctx.reply('Неверный формат тега. Попробуйте ещё раз');
        }

        const topDecks = await this.bestDeckService.getTopDecksByPlayerTag(text);

        const bestDecks = topDecks.filter(({ levelRange }) => levelRange < 10).sort((a, b) => a.levelSum - b.levelSum);

        for (const { deckName, deckCards, linkDeck, deckRank, avgElixir, levelSum } of bestDecks) {
            await ctx.sendChatAction('typing');

            const collageBuffer = await this.deckCollageService.createDeckCollage(deckCards);

            await ctx.replyWithPhoto(Input.fromBuffer(collageBuffer), {
                caption: `#${deckRank} <a href="${linkDeck}">${deckName}</a> ${avgElixir} ${levelSum}`,
                parse_mode: 'HTML',
            });
        }

        await ctx.reply('✅ Готово! Лучшие деки для тебя находятся снизу');
    }
}
