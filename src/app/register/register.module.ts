import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BlockModule,
  ButtonModule, CardModule, CheckboxModule,
  FormModule,
  GridModule, IconModule,
  InformerModule,
  InputModule, LabelModule,
  LinkModule,
  ShortcutsModule,
  StackModule
} from '@esanum/ui';
import { RegisterComponent } from './register.component';
import { AnalyticsModule } from "../../directives/analytics.module";

@NgModule({
  declarations: [
    RegisterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    AnalyticsModule,

    ShortcutsModule,
    StackModule,
    GridModule,
    InformerModule,
    BlockModule,
    FormModule,
    InputModule,
    ButtonModule,
    LinkModule,
    IconModule,
    CardModule,
    LabelModule,
    CheckboxModule
  ]
})
export class RegisterModule {

}
