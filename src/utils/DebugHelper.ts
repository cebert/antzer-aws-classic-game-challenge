import Phaser from 'phaser';

export class DebugHelper {
  private scene: Phaser.Scene;
  private debugMode: boolean = false;
  private debugOverlay: HTMLDivElement | null = null;
  private debugElements: Map<string, HTMLDivElement> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Check if debug mode is enabled via URL parameter
    this.debugMode = window.location.search.includes('debug=true');
    
    if (this.debugMode) {
      this.createDebugOverlay();
      
      // Add global access for Playwright
      (window as any).phaserDebug = {
        clickElement: this.clickElement.bind(this),
        getElements: () => Array.from(this.debugElements.keys()),
        toggleDebug: this.toggleDebug.bind(this)
      };
    }
  }

  private createDebugOverlay(): void {
    // Create overlay container
    this.debugOverlay = document.createElement('div');
    this.debugOverlay.style.position = 'absolute';
    this.debugOverlay.style.top = '0';
    this.debugOverlay.style.left = '0';
    this.debugOverlay.style.width = '100%';
    this.debugOverlay.style.height = '100%';
    this.debugOverlay.style.pointerEvents = 'none';
    this.debugOverlay.style.zIndex = '1000';
    
    document.getElementById('game-container')?.appendChild(this.debugOverlay);
  }

  public addDebugElement(id: string, x: number, y: number, width: number, height: number, label: string): void {
    if (!this.debugMode || !this.debugOverlay) return;
    
    // Create debug element
    const element = document.createElement('div');
    element.setAttribute('data-debug-id', id);
    element.style.position = 'absolute';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.border = '2px solid red';
    element.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
    element.style.color = 'white';
    element.style.fontSize = '12px';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.pointerEvents = 'auto';
    element.textContent = label;
    
    // Add click handler
    element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clickElement(id);
    });
    
    this.debugOverlay.appendChild(element);
    this.debugElements.set(id, element);
  }

  public removeDebugElement(id: string): void {
    if (!this.debugMode) return;
    
    const element = this.debugElements.get(id);
    if (element && this.debugOverlay) {
      this.debugOverlay.removeChild(element);
      this.debugElements.delete(id);
    }
  }

  public updateDebugElement(id: string, x: number, y: number): void {
    if (!this.debugMode) return;
    
    const element = this.debugElements.get(id);
    if (element) {
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    }
  }

  public clickElement(id: string): void {
    // Emit a custom event that the game can listen for
    const event = new CustomEvent('phaser-debug-click', { 
      detail: { id } 
    });
    window.dispatchEvent(event);
    
    console.log(`Debug click on element: ${id}`);
  }

  public toggleDebug(): void {
    this.debugMode = !this.debugMode;
    
    if (this.debugOverlay) {
      this.debugOverlay.style.display = this.debugMode ? 'block' : 'none';
    }
  }

  public isDebugMode(): boolean {
    return this.debugMode;
  }
}