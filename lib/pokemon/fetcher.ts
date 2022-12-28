export type FetchedPokemon = {
    id: string;
    name: string;
    url: string;
};

export const POKEMON_PER_PAGE = 100;

export const fetchPokemon = async (count: number, offset: number): Promise<FetchedPokemon[]> => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${count}&offset=${offset}`);

    if (!response.ok) {
        throw new Error('Failed to fetch pokemon');
    }

    const json = await response.json();

    return json.results.map((pokemon: { url: string; name: string }) => {
        const split = pokemon.url.split('/');
        const id = split[split.length - 2];

        return {
            name: pokemon.name,
            url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        };
    });
};
