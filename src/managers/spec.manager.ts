import { Injectable } from '@angular/core';
import { UI } from '@esanum/ui';
import { NGXLogger } from 'ngx-logger';
import inMemoryPlugin from 'pouchdb-adapter-memory';
import PouchDB from 'pouchdb-browser';
import { BehaviorSubject, Observable, Subject, zip } from 'rxjs';
import { bufferTime, filter, finalize, tap } from 'rxjs/operators';
import { generate } from 'shortid';
import { EditMode } from 'src/enums/edit-mode';
import { Persistence, SerializeType } from 'src/libs/persistence';
import { AppConfig } from '../app/config';
import { CURRENT_LANGUAGE, PROD_MODE, SCHEME_VERSION } from '../consts';
import { Language } from '../enums/language';
import { ReplicationState } from '../enums/replication-state';
import { environment } from '../environments/environment';
import { Path } from '../models/path';
import { PathRefPoint, ScreenFile, ScreenFilePathRef } from '../models/screen-file';
import { Spec, SPEC_DOC_ID } from '../models/spec';
import { User } from '../models/user';
import { SchemeInvalidError } from '../types/errors';
import { Patch } from '../types/patch';
import { Examples } from '../utils/examples';

PouchDB.plugin(inMemoryPlugin);
import Database = PouchDB.Database;

const BUFFER_TIME = 2500;
const RESTART_SYNC_INTERVAL = 2000;

interface Commit {
  obj: Persistence;
}

class Put implements Commit {
  constructor(public obj: Persistence,
              public rev: string) {

  }
}

class Remove implements Commit {
  constructor(public obj: Persistence) {

  }
}

export function createSpec(spec: Spec, demo: boolean = false): Persistence[] {
  const puts = spec.new();
  puts.push(spec);

  if (demo) {
    puts.push(...Examples.createDemo(spec));
  }

  return puts;
}

interface Replication {
  cancel: () => void;
}

@Injectable({providedIn: 'root'})
export class SpecManager {

  private db: { local?: Database, remote?: Database } = {};
  private replication: { sync?: Replication } = {};
  private committing$ = new Subject<Commit>();

  spec$!: BehaviorSubject<Spec | null> | null;

  get spec() {
    return this.spec$?.getValue();
  }

  state = new (class {
    remote$ = new BehaviorSubject(ReplicationState.done);

    set remote(state: ReplicationState) {
      this.remote$.next(state);
    }

    get remote() {
      return this.remote$.getValue();
    }

    dirty$ = new BehaviorSubject(0);

    set dirty(dirty: number) {
      this.dirty$.next(dirty);
    }

    get dirty() {
      return this.dirty$.getValue();
    }
  });

  mode$ = new BehaviorSubject(EditMode.edit);

  replicated$ = new Subject<Persistence[]>();

  set mode(mode: EditMode) {
    this.mode$.next(mode);
  }

  get mode() {
    return this.mode$.getValue();
  }

  constructor(private config: AppConfig,
              private logger: NGXLogger) {
    this.logger.info('create instance');
    this.committing$.pipe(tap(() => this.state.dirty++),
      bufferTime(BUFFER_TIME),
      tap(buffer => this.state.dirty -= buffer.length),
      filter(buffer => buffer.length > 0))
      .subscribe(buffer => this.commit(buffer));
  }

  private loadFromLocal(demo: boolean = false) {
    const spec = new Spec();
    spec.id = SPEC_DOC_ID;
    const progress = new Subject<Object>();
    spec.load(this.db.local as Database, progress)
      .subscribe(() => {
        if (spec.scheme.version !== SCHEME_VERSION) {
          this.spec$?.error(new SchemeInvalidError());
          return;
        }

        console.log(spec);

        if (!spec.loaded) {
          createSpec(spec, demo).forEach(o => this.put(o));
        }

        spec.linking();

        this.spec$?.next(spec);
      }, (err: { status: number, docId: string }) => {
        this.logger.error(err);
        this.spec$?.error(err);
      });
  }

  get(dbName: string, demo: boolean = false): Observable<Spec> {
    if (!this.spec$) {
      this.spec$ = new BehaviorSubject<Spec | null>(null);
      if (PROD_MODE) {
        this.db.local = new PouchDB(generate(),
          {
            adapter: 'memory',
            auto_compaction: true
          });
        this.db.remote = new PouchDB([environment.storage, dbName].join('/'),
          {
            skip_setup: false,
            fetch: (url, opts) => {
              if (!!opts) {
                opts.credentials = 'omit';
                const headers = opts.headers as Headers;
                if (!!this.config.token) {
                  headers.append('Authorization', `Bearer ${this.config.token.key}`);
                }
              }
              return PouchDB.fetch(url, opts);
            }
          });

        this.db.local.replicate.from(this.db.remote)
          .on('complete', (info: Object) => {
            this.logger.log(dbName);
            this.logger.log('synced', info);
            this.startSync();

            this.loadFromLocal(demo);
          }).on('error', (err: Object) => this.spec$?.error(err));
      } else {
        this.db.local = new PouchDB(dbName,
          {
            auto_compaction: true
          });
        this.loadFromLocal();
      }
    }

    return new Observable<Spec>(observer => {
      this.spec$?.pipe(finalize(() => observer.complete()),
        filter(spec => !!spec))
        .subscribe(spec => {
          this.logger.log('return');
          observer.next(spec as Spec);
          observer.complete();
        }, err => {
          this.spec$ = null;
          observer.error(err);
        });
    });
  }

