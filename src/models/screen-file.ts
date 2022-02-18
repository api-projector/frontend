import { Model, PrimitiveSerializer } from 'serialize-ts';
import { ModelType } from '../enums/model-type';
import { Persist, Persistence } from '../libs/persistence';
import { Patch } from '../types/patch';
import { Committed } from './committed';
import { Folder } from './folder';
import { Path } from './path';
import { User } from './user';

@Model()
export class PathRefPoint {

  @Persist()
  color!: string;

  @Persist()
  x!: number;

  @Persist()
  y!: number;

  constructor(defs: Partial<PathRefPoint> = {}) {
    Object.assign(this, defs);
  }

}

@Model()
export class ScreenFilePathRef extends Persistence {

  @Persist({name: 'model_type'})
  modelType: string = ModelType.screenFilePathRef;

  @Persist()
  path!: Path;

  @Persist()
  point!: PathRefPoint;

  @Persist({serializer: new PrimitiveSerializer()})
  comment: string | null = null;

  screen!: ScreenFile;

  constructor(defs: Partial<ScreenFilePathRef> = {}) {
    super();
    Object.assign(this, defs);
  }

  linking({screen}: { screen: ScreenFile }) {
    this.screen = screen;

    const path = screen.folder?.spec.paths.find(f => f.id === this.path.id);
    if (!!path) {
      this.path = path;
      path.linking({screenPathRef: this});
    }
  }

  delete(): Patch {
    const patch = new Patch;
    patch.deleted.push(this);

    if (!!this.screen) {
      this.screen.removePathRef(this);
      patch.changed.push(this.screen);
    }

    return patch;
  }

}

@Model()
export class ScreenFile extends Persistence {

  @Persist({name: 'model_type'})
  modelType: string = ModelType.screenFile;

  @Persist()
  name!: string;

  @Persist()
  url!: string;

  @Persist()
  thumbnail!: string;

  @Persist()
  error!: string;

  @Persist({type: ScreenFilePathRef})
  pathRefs: ScreenFilePathRef[] = [];

  @Persist()
  committed!: Committed;

  folder!: Folder;

  constructor(defs: Partial<ScreenFile> = {}) {
    super();
    Object.assign(this, defs);
  }

  override new(): Persistence[] {
    super.new();

    return [];
  }

  linking({folder}: { folder: Folder }) {
    this.folder = folder;

    this.pathRefs.forEach(r => r.linking({screen: this}));
  }

  override commit(by: User) {
    super.commit();
    this.committed = new Committed({at: new Date(), by});
  }

  delete(): Patch {
    const patch = new Patch;
    patch.deleted.push(this);

    if (!!this.folder) {
      this.folder.removeScreen(this);
      patch.changed.push(this.folder);
    }

    return patch;
  }

  addPathRef(ref: ScreenFilePathRef) {
    this.pathRefs.push(ref);
  }

  removePathRef(ref: ScreenFilePathRef) {
    const index = this.pathRefs.findIndex(f => f.id === ref.id);
    this.pathRefs.splice(index, 1);
  }

}
