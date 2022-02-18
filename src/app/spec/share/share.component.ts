import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {UI} from "@esanum/ui";
import {LocalUI} from "src/enums/local-ui";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  ui = UI;

  form = this.fb.group(
    {
      link: [null]
    }
  );

  @Input()
  link!: string;

  @Output()
  ok = new EventEmitter();

  constructor(
    private fb: FormBuilder,
  ) {

  }

  ngOnInit(): void {
    this.form.patchValue({
      link: this.link,
    });
  }

  close() {
    this.ok.emit();
  }

}
