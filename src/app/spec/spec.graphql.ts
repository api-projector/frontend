import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class ProjectGQL extends Query<{ project }> {
  override document = gql`
query Project($id: ID!) {
  project(id: $id) {
    id
    title
    description
    dbName
    figmaIntegration {
      token
    }
  }
}`;
}
