# Quiz de países · Country Quiz

Quiz de geografia em **português e inglês**, para jogar sozinho ou com amigos em salas.

**Jogue:** [country-quiz.coaladev.com.br](https://country-quiz.coaladev.com.br)

- **Sete assuntos:** capitais (nos dois sentidos), bandeiras, continentes, moedas, idiomas,
  fronteiras e tamanho dos países.
- **Regras ajustáveis:** quantidade de perguntas, dificuldade (fácil, médio ou difícil) e tempo
  por pergunta. Pontos extras por responder rápido.
- **Sozinho:** resultado por assunto, revisão das perguntas erradas e recorde salvo no navegador.
- **Salas:** crie uma sala, mande o link e joguem a mesma pergunta ao mesmo tempo, com ranking ao
  vivo. Cada jogador vê o jogo no próprio idioma. Recarregar a página volta para a mesma sala.

## Como funciona

As perguntas são geradas por `src/quiz.ts` sem texto, só com códigos (país, moeda, idioma…), e
cada jogador as lê no próprio idioma (`src/i18n.ts`). O mesmo gerador roda no navegador (modo
solo) e no servidor de salas (`server/`), que é um processo Node com WebSocket em `/ws` e também
serve o site.

Os dados ficam no repositório (`src/data/countries.json` e `public/flags/`), gerados por
`npm run snapshot` a partir de fontes abertas:

- países: [mledoze/countries](https://github.com/mledoze/countries) (ODbL)
- capitais em português: [Wikidata](https://www.wikidata.org) (CC0)
- bandeiras: [flagcdn](https://flagcdn.com)

## Rodando

```bash
npm install
npm run dev        # site em http://localhost:5173
npm run server     # salas em ws://localhost:4702/ws (em outro terminal)
npm run build && npm start   # site e salas juntos em http://localhost:4702
```

Com Docker:

```bash
docker build -t country-quiz .
docker run -p 4702:8080 country-quiz
```

Requer Node 22.18 ou mais novo (o servidor roda TypeScript direto).
