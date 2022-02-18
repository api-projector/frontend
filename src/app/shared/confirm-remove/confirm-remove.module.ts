import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmRemoveComponent } from './confirm-remove.component';
import {
  ButtonModule,
  IconModule,
  StackModule
} from "@esanum/ui";

@NgModule({
  declarations: [
    ConfirmRemoveComponent
  ],
  imports: [
    CommonModule,
    StackModule,
    IconModule,
    ButtonModule
  ],
  exports: [
    ConfirmRemoveComponent
  ]
})
export class ConfirmRemoveModule { }
