export interface PlayerCard {
    name: string;
    id: number;
    level: number;
    iconUrls: { medium: string; evolutionMedium: string };
    evolutionLevel?: number;
    maxLevel: number;
    maxEvolutionLevel?: number;
}
