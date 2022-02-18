import { Field, Model } from 'serialize-ts';

@Model()
export class UserRegisterInput {

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  constructor(defs: Partial<UserRegisterInput> = {}) {
    Object.assign(this, defs);
  }
}
