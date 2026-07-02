import { getTranslations } from './translations';
import type { Locale } from './translations';

export type { Locale };
export { getTranslations };

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'es') return 'es';
  return 'en';
}

export function getPathWithoutLocale(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale === 'en') return pathname;
  const segments = pathname.split('/').filter(Boolean);
  segments.shift();
  return '/' + segments.join('/');
}

export function localizePath(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  return path === '/' ? '/es/' : `/es${path}`;
}
