import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { ZodObject, ZodRawShape } from 'zod'
import { translateAuthError } from '@/lib/auth-errors'

type FieldName = 'name' | 'email' | 'password'

// Formulários de conta: valida ao sair do campo (não enquanto a pessoa ainda
// digita), e depois que um erro aparece ele some assim que for corrigido.
export function useAuthForm<T extends ZodRawShape>(schema: ZodObject<T>) {
  const form = useForm({ validationSchema: toTypedSchema(schema) })
  const formError = ref<string | null>(null)
  const loading = ref(false)

  function field(name: FieldName) {
    const [value, attrs] = form.defineField(name as never, {
      validateOnModelUpdate: false,
      validateOnBlur: true,
    })
    watch(value, () => {
      formError.value = null
      if ((form.errors.value as Record<string, string | undefined>)[name]) form.validateField(name as never)
    })
    return [value, attrs] as const
  }

  /** Mostra um erro do Better Auth no campo certo ou no aviso do formulário. */
  function showServerError(error: Parameters<typeof translateAuthError>[0]) {
    const info = translateAuthError(error)
    if (info.field && info.field in schema.shape) form.setFieldError(info.field as never, info.message)
    else formError.value = info.message
    return info
  }

  const submit = (handler: (values: Record<string, string>) => Promise<void>) =>
    form.handleSubmit(async (values) => {
      formError.value = null
      loading.value = true
      try {
        await handler(values as Record<string, string>)
      } catch {
        formError.value = 'Sem conexão com o servidor. Verifique sua internet.'
      } finally {
        loading.value = false
      }
    })

  return { ...form, field, submit, formError, loading, showServerError }
}
