import { DefaultLayout } from '@components/layouts/default.layout';
import Head from 'next/head';
import { ReactElement } from 'react';

export default function Home() {
    return (
        <>
            <Head>
                <title>Inventory</title>
                <meta name="description" content="An app used to learn stripe usage" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="flex flex-col p-4 gap-4"></div>
        </>
    );
}

Home.getLayout = function getLayout(page: ReactElement) {
    return <DefaultLayout>{page}</DefaultLayout>;
};

// export async function getServerSideProps() {}
