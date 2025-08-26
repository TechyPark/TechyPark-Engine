# ---- Base Stage ----
# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies Stage ----
FROM base AS dependencies
# Copy package.json and package-lock.json
COPY package*.json ./
# Install app dependencies
RUN npm ci --only=production

# ---- Release Stage ----
FROM base AS release
WORKDIR /usr/src/app
# Copy dependencies from the 'dependencies' stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
# Copy application source code
COPY . .

# Your app binds to port 5000, so expose it
EXPOSE 5000

# Define the command to run your app
CMD [ "node", "server.js" ]
