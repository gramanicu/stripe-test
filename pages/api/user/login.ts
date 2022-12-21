import { prisma } from '@lib/db';
import { stripe } from '@lib/stripe';
import type { NextApiRequest, NextApiResponse } from 'next';

type DTO = {
    message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email } = JSON.parse(req.body);

    const customers = (
        await stripe.customers.search({
            query: `email:"${email}"`,
        })
    ).data;

    if (customers.length > 0) {
        const user = await prisma.user.findFirst({
            where: {
                email,
            },
        });

        if (!user)
            await prisma.user.create({
                data: {
                    email,
                    stripeCustomerId: customers[0].id,
                },
            });

        const res_dto: DTO = {
            message: 'Authentication successful',
        };
        return res.status(200).json(res_dto);
    }

    const customer = await stripe.customers.create({
        email,
    });

    await prisma.user.create({
        data: {
            email,
            stripeCustomerId: customer.id,
        },
    });

    const res_dto: DTO = {
        message: 'Account created & authentication was successful',
    };
    return res.status(200).json(res_dto);
}
