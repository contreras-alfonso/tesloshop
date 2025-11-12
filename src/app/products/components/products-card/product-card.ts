import { Product } from '@/products/interfaces/product-response.interface';
import { ProductImagePipe } from '@/products/pipes/product-image.pipe';
import { SlicePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './product-card.html',
})
export class ProductsCard {
  backendUrl = environment.BACKEND_URL;
  product = input.required<Product>();

  imageUrl = computed(() => {
    return `${this.backendUrl}/api/files/product/${this.product().images[0]}`;
  });
}
