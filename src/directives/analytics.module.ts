import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AnalyticsDirective } from './analytics';
import { MetrikaModule } from 'ng-yandex-metrika';

@NgModule({
  declarations: [
    AnalyticsDirective
  ],
  imports: [
    CommonModule,
    MetrikaModule
  ],
  exports: [
    AnalyticsDirective
  ]
})

export class AnalyticsModule {
}
