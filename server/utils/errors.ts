import { ZodError } from 'zod'
import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'

export class AppError extends Error {
  statusCode: number
  code: string
  details?: unknown

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(404, 'not_found', message)
  }
}

export class InvalidReferenceError extends AppError {
  constructor(message: string) {
    super(400, 'invalid_reference', message)
  }
}

function toApiError(error: unknown): { statusCode: number; body: unknown } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: { error: { code: error.code, message: error.message, details: error.details } },
    }
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: 'validation_error',
          message: 'Dados inválidos',
          details: error.flatten(),
        },
      },
    }
  }

  if (error && typeof error === 'object' && 'statusCode' in error) {
    const h3Error = error as { statusCode: number; statusMessage?: string; message?: string }
    return {
      statusCode: h3Error.statusCode,
      body: {
        error: {
          code: h3Error.statusCode === 401 ? 'unauthenticated' : 'error',
          message: h3Error.message ?? h3Error.statusMessage ?? 'Erro',
        },
      },
    }
  }

  console.error(error)
  return {
    statusCode: 500,
    body: { error: { code: 'internal_error', message: 'Erro interno do servidor' } },
  }
}

export function defineApiHandler<T extends EventHandlerRequest = EventHandlerRequest>(
  handler: (event: H3Event<T>) => Promise<unknown>,
): EventHandler<T> {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event)
    } catch (error) {
      const { statusCode, body } = toApiError(error)
      setResponseStatus(event, statusCode)
      return body
    }
  })
}
