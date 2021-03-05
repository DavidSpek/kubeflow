import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Config, Volume, NotebookFormObject } from 'src/app/types';
import { Subscription } from 'rxjs';
import {
  NamespaceService,
  BackendService,
  SnackBarService,
  SnackType,
  getNameError,
} from 'kubeflow';
import { Router } from '@angular/router';
import { getFormDefaults, initFormControls } from './utils';
import { JWABackendService } from 'src/app/services/backend.service';
import { environment } from '@app/environment';

@Component({
  selector: 'app-form-default',
  templateUrl: './form-default.component.html',
  styleUrls: ['./form-default.component.scss'],
})
export class FormDefaultComponent implements OnInit, OnDestroy {
  currNamespace = '';
  formCtrl: FormGroup;
  config: Config;

  ephemeral = false;
  defaultStorageclass = false;

  blockSubmit = false;
  formReady = false;
  pvcs: Volume[] = [];
  existingNotebooks = new Set<string>();

  subscriptions = new Subscription();

  constructor(
    public namespaceService: NamespaceService,
    public backend: JWABackendService,
    public router: Router,
    public popup: SnackBarService,
  ) {}

  ngOnInit(): void {
    // Initialize the form control
    this.formCtrl = this.getFormDefaults();

    // Update the form Values from the default ones
    this.backend.getConfig().subscribe(config => {
      if (Object.keys(config).length === 0) {
        // Don't fire on empty config
        return;
      }

      this.config = config;
      this.initFormControls(this.formCtrl, config);
    });

    // Keep track of the selected namespace
    this.subscriptions.add(
      this.namespaceService.getSelectedNamespace().subscribe(namespace => {
        this.currNamespace = namespace;
        this.formCtrl.controls.namespace.setValue(this.currNamespace);

        // Get the PVCs of the new Namespace
        this.backend.getVolumes(namespace).subscribe(pvcs => {
          this.pvcs = pvcs;
        });
      }),
    );

    // Check if a default StorageClass is set
    this.backend.getDefaultStorageClass().subscribe(defaultClass => {
      if (defaultClass.length === 0) {
        this.defaultStorageclass = false;
        this.popup.open(
          "No default Storage Class is set. Can't create new Disks for the " +
            'new Notebook. Please use an Existing Disk.',
          SnackType.Warning,
          0,
        );
      } else {
        this.defaultStorageclass = true;
      }
    });
  }

  ngOnDestroy() {
    // Unsubscriptions
    this.subscriptions.unsubscribe();
  }

  // Functions for handling the Form Group of the entire Form
  getFormDefaults() {
    return getFormDefaults();
  }

  initFormControls(formCtrl: FormGroup, config: Config) {
    initFormControls(formCtrl, config);
  }

  // Form Actions
  getSubmitNotebook(): NotebookFormObject {
    const notebookCopy = this.formCtrl.value as NotebookFormObject;
    const notebook = JSON.parse(JSON.stringify(notebookCopy));

    // Use the custom image instead
    if (notebook.customImageCheck) {
      // Remove unnecessary images from payloaf
      delete notebook.jupyterImage;
      delete notebook.vscodeImage;
      delete notebook.rstudioImage;
      notebook.image = notebook.customImage;
      if (notebook.serverType == 'vs-code') {
        // Remove unnecessary images from payloaf
        delete notebook.jupyterImage;
        delete notebook.vscodeImage;
        delete notebook.rstudioImage;
        // Set base URI to / for Istio rewrite
        notebook.baseURI = '/';
      } else if (notebook.serverType == 'rstudio') {
        // Remove unnecessary images from payloaf
        delete notebook.jupyterImage;
        delete notebook.vscodeImage;
        delete notebook.rstudioImage;
        // Set base URI to / for Istio rewrite
        notebook.baseURI = '/';
        // Add X-RStudio-Root-Path header to requests for RStudio
        const headerKey = 'X-RStudio-Root-Path';
        const headerValue = '/notebook/' + notebook.namespace.toString() + '/' + notebook.name.toString() + '/';
        const rStudioHeader = headerKey.concat(': ', headerValue);
        notebook.requestHeaders = rStudioHeader;
      }
    } else if (notebook.serverType === 'jupyter') { // Set notebook image from jupyterImage
        notebook.image = notebook.jupyterImage;
        delete notebook.jupyterImage;
        delete notebook.vscodeImage;
        delete notebook.rstudioImage;
      } else if (notebook.serverType === 'vs-code') { // Set notebook image from vsCodeImage
        notebook.image = notebook.vscodeImage;
        delete notebook.jupyterImage;
        delete notebook.vscodeImage;
        delete notebook.rstudioImage;
        // Set base URI to / for Istio rewrite
        notebook.baseURI = '/';
      } else if (notebook.serverType === 'rstudio') { // Set notebook image from rStudioImage
        notebook.image = notebook.rstudioImage;
        delete notebook.jupyterImage;
        delete notebook.vscodeImage;
        delete notebook.rstudioImage;
        // Set base URI to / for Istio rewrite
        notebook.baseURI = '/';
        // Add X-RStudio-Root-Path header to requests for RStudio
        const headerKey = 'X-RStudio-Root-Path';
        const headerValue = '/notebook/' + notebook.namespace.toString() + '/' + notebook.name.toString() + '/';
        const rStudioHeader = headerKey.concat(': ', headerValue);
        notebook.requestHeaders = rStudioHeader;
      }

    // Ensure CPU input is a string
    if (typeof notebook.cpu === 'number') {
      notebook.cpu = notebook.cpu.toString();
    }

    // Add Gi to all sizes
    notebook.memory = notebook.memory.toString() + 'Gi';

    if (notebook.workspace.size) {
      notebook.workspace.size = notebook.workspace.size.toString() + 'Gi';
    }

    for (const vol of notebook.datavols) {
      if (vol.size) {
        vol.size = vol.size + 'Gi';
      }
    }

    return notebook;
  }

  onSubmit() {
    const notebook = this.getSubmitNotebook();
    this.backend.createNotebook(notebook).subscribe(() => {
      this.popup.close();
      this.router.navigate(['/']);
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
