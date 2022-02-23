import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeRu from '@angular/common/locales/ru';
import { DEFAULT_CURRENCY_CODE, ErrorHandler, LOCALE_ID, Provider } from '@angular/core';
import { EsanumUiModule, i18nEn, i18nRu, localeEnUs as jntEnUs, localeRu as jntRu } from '@esanum/ui';
import { EsanumUIConfig } from '@esanum/ui/lib/config';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/link-context';
import { Locale } from 'date-fns';
import { enUS as dfnsEnUS, ru as dfnsRu } from 'date-fns/locale';
import { NgxLoggerLevel } from 'ngx-logger';
import { detectLanguage } from 'src/utils/lang';
import { AppConfig } from './app/config';
import { Language } from './enums/language';
import { environment } from './environments/environment';
import * as Sentry from '@sentry/angular';
import { onError } from "@apollo/client/link/error";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";

export const BASE_URI = 'https://app.apiprojector.com';
export const UI_DELAY = 500;
export const SCHEME_VERSION = 6;
export const DATE_FORMAT = 'yyyy-MM-dd';
export const BUILD_HASH = 'v115';
export const CURRENT_LANGUAGE = detectLanguage();
export const USE_MOCKS = environment.mocks;
export const USE_LOCAL_DB = environment.mocks;
export const LOCAL_SCHEMAS_LOCATOR = '#/components/schemas';

export let APP_PROVIDERS: Provider[] = [
  {
    provide: Language,
    useValue: CURRENT_LANGUAGE
  },
  {
    provide: APOLLO_OPTIONS,
    useFactory: (httpLink: HttpLink, config: AppConfig, router: Router) => {
      const errorLink = onError(({networkError}) => {
        if (!!networkError) {
          const {status} = networkError as HttpErrorResponse;
          if (status === 401) {
            config.token = null;
            router.navigate(['/']);
          }
        }
      });
      const contextLink = setContext((_, {headers}) => {
        return {
          headers: !!config.token ? {
            ...headers,
            'Authorization': `Bearer ${config.token?.key}`
          } : headers
        };
      });
      const link = ApolloLink.from([errorLink, contextLink, httpLink.create({uri: environment.graphql})]);
      return {
        cache: new InMemoryCache(),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
          },
          query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        },
        link
      };
    },
    deps: [HttpLink, AppConfig, Router]
  }
];

if (environment.production) {
  APP_PROVIDERS.push({
    provide: ErrorHandler,
    useValue: Sentry.createErrorHandler(),
  });
}

enum CurrencyCode {
  usd = 'usd',
  rur = 'rur'
}

type BackendConfig = {
  config: {
    currencyCode: CurrencyCode,
    firstWeekDay: 0 | 1
  }
};
declare var window: Window & { backend?: BackendConfig };
export const BACKEND: BackendConfig = window.backend || {
  config: {
    currencyCode: CurrencyCode.usd,
    firstWeekDay: 1
  }
};

const CURRENCY_CODE = BACKEND.config.currencyCode;
export const FIRST_DAY_OF_WEEK: 0 | 1 = BACKEND.config.firstWeekDay;

enum LocaleData {
  NumberFormats = 14,
  CurrencyCode = 16
}

function getLocaleData(locale: Object) {
  let changes;
  switch (CURRENCY_CODE) {
    case CurrencyCode.rur:
      changes = {
        [LocaleData.NumberFormats]: localeRu[LocaleData.NumberFormats],
        [LocaleData.CurrencyCode]: localeRu[LocaleData.CurrencyCode]
      };
      break;
    case CurrencyCode.usd:
    default:
      changes = {
        [LocaleData.NumberFormats]: localeEn[LocaleData.NumberFormats],
        [LocaleData.CurrencyCode]: localeEn[LocaleData.CurrencyCode]
      };

  }
  return {...locale, ...changes};
}

function mergeDfnsLocale(l: Locale): Locale {
  return {...l, ...{options: {weekStartsOn: FIRST_DAY_OF_WEEK}}};
}

let data;
let dfnsLocale;
export let config: Partial<EsanumUIConfig> = {logger: NgxLoggerLevel.DEBUG};
switch (CURRENT_LANGUAGE) {
  case Language.ru:
    data = getLocaleData(localeRu);
    registerLocaleData(data);
    dfnsLocale = mergeDfnsLocale(dfnsRu);
    config = {
      ...config,
      i18n: i18nRu,
      hash: BUILD_HASH,
      weekStartsOn: FIRST_DAY_OF_WEEK,
      locale: {
        ui: jntRu,
        dfns: dfnsLocale
      }
    };
    APP_PROVIDERS.push({
      provide: LOCALE_ID,
      useValue: 'ru'
    });
    break;
  case Language.en:
  default:
    data = getLocaleData(localeEn);
    registerLocaleData(data);
    dfnsLocale = mergeDfnsLocale(dfnsEnUS);
    config = {
      ...config,
      i18n: i18nEn,
      hash: BUILD_HASH,
      weekStartsOn: FIRST_DAY_OF_WEEK,
      locale: {
        ui: jntEnUs,
        dfns: dfnsLocale
      }
    };
    APP_PROVIDERS.push({
      provide: LOCALE_ID,
      useValue: 'en'
    });
}

export const DFNS_LOCALE = dfnsLocale;
export const DFNS_OPTIONS = {locale: DFNS_LOCALE, weekStartsOn: FIRST_DAY_OF_WEEK};

APP_PROVIDERS.push({
  provide: DEFAULT_CURRENCY_CODE,
  useValue: data[LocaleData.CurrencyCode]
});

APP_PROVIDERS.push(EsanumUiModule.forRoot(config).providers || []);

export const YAML_OPTIONS = {noArrayIndent: true};

export const MONACO_OPTIONS = {
  language: 'yaml',
  theme: 'vs-dark',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  wrappingStrategy: 'advanced',
  quickSuggestions: true,
  minimap: {
    enabled: false
  },
  overviewRulerLanes: 0
};
