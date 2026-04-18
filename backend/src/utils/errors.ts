type StatusCode = 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500;


export class AppError extends Error {
  statusCode: StatusCode;
  details: object | null = null;

  constructor(message: string, statusCode: StatusCode, details: object | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Некорректный запрос', details = null) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Ошибка авторизации', details = null) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Доступ ограничен', details = null) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден', details = null) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Конфликт данных', details = null) {
    super(message, 409, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Ошибка валидации', details = null) {
    super(message, 422, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Ограничение количества запросов', details = null) {
    super(message, 429, details);
  }
}

export class ServerError extends AppError {
  constructor(message = 'Внутренняя ошибка сервера', details = null) {
    super(message, 500, details);
  }
}