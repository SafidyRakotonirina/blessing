// Réponse de succès standardisée
export const successResponse = (res, data = null, message = 'Succès', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Réponse d'erreur standardisée
export const errorResponse = (res, message = 'Erreur', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

// Réponse avec pagination
export const paginatedResponse = (res, data, page, limit, total, message = 'Succès') => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
};

// Gestion des erreurs async
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
