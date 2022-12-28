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

    if (!(await check_permissions(userId, ['pokémon:view_count']))) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const count = await prisma.pokemon.count();

        res.status(200).json({ count, message: 'Pokemon count retrieved' });
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
};

export default withSessionRoute(handler);
