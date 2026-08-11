<div align="center">

# PistaCerta

**Jogo de adivinhação de veículos. Doze pistas, um carro.**

[![React](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript%207-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Rsbuild](https://img.shields.io/badge/Rsbuild-FF5C00?logo=rspack&logoColor=white)](https://rsbuild.rs)
[![Tailwind](https://img.shields.io/badge/Tailwind%204-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)

</div>

O sistema sorteia um carro e mostra cinco pistas: ano, preço FIPE, combustível, cilindrada e potência. A cada clique vem mais uma — procedência, torque, aspiração, câmbio, tração, carroceria e, por último, o código do motor. Quanto antes você acertar, melhor.

Só carros com presença real no Brasil. Nada de catálogo mundial.

## Os dois modos

**Sozinho** — quatro alternativas e um botão Responder. O carro fica escondido até você responder, e quem decide se acertou é o servidor.

**Em dupla** — você vê a resposta e conduz a rodada, lendo as pistas para outra pessoa. Aqui o Acertei/Errei faz sentido: tem alguém do outro lado para validar o palpite.

## O carro fica realmente escondido

Um app estático entrega tudo que sabe assim que a página carrega — dá para ler a resposta no F12 antes da primeira pista. Aqui não: a identidade do veículo não sai do servidor até você responder.

O que trafega é uma projeção sem marca, modelo, geração e imagem, e um token cifrado com AES-GCM que carrega o veículo da rodada. Decodificar o token à força devolve binário; adulterar devolve 401.

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
```

## Os dados

Cada carro é um JSON em `content/vehicles/cars/`. As specs vêm da tabela FIPE, que codifica cilindrada, potência, câmbio e tração no próprio nome do modelo — a fonte fica registrada em `specSource`.

**Campo sem fonte confiável fica ausente**, e o motor de pistas pula a pista correspondente em silêncio. Nunca aparece "não informado", e nada é inventado para preencher buraco.

As fotos são links para o Wikimedia Commons em `content/images.json`. Nenhuma imagem é versionada: com trezentos carros seriam dezenas de MB, e git guarda toda versão de binário para sempre.

## Arquitetura

`src/domain/` não conhece React e é importado tanto pelo cliente quanto pelas rotas em `api/` — as regras do jogo vivem num lugar só.

`Vehicle` já nasce como união discriminada por `kind` e o motor de pistas é genérico sobre a lista de definições. Adicionar motos é conteúdo, um tipo e uma lista de pistas nova: nenhuma tela muda.

Sem banco de dados. As rotas são handlers `(Request) => Response` sem estado, servidos localmente por `Bun.serve` — o formato roda em qualquer provedor serverless quando chegar a hora de publicar.
