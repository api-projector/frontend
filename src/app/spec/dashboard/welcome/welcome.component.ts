import {Component, Output, EventEmitter} from '@angular/core';
import {UI} from "@esanum/ui";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {

  ui = UI;

  @Output()
  ok = new EventEmitter();

}
