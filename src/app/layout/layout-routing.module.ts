import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { MeUserResolver } from '../../resolvers/me';
import { LayoutModule } from './layout.module';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    resolve: {
      me: MeUserResolver
    },
    children: [
      {
        path: 'projects',
        loadChildren: () => import('../projects/projects-routing.module')
          .then(m => m.ProjectsRoutingModule)
      },
      {
        path: 'projects/:project/tools',
        pathMatch: 'full',
        loadChildren: () => import('../tools/tools-routing.module')
          .then(m => m.ToolsRoutingModule)
      },
      {
        path: 'projects/:project',
        loadChildren: () => import('../spec/spec-routing.module')
          .then(m => m.SpecRoutingModule)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/projects'
  }
];

@NgModule({
  imports: [
    LayoutModule,
    RouterModule.forChild(routes)
  ]
})
export class LayoutRoutingModule {

}
