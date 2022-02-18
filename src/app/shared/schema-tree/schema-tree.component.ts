import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SchemaInJson } from '../../../models/schema';

@Component({
  selector: 'app-schema-tree',
  templateUrl: './schema-tree.component.html',
  styleUrls: ['./schema-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchemaTreeComponent {

  readonly originalOrder = () => 0;

  private _json!: SchemaInJson;

  @Input()
  set json(json: SchemaInJson) {
    this._json = json;
    this.cd.detectChanges();
  }

  get json() {
    return this._json;
  }

  @Input()
  level: number = 1;

  @Input()
  maxLevels: number = 5;

  @Output()
  selected = new EventEmitter<string>();

  constructor(private cd: ChangeDetectorRef) {
  }

  goto(id: string) {
    this.selected.emit(id);
  }

}
