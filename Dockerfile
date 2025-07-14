# Dockerfile for filecabinet: Next.js + ClamAV + Calibre + conversion tools
FROM node:20-bullseye

# Install system dependencies for file conversion and virus scanning
RUN apt-get update && \
    apt-get install -y \
      clamav clamav-daemon \
      calibre \
      ffmpeg \
      libreoffice \
      imagemagick \
      poppler-utils \
      ghostscript \
    && rm -rf /var/lib/apt/lists/*

# Update ClamAV virus database
RUN freshclam || true

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build Next.js app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"] 