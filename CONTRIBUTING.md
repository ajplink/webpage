# Contribuir com conteúdo — Associação Plink

Este documento explica como adicionar ou alterar conteúdo **sem tocar em código**.
Tudo o que é preciso é criar (ou editar) um ficheiro Markdown na pasta certa.

Regra de ouro: **um ficheiro por item, uma pasta por idioma**.

```
src/content/<coleção>/<idioma>/<slug>.md
```

| Coleção  | Pasta                   | Para quê                          |
| -------- | ----------------------- | --------------------------------- |
| `team`   | `src/content/team/`     | Pessoas da associação             |
| `events` | `src/content/events/`   | Eventos (o estado vem das datas!) |
| `news`   | `src/content/news/`     | Notícias                          |
| `projects` | `src/content/projects/` | Projetos dos membros            |
| `pages`  | `src/content/pages/`    | Textos das páginas Sobre/Juntar/Privacidade |

Idiomas disponíveis: `pt` (obrigatório), `en-us`, `en-gb`.
O **`<slug>` tem de ser igual em todos os idiomas** (é o que liga as versões).

Depois de guardar o ficheiro, o site volta a ser gerado com `npm run build`.
Um ficheiro inválido faz falhar o build **de propósito** — é melhor apanhar o
erro agora do que publicar conteúdo partido.

---

## 1. Adicionar uma pessoa à equipa

Crie `src/content/team/pt/<nome>.md` (ex.: `src/content/team/pt/ana-silva.md`):

```markdown
---
name: Ana Silva
role: Responsável de Projetos
department: DP          # um de: DREE, DP, DL, DCI, Direção
bio: Duas frases sobre a pessoa e o que faz na associação.
order: 2                # opcional: ordem dentro do departamento
active: true            # false esconde a pessoa da página de equipa
links:                  # opcional
  - label: LinkedIn
    url: https://www.linkedin.com/in/exemplo
---
```

Para a fotografia (opcional), coloque a imagem em `src/assets/` e acrescente
`photo: ../../assets/fotografias/ana-silva.jpg`. Sem fotografia, o site mostra
as iniciais — não use retratos inventados.

## 2. Adicionar um evento

Crie `src/content/events/pt/<slug>.md`:

```markdown
---
title: Atelier de Robótica
date: 2027-02-10          # AAAA-MM-DD
endDate: 2027-02-11       # opcional, para eventos de vários dias
location: Lisboa
summary: Uma frase de descrição para listas e partilhas.
registrationUrl: https://example.org/inscricoes   # opcional
cancelled: false          # ponha true se o evento for cancelado
cover: ../../../assets/covers/exemplo.png         # opcional
---

## Programa

Texto livre em Markdown…
```

**Não escreva o estado do evento.** O site calcula-o sozinho a partir das datas:
um evento é “próximo” até terminar o último dia e “anterior” depois disso.
`cancelled: true` é a única exceção.

## 3. Publicar uma notícia

Crie `src/content/news/pt/<slug>.md`:

```markdown
---
title: Título da notícia
date: 2026-10-01
summary: Uma ou duas frases para a listagem, RSS e partilhas.
tags: [escolas, educacao]   # minúsculas, sem acentos, iguais em todos os idiomas
draft: false                # true = rascunho: nunca publicado
cover: ../../../assets/covers/exemplo.png   # opcional
---

Corpo da notícia em Markdown (pode usar **negrito**, listas, imagens, MDX)…
```

Enquanto `draft: true`, a notícia **não aparece em lado nenhum** (listas, RSS,
sitemap, página própria) — mas continua a ser validada.

## 4. Registar um projeto

Crie `src/content/projects/pt/<slug>.md`:

```markdown
---
title: Título do projeto
summary: Uma frase sobre o que é o projeto.
status: active          # um de: idea, active, completed
tags: [robotica, educacao]
leads: [pt/ana-silva]   # SEMPRE o id do ficheiro pt da pessoa (pasta + slug)
links:
  - label: Repositório
    url: https://example.org/repositorio
hasSimulation: false    # true reserva o espaço para a simulação interativa
cover: ../../../assets/covers/exemplo.png   # opcional
---

Descrição do projeto…
```

Nota sobre `leads`: o valor é a pasta do idioma seguida do nome do ficheiro da
pessoa, sem `.md` — `src/content/team/pt/ana-silva.md` → `pt/ana-silva`.
O site resolve automaticamente a versão traduzida da pessoa na página inglesa.

## 5. Alterar uma página (Sobre, Juntar, Privacidade)

Os textos destas páginas vivem em `src/content/pages/<idioma>/` com nomes fixos:
`about.md`, `join.md`, `privacy.md`. Não mude estes nomes (as URLs são traduzidas
noutro sítio — ver `.agents/i18n.md`). Editar = abrir o ficheiro e alterar o
Markdown.

---

## Traduções

A convenção é **pastas por idioma**. Para traduzir, copie o ficheiro `pt` para a
pasta do idioma (mantendo o `<slug>`) e traduza **apenas os campos de texto**:

| Campo                | Traduzir? | Notas                                                |
| -------------------- | --------- | ---------------------------------------------------- |
| `title`, `summary`, `bio`, `role`, `location` | sim | são os únicos campos que vêm do ficheiro traduzido |
| `date`, `endDate`, `tags`, `status`, `leads`, `order`, `active`, `photo`, `cover`, `links`, `cancelled`, `hasSimulation`, `registrationUrl`, `draft` | não | vêm sempre do ficheiro `pt` |
| corpo do documento   | sim       | cada idioma tem o seu corpo                          |

Exemplo — `src/content/news/en-us/robotica-de-verao.md`:

```markdown
---
title: Summer robotics workshop
date: 2027-02-10          # manter igual ao ficheiro pt
summary: One sentence for listings, RSS and social shares.
tags: [robotica, educacao]   # manter igual ao ficheiro pt
draft: false
---

Body in English…
```

Se não existir tradução, **não faz mal**: o site usa o texto português e a página
continua a existir em `/en-us/…` e `/en-gb/…`. Pode traduzir pouco a pouco.

## Imagens

- Coloque os ficheiros em `src/assets/` (serão convertidos automaticamente para
  AVIF/WebP com dimensões explícitas).
- Referencie o caminho **relativamente ao ficheiro de conteúdo**:
  de `src/content/news/pt/x.md` → `../../../assets/capas/x.png`.
- Sempre com `cover:` (nunca imagens no corpo sem `alt`).

## Cores, tipos e logótipo

- **Cores da associação** (azul, rosa, amarelo, verde, laranja, preto, branco):
  `src/styles/tokens.css`, bloco 1 — `--palette-*`. Depois de alterar, corra
  `npm run contrast` para confirmar que os contrastes continuam acessíveis.
- **Tipos de letra**: `--font-sans` / `--font-display` no mesmo ficheiro.
- **Nome, morada, NIPC, contactos, redes**: `src/config/site.ts`.
- **Logótipo e imagem de partilha**: `public/favicon.svg`, `public/og-placeholder.png`.

## Antes de publicar

```bash
npm run build       # valida tudo (astro check + build), sem avisos
npm run contrast    # contraste WCAG dos tokens
```

Se o build passar, o conteúdo está pronto para publicar.
