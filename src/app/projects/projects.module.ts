import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {
  AppLayoutModule,
  ArrayPipesModule,
  ButtonModule,
  CardModule,
  ConfirmModule,
  EmptyModule,
  GridModule,
  IconModule,
  LinkModule,
  MenuModule,
  ModalModule,
  PictureModule,
  SkeletonModule,
  StackModule
} from '@esanum/ui';
import {AnalyticsModule} from 'src/directives/analytics.module';
import {ProjectEditModule} from './edit-project/edit-projects.module';
import {ProjectsComponent} from './projects.component';
import {RouterModule} from "@angular/router";
import {ConfirmRemoveModule} from '../shared/confirm-remove/confirm-remove.module';

@NgModule({
  declarations: [
    ProjectsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    ReactiveFormsModule,
    ArrayPipesModule,
    AppLayoutModule,
    GridModule,
    ButtonModule,
    StackModule,
    CardModule,
    MenuModule,
    LinkModule,
    SkeletonModule,

    ProjectEditModule,
    EmptyModule,
    PictureModule,

    AnalyticsModule,
    ConfirmModule,
    ModalModule,
    IconModule,
    ConfirmRemoveModule
  ]
})
export class ProjectsModule {

}
