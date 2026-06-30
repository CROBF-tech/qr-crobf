import { defaultLocale, locales, type Locale, getTranslations, type UITranslations } from './translations';

export { defaultLocale, locales, type Locale, type UITranslations };

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split('/')[1];
  if (segment && isValidLocale(segment)) return segment;
  return defaultLocale;
}

export function getPathWithoutLocale(pathname: string): string {
  const segment = pathname.split('/')[1];
  if (segment && isValidLocale(segment)) {
    return pathname.replace(`/${segment}`, '') || '/';
  }
  return pathname;
}

export function localizePath(path: string, locale: Locale): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (locale === defaultLocale) {
    return clean ? `/${clean}` : '/';
  }
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

export { getTranslations };
