import {Component, OnInit} from '@angular/core';
import {UI} from "@esanum/ui";
import {ActivatedRoute} from "@angular/router";
import PouchDB from "pouchdb-browser";
import {environment} from "../../environments/environment";
import {Project} from "../../models/project";
import {AppConfig} from "../config";
import Database = PouchDB.Database;

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {

  ui = UI;

  db?: Database

  project!: Project;

  constructor(private route: ActivatedRoute,
              private config: AppConfig) {
  }

  ngOnInit() {
    this.route.data.subscribe(({project}) => {
      this.project = project;
      this.connect();
    });
  }

  private connect() {
    this.db?.close();
    this.db = new PouchDB([environment.storage, this.project.dbName].join('/'),
      {
        skip_setup: false,
        fetch: (url, opts) => {
          if (!!opts) {
            opts.credentials = 'omit';
            const headers = opts.headers as Headers;
            if (!!this.config.token) {
              headers.append('Authorization', `Bearer ${this.config.token.key}`);
            }
          }
          return PouchDB.fetch(url, opts);
        }
      });
    console.log(this.db);
  }

  import({target: {files: [file]}}) {
    if (!!file) {
      const reader = new FileReader();
      reader.onload = ({target}) => {
        const json = JSON.parse(target?.result as string);
        console.log(json);
        this.db?.bulkDocs(json, {new_edits: false},
          () => console.log('done'));
      };
      reader.readAsText(file);
    }

  }
}
