interface PlayerOptions {
    url: string;
    width?: string;
    height?: string;
    autoplay?: boolean;
    muted?: boolean;
    controls?: boolean;
    responsive?: boolean;
    playsinline?: boolean;
}

export class Player {
    private player: any;
    private iframe: HTMLIFrameElement;

    constructor(iframe: HTMLIFrameElement, options: PlayerOptions) {
        this.iframe = iframe;
        this.player = new (window as any).playerjs.Player(iframe);
    }

    on(event: string, callback: (...args: any[]) => void) {
        this.player.on(event, callback);
    }

    off(event: string) {
        this.player.off(event);
    }

    getDuration(): number {
        return this.player.getDuration();
    }

    getCurrentTime(): number {
        return this.player.getCurrentTime();
    }

    setCurrentTime(time: number) {
        this.player.setCurrentTime(time);
    }

    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
    }
} 