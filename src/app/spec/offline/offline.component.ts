import {Component, Output, EventEmitter} from '@angular/core';
import {UI} from "@esanum/ui";

@Component({
  selector: 'app-offline',
  templateUrl: './offline.component.html',
  styleUrls: ['./offline.component.scss']
})
export class OfflineComponent {

  ui = UI;

  @Output()
  ok = new EventEmitter();

}
