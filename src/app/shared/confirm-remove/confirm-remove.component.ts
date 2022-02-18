import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UI } from '@esanum/ui';

@Component({
  selector: 'app-confirm-remove',
  templateUrl: './confirm-remove.component.html',
  styleUrls: ['./confirm-remove.component.scss']
})
export class ConfirmRemoveComponent implements OnInit {

  ui = UI;

  @Input()
  what!: string;

  @Output()
  confirmed = new EventEmitter();

  @Output()
  canceled = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  confirm() {
    this.confirmed.emit();
  }

  cancel() {
    this.canceled.emit();
  }
}
