# Multi-stage lightweight Nginx container for Global-Setu
FROM nginx:alpine

# Copy all project files into Nginx public web root
COPY . /usr/share/nginx/html/

# Expose HTTP port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
