import type { NextFunction, Request, Response } from "express";

/**
 * Асинхронная промежуточная функция для замены блоков try/catch в контроллерах
 * @param {Function} fn - Функция контроллера для обработки
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};