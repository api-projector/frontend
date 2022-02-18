import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormComponent, InputComponent, UI } from '@esanum/ui';
import { finalize, map } from 'rxjs/operators';
import { deserialize, serialize } from 'serialize-ts';
import { UI_DELAY } from '../../consts';
import { SocialLoginSystem } from '../../enums/signin';
import { AuthToken } from '../../models/auth-token';
import { BackendError } from '../../types/gql-errors';
import { processGQL } from '../../utils/gql-errors';
import { AppConfig } from '../config';
import { MakeSocialLogin, TrySocialLogin } from '../login/models';
import { RegisterGQL, SocialLoginGQL } from './graphql';
import { UserRegisterInput } from './models';
import {CreateProjectGQL} from "../projects/graphql";

@Component({
  selector: 'spec-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit {

  ui = UI;
  loginSystem = SocialLoginSystem;

  errors: BackendError[] = [];
  progress = {
    registering: false,
    redirecting: false
  };

  @ViewChild('formRef')
  formRef!: FormComponent;

  @ViewChild('nameRef')
  nameRef!: InputComponent;

  @ViewChild('blockRef', {read: ElementRef})
  backdrop!: ElementRef<HTMLElement>;

  agreementControl = this.fb.control(false, [Validators.required]);
  form = this.fb.group({
    firstName: [null, [Validators.required]],
    lastName: [null, [Validators.required]],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required]],
    agreement: this.agreementControl
  });

  constructor(private registerGQL: RegisterGQL,
              private socialLoginGQL: SocialLoginGQL,
              private createProjectGQL: CreateProjectGQL,
              private fb: FormBuilder,
              public config: AppConfig,
              public router: Router) {
  }

  ngAfterViewInit() {
    setTimeout(() => this.nameRef.focus(), 100);
  }

  submit() {
    this.formRef.submit();
  }

  register() {
    const request = new UserRegisterInput(this.form.getRawValue());
    this.progress.registering = true;
    this.registerGQL.mutate({input: serialize(request)})
      .pipe(finalize(() => this.progress.registering = false),
        processGQL(),
        map(({register: {token}}) =>
          deserialize(token, AuthToken)))
      .subscribe((token: AuthToken) => {
        this.config.token = token;
        this.redirect();
      }, errors => this.errors = errors);
  }

  socialRegister(system: SocialLoginSystem) {
    const request = new TrySocialLogin({system});
    this.progress.registering = true;
    this.socialLoginGQL.mutate(serialize(request))
      .pipe(finalize(() => this.progress.registering = false),
        processGQL(),
        map(({response}) => deserialize(response, MakeSocialLogin)))
      .subscribe(({redirectUrl}) => {
          this.progress.redirecting = true;
          document.location.href = redirectUrl;
        },
        errors => this.errors = errors);
  }

  private redirect() {
    this.progress.redirecting = true;
    setTimeout(() => this.router.navigate(['/projects', {demo: 1}])
      .then(() => this.progress.redirecting = false), UI_DELAY);
  }

}
