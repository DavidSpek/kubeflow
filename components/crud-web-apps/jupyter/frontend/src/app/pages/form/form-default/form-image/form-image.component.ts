import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';

@Component({
  selector: 'app-form-image',
  templateUrl: './form-image.component.html',
  styleUrls: ['./form-image.component.scss'],
})
export class FormImageComponent implements OnInit, OnDestroy {
  @Input() parentForm: FormGroup;
  @Input() jupyterImages: string[];
  @Input() jupyterReadonly: boolean;
  @Input() vscodeImages: string[];
  @Input() vscodeReadonly: boolean;
  @Input() rstudioImages: string[];
  @Input() rstudioReadonly: boolean;
  @Input() rooturlReadonly: boolean;
  @Input() rstudioHeaderReadonly: boolean;

  subs = new Subscription();

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('jupyterlab', sanitizer.bypassSecurityTrustResourceUrl('static/assets/jupyterlab-wordmark.svg'));
    iconRegistry.addSvgIcon('vs-code', sanitizer.bypassSecurityTrustResourceUrl('static/assets/visual-studio-code.svg'));
    iconRegistry.addSvgIcon('r-studio', sanitizer.bypassSecurityTrustResourceUrl('static/assets/RStudio-Logo-flat.svg'));
  }

  ngOnInit() {
    this.subs.add(
      this.parentForm.get('customImageCheck').valueChanges.subscribe(check => {
        // Make sure that the use will insert and Image value
        if (check) {
          this.parentForm.get('customImage').setValidators(Validators.required);
          this.parentForm.get('jupyterImage').setValidators([]);
          this.parentForm.get('vsCodeImage').setValidators([]);
          this.parentForm.get('rStudioImage').setValidators([]);
        }
        this.parentForm.get('serverType').valueChanges.subscribe(selection => {
          if (selection === "jupyter") {
            this.parentForm.get('customImage').setValidators([]);
            this.parentForm.get('jupyterImage').setValidators(Validators.required);
            this.parentForm.get('vsCodeImage').setValidators([]);
            this.parentForm.get('rStudioImage').setValidators([]);
          } else if (selection === "vs-code") {
            this.parentForm.get('customImage').setValidators([]);
            this.parentForm.get('jupyterImage').setValidators([]);
            this.parentForm.get('vsCodeImage').setValidators(Validators.required);
            this.parentForm.get('rStudioImage').setValidators([]);
          } else if (selection === "r-studio") {
            this.parentForm.get('customImage').setValidators([]);
            this.parentForm.get('jupyterImage').setValidators([]);
            this.parentForm.get('vsCodeImage').setValidators([]);
            this.parentForm.get('rStudioImage').setValidators(Validators.required);
          }
          this.parentForm.get('jupyterImage').updateValueAndValidity();
          this.parentForm.get('vsCodeImage').updateValueAndValidity();
          this.parentForm.get('rStudioImage').updateValueAndValidity();
          
        })
        this.parentForm.get('customImage').updateValueAndValidity();
        this.parentForm.get('serverType').updateValueAndValidity();
        this.parentForm.get('useRootURL').updateValueAndValidity();
        this.parentForm.get('setRstudioPathHeader').updateValueAndValidity();
      }),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
