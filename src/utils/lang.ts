import { Language } from '../enums/language';

export function detectLanguage() {
  const base = localStorage['language'] || document.querySelector('base')
    ?.getAttribute('href')?.replace(/\//g, '') || 'en';
  switch (base) {
    case 'ru':
      return Language.ru;
    case 'en':
    default:
      return Language.en;
  }
}
