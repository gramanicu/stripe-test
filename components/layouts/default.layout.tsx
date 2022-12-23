import AuthButton from '@components/auth/AuthButton';
import Head from 'next/head';
import toast, { ToastBar, Toaster } from 'react-hot-toast';

type Props = {
    children?: React.ReactNode;
};

export function DefaultLayout({ children }: Props) {
    return (
        <div className="min-h-screen antialiased flex flex-col">
            {/* Head/Meta tags */}
            <Head>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <meta name="author" content="webitfactory" />
                <link rel="shortcut icon" href="/favicon.ico" />
            </Head>
            <Toaster position="top-right">
                {t => (
                    <ToastBar toast={t}>
                        {({ icon, message }) => (
                            <>
                                {icon}
                                {message}
                                {t.type !== 'loading' && <button onClick={() => toast.dismiss(t.id)}>X</button>}
                            </>
                        )}
                    </ToastBar>
                )}
            </Toaster>
            <div className="flex flex-col ">
                <div className="flex flex-row justify-between p-2 shadow-xl">
                    <span className="text-xl font-medium">
                        <span className="text-green-500">Stripe</span>Test
                    </span>
                    <AuthButton />
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}
