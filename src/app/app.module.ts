import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { ModalModule } from '@esanum/ui';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { APP_PROVIDERS } from '../consts';
import { AppComponent } from './app.component';
import { MetrikaModule } from "ng-yandex-metrika";

function routingErrorHandler(error) {
  console.log(error);
  // location.href = '/';
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'projects'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login-routing.module')
      .then(m => m.LoginRoutingModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register-routing.module')
      .then(m => m.RegisterRoutingModule)
  },
  {
    path: 'oauth',
    loadChildren: () => import('./login/login-routing.module')
      .then(m => m.LoginRoutingModule)
  },
  {
    path: '',
    loadChildren: () => import('./layout/layout-routing.module')
      .then(m => m.LayoutRoutingModule)
  }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule,

    HttpClientModule,
    BrowserAnimationsModule,
    ModalModule,

    LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG}),
    RouterModule.forRoot(routes, {
      paramsInheritanceStrategy: 'always',
      initialNavigation: 'enabled',
      scrollPositionRestoration: 'top',
      errorHandler: routingErrorHandler
    }),
    MetrikaModule.forRoot(
      {
        id: 87018942,
        webvisor: false,
        clickmap: true,
        trackLinks: true
      }
    )
  ],
  providers: APP_PROVIDERS,
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {

}
