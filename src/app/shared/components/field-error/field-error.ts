import { FormUtils } from '@/utils/form-utils';
import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'field-error',
  imports: [],
  templateUrl: './field-error.html',
})
export class FieldError {
  fieldName = input.required<string>();
  form = input.required<FormGroup>();
  formUtil = FormUtils
}
