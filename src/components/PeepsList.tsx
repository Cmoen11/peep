import dayjs from "dayjs";
import { api } from "~/utils/api";

// peep list is a component that displays a list of peeps/tweets
export function PeepsList() {
    const { isLoading, data: peepsData } = api.peep.getAll.useQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-4">
            {peepsData?.map((peep) => (
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
                        <div className="text-white mt-1">{peep.content}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
