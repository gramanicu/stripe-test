import PokemonCard from '@components/cards/PokemonCard';
import TextInput from '@components/inputs/TextInput';
import { DefaultLayout } from '@components/layouts/default.layout';
import { getPokemonKey, pokemonCountFetcher, pokemonFetcher } from '@lib/fetchers/fetchPokemon';
import { privilegesFetcher } from '@lib/fetchers/fetchPrivileges';
import { capitalizeFirstLetter } from '@lib/helpers';
import { withSessionSsr } from '@lib/session';
import { Pokemon } from '@prisma/client';
import Head from 'next/head';
import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';
import useSWRInfinite from 'swr/infinite';

export default function Shop() {
    const [search, setSearch] = useState('');
    const getKey = getPokemonKey(25, search);
    const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite<{ pokemon: Pokemon[] }>(
        getKey,
        pokemonFetcher
    );
    const { mutate: globalMutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);
    const { data: privileges } = useSWR('auth/privileges', privilegesFetcher);
    const { data: pokemon_count, mutate: pokemon_count_mutate } = useSWR(
        privileges && privileges.includes('pokémon:view_count') ? 'shop/view_count' : null,
        pokemonCountFetcher
    );

    const pokemon = data
        ? data
              .map(data => {
                  return data.pokemon;
              })
              .flat()
        : [];

    const observer = useRef<IntersectionObserver>();
    const lastElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (isValidating) return;
            if (error) return;

            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    loadNewPage();
                }
            });

            if (node) observer.current.observe(node);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [error, isValidating]
    );

    const loadNewPage = () => {
        setSize(size + 1);
    };

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
            pokemon_count_mutate();
        } else {
            toast.error(`Failed to add a page of pokémon to the database\nReason: ${data.message}`);
        }

        setIsLoading(false);
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
                        {pokemon ? `${pokemon.length} results` : 'No results'}
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
                    {pokemon ? (
                        pokemon.length > 0 ? (
                            pokemon.map((pokemon_elem, index) =>
                                index === pokemon.length - 1 ? (
                                    <div className="w-full" key={pokemon_elem.id} ref={lastElementRef}>
                                        <PokemonCard
                                            priority={index < 10}
                                            buttonText="Add to inventory"
                                            disabled={
                                                isLoading || !privileges || !privileges.includes('pokémon:owned:add')
                                            }
                                            name={pokemon_elem.name}
                                            url={pokemon_elem.url}
                                            onClick={async () => {
                                                if (isLoading) return;
                                                addPokemonToInventory(pokemon_elem);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full" key={pokemon_elem.id}>
                                        <PokemonCard
                                            priority={index < 10}
                                            buttonText="Add to inventory"
                                            disabled={
                                                isLoading || !privileges || !privileges.includes('pokémon:owned:add')
                                            }
                                            name={pokemon_elem.name}
                                            url={pokemon_elem.url}
                                            onClick={async () => {
                                                if (isLoading) return;
                                                addPokemonToInventory(pokemon_elem);
                                            }}
                                        />
                                    </div>
                                )
                            )
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
