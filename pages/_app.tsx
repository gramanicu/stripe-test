import { GlobalProvider } from '@contexts/global.context';
import '@styles/globals.scss';
import { NextPage } from 'next';
import { appWithTranslation } from 'next-i18next';
import { ThemeProvider } from 'next-themes';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import React from 'react';
import { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export function reportWebVitals(metric: NextWebVitalsMetric) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', metric.name, {
            event_category: metric.label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value), // values must be integers
            event_label: metric.id, // id unique to current page load
            non_interaction: true, // avoids affecting bounce rate.
        });
    }
}

function App({ Component, pageProps: { ...pageProps } }: AppPropsWithLayout) {
    if (typeof window === 'undefined') React.useLayoutEffect = React.useEffect;

    const getLayout = Component.getLayout ?? (page => page);

    return (
        <GlobalProvider>
            <ThemeProvider attribute="class">{getLayout(<Component {...pageProps} />)}</ThemeProvider>
        </GlobalProvider>
    );
}

export default appWithTranslation(App);
