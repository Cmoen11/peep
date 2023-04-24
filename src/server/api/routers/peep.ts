import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
    peepActionProdecure as peepProdecure,
} from "~/server/api/trpc";

export const peepRouter = createTRPCRouter({
    getAll: publicProcedure
        // .input(
        //     z.object({
        //         orderBy: z
        //             .enum(["createdAt", "likeCount"])
        //             .optional()
        //             .default("createdAt"),
        //         order: z.enum(["asc", "desc"]).optional().default("desc"),
        //     })
        // )
        .query(async ({ ctx }) => {
            const peeps = await ctx.prisma.peeps.findMany({
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    likedBy: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            const userId = ctx?.session?.user ? ctx.session.user.id : null;
            const peepsWithLikes = peeps.map((peep) => {
                return {
                    ...peep,
                    likeCount: peep.likedBy.length,
                    hasLiked: userId
                        ? peep.likedBy.some((like) => like.user.id === userId)
                        : false,
                };
            });

            return peepsWithLikes;
        }),

    create: protectedProcedure
        .input(z.object({ content: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const peep = await ctx.prisma.peeps.create({
                data: {
                    content: input.content,
                    author: {
                        connect: {
                            id: ctx.session.user.id,
                        },
                    },
                },
                select: {
                    id: true,
                    content: true,
                    createdAt: true,
                },
            });

            return peep;
        }),

    delete: peepProdecure.mutation(async ({ ctx }) => {
        const isAllowedToDelete = ctx.isAuthor && ctx.peep?.id;

        if (isAllowedToDelete) {
            await ctx.prisma.peeps.delete({
                where: {
                    id: ctx.peep?.id,
                },
            });
        } else {
            return new TRPCError({
                code: "UNAUTHORIZED",
                message: "You are not allowed to delete this peep",
            });
        }

        return {
            success: true,
        };
    }),

    like: peepProdecure.mutation(async ({ ctx }) => {
        const hasAlreadyLiked = ctx.peep?.likedBy.some(
            (like) => like.userId === ctx.session?.user.id
        );
        const isAllowedToLike = ctx.peep?.id && ctx.session?.user.id;

        if (isAllowedToLike) {
            if (hasAlreadyLiked) {
                await ctx.prisma.like.deleteMany({
                    where: {
                        peepId: ctx.peep?.id,
                        userId: ctx.session?.user.id,
                    },
                });
                return {
                    success: true,
                };
            }

            await ctx.prisma.like.create({
                data: {
                    peep: {
                        connect: {
                            id: ctx.peep?.id,
                        },
                    },
                    user: {
                        connect: {
                            id: ctx.session?.user.id,
                        },
                    },
                },
            });
        } else {
            return new TRPCError({
                code: "UNAUTHORIZED",
                message: "You are not allowed to like this peep",
            });
        }

        return {
            success: true,
        };
    }),
});
