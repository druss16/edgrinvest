# Build stage
FROM node:20 AS build

# Define build arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Echo to confirm value
RUN echo "🚨 VITE_API_URL is: $VITE_API_URL"

WORKDIR /app
COPY package*.json ./
RUN npm install
# 👇 Force esbuild to match host version
RUN npm install esbuild@0.25.6 --save-dev
COPY . .

# Inject API env directly into Vite build
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]