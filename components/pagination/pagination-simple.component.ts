/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { toNumber } from 'ng-zorro-antd/core/util';
import { PaginationItemRenderContext } from './pagination.types';

@Component({
  selector: 'ul[nz-pagination-simple]',
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li
      nz-pagination-item
      [attr.title]="locale.prev_page"
      [disabled]="isFirstIndex"
      (click)="prePage()"
      type="prev"
      [itemRender]="itemRender"
    ></li>
    <li [attr.title]="pageIndex + '/' + lastIndex" class="ant-pagination-simple-pager">
      <input [disabled]="disabled" [value]="pageIndex" (keydown.enter)="jumpToPageViaInput($event)" size="3" />
      <span class="ant-pagination-slash">/</span>
      {{ lastIndex }}
    </li>
    <li
      nz-pagination-item
      [attr.title]="locale.next_page"
      [disabled]="isLastIndex"
      (click)="nextPage()"
      type="next"
      [itemRender]="itemRender"
    ></li>
  `,
  host: {
    '[class.ant-pagination]': 'true',
    '[class.ant-pagination-simple]': 'true',
    '[class.ant-pagination-disabled]': 'disabled'
  }
})
export class NzPaginationSimpleComponent implements OnChanges {
  @Input() itemRender: TemplateRef<PaginationItemRenderContext> | null = null;
  @Input() disabled = false;
  @Input() locale: NzSafeAny = {};
  @Input() total = 0;
  @Input() pageIndex = 1;
  @Input() pageSize = 10;
  @Output() readonly pageIndexChange = new EventEmitter<number>();
  lastIndex = 0;
  isFirstIndex = false;
  isLastIndex = false;

  jumpToPageViaInput($event: Event): void {
    const target = $event.target as HTMLInputElement;
    const index = toNumber(target.value, this.pageIndex);
    this.onPageIndexChange(index);
    target.value = `${this.pageIndex}`;
  }

  prePage(): void {
    this.onPageIndexChange(this.pageIndex - 1);
  }
  nextPage(): void {
    this.onPageIndexChange(this.pageIndex + 1);
  }

  onPageIndexChange(index: number): void {
    this.pageIndexChange.next(index);
  }

  updateBindingValue(): void {
    this.lastIndex = Math.ceil(this.total / this.pageSize);
    this.isFirstIndex = this.pageIndex === 1;
    this.isLastIndex = this.pageIndex === this.lastIndex;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { pageIndex, total, pageSize } = changes;
    if (pageIndex || total || pageSize) {
      this.updateBindingValue();
    }
  }
}
