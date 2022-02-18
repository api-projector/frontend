import PouchDB from 'pouchdb-browser';
import 'reflect-metadata';
import { merge, Observable, of, Subject, tap, zip } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ArraySerializer, deserialize, Field, Model, ModelSerializer, Name, serialize, Serializer, Type } from 'serialize-ts';
import { characters, generate } from 'shortid';
import { User } from '../models/user';
import Document = PouchDB.Core.Document;
import Database = PouchDB.Database;

characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@$');

export const PERSIST_METADATA_KEY = Symbol('persist_field_meta');

function equal(x: Object | boolean | number | string, y: Object | boolean | number | string): boolean {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return !!x && !!y && tx === 'object' && tx === ty
    ? (ok(x).length === ok(y).length && ok(x).every(key => equal(x[key], y[key])))
    : (x === y);
}

interface FieldConfig {
  name?: string;
  type?: any;
  serializer?: Serializer<any>;
}

class FieldMetadata {
  property?: string;
  persistence = false;
  serializer!: Serializer<any>;
  reference!: Serializer<any>;
}

export enum SerializeType {
  default = 'default',
  reference = 'reference'
}

@Model()
export class Reference {

  @Field({jsonPropertyName: '_id'})
  id!: string;

}

export function Persist(config: FieldConfig = {}) {
  return function (obj: Object, property: string) {
    const metadata = new FieldMetadata();
    metadata.property = property;

    if (!!config.name) {
      Name(config.name)(obj, property);
    }

    if (!!config.serializer) {
      metadata.serializer = config.serializer;
      Type(config.serializer)(obj, property);
    } else {
      const type = Reflect.getMetadata('design:type', obj, property);
      if (type === Boolean || type === Number || type === String || type === Date) {
        // nothing...
      } else if (type === Array) {
        const persistence = config.type.prototype instanceof Persistence;
        metadata.persistence = persistence;
        metadata.serializer = new ArraySerializer(new ModelSerializer(config.type));
        metadata.reference = new ArraySerializer(new ModelSerializer(persistence ? Reference : config.type));
        Type(metadata.serializer)(obj, property);
      } else {
        const persistence = type.prototype instanceof Persistence;
        metadata.persistence = persistence;
        metadata.serializer = new ModelSerializer(type);
        metadata.reference = new ModelSerializer(persistence ? Reference : type);
        Type(metadata.serializer)(obj, property);
      }
    }

    Field()(obj, property);

    const fields = Reflect.getOwnMetadata(PERSIST_METADATA_KEY, obj) || [];
    fields.push(metadata);
    Reflect.defineMetadata(PERSIST_METADATA_KEY, fields, obj);
  };
}

@Model()
export class Persistence {

  committed$ = new Subject();

  loaded = false;
  snapshot!: Object;

  @Field({jsonPropertyName: '_id'})
  id!: string;

  @Field({jsonPropertyName: '_rev'})
  rev!: string;

  new(): Persistence[] {
    this.id = generate();

    return [];
  }

  commit(info?) {
    this.committed$.next(this);
  }

  get dirty(): boolean {
    return !equal(this.snapshot, this.serialize(SerializeType.reference));
  }

  flush(): void {
    this.snapshot = this.serialize(SerializeType.reference);
  }

  merge(db: Database, progress: Subject<Object>, src: Persistence): Observable<Persistence> {
    return new Observable<Persistence>(merged => {
      const loaders = [of(null)];

      this.rev = src.rev;

      const fields = Reflect.getMetadata(PERSIST_METADATA_KEY, this) || [];
      for (const metadata of fields) {
        const property = metadata.property;
        if (metadata.persistence) {
          const type = this.getPropertyType(property);
          if (type === Array) {
            const list: Persistence[] = [];
            for (const element of src[property]) {
              const obj = this[property].find(e => e.id === element.id) || element;
              list.push(obj);
              if (!obj.loaded) {
                loaders.push(element.load(db, progress));
              }
            }

            this[property] = list;
          } else {
            const obj = src[property];
            if (!obj.loaded) {
              loaders.push(obj.load(db, progress));
            }
            this[property] = obj;
          }
        } else {
          this[property] = src[property];
        }
      }

      zip(loaders).pipe(tap(() => console.log('children loaded for', this.id)),
        finalize(() => merged.complete()))
        .subscribe(() => {
          this.flush();
          merged.next(this);
        }, err => merged.error(err));
    });
  }

  load(db: Database, progress: Subject<Object>): Observable<Persistence> {
    return new Observable(loaded => {
      // TODO: think about it!
      console.log('load', this.id);
      if (!!this.id) {
        db.get(this.id, {conflicts: true}).then(doc => {
          console.log(this.id, doc._rev, doc._conflicts);
          const src = this.deserialize(doc);
          this.merge(db, progress, src)
            .pipe(finalize(() => loaded.complete()))
            .subscribe(() => {
              this.loaded = true;
              console.log('has been loaded', this.id);
              loaded.next(this);
              progress.next(this);
            }, (err: { status }) => {
              loaded.error(err);
            });
        }).catch(err => {
          if (err.status === 404) {
            console.warn('not found', this.id);
            loaded.next(this);
            progress.next(this);
          } else {
            loaded.error(err);
          }
        });
      } else {
        console.log('object id is empty', this.id);
        this.loaded = true;
        loaded.next(this);
        progress.next(this);
      }
    });
  }

  replicate(db: Database, progress: Subject<Object>, doc: Document<Object>): Observable<Persistence | null> {
    return new Observable(replicated => {
      if (doc._id === this.id) {
        const src = this.deserialize(doc);
        this.merge(db, progress, src)
          .pipe(finalize(() => replicated.complete()))
          .subscribe(() => replicated.next(this));
      } else {
        const queue: Observable<Persistence | null>[] = [];
        const fields = Reflect.getMetadata(PERSIST_METADATA_KEY, this) || [];
        for (const metadata of fields) {
          const property = metadata.property;
          if (!!metadata && metadata.persistence) {
            const type = this.getPropertyType(property);
            if (type === Array) {
              const list: Persistence[] = this[property];
              for (const element of list) {
                queue.push(element.replicate(db, progress, doc));
              }
            } else {
              const obj: Persistence = this[property];
              queue.push(obj.replicate(db, progress, doc));
            }
          }
        }

        if (queue.length > 0) {
          zip(queue).pipe(finalize(() => replicated.complete()))
            .subscribe(entities => {
              replicated.next(entities.find(e => !!e));
            }, err => replicated.error(err));
        } else {
          replicated.next(null);
          replicated.complete();
        }
      }
    });
  }

  serialize(type: SerializeType = SerializeType.default): Object {
    const prototype = Object.getPrototypeOf(this);
    const fields = Reflect.getMetadata(PERSIST_METADATA_KEY, this) || [];
    for (const metadata of fields) {
      const property = metadata.property;
      if (!!metadata && !!metadata.serializer) {
        Type(type === SerializeType.reference
          ? (metadata.reference || metadata.serializer)
          : metadata.serializer)(prototype, property);
      }
    }

    return serialize(this);
  }

  deserialize(obj: Object): Persistence {
    const prototype = Object.getPrototypeOf(this);
    const fields = Reflect.getMetadata(PERSIST_METADATA_KEY, this) || [];
    for (const metadata of fields) {
      const property = metadata.property;
      if (!!metadata && !!metadata.serializer) {
        Type(metadata.serializer)(prototype, property);
      }
    }

    return deserialize(obj, prototype.constructor);
  }

  private getPropertyType(property: string) {
    return Reflect.getMetadata('design:type', this, property);
  }

}
