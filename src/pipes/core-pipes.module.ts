import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HexToRGB, TextBrightnessPipe } from 'src/pipes/color.pipe';
import { FilterPathsPipe } from './filter-paths.pipe';
import { MethodColorPipe } from './method-color.pipe';
import { StripSchemaRefPipe } from './strip-schema-ref.pipe';
import { FormatDatePipe } from './format-date.pipe';

@NgModule({
  declarations: [
    StripSchemaRefPipe,
    MethodColorPipe,
    TextBrightnessPipe,
    FilterPathsPipe,
    HexToRGB,
    FormatDatePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StripSchemaRefPipe,
    MethodColorPipe,
    TextBrightnessPipe,
    FilterPathsPipe,
    HexToRGB,
    FormatDatePipe
  ]
})
export class CorePipesModule {

}
