import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Gender,
  Product,
  ProductsResponse,
} from '../interfaces/product-response.interface';
import { delay, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '@/auth/interfaces/user.interface';

const BACKEND_URL = environment.BACKEND_URL;

interface QueryOptions {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User,
};

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
    if (id === 'new') {
      return of(emptyProduct);
    }

    if (this.productsSlugCache.has(id)) {
      return of(this.productsSlugCache.get(id));
    }
    return this.http
      .get<Product>(`${BACKEND_URL}/api/products/${id}`)
      .pipe(tap((response) => this.productsSlugCache.set(id, response)));
  }

  updateProduct(
    id: string,
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    console.log('Actualizando producto');

    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList).pipe(
      map((imageNames) => ({
        ...productLike,
        images: [...currentImages, ...imageNames],
      })),
      switchMap((updatedProduct) =>
        this.http.patch<Product>(
          `${BACKEND_URL}/api/products/${id}`,
          updatedProduct
        )
      ),
      tap((product) => this.updateProductCache(product))
    );

    // return this.http
    //   .patch<Product>(`${BACKEND_URL}/api/products/${id}`, productLike)
    //   .pipe(tap((product) => this.updateProductCache(product)));
  }

  updateProductCache(product: Product) {
    const productId = product.id;
    this.productsSlugCache.set(productId, product);

    this.productsCache.forEach((productResponse) => {
      productResponse.products = productResponse.products.map(
        (currentProduct) =>
          currentProduct.id === productId ? product : currentProduct
      );
    });
  }

  createProduct(
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {
    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList).pipe(
      map((imageNames) => ({
        ...productLike,
        images: [...currentImages, ...imageNames],
      })),
      switchMap((updatedProduct) =>
        this.http.post<Product>(`${BACKEND_URL}/api/products`, updatedProduct)
      ),
      tap((product) => this.updateProductCache(product))
    );
    // return this.http
    //   .post<Product>(`${BACKEND_URL}/api/products`, productLike)
    //   .pipe(tap((product) => this.updateProductCache(product)));
  }

  uploadImages(images?: FileList): Observable<string[]> {
    if (!images) return of([]);
    const uploadObservables = Array.from(images).map((imageFile) =>
      this.uploadImage(imageFile)
    );

    return forkJoin(uploadObservables).pipe(
      tap((imageNames) => console.log({ imageNames }))
    );
  }

  uploadImage(image: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', image);
    return this.http
      .post<{ fileName: string }>(`${BACKEND_URL}/api/files/product`, formData)
      .pipe(map((resp) => resp.fileName));
  }
}
