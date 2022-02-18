import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Integrations } from '@sentry/tracing';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as Sentry from '@sentry/angular';

if (environment.production) {
  enableProdMode();

  Sentry.init({
    dsn: 'https://913d700cdc124c3b8887366fcd7edbbd@sentry.junte.ru/9',
    integrations: [
      new Integrations.BrowserTracing({
        tracingOrigins: ['localhost', 'https://yourserver.io/api'],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
    tracesSampleRate: .5,
  });
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
