import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { UpdateHandlers } from './controllers/bot.update';
import { BestDeckModule } from '../best-deck/best-deck.module';
import { DeckCollageService } from './services/deck-collage.service';

@Module({
    imports: [
        TelegrafModule.forRoot({
            token: process.env.BOT_TOKEN ?? '',
        }),
        BestDeckModule,
    ],
    providers: [UpdateHandlers, DeckCollageService],
})
export class BotModule {}

