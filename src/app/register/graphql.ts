import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class RegisterGQL extends Mutation<{ register: { token } }> {
  override document = gql`
mutation($input: RegisterInput!) {
    register(input: $input) {
        token {
            key
            created
        }
    }
}`;
}

@Injectable({
  providedIn: 'root'
})
export class SocialLoginGQL extends Mutation<{ response }> {
  override document = gql`
mutation ($system: SystemBackend!) {
  response: socialLogin(system: $system) {
    redirectUrl
  }
}`;
}
