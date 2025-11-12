import { ProductsCard } from '@/products/components/products-card/product-card';
import { ProductsService } from '@/products/services/products.service';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Pagination } from '@/shared/components/pagination/pagination';
import { PaginationService } from '@/shared/components/pagination/pagination.service';

// import { ProductsCard } from "../../../products/components/products-card/product-card";

@Component({
  selector: 'app-home-page',
  imports: [ProductsCard, Pagination],
  templateUrl: './home-page.html',
})
export class HomePage {
  private productsService = inject(ProductsService);

  paginationService = inject(PaginationService);

  productsResource = rxResource({
    request: () => ({ page: this.paginationService.currentPage() - 1 }),
    loader: ({ request }) => {
      return this.productsService.getProducts({
        offset: request.page * 9,
      });
    },
  });
}
