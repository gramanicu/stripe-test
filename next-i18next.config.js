// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
module.exports = {
    i18n: {
        locales: ['en', 'ro'],
        defaultLocale: 'en',
    },
    localePath: path.resolve('./public/locales'),
    trailingSlash: true,
};
