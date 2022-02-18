import { Model } from 'serialize-ts';
import { Persist } from '../libs/persistence';
import { User } from './user';

@Model()
export class Committed {

  @Persist()
  at!: Date;

  @Persist()
  by!: User;

  constructor(defs: Partial<Committed> = {}) {
    Object.assign(this, defs);
  }

}
