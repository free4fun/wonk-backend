import mongoose from 'mongoose';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Not authorized' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Para errores personalizados que podemos lanzar en nuestros controladores
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Error por defecto
  res.status(500).json({ error: 'Server error' });
};

// Función auxiliar para lanzar errores personalizados en los controladores
export const throwError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};
