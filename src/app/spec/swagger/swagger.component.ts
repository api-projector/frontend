import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '@esanum/ui';
import * as merge from 'deepmerge';
import { Subject, takeUntil } from 'rxjs';
import { Language } from 'src/enums/language';
import SwaggerUI from 'swagger-ui';
import { SpecManager } from '../../../managers/spec.manager';
import { Project } from '../../../models/project';
import { Spec } from '../../../models/spec';
import { BASE_URI } from "../../../consts";

@Component({
  selector: 'app-swagger',
  templateUrl: './swagger.component.html',
  styleUrls: ['./swagger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwaggerComponent implements OnInit, OnDestroy, AfterViewInit {

  ui = UI;
  language = Language;
  consts = {baseUri: BASE_URI};

  destroyed$ = new Subject();

  project!: Project;
  spec!: Spec;
  swagger!: any;

  constructor(private manager: SpecManager,
              private cd: ChangeDetectorRef,
              private route: ActivatedRoute) {
    this.cd.detach();
  }

  ngOnInit() {
    this.route.data.subscribe(({project, spec}) => {
      [this.project, this.spec] = [project, spec];
      this.cd.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.manager.replicated$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.build());

    this.build();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  build() {
    let spec: any = {
      'openapi': '3.0.0',
      'info': {
        'version': '0.0.1',
        'title': this.project.title,
        'description': this.project.description
      },
      paths: {},
      components: {schemas: {}}
    };

    this.spec.paths.forEach(({url, method, json, tags, id}) => {
      const p = '/' + url;
      if (!spec.paths[p]) {
        spec.paths[p] = {};
      }
      spec.paths[p][method] = merge(json, {
        tags: tags,
        externalDocs: {
          description: 'For changing contract, please follow',
          url: `/projects/${this.project.id}/paths/${id}`
        }
      }, {clone: true})
    });
    this.spec.schemas.forEach(schema => spec.components.schemas[schema.name] = merge(schema.json, {
      externalDocs: {
        description: 'For changing contract, please follow',
        url: `/projects/${this.project.id}/schemas/${schema.id}`
      }
    }), {clone: true});

    this.swagger = SwaggerUI({
      dom_id: '#swaxgger_ui',
      spec
    });
  }

}
