import { Pipe, PipeTransform } from '@angular/core';
import { getTextBrightness } from '@esanum/ui';

enum BrightnessColors {
  light = '#FFF',
  dark = '#4F4F4F'
}

@Pipe({name: 'textBrightness'})
export class TextBrightnessPipe implements PipeTransform {
  transform(color: string): string {
    if (color === 'primary') {
      return BrightnessColors.light;
    }
    if (color === 'secondary') {
      return BrightnessColors.dark;
    }
    return getTextBrightness(color);
  }
}

@Pipe({name: 'hexToRGB'})
export class HexToRGB implements PipeTransform {
  transform(hex, alpha = 0.8): string {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  }
}
