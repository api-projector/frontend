import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { InputComponent, UI } from '@esanum/ui';
import { assign } from 'lodash';
import { filter } from 'rxjs/operators';
import { SpecManager } from '../../../../../managers/spec.manager';
import { ScreenFilePathRef } from '../../../../../models/screen-file';
import { Spec } from '../../../../../models/spec';

@Component({
  selector: 'app-edit-comment',
  templateUrl: './edit-comment.component.html',
  styleUrls: ['./edit-comment.component.scss']
})
export class EditCommentComponent implements OnInit, AfterViewInit {

  ui = UI;

  _pathRef!: ScreenFilePathRef;

  @ViewChild('inputRef', {read: InputComponent})
  inputRef!: InputComponent;

  @Input()
  set pathRef(pathRef: ScreenFilePathRef) {
    this._pathRef = pathRef;
    this.updateForm();
  }

  get pathRef() {
    return this._pathRef;
  }

  form = this.fb.group({
    comment: [null]
  });

  @Output()
  updated = new EventEmitter();

  @Output()
  closed = new EventEmitter();

  constructor(private manager: SpecManager,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(({comment}) => {
      assign(this.pathRef, {comment});
      this.manager.put(this.pathRef);
      this.updated.emit();
    });

    this.manager.replicated$
      .pipe(filter(entities => entities.some(e => e.id === this.pathRef.id)))
      .subscribe(() => {
        this.updateForm();
        this.cd.detectChanges();
      });
  }

  ngAfterViewInit() {
    this.inputRef.focus();
  }

  updateForm() {
    this.form.setValue({
      comment: this.pathRef.comment
    }, {emitEvent: false});
  }

  close() {
    this.closed.emit();
  }

}
