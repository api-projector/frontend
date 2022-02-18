import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormModule, GridModule, IconModule, MessageModule, StackModule } from '@esanum/ui';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { YamlEditorComponent } from './yaml-editor.component';

@NgModule({
  declarations: [
    YamlEditorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MonacoEditorModule,
    GridModule,
    StackModule,
    FormModule,
    MessageModule,
    IconModule
  ],
  exports: [
    YamlEditorComponent
  ]
})
export class YamlEditorModule {

}
