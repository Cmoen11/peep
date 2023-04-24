/* eslint-disable @next/next/no-img-element */
import dayjs, { Dayjs } from "dayjs";
import { useSession } from "next-auth/react";
import { AiFillHeart, AiOutlineDelete, AiOutlineHeart } from "react-icons/ai";
import { api } from "~/utils/api";
import durationPlugin from "dayjs/plugin/duration";
dayjs.extend(durationPlugin);

// peep list is a component that displays a list of peeps/tweets

function formatDateSince(duration: durationPlugin.Duration) {
    const hours = duration.asHours();
    const minutes = duration.asMinutes();

    if (hours > 1) {
        return `${hours.toFixed(0)}h`;
    }

    return `${minutes.toFixed(0)}m`;
}

export function PeepsList() {
    const { data } = useSession();
    const { isLoading, data: peepsData } = api.peep.getAll.useQuery();

    return (
        <div className="w-full flex flex-col gap-4  ">
            {isLoading && (
                <div className="flex w-full items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-t-2 border-b-2 border-white rounded-full text-center"></div>
                </div>
            )}
            {peepsData?.map((peep) => {
                const isAuthor = peep.author.id == data?.user?.id;

                // if under a day ago, display like 11m // 1h // 1d
                const createdAt = dayjs(peep.createdAt);
                const now = dayjs();
                const duration = dayjs.duration(now.diff(createdAt));
                const agoTextTwitterLike = formatDateSince(duration);

                return (
                    <div
                        key={peep.id}
                        className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full first-letter:py-4 border-b-2 border-slate-700 pb-2"
                    >
                        <div className="flex flex-row items-start space-x-4">
                            <div id="avatar" className="w-12 h-12 rounded-full">
                                <img
                                    src={peep.author.image ?? ""}
                                    alt="avatar"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row space-x-2 items-center">
                                    <div className="text-white text-base font-semibold">
                                        {peep.author.name}
                                    </div>
                                    <div className="text-gray-500">
                                        @{peep.author.name}
                                    </div>
                                    <div className="text-gray-500">·</div>
                                    <div className="text-gray-500">
                                        {agoTextTwitterLike}
                                    </div>
                                </div>
                                <div className="text-white mt-1 text-base ">
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
        <div className="flex flex-row space-x-8">
            <button
                className="flex flex-row items-center space-x-2 hover:text-red-500"
                onClick={handleLikeClick}
                disabled={status !== "authenticated" || likeMutation.isLoading}
            >
                {likeMutation.isLoading ? (
                    <div className="animate-spin w-5 h-5 border-t-2 border-b-2 border-white rounded-full"></div>
                ) : (
                    <>
                        {likedByUser ? (
                            <AiFillHeart
                                size={20}
                                className="text-pink-500 hover:text-pink-700"
                            />
                        ) : (
                            <AiOutlineHeart
                                size={20}
                                className="text-white hover:text-pink-700"
                            />
                        )}
                        <div className="text-gray-500">{likeCount ?? 0}</div>
                    </>
                )}
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
                            <AiOutlineDelete size={20} className="fill-white" />
                            <div className="text-gray-500">Delete</div>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
