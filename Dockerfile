# Dockerfile for filecabinet: Next.js + ClamAV + Calibre + conversion tools
FROM node:20-bullseye

# Install system dependencies for file conversion and virus scanning
RUN apt-get update && \
    apt-get install -y \
      clamav clamav-daemon \
      calibre \
      ffmpeg \
      libreoffice \
      unoconv \
      imagemagick \
      poppler-utils \
      ghostscript \
      fonts-liberation fonts-dejavu fonts-freefont-ttf \
      wget ca-certificates \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
    # Puppeteer/Chrome dependencies (for headless browser rendering)
    && apt-get update && apt-get install -y \
      gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
      libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
      libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
      libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 \
      libxi6 libxrandr2 libxrender1 libxss1 libxtst6 fonts-liberation libnss3 lsb-release \
      xdg-utils \
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