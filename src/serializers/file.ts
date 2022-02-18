import { Serializer } from 'serialize-ts';

export class FileSerializer implements Serializer<File> {

  serialize(file: File): File {
    return file;
  }

  deserialize(source: File): File {
    throw new Error('Not implemented');
  }
}
