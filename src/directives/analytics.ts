import { Directive, HostListener, Input } from '@angular/core';
import { Metrika } from 'ng-yandex-metrika';
import { AnalyticsType } from 'src/enums/analytics-type';

class AnalyticsConfig {
  type?: AnalyticsType;
  goal!: string;
}

/*
<button [analytics]="{type: Analitics.goal, goal: string}">Click for tracking</button>
 */

@Directive({
  selector: '[analytics]'
})

export class AnalyticsDirective {

  private _config!: AnalyticsConfig;

  @Input('analytics')
  set config(config: AnalyticsConfig) {
    this._config = config;
  }

  constructor(public ym: Metrika) {
  }

  @HostListener('click')
  track() {
    console.log('track', this._config.goal);
    switch (this._config?.type) {
      case AnalyticsType.goal:
      default:
        this.ym.fireEvent(this._config.goal);
        break;
    }
  }

}
