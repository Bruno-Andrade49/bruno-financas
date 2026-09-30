<template>
  <div class="space-y-8">
    <div class="rise-in">
      <NuxtLink to="/dashboard" class="press mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <PhArrowLeft class="size-4" />Visão geral
      </NuxtLink>
      <h1 class="text-3xl font-bold tracking-tight">Vale a pena?</h1>
      <p class="mt-1 max-w-2xl text-muted-foreground">
        Simule uma compra parcelada e veja como ficam os seus próximos meses antes de passar o cartão.
      </p>
    </div>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div class="min-w-0 space-y-4">
        <Card class="rise-in" style="--i: 1">
          <CardHeader>
            <CardTitle class="text-base font-semibold">O que você quer comprar</CardTitle>
            <CardDescription>Dá pra somar mais de uma compra, como numa fatura.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <fieldset v-for="(purchase, index) in form.purchases" :key="purchase.id" class="space-y-3 rounded-xl bg-muted/50 p-3.5">
              <legend class="sr-only">Compra {{ index + 1 }}</legend>
              <div class="flex items-center gap-2">
                <Input v-model="purchase.name" placeholder="Ex.: PlayStation 5" aria-label="O que é" class="bg-background font-medium" />
                <Button
                  v-if="form.purchases.length > 1"
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="shrink-0 text-muted-foreground"
                  :aria-label="`Remover ${purchase.name || 'compra'}`"
                  @click="removePurchase(purchase.id)"
                >
                  <PhTrash class="size-4" />
                </Button>
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <label class="space-y-1">
                  <span class="text-xs font-medium text-muted-foreground">Valor da parcela</span>
                  <MoneyInput v-model="purchase.installmentAmount" />
                </label>
                <label class="space-y-1">
                  <span class="text-xs font-medium text-muted-foreground">Nº de parcelas</span>
                  <Input v-model="purchase.installments" type="number" inputmode="numeric" min="1" max="48" class="bg-background tabular-nums" />
                </label>
                <label class="space-y-1">
                  <span class="text-xs font-medium text-muted-foreground">Primeira parcela</span>
                  <Select v-model="purchase.startOffset">
                    <SelectTrigger class="w-full bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Este mês</SelectItem>
                      <SelectItem value="1">Próximo mês</SelectItem>
                      <SelectItem value="2">Daqui a 2 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label class="space-y-1">
                  <span class="text-xs font-medium text-muted-foreground">Preço à vista <span class="font-normal">(opcional)</span></span>
                  <MoneyInput v-model="purchase.cashPrice" />
                </label>
              </div>
              <p class="text-xs text-muted-foreground tabular-nums">
                Total parcelado: <span class="font-semibold text-foreground">{{ format(num(purchase.installmentAmount) * num(purchase.installments)) }}</span>
              </p>
            </fieldset>

            <Button type="button" variant="outline" class="press w-full rounded-xl border-dashed" @click="addPurchase">
              <PhPlus class="size-4" />Somar outra compra
            </Button>
          </CardContent>
        </Card>

        <Card class="rise-in" style="--i: 2">
          <CardHeader>
            <CardTitle class="text-base font-semibold">Seu mês hoje</CardTitle>
            <CardDescription>{{ baselineHint }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <label class="flex items-center justify-between gap-3">
              <span class="text-sm">Renda por mês</span>
              <MoneyInput v-model="form.income" class="w-36" />
            </label>
            <label class="flex items-center justify-between gap-3">
              <span class="text-sm">Gastos habituais</span>
              <MoneyInput v-model="form.expenses" class="w-36" />
            </label>
            <label class="flex items-center justify-between gap-3">
              <span class="text-sm">Quero guardar por mês</span>
              <MoneyInput v-model="form.savings" class="w-36" />
            </label>
            <p v-if="baseline?.savingsSource === 'goals' && baseline.goals.length" class="text-xs text-muted-foreground">
              Soma do que suas metas pedem por mês: {{ goalNames }}.
            </p>
            <button
              v-if="isEdited"
              type="button"
              class="press inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              @click="resetBaseline"
            >
              <PhArrowCounterClockwise class="size-3.5" />Voltar aos meus números
            </button>
          </CardContent>
        </Card>
      </div>

      <div class="min-w-0 space-y-4">
        <AsyncState :pending="baselinePending && !baseline" :error="baselineError">
          <section
            class="rise-in relative overflow-hidden rounded-2xl p-6 ring-1"
            :class="hasPurchases ? (result.verdict === 'worth' ? 'bg-status-good/10 ring-status-good/30' : 'bg-status-bad/10 ring-status-bad/30') : 'bg-muted ring-border'"
            style="--i: 1"
            aria-live="polite"
          >
            <div class="flex items-start gap-4">
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white"
                :class="hasPurchases ? (result.verdict === 'worth' ? 'bg-status-good' : 'bg-status-bad') : 'bg-muted-foreground'"
              >
                <component :is="verdict.icon" weight="bold" class="size-6" />
              </span>
              <div class="min-w-0">
                <p class="text-xs font-semibold" :class="hasPurchases ? (result.verdict === 'worth' ? 'text-income' : 'text-expense') : 'text-muted-foreground'">
                  {{ verdict.kicker }}
                </p>
                <h2 class="mt-0.5 text-2xl font-bold tracking-tight">{{ verdict.title }}</h2>
                <p class="mt-1.5 text-sm text-muted-foreground">{{ verdict.text }}</p>
              </div>
            </div>

            <dl v-if="hasPurchases" class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="rounded-xl bg-card/70 p-3 ring-1 ring-border/60">
                <dt class="text-xs text-muted-foreground">Total parcelado</dt>
                <dd class="mt-1 font-semibold tabular-nums">{{ format(result.totalInstallments) }}</dd>
              </div>
              <div class="rounded-xl bg-card/70 p-3 ring-1 ring-border/60">
                <dt class="text-xs text-muted-foreground">Pior mês, depois de guardar</dt>
                <dd class="mt-1 font-semibold tabular-nums" :class="(result.worstMonth?.afterSavings ?? 0) < 0 ? 'text-expense' : 'text-income'">
                  {{ format(result.worstMonth?.afterSavings ?? 0) }}
                </dd>
              </div>
              <div class="rounded-xl bg-card/70 p-3 ring-1 ring-border/60">
                <dt class="text-xs text-muted-foreground">Da renda em parcelas</dt>
                <dd class="mt-1 flex items-center gap-1 font-semibold tabular-nums" :class="result.maxCommitment > COMMITMENT_ALERT ? 'text-expense' : ''">
                  <PhWarning v-if="result.maxCommitment > COMMITMENT_ALERT" weight="fill" class="size-4" />
                  {{ pct(result.maxCommitment) }}
                </dd>
              </div>
              <div class="rounded-xl bg-card/70 p-3 ring-1 ring-border/60">
                <dt class="text-xs text-muted-foreground">Cabe em parcelas, por mês</dt>
                <dd class="mt-1 font-semibold tabular-nums">{{ format(result.maxAffordableInstallment) }}</dd>
              </div>
            </dl>
          </section>

          <Card v-if="hasPurchases" class="rise-in" style="--i: 2">
            <CardHeader>
              <CardTitle class="text-base font-semibold">Seus próximos {{ result.months.length }} meses</CardTitle>
              <CardDescription>Passe o dedo ou o mouse nos meses pra ver a conta.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectionChart :months="result.months" :savings-target="savings" />
            </CardContent>
          </Card>

          <Card v-if="tips.length" class="rise-in" style="--i: 3">
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-base font-semibold">
                <PhLightbulb weight="fill" class="size-4 text-warning" />Pra pensar antes de comprar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul class="space-y-3">
                <li v-for="tip in tips" :key="tip.text" class="flex gap-3 text-sm">
                  <component :is="tip.icon" class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    {{ tip.text }}
                    <NuxtLink v-if="tip.link" :to="tip.link.to" class="font-medium text-primary underline-offset-4 hover:underline">{{ tip.link.label }}</NuxtLink>
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </AsyncState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowCounterClockwise,
  PhArrowLeft,
  PhCalendarCheck,
  PhCheckCircle,
  PhCoins,
  PhLightbulb,
  PhPercent,
  PhPlus,
  PhQuestion,
  PhScales,
  PhTarget,
  PhTrash,
  PhWarning,
  PhXCircle,
} from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MoneyInput from '@/components/common/MoneyInput.vue'
import ProjectionChart from '@/components/simulator/ProjectionChart.vue'
import { COMMITMENT_ALERT, simulatePurchases } from '#shared/purchase-simulator'
import { parseMoney } from '#shared/money'

definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Vale a pena?' })

const { format } = useCurrencyFormat()

interface PurchaseForm {
  id: string
  name: string
  installmentAmount: string
  installments: string
  startOffset: string
  cashPrice: string
}

const STORAGE_KEY = 'bf-simulator'
const newId = () => Math.random().toString(36).slice(2, 10)
const examplePurchase = (): PurchaseForm => ({
  id: newId(),
  name: 'PlayStation 5',
  installmentAmount: '400',
  installments: '10',
  startOffset: '1',
  cashPrice: '3799',
})

const form = reactive({
  purchases: [examplePurchase()] as PurchaseForm[],
  income: '',
  expenses: '',
  savings: '',
})

const { data: baseline, pending: baselinePending, error: baselineError } = await useFetch('/api/v1/simulator/baseline')

const num = parseMoney

const toField = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

function fillFromBaseline() {
  if (!baseline.value) return
  form.income = toField(baseline.value.monthlyIncome)
  form.expenses = toField(baseline.value.monthlyExpenses)
  form.savings = toField(baseline.value.savingsTarget)
}

const isEdited = computed(
  () =>
    !!baseline.value &&
    (num(form.income) !== baseline.value.monthlyIncome ||
      num(form.expenses) !== baseline.value.monthlyExpenses ||
      num(form.savings) !== baseline.value.savingsTarget),
)

