import { Schema, Validator, ValidatorResult } from 'jsonschema';
import { SCHEMA_SCHEMA_V3_0 } from '../consts/open-api';
import * as YAML from 'js-yaml';
import { KeyValue } from '../types/key-value';

type YAMLException = { message: string };

const VALIDATOR_OPTIONS = {
  nestedErrors: true
};

export type Building = { error?: YAMLException, json?: KeyValue, schema?: ValidatorResult };

export function buildYAML(yaml: string, schema: Schema) {
  let json;
  try {
    json = YAML.load(yaml);
  } catch (e) {
    console.log(e);
    return {error: e as YAMLException};
  }
  return {json, schema: new Validator().validate(json, schema, VALIDATOR_OPTIONS)};
}
