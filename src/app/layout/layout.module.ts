import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
  AppLayoutModule,
  AvatarModule,
  ButtonModule,
  LinkModule,
  MenuModule,
  ModalModule,
  PopoverModule,
  StackModule
} from '@esanum/ui';
import {LayoutComponent} from './layout.component';

@NgModule({
  declarations: [
    LayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    MenuModule,
    AppLayoutModule,
    LinkModule,
    StackModule,
    PopoverModule,
    ModalModule,
    AvatarModule,
    ButtonModule
  ]
})
export class LayoutModule {

}
