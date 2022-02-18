export const EXAMPLE_PATH_YAML = `parameters:
- name: id
  in: path
  required: true
  description: Target user
  schema:
    type: integer
    format: int64
    example: 1
responses:
  '200':
    description: OK
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'`;

export const EXAMPLE_SCHEMA_YAML = `type: object
properties:
  id:
    type: integer
    nullable: false
    format: int64
    example: 1
  name:
    type: string
    nullable: false
    example: Ralph Edwards
  avatar:
    type: string
    nullable: true
    format: URL
    example: https://static.server.com/ralph.jpg
  phone:
    type: string
    nullable: true
    example: + 1 (704) 555-0127
  address:
    type: string
    nullable: true
    example: 4517 Washington Ave. Manchester, Kentucky 39495
  bio:
    type: string
    nullable: true
    example: Doctor
  summary:
    type: object
    properties:
        posts:
            type: integer
            nullable: false
            example: 12316
        followers:
            type: integer
            nullable: false
            example: 353119
        following:
            type: integer
            nullable: false
            example: 65`;
