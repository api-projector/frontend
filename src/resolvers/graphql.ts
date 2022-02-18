import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({providedIn: 'root'})
export class MeGQL extends Query<{ me }> {
  override document = gql`
query Me {
  me {
    id
    firstName
    lastName
    email
    avatar {
      url
    }
  }
}`;
}
