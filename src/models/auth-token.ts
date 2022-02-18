import { Field, Model } from 'serialize-ts';
import {MockField} from "@junte/mocker";

@Model()
export class AuthToken {

  @Field()
  created!: string;

  @MockField('test_token')
  @Field()
  key!: string;

}
