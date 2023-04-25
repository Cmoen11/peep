import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const profileRouter = createTRPCRouter({
    getProfile: publicProcedure
        .input(
            z.object({
                userId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: input.userId,
                },
                select: {
                    image: true,
                    name: true,
                    Profile: {
                        select: {
                            bio: true,
                            displayName: true,
                        },
                    },
                },
            });

            if (!user) {
                return null;
            }

            const profile = user?.Profile;

            return {
                username: user.name,
                displayName: profile?.displayName ?? user.name,
                bio: profile?.bio ?? "",
                image: user.image,
                isCurrentUser: ctx.session?.user?.id === input.userId,
            };
        }),
    updateProfile: protectedProcedure
        .input(
            z.object({
                displayName: z.string().min(1).max(50),
                bio: z.string().max(160),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.prisma.profile.upsert({
                where: {
                    userId: ctx.session.user.id,
                },
                update: {
                    displayName: input.displayName,
                    bio: input.bio,
                },
                create: {
                    userId: ctx.session.user.id,
                    displayName: input.displayName,
                    bio: input.bio,
                },
            });

            return {
                success: true,
            };
        }),
});
