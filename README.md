<div align="center">

# PistaCerta

**Jogo de adivinhação de veículos. Doze pistas, um carro.**

[**jogar →**](https://pistacerta.br1ansouza.workers.dev)

[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript%207-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Rsbuild](https://img.shields.io/badge/Rsbuild-FF5C00?logo=rspack&logoColor=white)](https://rsbuild.rs)
[![Tailwind](https://img.shields.io/badge/Tailwind%204-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
[![Cloudflare](https://img.shields.io/badge/Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

<img src="docs/demo.gif" width="230" alt="Uma rodada: pistas, palpite e revelação" />

</div>

O sistema sorteia um carro e mostra cinco pistas: ano, preço FIPE, combustível, cilindrada e potência. A cada clique vem mais uma — procedência, torque, aspiração, câmbio, tração, carroceria e, por último, o código do motor. Quanto antes você acertar, melhor.

Só carros com presença real no Brasil. Nada de catálogo mundial.

## Como joga

<table>
  <tr>
    <td align="center" width="33%">
      <img src="docs/home.jpg" width="240" alt="Tela inicial com a escolha de modo" /><br />
      <sub><b>Escolha o modo</b><br />Sozinho ou em dupla</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/rodada.jpg" width="240" alt="Rodada com as pistas reveladas" /><br />
      <sub><b>As pistas</b><br />Cinco de saída, o resto sob demanda</sub>
    </td>
    <td align="center" width="33%">
      <img src="docs/alternativas.jpg" width="240" alt="Folha com quatro alternativas" /><br />
      <sub><b>O palpite</b><br />Quatro alternativas, uma chance</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="docs/revelacao.jpg" width="240" alt="Revelação do veículo com foto e ficha" /><br />
      <sub><b>A revelação</b><br />Foto e ficha completa</sub>
    </td>
    <td align="center">
      <img src="docs/dupla.jpg" width="240" alt="Modo em dupla com a resposta revelada" /><br />
      <sub><b>Em dupla</b><br />Você conduz, o outro adivinha</sub>
    </td>
    <td></td>
  </tr>
</table>

## Os dois modos

**Sozinho** — quatro alternativas e um botão Responder. O carro fica escondido até você responder, e quem decide se acertou é o servidor.

**Em dupla** — você vê a resposta, atrás de um botão Revelar, e conduz a rodada lendo as pistas para outra pessoa. Aqui o Acertei/Errei faz sentido: tem alguém do outro lado para validar o palpite.

Placar de acertos e erros por modo, guardado no navegador.

## O carro fica realmente escondido

Um app estático entrega tudo que sabe assim que a página carrega — daria para ler a resposta no F12 antes da primeira pista. Aqui não: a identidade do veículo não sai do servidor até você responder.

O que trafega é uma projeção sem marca, modelo, geração e imagem, e um token cifrado com AES-GCM que carrega o veículo da rodada. Decodificar o token à força devolve binário, adulterar devolve 401, e nenhum nome de carro aparece no bundle.

## Rodando

```bash
bun install
bun run dev
```

Sobe a API em `127.0.0.1:3001` e o front em `0.0.0.0:3000`.

```bash
bun run typecheck        # tsc (TypeScript 7 nativo)
bun run lint             # oxlint
bun run build
bun run validate:content # schema e regras de curadoria do catálogo
bun run refresh:fipe     # reconsulta os preços salvos
bun run deploy           # publica no Cloudflare Workers
```

## Os dados

Cada carro é um JSON em `content/vehicles/cars/`. Preço e identificação vêm da tabela FIPE; torque, potência e código do motor não existem lá, então foram pesquisados carro a carro no Webmotors, iCarros e Carros na Web — a fonte fica registrada em `specSource`.

**Campo sem fonte confiável fica ausente**, e o motor de pistas pula a pista correspondente em silêncio. Nunca aparece "não informado", e nada é inventado para preencher buraco. Carro que não junta pistas suficientes fica inativo em vez de render uma rodada curta.

As fotos são links para o Wikimedia Commons em `content/images.json`. Nenhuma imagem é versionada: com trezentos carros seriam dezenas de MB, e git guarda toda versão de binário para sempre.

## Arquitetura

`src/domain/` não conhece React e é importado tanto pelo cliente quanto pelo worker — as regras do jogo vivem num lugar só.

`Vehicle` já nasce como união discriminada por `kind` e o motor de pistas é genérico sobre a lista de definições. Adicionar motos é conteúdo, um tipo e uma lista de pistas nova: nenhuma tela muda.

Sem banco de dados. As rotas são handlers `(Request) => Response` sem estado — rodam no `Bun.serve` local, no Cloudflare Workers em produção, e em qualquer outro provedor serverless sem reescrita.

Há também um build estático (`PUBLIC_STATIC=1`) publicado no [GitHub Pages](https://br1ansouza.github.io/pistacerta-game/), que sela a identidade dos carros em tempo de build. É mais fraco — a chave viaja para o navegador — e serve só como alternativa sem servidor.
