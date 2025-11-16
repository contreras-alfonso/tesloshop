import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment.development';

const BACKEND_URL = environment.BACKEND_URL;

@Pipe({
  name: 'productImage',
})
export class ProductImagePipe implements PipeTransform {
  transform(value: null | string | string[]): string {
    if (value === null) {
      return './assets/images/no-image.jpg';
    }

    console.log('caso de if fuera');
    if (typeof value === 'string' && value.startsWith('blob')) {
      console.log('caso de if ', value);
      return `${value}`;
    }

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
