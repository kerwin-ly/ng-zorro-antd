/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { CandyDate, cloneDate, CompatibleValue, normalizeRangeValue } from 'ng-zorro-antd/core/time';
import { ReplaySubject, Subject } from 'rxjs';
import { CompatibleDate, RangePartType } from './standard-types';

@Injectable()
export class DatePickerService {
  initialValue: CompatibleValue;
  value: CompatibleValue;
  activeDate: CompatibleValue;
  activeInput: RangePartType = 'left';
  arrowPositionStyle = {};
  isRange = false;

  valueChange$ = new ReplaySubject<CompatibleValue>(1);
  emitValue$ = new Subject<void>();
  inputPartChange$ = new Subject<RangePartType>();

  initValue(): void {
    if (this.isRange) {
      this.activeDate = normalizeRangeValue([]);
      this.value = this.initialValue = [];
    } else {
      this.value = this.initialValue = null;
    }
  }

  hasValue(value: CompatibleValue = this.value): boolean {
    if (Array.isArray(value)) {
      return !!value[0] && !!value[1];
    } else {
      return !!value;
    }
  }

  makeValue(value: CompatibleDate): CompatibleValue {
    if (this.isRange) {
      return value ? (value as Date[]).map(val => new CandyDate(val)) : [];
    } else {
      return value ? new CandyDate(value as Date) : null;
    }
  }

  setActiveDate(value: CompatibleValue): void {
    if (this.isRange) {
      this.activeDate = normalizeRangeValue(value as CandyDate[]);
    } else {
      this.activeDate = cloneDate(value);
    }
  }

  setValue(value: CompatibleValue): void {
    this.value = value;
    this.valueChange$.next(this.value);
  }

  getActiveIndex(part: RangePartType = this.activeInput): number {
    return { left: 0, right: 1 }[part];
  }

  hasOnePart(): boolean {
    if (Array.isArray(this.value)) {
      const [left, right] = this.value as CandyDate[]; // NOTE: the left/right maybe not the sequence it select at the date panels
      return (!left && !!right) || (!!left && !right);
    }
    return false;
  }
}
