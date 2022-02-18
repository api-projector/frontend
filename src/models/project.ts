import {merge} from 'lodash';
import {ArraySerializer, Field, Model} from 'serialize-ts';
import {EdgesToPaging} from 'src/serializers/graphql';
import {SecureToken} from '../serializers/token';
import {Image} from './image';
import {User} from './user';
import {MockField} from "@junte/mocker";

@Model()
export class FigmaIntegration {

  @MockField('token')
  @Field()
  token!: string;

}

@Model()
export class Project {

  @MockField('test')
  @Field()
  id!: string;

  @Field()
  emblem!: Image;

  @MockField('Test project')
  @Field()
  title!: string;

  @Field()
  description!: string;

  @MockField('test')
  @Field()
  dbName!: string;

  @MockField(FigmaIntegration)
  @Field()
  figmaIntegration!: FigmaIntegration;

  @Field()
  owner!: User;

}

@Model()
export class PagingProjects {

  @Field()
  count!: number;

  @MockField({type: Project, length: 10})
  @Field({
    jsonPropertyName: 'edges',
    serializer: new ArraySerializer(new EdgesToPaging<Project>(Project))
  })
  results!: Project[];

}

@Model()
export class FigmaIntegrationUpdate {

  @Field()
  token!: string;

}

@Model()
export class ProjectUpdate {

  @Field()
  title!: string;

  @Field()
  description?: string;

  @Field({serializer: new SecureToken(FigmaIntegrationUpdate)})
  figmaIntegration: FigmaIntegrationUpdate = new FigmaIntegrationUpdate();

  constructor(defs: Partial<ProjectUpdate> = {}) {
    merge(this, defs);
  }

}

@Model()
export class ProjectsFilter {

  @Field()
  first?: number;

  @Field()
  offset?: number;

  @Field()
  q?: string;

  constructor(defs: Partial<ProjectsFilter> = {}) {
    merge(this, defs);
  }

}
