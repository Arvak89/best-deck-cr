import { Module } from '@nestjs/common';
import { BestDeckService } from './services/best-deck.service';
import { BestDeckScrapperService } from './services/best-deck-scrapper.service';
import { BestDeckParserService } from './services/best-deck-parser.service';

@Module({
    providers: [BestDeckService, BestDeckScrapperService, BestDeckParserService],
    exports: [BestDeckService, BestDeckScrapperService, BestDeckParserService],
})
export class BestDeckModule {}
