import { Plugin } from '@prisma/client';

export type Package = {
    name: string;
    description: string;
    plugins: Plugin[];
    price: number;
};

export type PublicPlugin = Plugin & {
    price: number;
};
