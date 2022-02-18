import { Injectable } from '@angular/core';
import { Mutation } from 'apollo-angular';
import gql from 'graphql-tag';
import { ProjectAsset } from '../../../models/figma-asset';

@Injectable({
  providedIn: 'root'
})
export class UploadFigmaAssetGQL extends Mutation<{ response: { frame: ProjectAsset } }> {
  override document = gql`
mutation UploadFigmaProjectAsset($input: UploadFigmaProjectAssetInput!) {
  response: uploadFigmaAsset(input: $input) {
    frame: projectAsset {
      file {
        url
      }
    }
  }
}`;
}

@Injectable({
  providedIn: 'root'
})
export class UploadImageAssetGQL extends Mutation<{ response }> {
  override document = gql`
mutation ($input: UploadImageProjectAssetInput!) {
  response: uploadImageAsset(input: $input) {
    image: projectAsset {
      file {
        url
      }
    }
  }
}`;
}
