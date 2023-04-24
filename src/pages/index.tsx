import { type NextPage } from "next";
import Head from "next/head";
import { PeepsList } from "~/components/PeepsList";
import { PostPeepForm } from "~/components/PostPeepForm";
import { signIn, signOut, useSession } from "next-auth/react";

const Home: NextPage = () => {
    const { status } = useSession();

    return (
        <>
            <Head>
                <title>Peep</title>
                <meta name="description" content="Peep your mind" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center bg-slate-900 p-5">
                {status === "loading" ? (
                    <div className="flex w-full items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-t-2 border-b-2 border-white rounded-full text-center"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col w-full md:w-2/4 space-x-4 gap-8 md:px-0">
                            {status === "authenticated" && <PostPeepForm />}
                            {status === "unauthenticated" && (
                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={() => signIn("discord")}
                                        className="bg-blue-500 w-full md:w-2/12 h-15 hover:bg-blue-700 text-white font-bold rounded-full md:ml-2"
                                    >
                                        Sign in
                                    </button>
                                </div>
                            )}
                            <PeepsList />
                        </div>
                    </>
                )}
            </main>
        </>
    );
};

export default Home;
