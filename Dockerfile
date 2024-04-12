# Usa una imagen base con Node.js
FROM node:14-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de la aplicación de React al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm ci

COPY . .

# Construye la aplicación de React para producción
RUN npm run build

# Expone el puerto 3000 para acceder a la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación cuando se ejecute el contenedor
CMD ["npm", "start"]
