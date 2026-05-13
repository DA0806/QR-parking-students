import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation middleware factory
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User sync validation
const validateUserSync = [
  body('clerk_id').notEmpty().withMessage('clerk_id is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('name is required'),
  validate
];

// Vehicle validation
const validateVehicle = [
  body('plate').isLength({ min: 3, max: 10 }).withMessage('Plate must be 3-10 characters'),
  body('owner_clerk_id').notEmpty().withMessage('owner_clerk_id is required'),
  body('make').optional().isLength({ min: 1, max: 50 }).withMessage('Make must be 1-50 characters'),
  body('model').optional().isLength({ min: 1, max: 50 }).withMessage('Model must be 1-50 characters'),
  validate
];

// Zone validation
const validateZone = [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('total_capacity').isInt({ min: 1 }).withMessage('Total capacity must be a positive integer'),
  validate
];

// Zone update validation
const validateZoneUpdate = [
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('total_capacity').optional().isInt({ min: 1 }).withMessage('Total capacity must be a positive integer'),
  validate
];

// Role update validation
const validateRoleUpdate = [
  body('role').isIn(['student', 'admin', 'superadmin']).withMessage('Role must be student, admin, or superadmin'),
  validate
];

// Scan event validation
const validateScanEvent = [
  body('token').notEmpty().withMessage('token is required'),
  body('zone_id').isInt({ min: 1 }).withMessage('zone_id must be a positive integer'),
  validate
];

// Manual event validation
const validateManualEvent = [
  body('vehicle_plate').notEmpty().withMessage('vehicle_plate is required'),
  body('zone_id').isInt({ min: 1 }).withMessage('zone_id must be a positive integer'),
  body('isEntry').isBoolean().withMessage('isEntry must be a boolean'),
  validate
];

export {
  validate,
  validateUserSync,
  validateVehicle,
  validateZone,
  validateZoneUpdate,
  validateRoleUpdate,
  validateScanEvent,
  validateManualEvent
};
