# Imagen base
FROM node:18

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto (el mismo que en tu .env)
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "run", "dev"]
