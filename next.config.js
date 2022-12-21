/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
// const { nanoid } = require('nanoid');
// const crypto = require('crypto');

const generateCsp = () => {
    // const hash = crypto.createHash('sha256');
    // hash.update(nanoid());
    const production = process.env.NODE_ENV === 'production';

    const policies = [
        `default-src 'self';`,
        `connect-src 'self' https://api.stripe.com https://maps.googleapis.com;`,
        `frame-src 'self' https://js.stripe.com https://hooks.stripe.com;`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`,
        `script-src 'unsafe-inline' 'self' ${
            production ? '' : "'unsafe-eval'"
        } https://js.stripe.com https://maps.googleapis.com;`,
        `font-src https://fonts.gstatic.com 'self' data:;`,
        `img-src 'self' data:;`,
    ];

    return policies.join(' ');
};

const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
    },
    {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
    },
    {
        key: 'Content-Security-Policy',
        value: generateCsp(),
    },
];

const nextConfig = {
    outputFileTracing: true,
    reactStrictMode: true,
    swcMinify: true,
    productionBrowserSourceMaps: true,

    i18n,
    async headers() {
        return [
            {
                // Apply these headers to all routes in your application.
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
};

module.exports = nextConfig;
