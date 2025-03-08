class UIComponent {
  private element: HTMLElement;
  private styles: Record<string, any> = {};
  private styleSheet: string = '';
  private children: UIComponent[] = [];
  private useShadowDOM: boolean = true;
  
  constructor(tagName: string = 'div') {
    this.element = document.createElement(tagName);
  }
  
  // Add template string-based styling
  style(cssString: string): UIComponent {
    this.styleSheet = cssString;
    return this;
  }
  
  // Toggle shadow DOM usage
  shadowDOM(enabled: boolean = true): UIComponent {
    this.useShadowDOM = enabled;
    return this;
  }
  
  // Add container layers support
  containerType(type: 'normal' | 'inline' | 'size'): UIComponent {
    this.styles.containerType = type;
    return this;
  }
  
  containerName(name: string): UIComponent {
    this.styles.containerName = name;
    return this;
  }
  
  // Render method updated to handle shadow DOM and styles
  render(): HTMLElement {
    // Apply inline styles
    Object.assign(this.element.style, this.styles);
    
    if (this.useShadowDOM) {
      // Create shadow root
      const shadow = this.element.attachShadow({ mode: 'open' });
      
      // Add style element if needed
      if (this.styleSheet) {
        const style = document.createElement('style');
        style.textContent = this.styleSheet;
        shadow.appendChild(style);
      }
      
      // Create container for children
      const container = document.createElement('div');
      shadow.appendChild(container);
      
      // Append all children to the container
      this.children.forEach(child => {
        container.appendChild(child.render());
      });
    } else {
      // Add style element directly if not using shadow DOM
      if (this.styleSheet) {
        const style = document.createElement('style');
        // Add a unique attribute to scope styles
        const scopeId = `component-${Math.random().toString(36).substr(2, 9)}`;
        this.element.setAttribute('data-component-id', scopeId);
        
        // Scope all styles to this component
        style.textContent = this.styleSheet
          .split('}')
          .map(rule => rule.trim())
          .filter(rule => rule.length > 0)
          .map(rule => {
            const [selector, ...rest] = rule.split('{');
            return `[data-component-id="${scopeId}"] ${selector.trim()} {${rest.join('{')}}`
          })
          .join('}');
        
        this.element.appendChild(style);
      }
      
      // Append all children directly
      this.children.forEach(child => {
        this.element.appendChild(child.render());
      });
    }
    
    return this.element;
  }
}
