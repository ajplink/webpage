/**
 * UI strings, per locale.
 *
 * Keys are grouped by area. To add a string: add it to ALL three locales
 * (English variants may be identical). `t()` falls back along the chain in
 * site.ts FALLBACKS if a key is missing, so a missing en-gb key shows en-us.
 *
 * Content text NEVER lives here — this file is only for interface labels.
 */
import { DEFAULT_LOCALE, FALLBACKS, type Locale, type Localized } from '../config/site';

const ui = {
  'a11y.skip': {
    pt: 'Saltar para o conteúdo',
    'en-us': 'Skip to content',
    'en-gb': 'Skip to content',
  },
  'a11y.mainNav': {
    pt: 'Navegação principal',
    'en-us': 'Main navigation',
    'en-gb': 'Main navigation',
  },
  'a11y.mobileNav': {
    pt: 'Navegação',
    'en-us': 'Navigation',
    'en-gb': 'Navigation',
  },
  'a11y.footerNav': {
    pt: 'Navegação de rodapé',
    'en-us': 'Footer navigation',
    'en-gb': 'Footer navigation',
  },
  'a11y.language': {
    pt: 'Idioma',
    'en-us': 'Language',
    'en-gb': 'Language',
  },
  'a11y.menu': {
    pt: 'Menu',
    'en-us': 'Menu',
    'en-gb': 'Menu',
  },

  'theme.toggle': {
    pt: 'Alternar tema claro/escuro',
    'en-us': 'Toggle light/dark theme',
    'en-gb': 'Toggle light/dark theme',
  },
  'theme.toLight': {
    pt: 'Mudar para tema claro',
    'en-us': 'Switch to light theme',
    'en-gb': 'Switch to light theme',
  },
  'theme.toDark': {
    pt: 'Mudar para tema escuro',
    'en-us': 'Switch to dark theme',
    'en-gb': 'Switch to dark theme',
  },

  'nav.about': { pt: 'Sobre', 'en-us': 'About', 'en-gb': 'About' },
  'nav.team': { pt: 'Equipa', 'en-us': 'Team', 'en-gb': 'Team' },
  'nav.events': { pt: 'Eventos', 'en-us': 'Events', 'en-gb': 'Events' },
  'nav.news': { pt: 'Notícias', 'en-us': 'News', 'en-gb': 'News' },
  'nav.projects': { pt: 'Projetos', 'en-us': 'Projects', 'en-gb': 'Projects' },
  'nav.join': { pt: 'Juntar', 'en-us': 'Join', 'en-gb': 'Join' },
  'nav.privacy': { pt: 'Privacidade', 'en-us': 'Privacy', 'en-gb': 'Privacy' },

  'home.eyebrow': {
    pt: 'Associação de juventude · Portugal',
    'en-us': 'Youth association · Portugal',
    'en-gb': 'Youth association · Portugal',
  },
  'home.cta': {
    pt: 'Explorar projetos',
    'en-us': 'Explore projects',
    'en-gb': 'Explore projects',
  },
  'home.ctaSecondary': {
    pt: 'Juntar-me à Plink',
    'en-us': 'Join Plink',
    'en-gb': 'Join Plink',
  },
  'home.upcomingEvents': {
    pt: 'Próximos eventos',
    'en-us': 'Upcoming events',
    'en-gb': 'Upcoming events',
  },
  'home.latestNews': {
    pt: 'Últimas notícias',
    'en-us': 'Latest news',
    'en-gb': 'Latest news',
  },
  'home.featuredProjects': {
    pt: 'Projetos em destaque',
    'en-us': 'Featured projects',
    'en-gb': 'Featured projects',
  },
  'home.viewAll': { pt: 'Ver todos', 'en-us': 'View all', 'en-gb': 'View all' },
  'home.empty': {
    pt: 'Em breve — voltem para ver novidades.',
    'en-us': 'Coming soon — check back for updates.',
    'en-gb': 'Coming soon — check back for updates.',
  },

  'common.readMore': { pt: 'Ler mais', 'en-us': 'Read more', 'en-gb': 'Read more' },
  'common.backTo': { pt: 'Voltar a', 'en-us': 'Back to', 'en-gb': 'Back to' },
  'common.details': { pt: 'Detalhes', 'en-us': 'Details', 'en-gb': 'Details' },
  'common.fallbackNote': {
    pt: 'Esta página está disponível em português.',
    'en-us': 'This page is currently only available in Portuguese.',
    'en-gb': 'This page is currently only available in Portuguese.',
  },

  'events.upcoming': { pt: 'Próximos', 'en-us': 'Upcoming', 'en-gb': 'Upcoming' },
  'events.past': { pt: 'Anteriores', 'en-us': 'Past', 'en-gb': 'Past' },
  'events.cancelled': { pt: 'Cancelado', 'en-us': 'Cancelled', 'en-gb': 'Cancelled' },
  'events.register': {
    pt: 'Inscrever-me',
    'en-us': 'Register',
    'en-gb': 'Register',
  },
  'events.location': { pt: 'Local', 'en-us': 'Location', 'en-gb': 'Location' },
  'events.date': { pt: 'Data', 'en-us': 'Date', 'en-gb': 'Date' },
  'events.noUpcoming': {
    pt: 'Sem eventos marcados de momento.',
    'en-us': 'No events scheduled right now.',
    'en-gb': 'No events scheduled right now.',
  },
  'events.noPast': {
    pt: 'Ainda não há eventos anteriores.',
    'en-us': 'No past events yet.',
    'en-gb': 'No past events yet.',
  },

  'projects.status.idea': { pt: 'Ideia', 'en-us': 'Idea', 'en-gb': 'Idea' },
  'projects.status.active': { pt: 'Ativo', 'en-us': 'Active', 'en-gb': 'Active' },
  'projects.status.completed': {
    pt: 'Concluído',
    'en-us': 'Completed',
    'en-gb': 'Completed',
  },
  'projects.leads': {
    pt: 'Responsáveis',
    'en-us': 'Project leads',
    'en-gb': 'Project leads',
  },
  'projects.links': { pt: 'Ligações', 'en-us': 'Links', 'en-gb': 'Links' },
  'projects.filters': { pt: 'Filtrar', 'en-us': 'Filter', 'en-gb': 'Filter' },
  'projects.allProjects': {
    pt: 'Todos os projetos',
    'en-us': 'All projects',
    'en-gb': 'All projects',
  },
  'projects.filtersAll': { pt: 'Todos', 'en-us': 'All', 'en-gb': 'All' },
  'projects.filtersStatus': { pt: 'Estado', 'en-us': 'Status', 'en-gb': 'Status' },
  'projects.filtersTags': { pt: 'Tema', 'en-us': 'Topic', 'en-gb': 'Topic' },
  'projects.simulationPending': {
    pt: 'Simulação interativa — em breve.',
    'en-us': 'Interactive simulation — coming soon.',
    'en-gb': 'Interactive simulation — coming soon.',
  },

  'news.tags': { pt: 'Temas', 'en-us': 'Topics', 'en-gb': 'Topics' },
  'news.allPosts': {
    pt: 'Todas as notícias',
    'en-us': 'All posts',
    'en-gb': 'All posts',
  },
  'news.rss': {
    pt: 'Subscrever via RSS',
    'en-us': 'Subscribe via RSS',
    'en-gb': 'Subscribe via RSS',
  },

  'team.department': { pt: 'Departamento', 'en-us': 'Department', 'en-gb': 'Department' },
  'team.departments': {
    pt: 'Departamentos',
    'en-us': 'Departments',
    'en-gb': 'Departments',
  },

  'join.contact': { pt: 'Contacto', 'en-us': 'Contact', 'en-gb': 'Contact' },
  'join.formLink': {
    pt: 'Preencher o formulário',
    'en-us': 'Fill in the form',
    'en-gb': 'Fill in the form',
  },
  'join.emailLabel': {
    pt: 'Escreve-nos',
    'en-us': 'Email us',
    'en-gb': 'Email us',
  },

  'footer.rights': {
    pt: 'Todos os direitos reservados.',
    'en-us': 'All rights reserved.',
    'en-gb': 'All rights reserved.',
  },

  'notFound.title': {
    pt: 'Página não encontrada',
    'en-us': 'Page not found',
    'en-gb': 'Page not found',
  },
  'notFound.body': {
    pt: 'O endereço que procuras não existe (ou já não existe).',
    'en-us': 'The address you are looking for does not exist (or no longer exists).',
    'en-gb': 'The address you are looking for does not exist (or no longer exists).',
  },
  'notFound.home': { pt: 'Ir para o início', 'en-us': 'Go home', 'en-gb': 'Go home' },
} satisfies Record<string, Localized>;

export type UIKey = keyof typeof ui;

/** Translated UI string, walking the locale fallback chain (en-gb → en-us → pt). */
export function t(locale: Locale, key: UIKey): string {
  for (const l of [locale, ...FALLBACKS[locale], DEFAULT_LOCALE]) {
    const value = ui[key][l];
    if (value) return value;
  }
  return ui[key].pt;
}
