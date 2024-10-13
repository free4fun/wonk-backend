import Cafe from '../models/cafeModel.js';

export const createCafe = async (req, res, next) => {
  try {
    const cafe = new Cafe({
      ...req.body,
      createdBy: req.user._id
    });
    await cafe.save();
    res.status(201).json(cafe);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    next(error);
  }
};

export const getAllCafes = async (req, res, next) => {
  try {
    const cafes = await Cafe.find();
    res.json(cafes);
  } catch (error) {
    next(error);
  }
};

export const getCafe = async (req, res, next) => {
  try {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) {
      return res.status(404).json({ error: 'Cafe not found' });
    }
    res.json(cafe);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next(error);
  }
};


export const updateCafe = async (req, res, next) => {
  try {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) {
      return res.status(404).json({ error: 'Cafe not found' });
    }

    // Actualiza solo los campos proporcionados
    Object.keys(req.body).forEach((key) => {
      cafe[key] = req.body[key];
    });

    await cafe.save();
    res.json(cafe);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: `Cafe validation failed: ${error.message}` });
    }
    next(error);
  }
};

export const deleteCafe = async (req, res, next) => {
  try {
    const cafe = await Cafe.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!cafe) {
      return res.status(404).json({ error: 'Cafe not found' });
    }
    res.json({ error: 'Cafe deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    next(error);
  }
};
