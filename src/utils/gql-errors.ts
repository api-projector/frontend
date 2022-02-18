import { FetchResult } from '@apollo/client/core';
import { ErrorResponse } from 'apollo-link-error';
import { Observable } from 'rxjs';
import { deserialize } from 'serialize-ts';
import { AuthorisationError, BackendError, NetworkError, NotFoundError } from '../types/gql-errors';

export function convertGQLErrors({graphQLErrors, networkError}: ErrorResponse): BackendError[] {
  if (!!networkError) {
    if ('status' in networkError) {
      const msg = networkError['message'];
      switch (networkError['status']) {
        case 401:
          return [new AuthorisationError(msg)];
        case 404:
          return [new NotFoundError(msg)];
        default:
          return [new NetworkError(msg)];
      }

    }
  }
  if (!!graphQLErrors) {
    return graphQLErrors.map(err => deserialize(err, BackendError));
  }
  return [];
}

export function processGQL<T>() {
  return function (source: Observable<FetchResult<T>>) {
    return new Observable<T>(observer => {
      return source.subscribe({
        next(x) {
          const [err] = x.errors || [null];
          if (!!err) {
            observer.error(deserialize(err, BackendError));
          }
          observer.next(x.data as T);
        },
        error(err: ErrorResponse) {
          console.error(err);
          observer.error(convertGQLErrors(err));
        },
        complete() {
          observer.complete();
        }
      });
    });
  };
}
