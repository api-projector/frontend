import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService, PopoverInstance, TableComponent, UI } from '@esanum/ui';
import * as YAML from 'js-yaml';
import { of } from 'rxjs';
import { filter, finalize } from 'rxjs/operators';
import { EXAMPLE_PATH_YAML } from '../../../../consts/examples';
import { HttpMethods } from '../../../../enums/http-methods';
import { LocalUI } from '../../../../enums/local-ui';
import { SpecManager } from '../../../../managers/spec.manager';
import { Path } from '../../../../models/path';
import { Project } from '../../../../models/project';
import { PathRefPoint, ScreenFile, ScreenFilePathRef } from '../../../../models/screen-file';
import { Spec } from '../../../../models/spec';

const POINT_SIZE = 20;

@Component({
  selector: 'app-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScreenComponent implements OnInit {

  ui = UI;
  localUi = LocalUI;
  httpMethods = HttpMethods;

  instance: { popover?: PopoverInstance } = {};

  project!: Project;
  spec!: Spec;
  screen!: ScreenFile;

  xControl = this.fb.control([null]);
  point = this.fb.group({
    color: [null],
    x: this.xControl,
    y: [null]
  });

  form = this.fb.group({
    table: {
      q: null,
      first: 20,
      offset: 0
    }
  });

  @ViewChild('selectPathTemplate')
  selectPathTemplate!: TemplateRef<any>;

  @ViewChild('wrapperRef')
  wrapperRef!: ElementRef<HTMLElement>;

  @ViewChild('table', {static: true})
  table!: TableComponent;

  @ViewChild('thumbnailRef')
  thumbnailRef!: ElementRef<HTMLElement>;

  constructor(private manager: SpecManager,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public modal: ModalService) {
  }

  ngOnInit() {
    this.route.data.subscribe(({project, spec, screen}) => {
      [this.project, this.spec, this.screen] = [project, spec, screen];
      this.cd.detectChanges();
      this.table.load();
    });

    this.form.valueChanges.subscribe(() => this.table.load());

    this.manager.replicated$
      .pipe(filter(entities => entities.some(e => e instanceof Spec
        || e.id == this.screen.id
        || this.screen.pathRefs.some(p => p.id === e.id || p.path.id === e.id))))
      .subscribe(() => {
        this.table.load();
        this.cd.detectChanges();
      });
  }

  fetchPaths() {
    const {pathRefs} = this.screen;
    return of({
      results: pathRefs,
      length: pathRefs.length
    }).pipe(finalize(() => this.cd.markForCheck()));
  }

  selectPathRef() {
    const {color} = this.point.getRawValue();
    if (!!color || this.spec.paths.length > 0) {
      this.modal.open(this.selectPathTemplate, {
        title:
          {
            text: $localize`:@@label.add_path:Add path`,
            icon: LocalUI.icons.path,
          },
        width: '100%'
      });
    } else {
      this.createPath();
    }

  }

  addPathRef(path: Path) {
    const ref = new ScreenFilePathRef(
      {
        path,
        comment: 'Add comment'
      }
    );
    const {color, x, y} = this.point.getRawValue();
    if (!!color) {
      ref.point = new PathRefPoint({color, x, y});
      this.point.reset();
    }
    ref.new();
    ref.linking({screen: this.screen});
    this.manager.put(ref);

    this.screen.addPathRef(ref);
    this.manager.put(this.screen);

    this.cd.detectChanges();
  }

  removePathRef(ref: ScreenFilePathRef) {
    this.manager.patch(ref.delete());
    this.cd.detectChanges();
  }

  createPath() {
    const path = new Path({
      method: HttpMethods.get,
      url: 'users/{id}',
      yaml: EXAMPLE_PATH_YAML,
      json: YAML.load(EXAMPLE_PATH_YAML)
    });
    const links = path.new();
    links.push(path);
    links.forEach(o => this.manager.put(o));

    const {spec} = this.screen.folder;
    path.linking({spec: spec});

    spec.addPath(path);
    this.manager.put(spec);

    this.addPathRef(path);

    this.router.navigate([path.id, {editor: '1'}], {relativeTo: this.route})
      .then(() => null);
  }

  setPoint(e: MouseEvent) {
    if (e.target !== this.wrapperRef.nativeElement) {
      return;
    }
    const img = this.thumbnailRef.nativeElement;
    const [x, y] = [(e.offsetX - POINT_SIZE / 2) / img.offsetWidth * 100, (e.offsetY - POINT_SIZE / 2) / img.offsetHeight * 100];
    this.point.setValue({
      color: UI.color.red,
      x: x,
      y: y
    });
    this.selectPathRef();
  }

  commentUpdated() {
    this.cd.detectChanges();
  }

  gotoScheme(id: string) {
    this.router.navigate(['projects', this.project.id, 'schemas', id]);
  }

}
