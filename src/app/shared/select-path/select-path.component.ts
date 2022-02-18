import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UI } from '@esanum/ui';
import { debounceTime } from 'rxjs';
import { HttpMethods } from 'src/enums/http-methods';
import { LocalUI } from 'src/enums/local-ui';
import { Path } from '../../../models/path';
import { Spec } from '../../../models/spec';

@Component({
  selector: 'app-select-path',
  templateUrl: './select-path.component.html',
  styleUrls: ['./select-path.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectPathComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;
  httpMethods = HttpMethods;

  @Input()
  spec!: Spec;

  @Output()
  selected = new EventEmitter<Path>();

  queryControl = this.fb.control(null);
  form = this.fb.group({
    query: this.queryControl
  });

  constructor(private fb: FormBuilder,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.form.valueChanges.pipe(debounceTime(1000))
      .subscribe(() => this.cd.detectChanges());
  }

}
