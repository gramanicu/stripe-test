/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const { nanoid } = require('nanoid');
const crypto = require('crypto');

const generateCsp = () => {
    const hash = crypto.createHash('sha256');
    hash.update(nanoid());
    const production = process.env.NODE_ENV === 'production';

    return `default-src 'self'; style-src https://fonts.googleapis.com 'self' 'unsafe-inline'; script-src 'sha256-${hash.digest(
        'base64'
    )}' 'self' 'unsafe-inline' ${
        production ? '' : "'unsafe-eval'"
    }; font-src https://fonts.gstatic.com 'self' data:; img-src 'self' data:;`;
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
