import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UI} from '@esanum/ui';
import {FormBuilder} from "@angular/forms";
import {Spec} from "../../../../models/spec";
import {Schema} from "../../../../models/schema";

enum PagingType {
  array,
  map
}

@Component({
  selector: 'app-add-paging',
  templateUrl: './add-paging.component.html',
  styleUrls: ['./add-paging.component.scss']
})
export class AddPagingComponent {

  ui = UI;
  pagingType = PagingType;

  @Input()
  spec!: Spec;

  form = this.fb.group({
    type: PagingType.array
  });

  @Output()
  selected = new EventEmitter<Object>();

  constructor(private fb: FormBuilder) {
  }

  getCode(schema: Schema) {
    const {type} = this.form.getRawValue();
    return {
      type: 'object',
      properties: {
        total: {
          type: 'integer',
          example: 999
        },
        results: type === PagingType.array
          ? {
            type: 'array',
            items: {
              '$ref': `#/components/schemas/${schema.name}`
            }
          }
          : {
            type: 'object',
            additionalProperties: {
              '$ref': `#/components/schemas/${schema.name}`
            }
          }
      }
    };
  }

}
