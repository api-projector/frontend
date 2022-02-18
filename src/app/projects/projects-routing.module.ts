import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedGuard } from '../../guards/authorization';
import { MeUserResolver } from '../../resolvers/me';
import { ProjectsComponent } from './projects.component';
import { ProjectsModule } from './projects.module';
import {MakeDemoGuard} from "../../guards/demo";

export const PROJECTS_BREADCRUMB = $localize`:@@label.projects:Projects`;

const routes: Routes = [
  {
    path: '',
    component: ProjectsComponent,
    resolve: {
      me: MeUserResolver
    },
    data: {breadcrumb: PROJECTS_BREADCRUMB},
    canActivate: [
      LoggedGuard,
      MakeDemoGuard
    ]
  }
];

@NgModule({
  imports: [
    ProjectsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProjectsRoutingModule {

}
