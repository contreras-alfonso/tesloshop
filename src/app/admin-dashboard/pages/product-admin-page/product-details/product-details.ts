import { Product } from '@/products/interfaces/product-response.interface';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ProductCarousel } from '@/products/components/product-carousel/product-carousel';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '@/utils/form-utils';
import { FieldError } from '@/shared/components/field-error/field-error';
import { ProductsService } from '@/products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FieldError],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {
  product = input.required<Product>();
  router = inject(Router);
  productService = inject(ProductsService);

  wasSaved = signal(false);

  tempImages = signal<string[]>([]);

  imageFileList: FileList | undefined = undefined;

  imagesToCarousel = computed(() => {
    return [...this.product().images, ...this.tempImages()];
  });

  fb = inject(FormBuilder);

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: [
      '',
      [Validators.required, Validators.pattern(FormUtils.slugPattern)],
    ],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [[]],
    tags: [''],
    gender: [
      'men',
      [Validators.required, Validators.pattern(/men|women|kids|unisex/)],
    ],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    // this.productForm.reset(this.product() as any);
    this.setFormValue(this.product());
  }

  setFormValue(formLike: Partial<Product>) {
    this.productForm.patchValue(formLike as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(',') });
  }

  onSizeClick(size: string) {
    const currentSizes = this.productForm.value.sizes ?? [''];
    if (currentSizes.includes(size)) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    } else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({ sizes: currentSizes });
  }

  async onSubmit() {
    const isValid = this.productForm.valid;
    // console.log(this.productForm.value, { isValid });
    this.productForm.markAllAsTouched();

    if (!isValid) return;

    const formValue = this.productForm.value;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags:
        formValue.tags
          ?.toLocaleLowerCase()
          .split(',')
          .map((tag) => tag.trim()) ?? [],
    };

    console.log(productLike);

    if (this.product().id === 'new') {
      //Crear producto
      const product = await firstValueFrom(
        this.productService.createProduct(productLike, this.imageFileList)
      );

      this.router.navigate(['/admin/products', product.id]);
    } else {
      await firstValueFrom(
        this.productService.updateProduct(this.product().id, productLike, this.imageFileList)
      );
    }

    this.wasSaved.set(true);

    console.log('this.wasSaved()', this.wasSaved());

    setTimeout(() => {
      console.log('this.wasSaved() antes setime', this.wasSaved());
      this.wasSaved.set(false);
      console.log('this.wasSaved() despues', this.wasSaved());
    }, 2000);
  }

  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;

    this.imageFileList = fileList ?? undefined;

    this.tempImages.set([]);

    const imageUrls = Array.from(fileList ?? []).map((file) =>
      URL.createObjectURL(file)
    );

    console.log({ imageUrls });

    this.tempImages.set(imageUrls);

    // console.log(files);
  }

}
