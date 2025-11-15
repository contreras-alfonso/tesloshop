import { Component, inject, signal } from '@angular/core';
import { ProductTable } from '@/products/components/product-table/product-table';
import { ProductsService } from '@/products/services/products.service';
import { PaginationService } from '@/shared/components/pagination/pagination.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Pagination } from '@/shared/components/pagination/pagination';

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTable, Pagination],
  templateUrl: './products-admin-page.html',
})
export class ProductsAdminPage {
  private productsService = inject(ProductsService);

  paginationService = inject(PaginationService);

  productsPerPage = signal(10);

  productsResource = rxResource({
    request: () => ({
      page: this.paginationService.currentPage() - 1,
      productsPerPage: this.productsPerPage(),
    }),
    loader: ({ request }) => {
      return this.productsService.getProducts({
        offset: request.page * 9,
        limit: request.productsPerPage,
      });
    },
  });
}
