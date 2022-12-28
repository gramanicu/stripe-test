import { Pokemon } from '@prisma/client';

export const pokemonFetcher = async (): Promise<Pokemon[]> => {
    const res = await fetch('api/pokemon/list');

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const pokemon: Pokemon[] = data.pokemon;
    return pokemon;
};

export const pokemonCountFetcher = async (): Promise<number> => {
    const res = await fetch('api/pokemon/count');

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const count: number = data.count;
    return count;
};
