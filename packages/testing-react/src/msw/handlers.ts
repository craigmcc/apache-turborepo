import { rest } from 'msw';

export const handlers = [
  rest.get('/api/test-example', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ ok: true }));
  }),
];

