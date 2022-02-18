import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule, FormModule, GridModule, InputModule, LabelModule, SelectModule, StackModule } from '@esanum/ui';
import { SelectSchemaComponent } from './select-schema.component';

@NgModule({
  declarations: [
    SelectSchemaComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormModule,
        LabelModule,
        StackModule,
        GridModule,
        ButtonModule,
        InputModule,
        SelectModule
    ],
  exports: [
    SelectSchemaComponent
  ]
})
export class SelectSchemaModule {

}
