import { is_logged_in } from '@lib/auth';
import { check_permissions } from '@lib/auth/permissions';
import { prisma } from '@lib/db';
import { withSessionRoute } from '@lib/session';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { NextApiRequest, NextApiResponse } from 'next';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!(await is_logged_in(req))) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.userId;

    if (!(await check_permissions(userId, ['pokémon:owned:remove']))) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const { pokemonId } = req.body;

    try {
        const pokemon = await prisma.pokemon.update({
            where: {
                id: pokemonId,
            },
            data: {
                owners: {
                    disconnect: {
                        id: userId,
                    },
                },
            },
            include: {
                owners: true,
            },
        });

        if (!(await check_permissions(userId, ['pokémon:owned:list']))) {
            return res.status(204).end();
        }

        return res.status(200).json({ message: 'Pokemon removed from inventory', pokemon });
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            // https://www.prisma.io/docs/reference/api-reference/error-reference
            switch (err.code) {
                case 'P2025':
                    return res.status(404).json({ message: 'Pokemon not found' });
                default:
                    return res.status(500).json({ message: 'Internal server error' });
            }
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default withSessionRoute(handler);
