export const SITE_NAME = 'Bruno Finanças'

export const SITE_DESCRIPTION =
  'Controle financeiro pessoal gratuito: lance gastos em segundos, acompanhe orçamentos e metas e simule se uma compra parcelada cabe no seu bolso.'

export function webApplicationJsonLd(rawSiteUrl: string) {
  const siteUrl = rawSiteUrl.replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web, Android, iOS',
    inLanguage: 'pt-BR',
    image: `${siteUrl}/og-image.jpg`,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    featureList: [
      'Lançamento rápido de gastos por texto',
      'Orçamentos por categoria com alertas',
      'Metas com projeção de quanto guardar por mês',
      'Simulador de compras parceladas',
      'Transações recorrentes',
      'Tema claro e escuro',
    ],
  }
}
