import { NextApiRequest } from 'next';

export async function is_logged_in(req: NextApiRequest): Promise<boolean> {
    return !!req.session.userId;
}
