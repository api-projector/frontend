import { Model, PrimitiveSerializer } from 'serialize-ts';
import { HttpMethods } from '../enums/http-methods';
import { ModelType } from '../enums/model-type';
import { Persist, Persistence } from '../libs/persistence';
import { KeyValueSerializer } from '../serializers/key-value.serializer';
import { KeyValue } from '../types/key-value';
import { Patch } from '../types/patch';
import { Committed } from './committed';
import { Spec } from './spec';
import { User } from './user';

export type SchemaInJson = {
  id: string;
  $ref: string;
  ref$: string;
  type: string,
  example: string,
  items: {
    id: string;
    $ref: string,
    ref$: string,
    properties: { [key: string]: { type: string } }
  },
  properties: { [key: string]: { type: string } };
};

@Model()
export class Schema extends Persistence {

  @Persist({name: 'model_type'})
  modelType: string = ModelType.schema;

  @Persist()
  name!: string;

  @Persist()
  yaml!: string;

  @Persist({serializer: new KeyValueSerializer()})
  json!: SchemaInJson;

  @Persist()
  committed!: Committed;

  spec!: Spec;

  constructor(defs: Partial<Schema> = {}) {
    super();
    Object.assign(this, defs);
  }

  override new(): Persistence[] {
    super.new();

    return [];
  }

  linking({spec}: { spec: Spec }) {
    this.spec = spec;
  }

  override commit(by: User) {
    super.commit();
    this.committed = new Committed({at: new Date(), by});
  }

  delete(): Patch {
    const patch = new Patch;
    patch.deleted.push(this);
    this.spec.removeSchema(this);
    patch.changed.push(this.spec);
    return patch;
  }

}