function resetBaseline() {
  fillFromBaseline()
}

fillFromBaseline()

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved?.purchases?.length) form.purchases = saved.purchases
    if (saved?.overrides) Object.assign(form, saved.overrides)
  } catch {
    // sem localStorage, segue sem salvar
  }
})
watch(
  form,
  () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          purchases: form.purchases,
          overrides: isEdited.value ? { income: form.income, expenses: form.expenses, savings: form.savings } : null,
        }),
      )
    } catch {
      // sem localStorage, segue sem salvar
    }
  },
  { deep: true },
)

function addPurchase() {
  form.purchases.push({ id: newId(), name: '', installmentAmount: '', installments: '6', startOffset: '1', cashPrice: '' })
}
function removePurchase(id: string) {
  form.purchases = form.purchases.filter((p) => p.id !== id)
}

const savings = computed(() => num(form.savings))
const now = new Date()
const firstMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

const result = computed(() =>
  simulatePurchases({
    monthlyIncome: num(form.income),
    monthlyExpenses: num(form.expenses),
    savingsTarget: savings.value,
    firstMonth,
    purchases: form.purchases.map((p) => ({
      id: p.id,
      name: p.name.trim() || 'Compra',
      installmentAmount: num(p.installmentAmount),
      installments: Math.min(48, Math.max(0, Math.round(num(p.installments)))),
      startOffset: Number(p.startOffset) || 0,
      cashPrice: num(p.cashPrice) || null,
    })),
  }),
)
const hasPurchases = computed(() => result.value.totalInstallments > 0)

const pct = (value: number) =>
  Number.isFinite(value) ? `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%` : 'sem renda'
const monthName = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, 1)).toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })
}

const verdict = computed(() => {
  const r = result.value
  if (!hasPurchases.value) {
    return { icon: PhQuestion, kicker: 'Simulação', title: 'Monte sua compra', text: 'Informe o valor da parcela e em quantas vezes. O resultado aparece aqui na hora.' }
  }
  const worst = r.worstMonth!
  const target = format(savings.value)
  if (r.verdict === 'worth') {
    return {
      icon: PhCheckCircle,
      kicker: 'Vale a pena',
      title: 'Cabe no seu bolso',
      text: `Mesmo pagando as parcelas, você continua guardando ${target} por mês. No mês mais apertado (${monthName(worst.month)}) ainda sobram ${format(worst.afterSavings)}.`,
    }
  }
  if (r.monthsNegative > 0) {
    return {
      icon: PhXCircle,
      kicker: 'Não vale a pena agora',
      title: 'As contas não fecham',
      text: `Em ${r.monthsNegative} ${r.monthsNegative === 1 ? 'mês' : 'meses'} você gastaria mais do que ganha. Em ${monthName(worst.month)} faltariam ${format(Math.abs(worst.leftover))}, mesmo sem guardar nada.`,
    }
  }
  return {
    icon: PhXCircle,
    kicker: 'Não vale a pena agora',
    title: 'Você deixaria de guardar',
    text: `Em ${r.monthsBelowTarget} de ${r.months.length} meses não daria pra guardar os ${target} que você planeja. No pior mês (${monthName(worst.month)}) faltariam ${format(Math.abs(worst.afterSavings))} pra meta.`,
  }
})

