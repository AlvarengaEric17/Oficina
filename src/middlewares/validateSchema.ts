import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateSchema = (location: 'body' | 'query' | 'params' = 'body') => {
  return (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const dataToValidate = location === 'body' ? req.body : location === 'query' ? req.query : req.params;
        const parsed = schema.parse(dataToValidate);
        
        if (location === 'body') req.body = parsed;
        else if (location === 'query') (req.query as any) = parsed;
        else (req.params as any) = parsed;
        
        next();
      } catch (error: any) {
        res.status(400).json({
          error: 'Validation Error',
          details: error.errors || error.message,
        });
      }
    };
  };
};
