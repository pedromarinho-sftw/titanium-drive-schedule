# Finalização do Titanium

Esta pasta concentra a checklist de fechamento do projeto.

## Já corrigido nesta branch

- Migrations de agendamento conflitantes foram consolidadas: a migration antiga foi tornada inócua para evitar criação de schema duplicado.
- Fluxo de reserva mantém bloqueio concorrente no banco por data + horário.
- Validações de nome, telefone, veículo, serviço, data, domingo e horário de atendimento foram reforçadas.
- Funções RPC continuam sendo a única porta de escrita/leitura do agendamento para o frontend.
- O frontend não usa service-role.
- Foi removida a alegação comercial não verificada de "+500 carros".
- Depoimentos fictícios foram removidos para não apresentar avaliações como se fossem reais.
- Correção do tipo do estado de confirmação e da mensagem do WhatsApp.
- Branch de trabalho: `finalizacao`.

## Ainda depende de dados reais do negócio

1. Endereço completo.
2. Horário real de funcionamento.
3. Confirmação dos preços dos serviços.
4. Número/Instagram oficiais, se forem diferentes dos atuais.
5. Fotos reais da empresa/serviços, quando disponíveis.
6. Depoimentos reais, caso o cliente queira exibi-los.
7. Projeto Supabase real e teste de produção das migrations/RPCs.

## Teste final obrigatório

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] Testar reserva normal.
- [ ] Tentar reservar o mesmo horário em duas sessões.
- [ ] Testar cancelamento com mais de 1 hora.
- [ ] Testar cancelamento com menos de 1 hora.
- [ ] Testar mobile, tablet e desktop.
- [ ] Conferir console do navegador.
- [ ] Conferir WhatsApp.
- [ ] Conferir endereço/mapa antes da publicação.

> Não publicar o site como versão definitiva enquanto os dados reais acima não forem confirmados.
