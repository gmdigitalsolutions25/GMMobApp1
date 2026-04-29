import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // SECURITY: Hide internal error details in production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.SMS_PROVIDER === 'softline';
    return {
      ...shape,
      data: {
        ...shape.data,
        // Strip stack trace in production
        stack: isProduction ? undefined : (error as any).stack,
      },
      message: isProduction && error.code === 'INTERNAL_SERVER_ERROR'
        ? 'An internal error occurred'
        : shape.message,
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
