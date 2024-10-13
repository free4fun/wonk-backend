import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import cafeRoutes from './routes/cafeRoutes.js';
import { errorHandler } from './utils/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);

// Manejo global de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Manejo de errores de CastError (ObjectId inválido)
app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next(err);
});



export default app;
