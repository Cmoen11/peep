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
            <main className="flex min-h-screen  flex-col items-center bg-slate-900 p-5">
                <div className="flex flex-col w-2/4 space-x-4  gap-4 ">
                    {status === "loading" && <div>Loading...</div>}
                    {status === "authenticated" && <PostPeepForm />}
                    {status === "unauthenticated" && (
                        <div>
                            <button
                                onClick={() => signIn("discord")}
                                className="bg-blue-500 w-2/12 h-15 hover:bg-blue-700 text-white font-bold rounded-full ml-2"
                            >
                                Sign in
                            </button>
                        </div>
                    )}
                    <PeepsList />
                </div>
            </main>
        </>
    );
};

export default Home;
