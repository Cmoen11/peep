/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { PeepsList } from "~/components/PeepsList";
import Layout from "~/components/layout";
import { api } from "~/utils/api";
import { AiFillEdit } from "react-icons/ai";
import { type FormEvent, useRef, useState } from "react";
import Link from "next/link";

// [...profileId].tsx
const Profile: NextPage = () => {
    const router = useRouter();
    const [editMode, setEditMode] = useState(false);
    const { profileId } = router.query as { profileId: string };
    const formRef = useRef<HTMLFormElement>(null);
    const profileQuery = api.profile.getProfile.useQuery(
        {
            userId: profileId,
        },
        {}
    );
    const profileMutation = api.profile.updateProfile.useMutation({
        onSuccess: async () => {
            await profileQuery.refetch();
        },
    });

    function onEditCompleted(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        const displayName = formData.get("displayName");
        const bio = formData.get("bio");

        profileMutation.mutate({
            bio: bio as string,
            displayName: displayName as string,
        });

        setEditMode(false);
    }

    if (profileQuery.isLoading) {
        return (
            <Layout>
                <div className="flex w-full items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-t-2 border-b-2 border-white rounded-full text-center"></div>
                </div>
            </Layout>
        );
    }

    if (!profileQuery.data) {
        return (
            <Layout>
                <div className="flex w-full items-center justify-center">
                    <div className="text-white text-base font-semibold">
                        Profile not found
                    </div>
                </div>
            </Layout>
        );
    }

    const profile = profileQuery.data;

    return (
        <Layout>
            <div className="w-full py-5 text-white">
                <div id="breadcrumb" className="flex flex-row space-x-2">
                    <div className="text-gray-500 text-base">
                        <Link href="/">Home</Link>
                    </div>
                    <div className="text-gray-500 text-base">/</div>
                    <div className="text-gray-500 text-base">
                        <Link href={`/profile/${profileId}`}>
                            @{profile.displayName}
                        </Link>
                    </div>
                </div>
                {!editMode ? (
                    <>
                        <div className="flex flex-row items-center justify-between mt-4">
                            <div className="flex flex-row items-center space-x-4">
                                <div
                                    id="avatar"
                                    className="w-12 h-12 rounded-full"
                                >
                                    <img
                                        src={profile.image ?? ""}
                                        alt="avatar"
                                    />
                                </div>
                                <h1 className="text-2xl font-semibold">
                                    {profile.displayName}
                                    <span className="text-gray-500 text-base">
                                        {" "}
                                        · @{profile.username}
                                    </span>
                                </h1>
                            </div>
                            {profile.isCurrentUser && (
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-full"
                                    onClick={() => setEditMode(true)}
                                >
                                    <AiFillEdit size={30} />
                                </button>
                            )}
                        </div>
                        <div className="text-gray-500 text-base mt-3">
                            {profile.bio ?? "No bio"}
                        </div>
                    </>
                ) : (
                    <form
                        className="flex flex-col space-y-4 text-black"
                        onSubmit={onEditCompleted}
                        ref={formRef}
                    >
                        <label htmlFor="displayName">Display Name:</label>
                        <input
                            type="text"
                            name="displayName"
                            defaultValue={profile.displayName ?? ""}
                        />

                        <label htmlFor="bio">Bio:</label>
                        <textarea
                            name="bio"
                            rows={4}
                            defaultValue={profile.bio ?? ""}
                        />

                        <div className="flex justify-between pt-4">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-full"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-full"
                                onClick={() => setEditMode(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
            <hr className="border-gray-500 w-full" />
            <PeepsList profileId={profileId} />
        </Layout>
    );
};

export default Profile;
