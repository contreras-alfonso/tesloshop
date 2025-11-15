import { Component, input } from '@angular/core';

@Component({
  selector: 'alert-error',
  imports: [],
  templateUrl: './alert-error.html',
})
export class AlertError {
  message = input.required<string>();
}
