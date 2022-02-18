import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoggedGuard} from '../../guards/authorization';
import {ToolsModule} from "./tools.module";
import {ToolsComponent} from "./tools.component";
import {ProjectResolver} from "../spec/spec.resolvers";

const routes: Routes = [
  {
    path: '',
    component: ToolsComponent,
    resolve: {
      project: ProjectResolver
    },
    canActivate: [
      LoggedGuard
    ]
  }
];

@NgModule({
  imports: [
    ToolsModule,
    RouterModule.forChild(routes)
  ]
})
export class ToolsRoutingModule {

}
