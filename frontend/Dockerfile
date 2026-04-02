FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASEURL=http://localhost:8080/api
ARG VITE_API_TOKEN=
ARG VITE_USE_MOCK_API=false

ENV VITE_API_BASEURL=${VITE_API_BASEURL}
ENV VITE_API_TOKEN=${VITE_API_TOKEN}
ENV VITE_USE_MOCK_API=${VITE_USE_MOCK_API}

RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
