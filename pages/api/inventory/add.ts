import { is_logged_in } from '@lib/auth';
import { check_permissions } from '@lib/auth/permissions';
import { prisma } from '@lib/db';
import { withSessionRoute } from '@lib/session';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { NextApiRequest, NextApiResponse } from 'next';

type RequestBody = {
    pokemonId: string;
};

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

    const { pokemonId } = req.body as RequestBody;

    try {
        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                pokemon: {
                    connect: {
                        id: pokemonId,
                    },
                },
            },
            include: {
                pokemon: true,
            },
        });

        if (!(await check_permissions(user, ['pokémon:owned:list']))) {
            return res.status(204).end();
        }

        return res.status(201).json({ message: 'Pokemon added to inventory', pokemon: user.pokemon });
    } catch (err) {
        // https://www.prisma.io/docs/reference/api-reference/error-reference
        if (err instanceof PrismaClientKnownRequestError) {
            switch (err.code) {
                case 'P2002':
                    return res.status(409).json({ message: 'Pokemon already in inventory' });
                case 'P2025':
                    return res.status(404).json({ message: 'Pokemon not found' });
                case 'P2003':
                    return res.status(404).json({ message: 'User not found' });
                case 'P2016':
                    return res.status(404).json({ message: 'User not found' });
                default:
                    return res.status(500).json({ message: 'Internal server error' });
            }
        }

        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default withSessionRoute(handler);
