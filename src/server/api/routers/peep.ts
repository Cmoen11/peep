import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

export const peepRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const peeps = await ctx.prisma.peeps.findMany({
            select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return peeps;
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
});
