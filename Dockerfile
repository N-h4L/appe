FROM node:24-alpine

ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

COPY --chown=node:node package.json server.js ./
COPY --chown=node:node public ./public

EXPOSE 8000

USER node

CMD ["node", "server.js"]
