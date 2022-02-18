import { Field, Model } from 'serialize-ts';
import { Image } from './image';
import {MockField} from "@junte/mocker";

@Model()
export class User {

  @MockField('test')
  @Field()
  id!: string;

  @MockField('Joe')
  @Field()
  firstName!: string;

  @MockField('Jackson')
  @Field()
  lastName!: string;

  @Field()
  avatar!: Image;
}

@Model()
export class MeUser extends User {

  @Field()
  email!: string;

  @Field()
  isStaff!: boolean;

}

@Model()
export class UpdateMeInput {

  @Field()
  avatar!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  constructor(defs: Partial<UpdateMeInput> = {}) {
    Object.assign(this, defs);
  }

}
