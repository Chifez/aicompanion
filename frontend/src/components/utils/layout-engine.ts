const BASE_TILE_CLASS =
  'relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 shadow-[0_0_60px_rgba(14,165,233,0.08)] dark:border-slate-900/60 dark:bg-slate-900/60';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export interface MeetingLayoutConfig {
  variant: 'single' | 'double';
  containerClass: string;
  mainTileWrapperClass: string;
  mainTileClass: string;
  secondaryContainerClass?: string;
  secondaryTileClass?: string;
  floatingSelfWrapperClass?: string;
  floatingSelfTileClass?: string;
}

interface ComputeOptions {
  participantCount: number;
  screenSize: ScreenSize;
}

/**
 * Minimal layout engine tailored to the current requirements:
 * - Maximum of two human participants (+ the AI host tile)
 * - Dedicated rules for mobile, tablet, and desktop screens
 * - Handles floating self-view for solo participants and stacked layouts for pairs
 */
export class MeetingLayoutEngine {
  static compute({
    participantCount,
    screenSize,
  }: ComputeOptions): MeetingLayoutConfig {
    const count = Math.min(Math.max(participantCount, 1), 2);

    if (count === 1) {
      return this.computeSingleLayout(screenSize);
    }

    return this.computeDoubleLayout(screenSize);
  }

  private static computeSingleLayout(
    screenSize: ScreenSize
  ): MeetingLayoutConfig {
    const isDesktop = screenSize === 'desktop';
    const isTablet = screenSize === 'tablet';

    return {
      variant: 'single',
      containerClass: 'relative flex h-full w-full items-center justify-center',
      mainTileWrapperClass: isDesktop
        ? 'w-[70vw] max-w-4xl'
        : 'w-full max-w-4xl',
      mainTileClass: `${BASE_TILE_CLASS} w-full ${
        isDesktop
          ? 'aspect-video lg:min-h-[440px]'
          : isTablet
            ? 'min-h-[62vh]'
            : 'min-h-[75vh]'
      }`,
      floatingSelfWrapperClass: isDesktop
        ? 'pointer-events-none absolute bottom-8 right-8 w-56'
        : 'pointer-events-none absolute bottom-4 right-4 w-40',
      floatingSelfTileClass: `${BASE_TILE_CLASS} aspect-video w-full`,
    };
  }

  private static computeDoubleLayout(
    screenSize: ScreenSize
  ): MeetingLayoutConfig {
    const isTablet = screenSize === 'tablet';

    return {
      variant: 'double',
      containerClass:
        'flex h-full w-full flex-col gap-4 lg:max-w-6xl lg:flex-row lg:items-stretch lg:gap-8',
      mainTileWrapperClass: 'w-full lg:flex-[0.65] lg:min-w-0 lg:max-w-[960px]',
      mainTileClass: `${BASE_TILE_CLASS} w-full ${
        isTablet ? 'min-h-[62vh]' : 'min-h-[62vh]'
      } lg:min-h-full`,
      secondaryContainerClass: `grid grid-cols-2 gap-3 lg:flex lg:flex-[0.35] lg:min-w-0 lg:flex-col lg:justify-between lg:gap-4`,
      secondaryTileClass: `${BASE_TILE_CLASS} w-full aspect-[4/3] md:aspect-[16/9] lg:flex-1 lg:min-h-[100px]!`,
    };
  }
}
