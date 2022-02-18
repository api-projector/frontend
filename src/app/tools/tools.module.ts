import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ToolsComponent} from "./tools.component";
import {AppLayoutModule, BreadcrumbsModule, GridModule} from "@esanum/ui";
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [
    ToolsComponent
  ],
  imports: [
    CommonModule,

    AppLayoutModule,
    GridModule,
    RouterModule,
    BreadcrumbsModule
  ],
  exports: [
    ToolsComponent
  ]
})
export class ToolsModule {

}
