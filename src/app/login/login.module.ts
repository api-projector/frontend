import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BlockModule,
  ButtonModule,
  FormModule,
  GridModule,
  InformerModule,
  InputModule,
  LinkModule,
  ShortcutsModule,
  StackModule
} from '@esanum/ui';
import { LoginComponent } from 'src/app/login/login.component';
import { AnalyticsModule } from "../../directives/analytics.module";

@NgModule({
  declarations: [
    LoginComponent
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
    LinkModule
  ]
})
export class LoginModule {

}
