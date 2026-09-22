# Titanium Refine

Crie um site profissional de página única (landing page) para a Titanium, uma estética automotiva premium, com sistema de agendamento integrado.

Identidade visual:

Paleta escura/premium: preto (
#0A0A0A), cinza metálico (
#2A2A2E, 
#6B6B70) e um acento vibrante em vermelho (
#E10600) ou azul elétrico (
#0057FF) — use apenas uma cor de acento para consistência
Tipografia forte e moderna (sans-serif condensada para títulos, ex: estilo Bebas Neue/Oswald; sans-serif limpa para corpo de texto)
Efeitos sutis de brilho/reflexo (gradientes metálicos, sombras) que remetam a pintura automotiva polida
Ícones minimalistas relacionados a carros/detalhamento

Estrutura da página:

Header fixo: logo "Titanium", menu (Serviços, Sobre, Galeria, Agendamento, Contato), botão CTA destacado "Agendar Horário"
Hero section: título de impacto (ex: "Seu carro merece um acabamento de titânio"), subtítulo curto, imagem/vídeo de fundo de carro detalhado, botão CTA principal para agendamento
Serviços (cards com ícone, título, descrição curta e preço "a partir de"):
Lavagem e Higienização (interna/externa, higienização de bancos e ar-condicionado)
Polimento e Vitrificação de Pintura (remoção de riscos, proteção cerâmica)
Envelopamento e Película (personalização visual, proteção de pintura)
Detalhamento Completo (pacote premium combinando os serviços acima)
Galeria/Antes e Depois: grid de imagens (usar placeholders) mostrando resultados
Seção de Agendamento (o coração do site):
Calendário interativo com seleção de data
Seleção de horários disponíveis (slots, ex: 08h-18h, intervalos de 1h)
Seleção do serviço desejado (dropdown vinculado aos serviços acima)
Campos: nome, telefone/WhatsApp, modelo do carro, observações
Confirmação visual após envio (mensagem de sucesso + resumo do agendamento)
Botão alternativo "Prefiro agendar pelo WhatsApp" com link direto
Depoimentos de clientes: carrossel simples com avaliações (placeholders)
Sobre a Titanium: breve história, diferenciais (qualidade, cuidado, equipamento profissional)
Footer: endereço, horário de funcionamento, redes sociais (Instagram @titanium_jf), WhatsApp, mapa incorporado (placeholder)

Funcionalidades técnicas:

Totalmente responsivo (mobile-first, já que a maioria virá do Instagram)
Sistema de agendamento com estado (React) que impede seleção de horários já ocupados (usar dados mockados por enquanto)
Animações suaves de scroll e hover
Botão flutuante de WhatsApp fixo no canto inferior direito
Performance otimizada, carregamento rápido

Tom geral: sofisticado, confiável e tecnológico — transmitir precisão e cuidado no serviço, como o próprio nome "Titanium" sugere.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dd7be9db-5706-43f2-bec6-8bea82441cbb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