const tips = computed(() => {
  const r = result.value
  const list: { icon: typeof PhTarget; text: string; link?: { to: string; label: string } }[] = []
  if (!hasPurchases.value) return list

  if (r.maxCommitment > COMMITMENT_ALERT) {
    list.push({
      icon: PhPercent,
      text: `As parcelas chegam a ${pct(r.maxCommitment)} da sua renda. Acima de 30%, sobra pouco espaço pra imprevistos: um conserto ou uma consulta já apertam o mês.`,
    })
  }
  if (r.financingCost > 0) {
    const cash = form.purchases.reduce((sum, p) => sum + num(p.cashPrice), 0)
    list.push({
      icon: PhCoins,
      text: `Parcelando você paga ${format(r.financingCost)} a mais (${pct(cash > 0 ? r.financingCost / cash : 0)}) do que à vista. "Sem juros" nem sempre é sem custo. Vale pedir desconto pra pagar à vista.`,
    })
  }
  const REASONABLE_CASH_MONTHS = 36
  const REASONABLE_INSTALLMENTS = 24
  const splitInto = r.maxAffordableInstallment > 0 ? Math.ceil(r.totalInstallments / r.maxAffordableInstallment) : Infinity
  const slackTooSmall =
    (r.monthsToBuyInCash === null || r.monthsToBuyInCash > REASONABLE_CASH_MONTHS) &&
    (r.verdict === 'worth' || splitInto > REASONABLE_INSTALLMENTS)

  if (slackTooSmall) {
    list.push({
      icon: PhScales,
      text:
        r.maxAffordableInstallment > 0
          ? `Depois de guardar sua meta, sobram só ${format(r.maxAffordableInstallment)}/mês, pouco pra assumir compras novas. Pra caber, seria preciso cortar gastos habituais ou alongar o prazo da meta.`
          : 'Seus gastos habituais somados à meta de guardar já consomem toda a renda. Antes de uma compra nova, vale rever onde dá pra cortar.',
      link: { to: '/budgets', label: 'Ver orçamentos' },
    })
  } else {
    if (r.monthsToBuyInCash !== null && r.monthsToBuyInCash <= REASONABLE_CASH_MONTHS) {
      list.push({
        icon: PhCalendarCheck,
        text: `Guardando o que sobra depois da sua meta (${format(r.maxAffordableInstallment)}/mês), você compraria à vista em ${r.monthsToBuyInCash} ${r.monthsToBuyInCash === 1 ? 'mês' : 'meses'}, sem comprometer a renda futura.`,
      })
    }
    if (r.verdict === 'not_worth' && splitInto <= REASONABLE_INSTALLMENTS) {
      list.push({
        icon: PhScales,
        text: `Pra manter sua meta, as parcelas somadas precisam ficar em até ${format(r.maxAffordableInstallment)}/mês. O mesmo valor total caberia em ${splitInto}x de ${format(r.totalInstallments / splitInto)}.`,
      })
    }
  }
  if (baseline.value?.savingsSource === 'default_rate') {
    list.push({
      icon: PhTarget,
      text: 'Você não tem metas ativas, então usamos 10% da renda como "quero guardar". Com uma meta de verdade, a simulação fica mais fiel.',
      link: { to: '/goals', label: 'Criar uma meta' },
    })
  }
  return list
})

const goalNames = computed(() => (baseline.value?.goals ?? []).map((g: { name: string }) => g.name).join(', '))

const baselineHint = computed(() => {
  const basis = baseline.value?.basis
  if (!basis || basis.kind === 'none') return 'Ainda não há lançamentos. Preencha com uma estimativa.'
  if (basis.kind === 'current_month') return 'Com base no mês atual (ainda não há meses fechados). Ajuste se quiser.'
  return `Média dos seus últimos ${basis.months} ${basis.months === 1 ? 'mês fechado' : 'meses fechados'}. Ajuste se quiser.`
})
</script>
