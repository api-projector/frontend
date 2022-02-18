import { UI } from '@esanum/ui';
import * as YAML from 'js-yaml';
import { CURRENT_LANGUAGE } from '../consts';
import { EXAMPLE_PATH_YAML, EXAMPLE_SCHEMA_YAML } from '../consts/examples';
import { HttpMethods } from '../enums/http-methods';
import { Language } from '../enums/language';
import { Persistence } from '../libs/persistence';
import { Path } from '../models/path';
import { Schema } from '../models/schema';
import { PathRefPoint, ScreenFile, ScreenFilePathRef } from '../models/screen-file';
import { Spec } from '../models/spec';

export abstract class Examples {

  static createPath(spec: Spec): { path: Path, puts: Persistence[] } {
    const puts: Persistence[] = [];

    const path = new Path({
      method: HttpMethods.get,
      url: 'users/{id}',
      tags: ['Users'],
      yaml: EXAMPLE_PATH_YAML,
      json: YAML.load(EXAMPLE_PATH_YAML)
    });
    puts.push(...path.new());
    puts.push(path);
    spec.addPath(path);
    puts.push(spec);

    return {path, puts};
  }

  static createSchema(spec: Spec): { schema: Schema, puts: Persistence[] } {
    const puts: Persistence[] = [];

    const schema = new Schema({
      name: 'User',
      yaml: EXAMPLE_SCHEMA_YAML,
      json: YAML.load(EXAMPLE_SCHEMA_YAML)
    });
    puts.push(...schema.new());
    puts.push(schema);
    spec.addSchema(schema);
    puts.push(spec);

    return {schema, puts};
  }

  static createDemo(spec: Spec): Persistence[] {
    const links: Persistence[] = [];

    switch (CURRENT_LANGUAGE) {
      case Language.ru:

        break;
      case Language.en:
      default:

    }

    const paths: { users: Path | null } = {users: null};
    {
      const {path, puts} = Examples.createPath(spec);
      links.push(...puts);
      paths.users = path;
    }

    {
      const {puts} = Examples.createSchema(spec);
      links.push(...puts);
    }

    const screens: { userProfile: ScreenFile | null } = {userProfile: null};

    {
      const screen = new ScreenFile({
        name: 'User profile',
        thumbnail: '/assets/images/user_profile.jpg'
      });
      links.push(...screen.new());
      links.push(screen);
      spec.root.addScreen(screen);

      screens.userProfile = screen;
    }

    {
      const pathRef = new ScreenFilePathRef({
        path: paths.users,
        point: new PathRefPoint({color: UI.color.red, x: 30, y: 40}),
        comment: 'Get user from server'
      });
      links.push(...pathRef.new());
      links.push(pathRef);

      screens.userProfile.addPathRef(pathRef);
    }

    return links;
  }

}
