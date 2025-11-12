import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const BACKEND_URL = environment.BACKEND_URL;

@Pipe({
  name: 'productImage',
})
export class ProductImagePipe implements PipeTransform {
  transform(value: string | string[]): string {
    if (typeof value === 'string') {
      return `${BACKEND_URL}/api/files/product/${value}`;
    }

    const image = value.at(0);

    if (!image) {
      return './assets/images/no-image.jpg';
    }

    return `${BACKEND_URL}/api/files/product/${image}`;
  }
}
