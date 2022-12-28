import { Pokemon } from '@prisma/client';

export const inventoryFetcher = async (): Promise<Pokemon[]> => {
    const res = await fetch('api/inventory/list');

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const pokemon: Pokemon[] = data.pokemon;
    return pokemon;
};
