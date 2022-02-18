import { Serializer, serialize, deserialize } from 'serialize-ts';

type WithToken = { token: string | undefined };

export class SecureToken<T extends WithToken> implements Serializer<T> {

  constructor(private type: new() => T) {
  }

  serialize(obj: Object): Object {
    const json = serialize(obj) as WithToken;
    if (json.token === '*') {
      json.token = undefined;
    }
    return json;
  }

  deserialize(src: Object): T {
    return deserialize(src, this.type) as T;
  }
}
