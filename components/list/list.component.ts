/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { NzUpdateHostClassService } from 'ng-zorro-antd/core/services';
import { NzDirectionVHType, NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import { BehaviorSubject, Observable } from 'rxjs';

import { NzListGrid } from './interface';
import { NzListFooterComponent, NzListLoadMoreDirective, NzListPaginationComponent } from './list-cell';

@Component({
  selector: 'nz-list, [nz-list]',
  exportAs: 'nzList',
  template: `
    <ng-template #itemsTpl>
      <div class="ant-list-items">
        <ng-container *ngFor="let item of nzDataSource; let index = index">
          <ng-template [ngTemplateOutlet]="nzRenderItem" [ngTemplateOutletContext]="{ $implicit: item, index: index }"></ng-template>
        </ng-container>
        <ng-content select="nz-list-item, [nz-list-item]"></ng-content>
      </div>
    </ng-template>

    <nz-list-header *ngIf="nzHeader">
      <ng-container *nzStringTemplateOutlet="nzHeader">{{ nzHeader }}</ng-container>
    </nz-list-header>
    <ng-content select="nz-list-header"></ng-content>

    <nz-spin [nzSpinning]="nzLoading">
      <ng-container>
        <div *ngIf="nzLoading && nzDataSource && nzDataSource.length === 0" [style.min-height.px]="53"></div>
        <div *ngIf="nzGrid && nzDataSource; else itemsTpl" nz-row [nzGutter]="nzGrid.gutter">
          <div
            nz-col
            [nzSpan]="nzGrid.span"
            [nzXs]="nzGrid.xs"
            [nzSm]="nzGrid.sm"
            [nzMd]="nzGrid.md"
            [nzLg]="nzGrid.lg"
            [nzXl]="nzGrid.xl"
            [nzXXl]="nzGrid.xxl"
            *ngFor="let item of nzDataSource; let index = index"
          >
            <ng-template [ngTemplateOutlet]="nzRenderItem" [ngTemplateOutletContext]="{ $implicit: item, index: index }"></ng-template>
          </div>
        </div>
        <nz-list-empty *ngIf="!nzLoading && nzDataSource && nzDataSource.length === 0" [nzNoResult]="nzNoResult"></nz-list-empty>
      </ng-container>
      <ng-content></ng-content>
    </nz-spin>

    <nz-list-footer *ngIf="nzFooter">
      <ng-container *nzStringTemplateOutlet="nzFooter">{{ nzFooter }}</ng-container>
    </nz-list-footer>
    <ng-content select="nz-list-footer, [nz-list-footer]"></ng-content>

    <ng-template [ngTemplateOutlet]="nzLoadMore"></ng-template>
    <ng-content select="nz-list-load-more, [nz-list-load-more]"></ng-content>

    <nz-list-pagination *ngIf="nzPagination">
      <ng-template [ngTemplateOutlet]="nzPagination"></ng-template>
    </nz-list-pagination>
    <ng-content select="nz-list-pagination, [nz-list-pagination]"></ng-content>
  `,
  providers: [NzUpdateHostClassService],
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ant-list-vertical]': 'nzItemLayout === "vertical"',
    '[class.ant-list-lg]': 'nzSize === "large"',
    '[class.ant-list-sm]': 'nzSize === "small"',
    '[class.ant-list-split]': 'nzSplit',
    '[class.ant-list-bordered]': 'nzBordered',
    '[class.ant-list-loading]': 'nzLoading',
    '[class.ant-list-something-after-last-item]': 'hasSomethingAfterLastItem'
  }
})
export class NzListComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy {
  // tslint:disable-next-line:no-any
  @Input() nzDataSource: any[];
  @Input() @InputBoolean() nzBordered = false;
  @Input() nzGrid: NzListGrid;
  @Input() nzHeader: string | TemplateRef<void>;
  @Input() nzFooter: string | TemplateRef<void>;
  @Input() nzItemLayout: NzDirectionVHType = 'horizontal';
  @Input() nzRenderItem: TemplateRef<void>;
  @Input() @InputBoolean() nzLoading = false;
  @Input() nzLoadMore: TemplateRef<void>;
  @Input() nzPagination: TemplateRef<void>;
  @Input() nzSize: NzSizeLDSType = 'default';
  @Input() @InputBoolean() nzSplit = true;
  @Input() nzNoResult: string | TemplateRef<void>;

  @ContentChild(NzListFooterComponent) nzListFooterComponent: NzListFooterComponent;
  @ContentChild(NzListPaginationComponent) nzListPaginationComponent: NzListPaginationComponent;
  @ContentChild(NzListLoadMoreDirective) nzListLoadMoreDirective: NzListLoadMoreDirective;

  hasSomethingAfterLastItem = false;
  private prefixCls = 'ant-list';

  private _setClassMap(): void {
    const classMap = {
      [this.prefixCls]: true
    };
    this.updateHostClassService.updateHostClass(this.el.nativeElement, classMap);
  }

  // #endregion

  private itemLayoutNotifySource = new BehaviorSubject<NzDirectionVHType>(this.nzItemLayout);

  get itemLayoutNotify$(): Observable<NzDirectionVHType> {
    return this.itemLayoutNotifySource.asObservable();
  }

  constructor(private el: ElementRef, private updateHostClassService: NzUpdateHostClassService) {}

  getSomethingAfterLastItem(): boolean {
    return !!(
      this.nzLoadMore ||
      this.nzPagination ||
      this.nzFooter ||
      this.nzListFooterComponent ||
      this.nzListPaginationComponent ||
      this.nzListLoadMoreDirective
    );
  }

  ngOnInit(): void {
    this._setClassMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this._setClassMap();
    if (changes.nzItemLayout) {
      this.itemLayoutNotifySource.next(this.nzItemLayout);
    }
  }

  ngOnDestroy(): void {
    this.itemLayoutNotifySource.unsubscribe();
  }

  ngAfterContentInit(): void {
    this.hasSomethingAfterLastItem = this.getSomethingAfterLastItem();
  }
}
