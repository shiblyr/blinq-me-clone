
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createBusinessCardInputSchema,
  updateBusinessCardInputSchema,
  getBusinessCardByIdInputSchema,
  getBusinessCardByUrlInputSchema,
  generateQrCodeInputSchema
} from './schema';

import { createBusinessCard } from './handlers/create_business_card';
import { getBusinessCards } from './handlers/get_business_cards';
import { getBusinessCardById } from './handlers/get_business_card_by_id';
import { getBusinessCardByUrl } from './handlers/get_business_card_by_url';
import { updateBusinessCard } from './handlers/update_business_card';
import { deleteBusinessCard } from './handlers/delete_business_card';
import { generateQrCode } from './handlers/generate_qr_code';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  createBusinessCard: publicProcedure
    .input(createBusinessCardInputSchema)
    .mutation(({ input }) => createBusinessCard(input)),
  getBusinessCards: publicProcedure
    .query(() => getBusinessCards()),
  getBusinessCardById: publicProcedure
    .input(getBusinessCardByIdInputSchema)
    .query(({ input }) => getBusinessCardById(input)),
  getBusinessCardByUrl: publicProcedure
    .input(getBusinessCardByUrlInputSchema)
    .query(({ input }) => getBusinessCardByUrl(input)),
  updateBusinessCard: publicProcedure
    .input(updateBusinessCardInputSchema)
    .mutation(({ input }) => updateBusinessCard(input)),
  deleteBusinessCard: publicProcedure
    .input(getBusinessCardByIdInputSchema)
    .mutation(({ input }) => deleteBusinessCard(input)),
  generateQrCode: publicProcedure
    .input(generateQrCodeInputSchema)
    .mutation(({ input }) => generateQrCode(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
