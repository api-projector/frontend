import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoneLoggedGuard } from '../../guards/authorization';
import { RegisterComponent } from './register.component';
import { RegisterModule } from './register.module';

export const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    canActivate: [
      NoneLoggedGuard
    ]
  }
];

@NgModule({
  imports: [
    RegisterModule,
    RouterModule.forChild(routes)
  ]
})
export class RegisterRoutingModule {

}
