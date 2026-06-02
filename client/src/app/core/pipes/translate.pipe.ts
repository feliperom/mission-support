import { Pipe, PipeTransform, inject, ChangeDetectorRef, effect } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    effect(() => {
      // By reading these signals, this effect will re-run when language changes
      // or when translations are loaded via HTTP, triggering a CD cycle in zoneless mode.
      this.translationService.isLoaded();
      this.translationService.currentLang();
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    return this.translationService.translate(key);
  }
}
