FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libjpeg-dev libfreetype6-dev \
    libonig-dev libxml2-dev libzip-dev libsqlite3-dev nginx supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www

# Copy backend
COPY backend/ ./backend/
WORKDIR /var/www/backend
RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN cp .env.example .env 2>/dev/null || true
RUN php artisan key:generate --force 2>/dev/null || true

# Copy and build frontend
WORKDIR /var/www
COPY frontend/ ./frontend/
WORKDIR /var/www/frontend
RUN npm ci --ignore-scripts && npm run build

# Nginx config
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create storage directories
RUN mkdir -p /var/www/backend/storage/logs \
    /var/www/backend/storage/framework/sessions \
    /var/www/backend/storage/framework/views \
    /var/www/backend/storage/framework/cache \
    /var/www/backend/storage/app/public \
    && chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache

# SQLite database
RUN touch /var/www/backend/database/database.sqlite \
    && chown www-data:www-data /var/www/backend/database/database.sqlite

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
