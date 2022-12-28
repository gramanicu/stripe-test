import { is_logged_in } from '@lib/auth';
import { check_permissions } from '@lib/auth/permissions';
import { prisma } from '@lib/db';
import { withSessionRoute } from '@lib/session';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { NextApiRequest, NextApiResponse } from 'next';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!(await is_logged_in(req))) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.session.userId;

    if (!(await check_permissions(userId, ['pokémon:list']))) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const pokemon = await prisma.pokemon.findMany({
            where: {
                owners: {
                    none: {
                        id: userId,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                url: true,
            },
        });

        if (pokemon.length === 0) {
            return res.status(404).json({ message: 'No pokemon found' });
        }

        return res.status(200).json({ message: 'Pokemon list retrieved', pokemon });
    } catch (err) {
        if (err instanceof PrismaClientKnownRequestError) {
            // https://www.prisma.io/docs/reference/api-reference/error-reference
            switch (err.code) {
                case 'P2003':
                    return res.status(404).json({ message: 'No pokemon found' });
                default:
                    return res.status(500).json({ message: 'Internal server error' });
            }
        }

        return res.status(404).json({ message: 'No pokemon found' });
    }
};

export default withSessionRoute(handler);
