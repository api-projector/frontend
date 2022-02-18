import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GridModule, InputModule, LabelModule, StackModule } from '@esanum/ui';
import { CorePipesModule } from '../../../pipes/core-pipes.module';
import { SelectPathComponent } from './select-path.component';

@NgModule({
  declarations: [
    SelectPathComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelModule,
    StackModule,
    GridModule,
    CorePipesModule,
    InputModule
  ],
  exports: [
    SelectPathComponent
  ]
})
export class SelectPathModule {

}
