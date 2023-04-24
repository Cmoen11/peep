import dayjs from "dayjs";
import { api } from "~/utils/api";
import { AiOutlineHeart, AiFillHeart, AiOutlineDelete } from "react-icons/ai";

import { useState } from "react";
import { useSession } from "next-auth/react";

// peep list is a component that displays a list of peeps/tweets
export function PeepsList() {
    const { data } = useSession();
    const { isLoading, data: peepsData } = api.peep.getAll.useQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-4">
            {peepsData?.map((peep) => {
                const isAuthor = peep.author.id == data?.user?.id;

                return (
                    <div
                        key={peep.id}
                        className="flex flex-row space-x-4 rounded-md p-4"
                    >
                        <div className="flex flex-col">
                            <div className="flex flex-row space-x-2 items-center">
                                <div className="text-white text-lg font-bold">
                                    {peep.author.name}
                                </div>
                                <div className="text-gray-500">
                                    @{peep.author.name}
                                </div>
                                <div className="text-gray-500">·</div>
                                <div className="text-gray-500">
                                    {dayjs(peep.createdAt).format("MMM D")}
                                </div>
                            </div>
                            <div className="text-white mt-1">
                                {peep.content}
                            </div>
                            <PeepActions
                                peepId={peep.id}
                                isAuthor={isAuthor}
                                likeCount={peep.likeCount}
                                likedByUser={peep.hasLiked}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function PeepActions({
    peepId,
    isAuthor,
    likeCount,
    likedByUser,
}: {
    peepId: string;
    isAuthor: boolean;
    likeCount: number;
    likedByUser: boolean;
}) {
    const { status } = useSession();
    const utils = api.useContext();
    const deleteMutation = api.peep.delete.useMutation({
        onSuccess: async () => {
            await utils.peep.getAll.invalidate();
        },
    });

    const likeMutation = api.peep.like.useMutation({
        onSuccess: async () => {
            await utils.peep.getAll.invalidate();
        },
    });

    const handleLikeClick = () => {
        likeMutation.mutate({ peepId });
    };

    const handleDeleteClick = async () => {
        await deleteMutation.mutateAsync({ peepId });
    };

    return (
        <div className="flex flex-row space-x-4">
            <button
                className="flex flex-row items-center space-x-2 hover:text-red-500"
                onClick={handleLikeClick}
                disabled={status !== "authenticated"}
            >
                {likedByUser ? (
                    <AiFillHeart className="text-pink-500 hover:text-pink-700" />
                ) : (
                    <AiOutlineHeart className="text-white hover:text-pink-700" />
                )}
                <div className="text-gray-500">{likeCount ?? 0}</div>
            </button>
            {isAuthor && (
                <button
                    className="flex flex-row items-center space-x-2 focus:outline-none hover:text-red-500"
                    onClick={handleDeleteClick}
                    disabled={deleteMutation.isLoading}
                >
                    {deleteMutation.isLoading ? (
                        <div className="animate-spin w-5 h-5 border-t-2 border-b-2 border-white rounded-full"></div>
                    ) : (
                        <>
                            <AiOutlineDelete className="fill-white" />
                            <div className="text-gray-500">Delete</div>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
