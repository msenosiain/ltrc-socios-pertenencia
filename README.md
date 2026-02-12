# 🏉 LTRC Socios Pertenencia

App para gestión de Socios Pertenencia de LTRC.

## Stack

- **NestJS** + **MongoDB** + **GridFS**
- **Google Apps Script** para sincronización con Google Sheets

## Desarrollo Local

```bash
npm install
docker run -d -p 27017:27017 --name mongodb mongo:latest
npx nx serve api
```

## Variables de Entorno

```env
MONGODB_URI=mongodb://localhost:27017/socios-pertenencia
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
API_URL=http://localhost:3000
PORT=3000
```

## Deploy en Render

1. Crear **Web Service** en Render
2. Conectar repositorio
3. Build Command: `npx nx build api`
4. Start Command: `node dist/apps/api/main.js`
5. Configurar variables de entorno en Render

## Endpoints

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/api/members` | Crear miembro |
| GET | `/api/members` | Listar todos |
| GET | `/api/members/:id` | Por ID |
| GET | `/api/members/document/:dni` | Por DNI |
| GET | `/api/members/image/:fileId` | Descargar imagen |
| PATCH | `/api/members/:id` | Actualizar |
| DELETE | `/api/members/:id` | Eliminar |
