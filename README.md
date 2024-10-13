# Wonk Backend

Wonk Backend es una API REST para una aplicación de gestión de cafeterías. Proporciona endpoints para la autenticación de usuarios y operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para cafeterías.

## Características

- Autenticación de usuarios (registro e inicio de sesión)
- Gestión de cafeterías (crear, leer, actualizar, eliminar)
- Validación de datos de entrada
- Manejo de errores
- Pruebas de integración

## Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB (con Mongoose)
- JSON Web Tokens (JWT) para autenticación
- Mocha y Supertest para pruebas

## Requisitos previos

- Node.js
- MongoDB

## Instalación

1. Clona el repositorio:
   ```
   git clone https://github.com/free4fun/wonk-backend.git
   cd wonk-backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables de entorno:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/wonk
   JWT_SECRET=tu_secreto_jwt
   ```

## Ejecución

Para iniciar el servidor en modo de desarrollo:

```
npm run dev
```

Para iniciar el servidor en modo de producción:

```
npm start
```

## Pruebas

Para ejecutar las pruebas de integración:

```
npm test
```

## Estructura del proyecto

```
wonk-backend/
│
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── cafeController.js
|   ├── middleware
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── userModel.js
│   │   └── cafeModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── cafeRoutes.js
│   ├── utils/
│   │   └── errorHandler.js
│   └── app.js
│
├── test/
│   └── integration/
│       └── api.test.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Autenticación

- `POST /api/auth/register`: Registrar un nuevo usuario
- `POST /api/auth/login`: Iniciar sesión

### Cafeterías

- `GET /api/cafes`: Obtener todas las cafeterías
- `GET /api/cafes/:id`: Obtener una cafetería específica
- `POST /api/cafes`: Crear una nueva cafetería
- `PUT /api/cafes/:id`: Actualizar una cafetería existente
- `DELETE /api/cafes/:id`: Eliminar una cafetería
