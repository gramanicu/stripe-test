import { is_logged_in } from '@lib/auth';
import { check_permissions } from '@lib/auth/permissions';
import { prisma } from '@lib/db';
import { POKEMON_PER_PAGE, fetchPokemon } from '@lib/pokemon/fetcher';
import { withSessionRoute } from '@lib/session';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { NextApiRequest, NextApiResponse } from 'next';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!(await is_logged_in(req))) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.userId;

    if (!(await check_permissions(userId, ['pokémon:add-page']))) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const offset = await prisma.pokemon.count();

    const pokemon_data = await fetchPokemon(POKEMON_PER_PAGE, offset);

    try {
        await prisma.pokemon.createMany({
            data: pokemon_data,
            skipDuplicates: true,
        });

        if (!(await check_permissions(userId, ['pokémon:list']))) {
            return res.status(200).json({ message: 'Added another page of pokemon' });
        }

        const all_pokemon = await prisma.pokemon.findMany({
            orderBy: {
                id: 'asc',
            },
        });

        return res.status(200).json({ message: 'Added another page of pokemon', all_pokemon });
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            // https://www.prisma.io/docs/reference/api-reference/error-reference
            switch (err.code) {
                case 'P2003':
                    return res.status(404).json({ message: 'Pokemon not found' });
                default:
                    return res.status(500).json({ message: 'Internal server error' });
            }
        }
        return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({ message: 'Success' });
};

export default withSessionRoute(handler);
