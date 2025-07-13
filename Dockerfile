# Use official Node.js LTS image
FROM node:20

# Install Calibre and dependencies
RUN apt-get update && \
    apt-get install -y wget xz-utils && \
    wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin

# Add Calibre to PATH
ENV PATH="/opt/calibre:${PATH}"

# Set working directory
WORKDIR /app

# Copy package files and install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port (change if your app uses a different port)
EXPOSE 3000

# Start the app
CMD ["npm", "start"] 