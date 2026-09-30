// Entende frases como "35 almoço ontem" usando regras simples, sem IA.
export interface QuickAddParse {
  type: 'income' | 'expense'
  amount: number | null
  description: string
  date: string
  categoryName: string | null
}

const EXPENSE_KEYWORDS: Record<string, string[]> = {
  Alimentação: [
    'almoco', 'jantar', 'cafe', 'lanche', 'mercado', 'supermercado', 'padaria', 'ifood', 'restaurante',
    'pizza', 'comida', 'feira', 'acougue', 'hamburguer', 'marmita', 'marmitas', 'doce', 'sorvete', 'acai',
  ],
  Transporte: [
    'uber', '99', 'taxi', 'gasolina', 'combustivel', 'etanol', 'onibus', 'metro', 'estacionamento',
    'pedagio', 'passagem', 'oficina', 'bicicleta',
  ],
  Moradia: ['aluguel', 'condominio', 'luz', 'energia', 'agua', 'internet', 'gas', 'iptu', 'reforma'],
  Saúde: ['farmacia', 'remedio', 'medico', 'consulta', 'dentista', 'exame', 'academia', 'hospital', 'terapia'],
  Educação: ['curso', 'faculdade', 'escola', 'livro', 'livros', 'mensalidade', 'udemy', 'aula', 'apostila'],
  Lazer: ['cinema', 'show', 'viagem', 'jogo', 'steam', 'bar', 'festa', 'passeio', 'ingresso', 'balada'],
  Compras: ['roupa', 'roupas', 'tenis', 'shopping', 'amazon', 'presente', 'celular', 'shopee', 'eletronico'],
  Assinaturas: ['netflix', 'spotify', 'disney', 'prime', 'hbo', 'youtube', 'icloud', 'assinatura', 'max'],
}

const INCOME_KEYWORDS: Record<string, string[]> = {
  Salário: ['salario', 'holerite', 'adiantamento', 'decimo'],
  Freelance: ['freela', 'freelance', 'projeto', 'cliente', 'job', 'site'],
  Investimentos: ['dividendos', 'dividendo', 'rendimento', 'rendimentos', 'juros', 'cdb', 'acoes', 'tesouro'],
}

const INCOME_SIGNALS = ['recebi', 'ganhei', 'entrou', 'caiu', 'vendi', 'receita', 'reembolso']

const FILLER = new Set([
  'gastei', 'paguei', 'comprei', 'recebi', 'ganhei', 'entrou', 'caiu', 'vendi',
  'de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'com', 'pra', 'para', 'pro',
  'o', 'a', 'os', 'as', 'um', 'uma', 'reais', 'real', 'r$', 'hoje', 'ontem', 'anteontem', 'mil', 'k',
])

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function parseAmountToken(raw: string): number {
  const token = raw.replace(/\s/g, '')
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(token)) {
    return Number(token.replace(/\./g, '').replace(',', '.'))
  }
  return Number(token.replace(',', '.'))
}

export function parseQuickAdd(
  input: string,
  options: { today?: Date; categories?: { name: string; type: 'income' | 'expense' }[] } = {},
): QuickAddParse {
  const today = options.today ?? new Date()
  let text = ` ${input.trim()} `

  let date = today
  const explicitDate = text.match(/\s(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s/)
  if (explicitDate) {
    const [, d, m, y] = explicitDate
    const year = y ? (y.length === 2 ? 2000 + Number(y) : Number(y)) : today.getFullYear()
    const candidate = new Date(year, Number(m) - 1, Number(d))
    if (!Number.isNaN(candidate.getTime()) && candidate.getDate() === Number(d)) date = candidate
    text = text.replace(explicitDate[0], ' ')
  } else if (/\santeontem\s/i.test(text)) {
    date = addDays(today, -2)
  } else if (/\sontem\s/i.test(text)) {
    date = addDays(today, -1)
  }

  let amount: number | null = null
  const amountMatch = text.match(
    /(?:^|\s)([+-])?\s*(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(k|mil)?(?=\s|$)/i,
  )
  let explicitSign: string | undefined
  if (amountMatch) {
    const [whole, sign, number, multiplier] = amountMatch
    explicitSign = sign
    amount = parseAmountToken(number!)
    if (multiplier) amount *= 1000
    amount = Math.round(amount * 100) / 100
    if (!(amount > 0)) amount = null
    text = text.replace(whole, ' ')
  }

  const words = text.split(/\s+/).filter(Boolean)
  const normalizedWords = words.map(normalize)

  const hasIncomeSignal = explicitSign === '+' || normalizedWords.some((w) => INCOME_SIGNALS.includes(w))

  let categoryName: string | null = null
  let categoryType: 'income' | 'expense' | null = null
  for (const category of options.categories ?? []) {
    const name = normalize(category.name)
    if (name !== 'outros' && normalizedWords.includes(name)) {
      categoryName = category.name
      categoryType = category.type
      break
    }
  }
  if (!categoryName) {
    const dictionaries: ['income' | 'expense', Record<string, string[]>][] = hasIncomeSignal
      ? [['income', INCOME_KEYWORDS], ['expense', EXPENSE_KEYWORDS]]
      : [['expense', EXPENSE_KEYWORDS], ['income', INCOME_KEYWORDS]]
    outer: for (const [type, dictionary] of dictionaries) {
      for (const [name, keywords] of Object.entries(dictionary)) {
        if (normalizedWords.some((w) => keywords.includes(w) || w === normalize(name))) {
          categoryName = name
          categoryType = type
          break outer
        }
      }
    }
  }

  const type: 'income' | 'expense' =
    explicitSign === '-' ? 'expense' : hasIncomeSignal ? 'income' : (categoryType ?? 'expense')

  const descriptionWords = words.filter((_, i) => !FILLER.has(normalizedWords[i]!))
  const rawDescription = descriptionWords.join(' ').trim()
  const description = rawDescription
    ? rawDescription.charAt(0).toUpperCase() + rawDescription.slice(1)
    : (categoryName ?? (type === 'income' ? 'Receita' : 'Despesa'))

  return {
    type,
    amount,
    description: description.slice(0, 200),
    date: toIsoDate(date),
    categoryName: categoryType === type ? categoryName : null,
  }
}
