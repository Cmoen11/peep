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
            className="w-full flex-row flex"
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
            <div className="flex flex-grow">
                <input
                    name="content"
                    className="w-full bg-white text-black rounded-l-full border-gray-500 p-3 text-xl"
                />
            </div>
            <button
                className="bg-blue-500 w-2/12 h-15 hover:bg-blue-700 text-white font-bold rounded-r-full"
                type="submit"
                disabled={peepMutation.isLoading}
            >
                {peepMutation.isLoading ? "Loading..." : "Peep"}
            </button>
        </form>
    );
};
