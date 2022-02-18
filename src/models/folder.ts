import { Model } from 'serialize-ts';
import { ModelType } from '../enums/model-type';
import { Persist, Persistence } from '../libs/persistence';
import { Patch } from '../types/patch';
import { ScreenFile } from './screen-file';
import { Spec } from './spec';

@Model()
export class Folder extends Persistence {

  @Persist({name: 'model_type'})
  modelType: string = ModelType.folder;

  @Persist()
  name!: string;

  @Persist({type: ScreenFile})
  screens: ScreenFile[] = [];

  spec!: Spec;

  constructor(defs: Partial<Folder> = {}) {
    super();
    Object.assign(this, defs);
  }

  override new(): Persistence[] {
    super.new();

    return [];
  }

  linking({spec}: { spec: Spec }) {
    this.spec = spec;
    this.screens.forEach(s => s.linking({folder: this}));
  }

  addScreen(screen: ScreenFile) {
    this.screens.push(screen);
  }

  removeScreen(screen: ScreenFile) {
    const index = this.screens.findIndex(f => f.id === screen.id);
    this.screens.splice(index, 1);
  }

  delete(): Patch {
    const patch = new Patch;
    this.screens.forEach(s => {
      patch.merge(s.delete());
      this.removeScreen(s);
    });

    patch.deleted.push(this);
    this.spec.removeFolder(this);
    patch.changed.push(this.spec);
    return patch;
  }
}
