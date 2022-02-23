import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormComponent, InputComponent, UI } from '@esanum/ui';
import 'reflect-metadata';
import { delay, finalize, map } from 'rxjs/operators';
import { deserialize, serialize } from 'serialize-ts';
import { AppConfig } from 'src/app/config';
import { AuthToken } from 'src/models/auth-token';
import { SocialLoginSystem } from '../../enums/signin';
import { BackendError } from '../../types/gql-errors';
import { processGQL } from '../../utils/gql-errors';
import { LoginGQL, SocialLoginCompleteGQL, SocialLoginGQL } from './graphql';
import { CompleteSocialLogin, MakeSocialLogin, TrySocialLogin, UserCredentials } from './models';
import { UI_DELAY, USE_MOCKS } from '../../consts';
import { getMock } from '@junte/mocker';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, AfterViewInit {

  ui = UI;
  loginSystem = SocialLoginSystem;

  progress = {login: false, redirecting: false};
  errors: BackendError[] = [];

  form = this.builder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required]]
  });

  @ViewChild(FormComponent)
  formComponent!: FormComponent;

  @ViewChild('emailRef')
  emailRef!: InputComponent;

  @ViewChild('blockRef', {read: ElementRef})
  backdrop!: ElementRef<HTMLElement>;

  constructor(private loginGQL: LoginGQL,
              private socialLoginGQL: SocialLoginGQL,
              private socialLoginCompleteGQL: SocialLoginCompleteGQL,
              private config: AppConfig,
              private builder: FormBuilder,
              private route: ActivatedRoute,
              public router: Router,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.completeSocialLogin();

    if (USE_MOCKS) {
      this.form.patchValue({
        email: 'user@test.com',
        password: '123456'
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.emailRef.focus(), 100);
  }

  private completeSocialLogin() {
    const snapshot = this.route.snapshot;
    const {system} = snapshot.data;
    if (!system) {
      return;
    }

    const {code, state} = snapshot.queryParams;
    const request = new CompleteSocialLogin({system, code, state});
    this.progress.login = true;
    this.cd.detectChanges();
    this.socialLoginCompleteGQL.mutate(serialize(request))
      .pipe(processGQL(), finalize(() => {
          this.progress.login = false;
          this.cd.detectChanges();
        }),
        map(({response: {token, isNewUser}}) => ({token: deserialize(token, AuthToken), isNewUser})))
      .subscribe(({token, isNewUser}) => this.logged(token, isNewUser),
        errors => this.errors = errors);
  }

  submit() {
    this.formComponent.submit();
  }

  login() {
    const request = new UserCredentials(this.form.getRawValue());
    this.progress.login = true;
    this.cd.detectChanges();
    const action = USE_MOCKS
      ? of(getMock(AuthToken)).pipe(delay(UI_DELAY))
      : this.loginGQL.mutate({input: request})
        .pipe(processGQL(),
          map(({login: {token}}) => deserialize(token, AuthToken)));
    action.pipe(finalize(() => {
      this.progress.login = false;
      this.cd.detectChanges();
    })).subscribe((token: AuthToken) => this.logged(token),
      errors => this.errors = errors);
  }

  socialLogin(system: SocialLoginSystem) {
    const request = new TrySocialLogin({system});
    this.progress.login = true;
    this.cd.detectChanges();
    this.socialLoginGQL.mutate(serialize(request))
      .pipe(processGQL(), finalize(() => {
          this.progress.login = false;
          this.cd.detectChanges();
        }),
        map(({response}) => deserialize(response, MakeSocialLogin)))
      .subscribe(({redirectUrl}) => {
          this.progress.redirecting = true;
          this.cd.detectChanges();
          document.location.href = redirectUrl;
        },
        errors => this.errors = errors);
  }

  private logged(token: AuthToken, demo: boolean = false) {
    this.config.token = token;
    this.progress.redirecting = true;
    this.cd.detectChanges();
    this.router.navigate(['/projects', demo ? {demo: 1} : {}])
      .then(() => this.progress.redirecting = false);
  }

}
