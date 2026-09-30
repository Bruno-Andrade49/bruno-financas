import { z, ZodIssueCode } from 'zod'

// Mensagens padrão do Zod em português. As mensagens escritas nos schemas
// continuam tendo prioridade.
export const zodPtBr: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') return { message: 'Campo obrigatório' }
      if (issue.expected === 'number') return { message: 'Informe um número' }
      return { message: 'Valor inválido' }
    case ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: issue.minimum === 1 ? 'Campo obrigatório' : `Mínimo de ${issue.minimum} caracteres` }
      }
      if (issue.type === 'number') return { message: `O valor mínimo é ${issue.minimum}` }
      return { message: 'Valor muito pequeno' }
    case ZodIssueCode.too_big:
      if (issue.type === 'string') return { message: `Máximo de ${issue.maximum} caracteres` }
      if (issue.type === 'number') return { message: `O valor máximo é ${issue.maximum}` }
      return { message: 'Valor muito grande' }
    case ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return { message: 'E-mail inválido' }
      if (issue.validation === 'uuid') return { message: 'Identificador inválido' }
      if (issue.validation === 'date') return { message: 'Data inválida' }
      return { message: 'Formato inválido' }
    case ZodIssueCode.invalid_enum_value:
      return { message: 'Escolha uma das opções' }
    case ZodIssueCode.invalid_date:
      return { message: 'Data inválida' }
    default:
      return { message: ctx.defaultError }
  }
}

z.setErrorMap(zodPtBr)
