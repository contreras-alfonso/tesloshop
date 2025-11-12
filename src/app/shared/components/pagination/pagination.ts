import {
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  templateUrl: './pagination.html',
})
export class Pagination {
  currentPage = input<number>(3);
  pages = input<number>(0);
  // activePage = signal(this.currentPage());
  activePage = linkedSignal(this.currentPage);

  getPagesList = computed(() => {
    const pages: number[] = [];

    for (let index = 1; index <= this.pages(); index++) {
      pages.push(index);
    }
    return pages;
  });
}
