import { initTRPC, TRPCError } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createBusinessCardInputSchema,
  updateBusinessCardInputSchema,
  getBusinessCardByIdInputSchema,
  getBusinessCardByUrlInputSchema,
  generateQrCodeInputSchema,
  signupInputSchema,
  signinInputSchema
} from './schema';

import { createBusinessCard } from './handlers/create_business_card';
import { getBusinessCards } from './handlers/get_business_cards';
import { getBusinessCardById } from './handlers/get_business_card_by_id';
import { getBusinessCardByUrl } from './handlers/get_business_card_by_url';
import { updateBusinessCard } from './handlers/update_business_card';
import { deleteBusinessCard } from './handlers/delete_business_card';
import { generateQrCode } from './handlers/generate_qr_code';

// Auth handlers
import { signup } from './handlers/auth/signup';
import { signin } from './handlers/auth/signin';
import { me } from './handlers/auth/me';
import { logout } from './handlers/auth/logout';

// Simple token verification function
function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Token expired
    }
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// Create context type
interface Context {
  userId?: number;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

// Protected procedure that requires authentication
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

// Auth router
const authRouter = router({
  signup: publicProcedure
    .input(signupInputSchema)
    .mutation(({ input }) => signup(input)),
  signin: publicProcedure
    .input(signinInputSchema)
    .mutation(({ input }) => signin(input)),
  me: protectedProcedure
    .query(({ ctx }) => me(ctx.userId)),
  logout: protectedProcedure
    .mutation(() => logout()),
});

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  auth: authRouter,
  createBusinessCard: protectedProcedure
    .input(createBusinessCardInputSchema)
    .mutation(({ input, ctx }) => createBusinessCard(input, ctx.userId)),
  getBusinessCards: protectedProcedure
    .query(({ ctx }) => getBusinessCards(ctx.userId)),
  getBusinessCardById: publicProcedure
    .input(getBusinessCardByIdInputSchema)
    .query(({ input }) => getBusinessCardById(input)),
  getBusinessCardByUrl: publicProcedure
    .input(getBusinessCardByUrlInputSchema)
    .query(({ input }) => getBusinessCardByUrl(input)),
  updateBusinessCard: protectedProcedure
    .input(updateBusinessCardInputSchema)
    .mutation(({ input, ctx }) => updateBusinessCard(input, ctx.userId)),
  deleteBusinessCard: protectedProcedure
    .input(getBusinessCardByIdInputSchema)
    .mutation(({ input, ctx }) => deleteBusinessCard(input, ctx.userId)),
  generateQrCode: protectedProcedure
    .input(generateQrCodeInputSchema)
    .mutation(({ input, ctx }) => generateQrCode(input, ctx.userId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext({ req }): Context {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {};
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = verifyToken(token);
      if (!decoded) {
        return {};
      }

      return { userId: decoded.userId };
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();