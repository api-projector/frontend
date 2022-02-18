import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpecComponent } from 'src/app/spec/spec.component';
import { LoggedGuard } from '../../guards/authorization';
import { Path } from '../../models/path';
import { Folder } from '../../models/folder';
import { Project } from '../../models/project';
import { Schema } from '../../models/schema';
import { ScreenFile } from '../../models/screen-file';
import { DesignComponent } from './design/design.component';
import { ScreenComponent } from './design/screen/screen.component';
import { EditPathComponent } from './paths/edit-path/edit-path.component';
import { PathsComponent } from './paths/paths.component';
import { EditSchemaComponent } from './schemas/edit-schema/edit-schema.component';
import { SchemasComponent } from './schemas/schemas.component';
import { SpecModule } from './spec.module';
import {
  PathResolver,
  FolderResolver,
  SchemaResolver,
  SpecResolver,
  ScreenResolver,
  ProjectResolver
} from './spec.resolvers';
import { SwaggerComponent } from './swagger/swagger.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export function getProject({project}: { project: Project }) {
  return project.title;
}

export function getFolder({folder}: { folder: Folder }) {
  return folder.name;
}

export function getScreen({screen}: { screen: ScreenFile }) {
  return screen.name;
}

export function getPath({path}: { path: Path }) {
  return path.url;
}

export function getSchema({schema}: { schema: Schema }) {
  return schema.name;
}

export const routes: Routes = [
  {
    path: '',
    component: SpecComponent,
    resolve: {
      spec: SpecResolver,
      project: ProjectResolver
    },
    data: {breadcrumb: getProject},
    canActivate: [
      LoggedGuard
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        data: {breadcrumb: 'Dashboard'},
        component: DashboardComponent
      },
      {
        path: 'design',
        data: {breadcrumb: 'Design'},
        resolve: {
          project: ProjectResolver
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: DesignComponent,
          },
          {
            path: '~',
            children: [
              {
                path: ':screen',
                data: {breadcrumb: getScreen},
                resolve: {
                  screen: ScreenResolver
                },
                children: [
                  {
                    path: '',
                    pathMatch: 'full',
                    component: ScreenComponent,
                  },
                  {
                    path: ':path',
                    component: EditPathComponent,
                    data: {breadcrumb: getPath},
                    resolve: {
                      path: PathResolver
                    }
                  }
                ]
              }
            ]
          },
          {
            path: ':folder',
            data: {breadcrumb: getFolder},
            resolve: {
              folder: FolderResolver
            },
            children: [
              {
                path: '',
                pathMatch: 'full',
                component: DesignComponent
              },
              {
                path: ':screen',
                data: {breadcrumb: getScreen},
                resolve: {
                  screen: ScreenResolver
                },
                children: [
                  {
                    path: '',
                    pathMatch: 'full',
                    component: ScreenComponent,
                  },
                  {
                    path: ':path',
                    component: EditPathComponent,
                    data: {breadcrumb: getPath},
                    resolve: {
                      path: PathResolver
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'paths',
        data: {breadcrumb: 'Paths'},
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: PathsComponent
          },
          {
            path: ':path',
            component: EditPathComponent,
            data: {breadcrumb: getPath},
            resolve: {
              path: PathResolver
            }
          }
        ]
      },
      {
        path: 'schemas',
        data: {breadcrumb: 'Schemas'},
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: SchemasComponent
          },
          {
            path: ':schema',
            component: EditSchemaComponent,
            data: {breadcrumb: getSchema},
            resolve: {
              schema: SchemaResolver
            }
          }
        ]
      },
      {
        path: 'swagger',
        component: SwaggerComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    SpecModule,
    RouterModule.forChild(routes)
  ]
})
export class SpecRoutingModule {

}
