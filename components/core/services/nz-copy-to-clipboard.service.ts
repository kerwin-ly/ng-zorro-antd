/**
 * @license
 * Copyright Alibaba.com All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzCopyToClipboardServiceModule } from './nz-copy-to-clipboard.service.module';

@Injectable({
  providedIn: NzCopyToClipboardServiceModule
})
export class NzCopyToClipboardService {
  constructor(@Inject(DOCUMENT) private document: NzSafeAny) {}

  copy(text: string): Promise<string> {
    return new Promise<string>((resolve, reject): void => {
      let copyTextArea = null;
      try {
        copyTextArea = this.document.createElement('textarea') as NzSafeAny;
        copyTextArea.style!.all = 'unset';
        copyTextArea.style.position = 'fixed';
        copyTextArea.style.top = '0';
        copyTextArea.style.clip = 'rect(0, 0, 0, 0)';
        copyTextArea.style.whiteSpace = 'pre';
        copyTextArea.style.webkitUserSelect = 'text';
        copyTextArea.style!.MozUserSelect = 'text';
        copyTextArea.style.msUserSelect = 'text';
        copyTextArea.style.userSelect = 'text';
        this.document.body.appendChild(copyTextArea);
        copyTextArea.value = text;
        copyTextArea.select();

        const successful = this.document.execCommand('copy');
        if (!successful) {
          reject(text);
        }
        resolve(text);
      } finally {
        if (copyTextArea) {
          this.document.body.removeChild(copyTextArea);
        }
      }
    });
  }
}
