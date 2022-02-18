import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AppLayoutModule,
  ArrayPipesModule, AvatarModule, BadgeModule,
  BlockModule,
  BreadcrumbsModule,
  ButtonModule,
  CardModule,
  CollapsibleModule,
  DotModule,
  EmptyModule,
  FormModule,
  GridModule,
  IconModule, ImageUploaderModule,
  InputModule,
  LabelModule,
  LinkModule,
  MenuModule,
  MessageModule,
  PictureModule,
  PopoverModule,
  ResponsiveModule,
  SelectableModule,
  SelectModule,
  ShortcutsModule,
  SpinnerModule,
  StackModule, SwitcherModule,
  TableModule, TabsModule,
  TimelineModule
} from '@esanum/ui';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { GroupByColsPipe } from 'src/app/spec/design/group-by-cols.pipe';
import { SpecComponent } from 'src/app/spec/spec.component';
import { AnalyticsModule } from '../../directives/analytics.module';
import { CorePipesModule } from '../../pipes/core-pipes.module';
import { SchemaTreeModule } from '../shared/schema-tree/schema-tree.module';
import { SelectPathModule } from '../shared/select-path/select-path.module';
import { SelectSchemaModule } from '../shared/select-schema/select-schema.module';
import { YamlEditorModule } from '../shared/yaml-editor/yaml-editor.module';
import { AllTagsPipe } from './all-tags.pipe';
import { DesignComponent } from './design/design.component';
import { EditFolderComponent } from './design/edit-folder/edit-folder.component';
import { EditScreenComponent } from './design/edit-screen/edit-screen.component';
import { EditCommentComponent } from './design/screen/edit-comment/edit-comment.component';
import { ScreenComponent } from './design/screen/screen.component';
import { SetFigmaTokenComponent } from './design/set-figma-key/set-figma-token.component';
import { OfflineComponent } from './offline/offline.component';
import { EditPathComponent } from './paths/edit-path/edit-path.component';
import { PathsComponent } from './paths/paths.component';
import { ResolveRefsPipe } from './resolve-refs.pipe';
import { EditSchemaComponent } from './schemas/edit-schema/edit-schema.component';
import { SchemasComponent } from './schemas/schemas.component';
import { SwaggerComponent } from './swagger/swagger.component';
import { WelcomeComponent } from './dashboard/welcome/welcome.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardDesignsComponent } from './dashboard/designs/dashboard-designs.component';
import { DashboardPathsComponent } from './dashboard/paths/dashboard-paths.component';
import { DashboardSchemasComponent } from './dashboard/schemas/dashboard-schemas.component';
import { ShareComponent } from './share/share.component';
import { ConfirmRemoveModule } from '../shared/confirm-remove/confirm-remove.module';
import {AddPagingComponent} from "./paths/add-paging/add-paging.component";

@NgModule({
  declarations: [
    SpecComponent,
    DesignComponent,
    SetFigmaTokenComponent,
    EditFolderComponent,
    EditScreenComponent,
    PathsComponent,
    EditPathComponent,
    SchemasComponent,
    EditSchemaComponent,
    SwaggerComponent,
    ResolveRefsPipe,
    AllTagsPipe,
    ScreenComponent,
    EditCommentComponent,
    WelcomeComponent,
    OfflineComponent,
    GroupByColsPipe,
    DashboardComponent,
    DashboardDesignsComponent,
    DashboardPathsComponent,
    DashboardSchemasComponent,
    ShareComponent,
    AddPagingComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    AppLayoutModule,
    BreadcrumbsModule,
    LinkModule,
    MenuModule,
    ButtonModule,
    IconModule,
    CardModule,
    // TODO: why should we include it?
    MonacoEditorModule.forRoot(),
    ResponsiveModule,
    GridModule,
    StackModule,
    FormModule,
    InputModule,
    BlockModule,
    SelectModule,
    CollapsibleModule,
    TableModule,
    LabelModule,
    PopoverModule,
    PictureModule,
    CorePipesModule,
    SelectableModule,
    ShortcutsModule,
    MessageModule,
    TimelineModule,
    AnalyticsModule,
    SpinnerModule,
    EmptyModule,
    DotModule,
    SelectPathModule,
    SelectSchemaModule,
    YamlEditorModule,
    SchemaTreeModule,
    ConfirmRemoveModule,
    ArrayPipesModule,
    AvatarModule,
    BadgeModule,
    TabsModule,
    ImageUploaderModule,
    SwitcherModule
  ]
})
export class SpecModule {

}
