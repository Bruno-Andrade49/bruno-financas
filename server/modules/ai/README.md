Ainda não implementado — ver ARCHITECTURE.md, seção D (arquitetura de IA).

Estrutura esperada:
- chat-provider/  -> adapter do provedor de LLM (Anthropic Claude por padrão)
- tools/          -> uma tool por arquivo (get_expenses_by_category, ...)
- ai.service.ts   -> orquestra a conversa, chama o chat-provider e as tools
