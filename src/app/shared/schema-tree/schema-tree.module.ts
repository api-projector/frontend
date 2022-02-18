import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CorePipesModule } from '../../../pipes/core-pipes.module';
import { SchemaTreeComponent } from './schema-tree.component';

@NgModule({
  declarations: [
    SchemaTreeComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CorePipesModule
  ],
  exports: [
    SchemaTreeComponent
  ]
})
export class SchemaTreeModule {

}
