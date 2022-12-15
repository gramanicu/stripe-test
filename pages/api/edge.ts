import { v4 as uuidv4 } from 'uuid';

export const config = {
    runtime: 'experimental-edge',
};

export default async function handler() {
    return new Response(JSON.stringify({ id: uuidv4() }), {
        status: 200,
        headers: {
            'content-type': 'application/json',
            'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
        },
    });
}
