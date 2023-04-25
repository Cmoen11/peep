import type { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => (
    <main className="flex min-h-screen flex-col items-center  p-5">
        <div className="flex flex-col w-full md:w-2/4 space-x-4 gap-8 md:px-0">
            {children}
        </div>
    </main>
);

export default Layout;
