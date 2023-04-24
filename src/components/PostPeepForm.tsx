import { useRef } from "react";
import { api } from "~/utils/api";

export const PostPeepForm = () => {
    const refReset = useRef<HTMLFormElement>(null);
    const utils = api.useContext();
    const peepMutation = api.peep.create.useMutation({
        onSuccess: async () => {
            await utils.peep.getAll.invalidate();
        },
    });

    return (
        <form
            ref={refReset}
            className="w-full flex flex-col md:flex-row"
            onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const content = formData.get("content");
                if (typeof content === "string") {
                    await peepMutation.mutateAsync({ content });
                    refReset.current?.reset();
                }
            }}
        >
            <div className="flex flex-grow mb-4 md:mb-0">
                <input
                    name="content"
                    disabled={peepMutation.isLoading}
                    className="w-full bg-white text-black rounded-l-lg md:rounded-none md:rounded-l-lg border-gray-500 p-3 text-xl"
                />
            </div>
            <button
                className="bg-blue-500 w-4/12 h-15 hover:bg-blue-700 text-white font-bold rounded-r-lg md:rounded-none md:rounded-r-lg"
                type="submit"
                disabled={peepMutation.isLoading}
            >
                {peepMutation.isLoading ? (
                    <div className="flex w-full items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-t-2 border-b-2 border-white rounded-full text-center"></div>
                    </div>
                ) : (
                    "Peep"
                )}
            </button>
        </form>
    );
};
