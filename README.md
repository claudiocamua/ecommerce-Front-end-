# Ecommerce Front-end

Este projeto é um front-end para uma aplicação de ecommerce, desenvolvido com [Next.js](https://nextjs.org) e TypeScript.

## Como executar localmente

1. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

2. Configure as variáveis de ambiente no arquivo `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do Projeto

- `src/app/` — Páginas e componentes principais
- `src/services/` — Serviços de integração com o backend (auth, cart, etc)
- `src/store/` — Gerenciamento de estado global
- `public/` — Assets públicos (imagens, ícones, etc)

## Funcionalidades

- Cadastro e login de usuários (tradicional e Google OAuth)
- Proteção de rotas autenticadas
- Carrinho de compras com atualização dinâmica
- Checkout e resumo de pedidos
- Integração com backend via API REST

## Tecnologias Utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Heroicons
- Axios

## Deploy

Para publicar o projeto, recomenda-se utilizar plataformas como [Vercel](https://vercel.com/) ou [Netlify](https://www.netlify.com/).

## Documentação

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação Heroicons](https://heroicons.com/)

## Contribuição

Contribuições são bem-vindas!  
Abra uma issue ou envie um pull request.

## Licença

Este projeto está sob a licença MIT.
