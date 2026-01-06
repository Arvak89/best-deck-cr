export class CardsResponse {
    items: Item[];
    supportItems: SupportItem[];
}

export class Item {
    name: string;
    id: number;
    maxLevel: number;
    maxEvolutionLevel?: number;
    elixirCost?: number;
    iconUrls: ItemIconUrls;
    rarity: Rarity;
}

export class ItemIconUrls {
    medium: string;
    evolutionMedium?: string;
}

export enum Rarity {
    Champion = 'champion',
    Common = 'common',
    Epic = 'epic',
    Legendary = 'legendary',
    Rare = 'rare',
}

export class SupportItem {
    name: string;
    id: number;
    maxLevel: number;
    iconUrls: SupportItemIconUrls;
    rarity: Rarity;
}

export class SupportItemIconUrls {
    medium: string;
}
