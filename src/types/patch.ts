import { Persistence } from '../libs/persistence';

export class Patch {
  constructor(public changed: Persistence[] = [],
              public deleted: Persistence[] = []) {
  }

  merge(patch: Patch) {
    this.changed.push(...patch.changed);
    this.deleted.push(...patch.deleted);
  }
}
