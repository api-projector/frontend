import { ArraySerializer, Model, PrimitiveSerializer } from 'serialize-ts';
import { HttpMethods } from '../enums/http-methods';
import { ModelType } from '../enums/model-type';
import { Persist, Persistence } from '../libs/persistence';
import { KeyValueSerializer } from '../serializers/key-value.serializer';
import { KeyValue } from '../types/key-value';
import { Patch } from '../types/patch';
import { Committed } from './committed';
import { ScreenFile, ScreenFilePathRef } from './screen-file';
import { Spec } from './spec';
import { User } from './user';

export type PathInJson = {
  parameters?: { [key: string]: {} },
  requestBody?: { content: { 'application/json': { schema } } },
  responses: { [key: string]: { content: { 'application/json': { schema } } } }
} & KeyValue;

@Model()
export class Path extends Persistence {

  @Persist({name: 'model_type'})
  modelType: string = ModelType.path;

  @Persist({serializer: new PrimitiveSerializer()})
  method!: HttpMethods | string;

  @Persist({serializer: new ArraySerializer(new PrimitiveSerializer())})
  tags: string[] = [];

  @Persist()
  url!: string;

  @Persist()
  yaml!: string;

  @Persist({serializer: new KeyValueSerializer()})
  json!: PathInJson;

  @Persist()
  committed!: Committed;

  spec!: Spec;

  screenPathRefs: ScreenFilePathRef[] = [];

  constructor(defs: Partial<Path> = {}) {
    super();
    Object.assign(this, defs);
  }

  override new(): Persistence[] {
    super.new();

    return [];
  }

  linking({spec, screenPathRef}: { spec?: Spec, screenPathRef?: ScreenFilePathRef }) {
    if (!!spec) {
      this.spec = spec;
    }
    if (!!screenPathRef) {
      this.screenPathRefs.push(screenPathRef);
    }
  }

  override commit(by: User) {
    super.commit();
    this.committed = new Committed({at: new Date(), by});
  }

  delete(): Patch {
    const patch = new Patch;
    patch.deleted.push(this);
    this.spec.removePath(this);
    patch.changed.push(this.spec);

    this.screenPathRefs
      .forEach(ref => {
        const {changed, deleted} = ref.delete();
        patch.changed.push(...changed);
        patch.deleted.push(...deleted);
      });

    return patch;
  }
}
