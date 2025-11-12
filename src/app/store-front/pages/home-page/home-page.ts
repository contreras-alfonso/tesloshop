import { ProductsCard } from '@/products/components/products-card/product-card';
import { ProductsService } from '@/products/services/products.service';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

// import { ProductsCard } from "../../../products/components/products-card/product-card";

@Component({
  selector: 'app-home-page',
  imports: [ProductsCard],
  templateUrl: './home-page.html',
})
export class HomePage {
  private productsService = inject(ProductsService);

  productsResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this.productsService.getProducts();
    },
  });
}
