import * as merge from 'deepmerge';
import { Field, Model } from 'serialize-ts';

@Model()
export class ProjectFile {

  @Field()
  url!: string;

}

@Model()
export class ProjectAsset {

  @Field()
  file!: ProjectFile;

}

@Model()
export class UploadFigmaAssetRequest {

  @Field()
  project!: string;

  @Field()
  url!: string;

  constructor(defs: Partial<UploadFigmaAssetRequest> = {}) {
    Object.assign(this, defs);
  }

}
