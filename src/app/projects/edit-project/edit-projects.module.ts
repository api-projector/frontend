import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
    ButtonModule,
    FormModule,
    ImageUploaderModule,
    InformerModule,
    InputModule, PictureModule,
    StackModule, SwitcherModule,
    SwitchModule,
    TabsModule
} from '@esanum/ui';
import { EditProjectComponent } from './edit-project.component';
import { AnalyticsModule } from 'src/directives/analytics.module';

@NgModule({
  declarations: [
    EditProjectComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,

        InformerModule,
        FormModule,
        StackModule,
        TabsModule,
        InputModule,
        ButtonModule,
        SwitchModule,
        ImageUploaderModule,
        PictureModule,
        SwitcherModule,

        AnalyticsModule
    ]
})
export class ProjectEditModule {

}
