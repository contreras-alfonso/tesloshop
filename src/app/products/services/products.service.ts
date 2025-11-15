import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Product,
  ProductsResponse,
} from '../interfaces/product-response.interface';
import { delay, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.BACKEND_URL;

interface QueryOptions {
  limit?: number;
  offset?: number;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();
  private productsSlugCache = new Map<string, Product>();

  getProducts(query: QueryOptions): Observable<ProductsResponse> {
    const { limit = 10, offset = 0, gender = '' } = query;

    const key = `${limit}-${offset}-${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http
      .get<ProductsResponse>(`${BACKEND_URL}/api/products`, {
        params: {
          limit,
          offset,
          gender,
        },
      })
      .pipe(
        tap((response) => console.log(response)),
        tap((response) => this.productsCache.set(key, response))
      );
  }

  getProductByIdSlug(idSlug: string) {
    if (this.productsSlugCache.has(idSlug)) {
      return of(this.productsSlugCache.get(idSlug));
    }
    return this.http.get<Product>(`${BACKEND_URL}/api/products/${idSlug}`).pipe(
      tap((response) => console.log(response)),
      tap((response) => this.productsSlugCache.set(idSlug, response))
    );
  }

  getProductById(id: string) {
    if (this.productsSlugCache.has(id)) {
      return of(this.productsSlugCache.get(id));
    }
    return this.http.get<Product>(`${BACKEND_URL}/api/products/${id}`).pipe(
      tap((response) => console.log(response)),
      tap((response) => this.productsSlugCache.set(id, response))
    );
  }
}
