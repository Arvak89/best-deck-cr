export const normalizeCardName = (deckName: string) => {
    return deckName
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, '');
};
