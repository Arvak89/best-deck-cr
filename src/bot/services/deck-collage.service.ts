import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class DeckCollageService {
    private readonly collageWidth = 600;
    private readonly collageHeight = 400;
    private readonly columns = 4;
    private readonly rows = 2;

    private async fetchImageBuffer(url: string): Promise<Buffer> {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${url}, status: ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    async createDeckCollage(deckCards: { icon: string }[]): Promise<Buffer> {
        const { collageWidth, collageHeight, columns, rows } = this;

        const cellWidth = Math.floor(collageWidth / columns);
        const cellHeight = Math.floor(collageHeight / rows);

        const buffers = await Promise.all(deckCards.map(({ icon }) => this.fetchImageBuffer(icon)));

        const resizedBuffers = await Promise.all(
            buffers.map((buf) => sharp(buf).resize(cellWidth, cellHeight, { fit: 'cover' }).toBuffer()),
        );

        const compositeLayers = resizedBuffers.map((buffer, i) => {
            const col = i % columns;
            const row = Math.floor(i / columns);

            return {
                input: buffer,
                left: col * cellWidth,
                top: row * cellHeight,
            };
        });

        return sharp({
            create: {
                width: collageWidth,
                height: collageHeight,
                channels: 4,
                background: '#ffffff',
            },
        })
            .composite(compositeLayers)
            .png()
            .toBuffer();
    }
}
