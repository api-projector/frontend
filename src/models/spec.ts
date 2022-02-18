import { Model } from 'serialize-ts';
import { SCHEME_VERSION } from '../consts';
import { ModelType } from '../enums/model-type';
import { Persist, Persistence } from '../libs/persistence';
import { Path } from './path';
import { Folder } from './folder';
import { Schema } from './schema';

export const SPEC_DOC_ID = 'spec';

@Model()
export class SpecScheme {

  @Persist()
  version?: number;

  constructor(defs: Partial<SpecScheme> = {}) {
    Object.assign(this, defs);
  }

}


@Model()
export class Spec extends Persistence {

  @Persist({name: 'model_type'})
  modelType: string = ModelType.spec;

  @Persist()
  scheme: SpecScheme = new SpecScheme({
    version: SCHEME_VERSION
  });

  @Persist({type: Folder})
  folders: Folder[] = [];

  @Persist({type: Folder})
  root: Folder = new Folder();

  @Persist({type: Path})
  paths: Path[] = [];

  @Persist({type: Schema})
  schemas: Schema[] = [];

  constructor(defs: Partial<Spec> = {}) {
    super();
    Object.assign(this, defs);
  }

  linking() {
    this.folders.forEach(f => f.linking({spec: this}));
    this.root.linking({spec: this});

    this.paths.forEach(e => e.linking({spec: this}));
    this.schemas.forEach(s => s.linking({spec: this}));
  }

  override new(): Persistence[] {
    this.id = SPEC_DOC_ID;

    const root = new Folder();
    const links = root.new();
    links.push(root);
    this.root = root;

    return links;
  }

  addFolder(folder: Folder) {
    this.folders.push(folder);
  }

  removeFolder(folder: Folder) {
    const index = this.folders.findIndex(f => f.id === folder.id);
    this.folders.splice(index, 1);
  }

  addPath(path: Path) {
    this.paths.push(path);
  }

  removePath(path: Path) {
    const index = this.paths.findIndex(f => f.id === path.id);
    this.paths.splice(index, 1);
  }

  addSchema(schema: Schema) {
    this.schemas.push(schema);
  }

  removeSchema(schema: Schema) {
    const index = this.schemas.findIndex(f => f.id === schema.id);
    this.schemas.splice(index, 1);
  }

}
