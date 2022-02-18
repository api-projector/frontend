import { Injectable } from '@angular/core';
import { Mutation, Query } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class AllProjectsGQL extends Query<{ projects }> {
  override document = gql`
{
  projects: allProjects {
    count
    edges {
      node {
        id
        title
        description
        figmaIntegration {
          token
        }
      }
    }
  }
}`;
}

@Injectable({
  providedIn: 'root'
})
export class CreateProjectGQL extends Mutation<{ response: { project } }> {
  override document = gql`
mutation ($input: CreateProjectInput!) {
  response: createProject(input: $input) {
    project {
      id
      title
      description
      figmaIntegration {
        token
      }
    }
  }
}`;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateProjectGQL extends Mutation<{ response: { project } }> {
  override document = gql`
mutation ($id: ID!, $input: UpdateProjectInput!) {
  response: updateProject(id: $id, input: $input) {
    project {
      id
      title
      description
      figmaIntegration {
        token
      }
    }
  }
}`;
}

@Injectable({
  providedIn: 'root'
})
export class DeleteProjectGQL extends Mutation<{ status }> {
  override document = gql`
mutation($id: ID!) {
    deleteProject(project: $id) {
        status
    }
}`;
}
