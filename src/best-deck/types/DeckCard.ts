import { PlayerCard } from './PlayerCard';

export type DeckCard = Omit<PlayerCard, 'iconUrls'> & { icon: string; evo: boolean };
