import { GraphQLError } from 'graphql';
import { Field, Model, Serializer } from 'serialize-ts';

@Model()
export class FieldError {

  path!: string[];
  index!: number;
  messages!: string[];

  get name() {
    return this.path.join('_');
  }

  constructor(defs: Object = {}) {
    // noinspection TypeScriptValidateTypes
    Object.assign(this, defs);
  }
}

interface GqlFieldError {
  fieldName: string;
  index?: number;
  messages: (string | GqlFieldError)[];
}

export class GqlErrorSerializer implements Serializer<BackendError> {

  serialize(error: BackendError): string {
    throw new Error('Not implemented');
  }

  deserialize(source: GraphQLError): BackendError {
    switch (!!source.extensions ? source.extensions['code'] : null) {
      case 'NOT_FOUND':
        return new NotFoundError(source.message);
      case 'INPUT_ERROR':
        const fields: FieldError[] = [];
        const fieldErrors = source.extensions['fieldErrors'] as GqlFieldError[];
        if (!!fieldErrors) {
          const read = (e: GqlFieldError, path: string[] = []) => {
            if (e.fieldName !== 'nonFieldErrors') {
              path.push(e.fieldName);
            }
            const messages: string[] = [];
            e.messages.forEach(m => typeof m === 'string'
              ? messages.push(m) : read(m as GqlFieldError, path));

            if (messages.length > 0) {
              fields.push(new FieldError({
                path: path,
                index: e.index,
                messages: messages
              }));
            }
          };
          fieldErrors.forEach(e => read(e));
        }

        return new InputError(source.message, {fields});
      default:
        return new BackendError(source.message);
    }
  }
}

@Model(new GqlErrorSerializer())
export class BackendError {

  @Field()
  message!: string;

  constructor(message?: string) {
    if (!!message) {
      this.message = message;
    }
  }

  toString() {
    return this.message;
  }
}

@Model()
export class NetworkError extends BackendError {

  constructor(message?: string) {
    super(message);
  }
}

@Model()
export class NotFoundError extends BackendError {

  constructor(message?: string) {
    super(message);
  }
}

@Model()
export class AuthorisationError extends BackendError {

  constructor(message?: string) {
    super(message);
  }
}

@Model()
export class InputError extends BackendError {

  fields: FieldError[] = [];

  constructor(message?: string, defs: Object = {}) {
    super(message);
    // noinspection TypeScriptValidateTypes
    Object.assign(this, defs);
  }

  override toString() {
    return this.fields.map(f => f.messages).join(' | ');
  }

}
