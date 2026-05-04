FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node backend/package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node backend/ ./
USER node
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
