/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { InputBoolean, InputNumber } from 'ng-zorro-antd/core/util';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginationItemRenderContext } from './pagination.types';

@Component({
  selector: 'nz-pagination',
  exportAs: 'nzPagination',
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="showPagination">
      <ul
        *ngIf="nzSimple"
        nz-pagination-simple
        [class.ant-table-pagination]="nzInsideTable"
        [disabled]="nzDisabled"
        [itemRender]="nzItemRender"
        [locale]="locale"
        [pageSize]="nzPageSize"
        [total]="nzTotal"
        [pageIndex]="nzPageIndex"
        (pageIndexChange)="onPageIndexChange($event)"
      ></ul>
      <ul
        *ngIf="!nzSimple"
        nz-pagination-default
        [class.ant-table-pagination]="nzInsideTable"
        [nzSize]="nzSize"
        [itemRender]="nzItemRender"
        [showTotal]="nzShowTotal"
        [disabled]="nzDisabled"
        [locale]="locale"
        [showSizeChanger]="nzShowSizeChanger"
        [showQuickJumper]="nzShowQuickJumper"
        [total]="nzTotal"
        [pageIndex]="nzPageIndex"
        [pageSize]="nzPageSize"
        [pageSizeOptions]="nzPageSizeOptions"
        (pageIndexChange)="onPageIndexChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      ></ul>
    </ng-container>
  `
})
export class NzPaginationComponent implements OnInit, OnDestroy, OnChanges {
  @Output() readonly nzPageSizeChange: EventEmitter<number> = new EventEmitter();
  @Output() readonly nzPageIndexChange: EventEmitter<number> = new EventEmitter();
  @Input() nzShowTotal: TemplateRef<{ $implicit: number; range: [number, number] }> | null = null;
  @Input() nzSize: 'default' | 'small' = 'default';
  @Input() nzPageSizeOptions = [10, 20, 30, 40];
  @Input() nzItemRender: TemplateRef<PaginationItemRenderContext>;
  @Input() @InputBoolean() nzDisabled = false;
  @Input() @InputBoolean() nzInsideTable = false;
  @Input() @InputBoolean() nzShowSizeChanger = false;
  @Input() @InputBoolean() nzHideOnSinglePage = false;
  @Input() @InputBoolean() nzShowQuickJumper = false;
  @Input() @InputBoolean() nzSimple = false;
  @Input() @InputNumber() nzTotal = 0;
  @Input() @InputNumber() nzPageIndex = 1;
  @Input() @InputNumber() nzPageSize = 10;
  showPagination = true;
  locale: NzSafeAny = {};
  private destroy$ = new Subject<void>();
  private total$ = new ReplaySubject<number>(1);

  validatePageIndex(value: number, lastIndex: number): number {
    if (value > lastIndex) {
      return lastIndex;
    } else if (value < 1) {
      return 1;
    } else {
      return value;
    }
  }

  onPageIndexChange(index: number): void {
    const lastIndex = this.getLastIndex(this.nzTotal, this.nzPageSize);
    const validIndex = this.validatePageIndex(index, lastIndex);
    if (validIndex !== this.nzPageIndex && !this.nzDisabled) {
      this.nzPageIndex = validIndex;
      this.nzPageIndexChange.emit(this.nzPageIndex);
    }
  }

  onPageSizeChange(size: number): void {
    this.nzPageSize = size;
    this.nzPageSizeChange.emit(size);
    const lastIndex = this.getLastIndex(this.nzTotal, this.nzPageSize);
    if (this.nzPageIndex > lastIndex) {
      this.onPageIndexChange(lastIndex);
    }
  }

  onTotalChange(total: number): void {
    const lastIndex = this.getLastIndex(total, this.nzPageSize);
    if (this.nzPageIndex > lastIndex) {
      Promise.resolve().then(() => this.onPageIndexChange(lastIndex));
    }
  }

  getLastIndex(total: number, pageSize: number): number {
    return Math.ceil(total / pageSize);
  }

  constructor(private i18n: NzI18nService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.i18n.localeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.locale = this.i18n.getLocaleData('Pagination');
      this.cdr.markForCheck();
    });
    this.total$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      this.onTotalChange(total);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzHideOnSinglePage, nzTotal, nzPageSize } = changes;
    if (nzTotal) {
      this.total$.next(this.nzTotal);
    }
    if (nzHideOnSinglePage || nzTotal || nzPageSize) {
      this.showPagination = (this.nzHideOnSinglePage && this.nzTotal > this.nzPageSize) || (this.nzTotal > 0 && !this.nzHideOnSinglePage);
    }
  }
}
