import { Field, Model } from 'serialize-ts';
import { FileSerializer } from '../serializers/file';
import { assign } from "lodash";

@Model()
export class Image {

  @Field()
  id!: string;

  @Field()
  url!: string;
}

@Model()
export class UploadImageProjectAssetInput {

  @Field()
  project!: number;

  @Field({serializer: new FileSerializer()})
  file!: File;

  constructor(defs: Partial<UploadImageProjectAssetInput> = {}) {
    assign(this, defs);
  }

}
