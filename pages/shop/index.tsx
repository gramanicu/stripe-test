import PokemonCard from '@components/cards/PokemonCard';
import TextInput from '@components/inputs/TextInput';
import { DefaultLayout } from '@components/layouts/default.layout';
import { pokemonCountFetcher, pokemonFetcher } from '@lib/fetchers/fetchPokemon';
import { privilegesFetcher } from '@lib/fetchers/fetchPrivileges';
import { capitalizeFirstLetter } from '@lib/helpers';
import { withSessionSsr } from '@lib/session';
import { Pokemon } from '@prisma/client';
import Head from 'next/head';
import { ReactElement, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';

export default function Shop() {
    const { data, error, mutate } = useSWR('shop/list', pokemonFetcher);
    const { mutate: globalMutate } = useSWRConfig();
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { data: privileges } = useSWR('auth/privileges', privilegesFetcher);
    const { data: pokemon_count } = useSWR(
        privileges && privileges.includes('pokémon:view_count') ? 'shop/view_count' : null,
        pokemonCountFetcher
    );

    if (error) {
        toast.error(error.message);
        return <div>Failed to load</div>;
    }

    const addPokemonToInventory = async (pokemon: Pokemon) => {
        setIsLoading(true);
        const res = await fetch('/api/inventory/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pokemonId: pokemon.id,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            toast.success(`Added ${capitalizeFirstLetter(pokemon.name)} to inventory!`);

            mutate();
            globalMutate('inventory/list');
        } else {
            toast.error(`Failed to add pokemon to inventory\nReason: ${data.message}`);
        }

        setIsLoading(false);
    };

    const addPokemonPage = async () => {
        setIsLoading(true);
        const res = await fetch('/api/pokemon/more', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (res.ok) {
            toast.success(`Added a page of pokémon to the database!`);
            mutate();
        } else {
            toast.error(`Failed to add a page of pokémon to the database\nReason: ${data.message}`);
        }

        setIsLoading(false);
    };

    const filterPokemon = (pokemonArr: Pokemon[], search: string) => {
        return pokemonArr.filter(pokemon => pokemon.name.toLowerCase().includes(search.toLowerCase()));
    };

    return (
        <>
            <Head>
                <title>PokéShop</title>
                <meta name="description" content="An app used to learn stripe usage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col gap-4 my-4">
                <TextInput text={search} onChange={setSearch} placeholder="Search for a pokemon..." />
                <div className="flex flex-row w-full justify-between">
                    <span className="text-md font-bold text-gray-500">
                        {data ? `${filterPokemon(data, search).length} results` : 'No results'}
                        {pokemon_count ? ` / ${pokemon_count} pokémon` : ''}
                    </span>
                    {privileges && privileges.includes('pokémon:add-page') && (
                        <button
                            className="border border-secondary text-secondary rounded-lg px-2 py-1"
                            onClick={() => {
                                addPokemonPage();
                            }}>
                            Search for more
                        </button>
                    )}
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 flex-col gap-4">
                    {data ? (
                        filterPokemon(data, search).length > 0 ? (
                            filterPokemon(data, search).map((pokemon, index) => (
                                <div className="w-full" key={pokemon.id}>
                                    <PokemonCard
                                        priority={index < 10}
                                        buttonText="Add to inventory"
                                        disabled={isLoading || !privileges || !privileges.includes('pokémon:owned:add')}
                                        name={pokemon.name}
                                        url={pokemon.url}
                                        onClick={async () => {
                                            if (isLoading) return;
                                            addPokemonToInventory(pokemon);
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="min-w-full sm:min-w-[128px]">No results</div>
                        )
                    ) : (
                        <div className="w-full">Loading...</div>
                    )}
                </div>
            </div>
        </>
    );
}

Shop.getLayout = function getLayout(page: ReactElement) {
    return <DefaultLayout>{page}</DefaultLayout>;
};

export const getServerSideProps = withSessionSsr(async ({ req }) => {
    if (!req.session || !req.session.userId) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
});
