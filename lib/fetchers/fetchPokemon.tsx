import { SWRInfiniteKeyLoader } from 'swr/infinite';

export const getPokemonKey = (limit: number, search: string): SWRInfiniteKeyLoader => {
    return (pageIndex, previousPageData) => {
        if (previousPageData && !previousPageData.pokemon) return null;

        if (pageIndex === 0) return `limit=${limit}&search=${search}`;

        pageIndex += 1;

        return `cursor=${previousPageData.nextCursor}&limit=${limit}&search=${search}`;
    };
};

export const pokemonFetcher = async (param: string) => {
    const res = await fetch(`api/pokemon/list${param ? `?${param}` : ''}`);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    return data;
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
