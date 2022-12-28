import PokemonCard from '@components/cards/PokemonCard';
import { DefaultLayout } from '@components/layouts/default.layout';
import { inventoryFetcher } from '@lib/fetchers/fetchInventory';
import { privilegesFetcher } from '@lib/fetchers/fetchPrivileges';
import { withSessionSsr } from '@lib/session';
import { Pokemon } from '@prisma/client';
import Head from 'next/head';
import { ReactElement, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { useSWRConfig } from 'swr';

export default function Inventory() {
    const { data, error, mutate } = useSWR('inventory/list', inventoryFetcher);
    const { mutate: globalMutate } = useSWRConfig();
    const [isLoading, setIsLoading] = useState(false);
    const { data: privileges } = useSWR('auth/privileges', privilegesFetcher);

    if (error) {
        toast.error(error.message);
        return <div>Failed to load</div>;
    }

    const removePokemonFromInventory = async (pokemon: Pokemon) => {
        setIsLoading(true);
        const res = await fetch('/api/inventory/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pokemonId: pokemon.id,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            toast.success(`Removed ${pokemon.name} from inventory!`);

            mutate();
            globalMutate('shop/list');
        } else {
            toast.error(`Failed to remove pokemon from inventory\nReason: ${data.message}`);
        }

        setIsLoading(false);
    };

    return (
        <>
            <Head>
                <title>Inventory</title>
                <meta name="description" content="An app used to learn stripe usage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col gap-4 my-4">
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 flex-col gap-4">
                    {data ? (
                        data.length > 0 ? (
                            data.map((pokemon, index) => (
                                <div className="w-full" key={pokemon.id}>
                                    <PokemonCard
                                        priority={index < 10}
                                        disabled={
                                            isLoading || !privileges || !privileges.includes('pokémon:owned:remove')
                                        }
                                        buttonText="Remove"
                                        name={pokemon.name}
                                        url={pokemon.url}
                                        onClick={async () => {
                                            if (isLoading) return;
                                            removePokemonFromInventory(pokemon);
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

Inventory.getLayout = function getLayout(page: ReactElement) {
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
