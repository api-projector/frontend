import { Field, Model } from 'serialize-ts';
import { SocialLoginSystem } from '../../enums/signin';

@Model()
export class UserCredentials {

  @Field()
  email!: string;

  @Field()
  password!: string;

  constructor(defs: Partial<UserCredentials> = {}) {
    Object.assign(this, defs);
  }
}

@Model()
export class TrySocialLogin {

  @Field()
  system!: SocialLoginSystem;

  constructor(defs: Partial<TrySocialLogin> = {}) {
    Object.assign(this, defs);
  }

}

@Model()
export class MakeSocialLogin {

  @Field()
  redirectUrl!: string;

  constructor(defs: Partial<MakeSocialLogin> = {}) {
    Object.assign(this, defs);
  }

}

@Model()
export class CompleteSocialLogin {

  @Field()
  system!: SocialLoginSystem;

  @Field()
  state!: string;

  @Field()
  code!: string;

  constructor(defs: Partial<CompleteSocialLogin> = {}) {
    Object.assign(this, defs);
  }

}
