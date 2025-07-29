import { translations, TranslationKey } from '../translations';

export const useLanguage = () => {
  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let translation = translations.en[key] || key;
    if (vars) {
      for (const [varKey, varValue] of Object.entries(vars)) {
        const regex = new RegExp(`{{${varKey}}}`, 'g');
        translation = translation.replace(regex, String(varValue));
      }
    }
    return translation;
  };

  // Maintain the original hook signature to avoid breaking component destructuring.
  // setLanguage is now a no-op as the language is fixed to English.
  return { language: 'en' as const, setLanguage: () => {}, t };
};