  put(object: Persistence, by: User | null = null) {
    object.commit(by);
    this.logger.info('put');
    this.committing$.next(new Put(object, object.rev));
  }

  remove(object: Persistence, by: User | null = null) {
    object.commit(by);
    this.logger.info('remove');
    this.committing$.next(new Remove(object));
  }

  patch(patch: Patch) {
    patch.deleted.forEach(o => this.remove(o));
    patch.changed.forEach(o => this.put(o));
  }

  private restartSync() {
    setTimeout(() => navigator.onLine ? this.startSync()
      : this.restartSync(), RESTART_SYNC_INTERVAL);
  }

  private startSync() {
    this.logger.info('start sync with cloud');

    this.replication.sync?.cancel();
    this.replication.sync = this.db.local?.sync(this.db.remote as Database, {
      live: true,
      batch_size: 1000
    }).on('change', ({direction, change: {docs}}) => {
      if (direction === 'pull') {
        this.logger.info('changes from server', docs);
        const progress = new Subject<Object>();
        progress.subscribe(ref => {
          this.logger.info('updated');
          console.log(ref);
        });

        const spec = this.spec$?.getValue();
        if (!spec) {
          throw 'Spec is not loaded';
        }

        const queue: Observable<Persistence | null>[] = [];
        for (const doc of docs) {
          queue.push(new Observable<Persistence | null>(o => {
            this.db.local?.get(doc._id, {conflicts: true})
              .then(local => {
                if (!local._conflicts?.includes(doc._rev)) {
                  spec.replicate(this.db.local as Database, progress, doc)
                    .pipe(finalize(() => o.complete()))
                    .subscribe(e => o.next(e));
                } else {
                  this.logger.warn(doc._id, 'conflicts', local._conflicts, 'with local while replication', doc._rev);
                }
              })
              .catch(err => {
                if (err.status === 404) {
                  this.logger.warn('not found locally for replication', doc);
                } else {
                  this.logger.warn('error with loading local for replication', doc, err);
                }
                o.next(null);
                o.complete();
              });
          }));
        }
        zip(queue).subscribe(entities => {
          spec?.linking();
          this.replicated$.next(entities.filter(e => !!e) as Persistence[]);
        });
      }
    }).on('active', () => {
      this.logger.info('replication active');
      this.state.remote = ReplicationState.active;
    }).on('change', (info: Object) => {
      this.logger.info('replication change', info);
      this.state.remote = ReplicationState.done;
    }).on('error', (error: Object) => {
      this.logger.error('replication error', error);
      this.state.remote = ReplicationState.error;
      this.restartSync();
    }).on('denied', (denied: Object) => {
      this.logger.error('replication denied', denied);
      this.state.remote = ReplicationState.error;
    }).on('paused', (info: Object) => {
      this.logger.info('replication paused', info);
      this.state.remote = ReplicationState.paused;
    });
  }

  commit(buffer: Commit[]) {
    this.logger.info('committing', buffer);
    const puts = new Map<string, Put>(),
      removed = new Map<string, Remove>();

    for (const action of buffer) {
      if (action instanceof Put) {
        if (!puts.has(action.obj.id)) {
          puts.set(action.obj.id, action);
        }
      } else if (action instanceof Remove) {
        if (!removed.has(action.obj.id)) {
          removed.set(action.obj.id, action);
        }
      }
    }

    const docs: Object[] = [];
    for (const action of Array.from(puts.values())) {
      const object = action.obj;
      if (object.dirty && !removed.has(action.obj.id)) {
        const doc = object.serialize(SerializeType.reference) as { _rev: string };
        doc._rev = action.rev;
        docs.push(doc);
        this.logger.info('commit with rev', action.rev);
      } else {
        this.logger.info('object it not dirty');
      }
    }

    for (const action of Array.from(removed.values())) {
      const obj = action.obj.serialize(SerializeType.reference) as { _deleted: boolean };
      obj._deleted = true;
      docs.push(obj);
      console.log('deleting!');
    }

    if (docs.length > 0) {
      this.logger.info('committing', docs);
      this.db.local?.bulkDocs(docs)
        .then((updates => {
          for (const result of updates) {
            if ('id' in result) {
              const doc = result as { id: string, rev: string };
              if (puts.has(doc.id)) {
                const action = puts.get(doc.id);
                if (!!action) {
                  action.obj.rev = doc.rev;
                  action.obj.flush();
                }
              }
            }
          }
        })).catch((err: Object) => this.logger.error(err));
    }
  }

  clear() {
    this.replication.sync?.cancel();
    this.spec$ = null;
  }

}
