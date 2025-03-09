export type EdgeValue = "top" | "bottom" | "leading" | "trailing" | "all" | "horizontal" | "vertical";
export type DotEdge = `${EdgeValue}`;


export class Color {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }


  // TODO: Need to manage these better
  // Thinking of using open props
  // Getting the iOS default for now, but there's probably a better way to do this. 
  // Future me problem (～￣▽￣)～.
  // Common colors as static properties
  static black = new Color("#000000");
  static blue = new Color("#0A84FF");
  static gray = new Color("#8E8E93");
  static green = new Color("#30D158");
  static orange = new Color("#FF9F0A");
  static pink = new Color("#FF375F");
  static purple = new Color("#BF5AF2");
  static red = new Color("#FF453A");
  static white = new Color("#FFFFFF");


  // Create color with opacity
  opacity(value: number): Color {
    if (this.value.startsWith("#")) {
      const r = parseInt(this.value.slice(1, 3), 16);
      const g = parseInt(this.value.slice(3, 5), 16);
      const b = parseInt(this.value.slice(5, 7), 16);

      return new Color(`rgba(${r}, ${g}, ${b}, ${value})`);
    }

    if (this.value.startsWith("rgb(")) {
      // Prob a better to do this
      return new Color(this.value.replace("rgb(", "rgba(").replace(")", `, ${value})`));
    }

    return new Color(`color-mix(in oklab, ${this.value} ${value * 100}%, transparent)`);
  }

}


export class Font {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  static largeTitle(): Font {
    return new Font("2.5rem");
  }

  static title(): Font {
    return new Font("2rem");
  }

  static headline(): Font {
    return new Font("1.5rem bold");
  }

  static body(): Font {
    return new Font("1rem");
  }

  static callout(): Font {
    return new Font("0.8rem");
  }

  static caption(): Font {
    return new Font("0.8rem");
  }

  static footnote(): Font {
    return new Font("0.7rem");
  }

  // #region Modifiers
  bold(): Font {
    return new Font(`${this.value} bold`)
  }


  italic(): Font {
    return new Font(`${this.value} italic`);
  }

  // #endregion

}


// THis shit will probably become complex in the future. I wanna also learn how signals are implemented.
// So brewing complexity - might end up moving to own submodule
export class State<T> {
  // Use #<?> on the next version
  private _value: T;
  private subscribers: Set<() => void> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (!this.isSame(this._value, newValue)) {
      this._value = newValue;
      this.notifySubscribers();
    }
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    // clean up
    return () => this.subscribers.delete(callback)
  }


  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback());
  }

  // Move to utils
  isSame(value1: any, value2: any): boolean {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }
}


export class UIComponent<TElement = HTMLElement> {
  private element: HTMLElement;
  private styles: Record<string, any> = {};
  private styleSheet: string = "";
  private children: UIComponent[] = [];
  private useShadowDOM: boolean = false;
  private stateUnsubscribers: Array<() => void> = [];

  constructor(tagName: string = "div") {
    this.element = document.createElement(tagName);
  }

  // Clean up broo
  dispose(): void {
    this.stateUnsubscribers.forEach(unsub => unsub());
    this.children.forEach(child => child.dispose());
  }

  get getElement(): HTMLElement {
    return this.element;
  }

  // What inspired this whole thing. was interested in how SwiftUI automatically know what to show as option
  // based on the param index type when you .<?>
  // Basic style Modifiers
  padding(edgeOrValue?: DotEdge | number, value?: number): UIComponent {
    if (edgeOrValue === undefined) {
      this.styles.padding = "10px"; // Should move to constants
    } else if (typeof edgeOrValue === "number") {
      this.styles.padding = `${edgeOrValue}px`;
    } else {
      const edge = edgeOrValue.substring(1) as EdgeValue;
      const keyPropertyMap = {
        top: "padding-top",
        bottom: "padding-bottom",
        leading: "padding-left",
        trailing: "padding-right",
        all: "padding",
        horizontal: "padding-inline",
        vertical: "padding-block"
      }

      this.styles[keyPropertyMap[edge]] = `${value}px`;
    }
    return this;
  }

  backgroundColor(color: Color | string & {}): UIComponent {
    this.styles.backgroundColor = color.toString();
    return this;
  }

  foregroundColor(color: Color | string & {}): UIComponent {
    this.styles.color = color.toString();
    return this;
  }

  font(font: Font): UIComponent {
    this.styles.font = font.toString();
    return this;
  }

  frame(options: { width?: number | string, height?: number | string, alignment?: string } = {}): UIComponent {
    if (options.width) {
      this.styles.width = typeof options.width === "number" ? `${options.width}px` : options.width;
    }

    if (options.height) {
      this.styles.height = typeof options.height === "number" ? `${options.height}px` : options.height;
    }

    if (options.alignment) {
      this.styles.margin = "auto";
    }

    return this;
  }

  cornerRadius(radius: number): UIComponent {
    this.styles.borderRadius = `${radius}px`;
    return this;
  }

  border(width: number, color: Color | string): UIComponent {
    this.styles.border = `${width}px solid ${color.toString()}`;
    return this;
  }

  shadowDom(enable: boolean = true): UIComponent {
    this.useShadowDOM = enable;
    return this;
  }

  style(styles: string | Record<string, any>): UIComponent {
    if (typeof styles === "string") {
      this.styleSheet = styles;
    }

    if (typeof styles === "object") {
      Object.assign(this.styles, styles);
    }

    return this;
  }

  // #region Content methods
  text(content: string): UIComponent {
    this.element.textContent = content;
    return this;
  }

  // Structure method
  add(...components: UIComponent[]): UIComponent {
    this.children.push(...components);
    return this;
  }

  // #region Event handling
  onTap(handler: (e: MouseEvent) => void): UIComponent {
    this.element.addEventListener("click", handler);
    return this;
  }

  onClick(handler: (e: MouseEvent) => void): UIComponent {
    this.element.addEventListener("click", handler);
    return this;
  }

  onChange(handler: (e: Event) => void): UIComponent {
    this.element.addEventListener("change", handler);
    return this;
  }

  onInput(handler: (e: Event) => void): UIComponent {
    this.element.addEventListener("input", handler);
    return this;
  }


  // State binding
  bind<T>(state: State<T>, updateFn: (value: T, component: UIComponent) => void): UIComponent {
    // Initial update
    updateFn(state.value, this);

    // Subscribe to state
    const unsub = state.subscribe(() => updateFn(state.value, this));
    this.stateUnsubscribers.push(unsub);

    return this;
  }


  // !!Remember: Look up how signals work, and how to implement them
  render(): HTMLElement {
    Object.assign(this.element.style, this.styles);

    if (this.useShadowDOM) {
      const shadow = this.element.attachShadow({ mode: "open" });

      if (this.styleSheet) {
        const style = document.createElement("style");
        style.textContent = this.styleSheet;
        shadow.appendChild(style);
      }

      // Render children
      const container = document.createElement("div");
      shadow.appendChild(container);

      this.children.forEach(child => container.appendChild(child.render()));

    } else {
      const style = document.createElement("style");
      const scopeId = crypto.randomUUID() ?? `component-${Math.random().toString(36).substring(7)}`;
      this.element.setAttribute("data-component-id", scopeId);

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


    this.children.forEach(child => this.element.appendChild(child.render()));

    return this.element;
  }
}


// #region Layout COmponensts 
export function VStack(...children: UIComponent[]): UIComponent {
  const stack = new UIComponent("div").style("display: flex; flex-direction: column")
  return stack.add(...children);
}

export function HStack(...children: UIComponent[]): UIComponent {
  const stack = new UIComponent("div").style("display: flex; flex-direction: row")
  return stack.add(...children);
}

export function ZStack(...children: UIComponent[]): UIComponent {
  const stack = new UIComponent("div").style("position: relative")

  children.forEach((child, index) => {
    child.style({ position: "absolute", inset: 0, zIndex: index })
  })

  return stack.add(...children);
}

export function Spacer(): UIComponent {
  return new UIComponent("div").style("flex: 1");
}

export function Divider(): UIComponent {
  return new UIComponent("div").style("border-top: 1px solid #8E8E93");
}

// Basic component
export function Text(content: string): UIComponent {
  return new UIComponent("span").text(content);
}

export function Button(label: string): UIComponent {
  return new UIComponent("button")
    .text(label)
    .style(`
      :host {
        cursor: pointer;
        border: none;
        background-color: #0A84FF;
        color: white;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 600;
      }

      :host:hover {
        background-color: #0062CC;
      }
      :host:active {
        background-color: #004999;
      }
    `)
}

export function TextField(placeholder: string = ""): UIComponent {
  const input = new UIComponent("input");
  input.getElement.setAttribute("placeholder", placeholder);
  input.getElement.setAttribute("type", "text");
  
  return input.style(`
    :host {
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #c0c0c0;
      font-size: 16px;
      width: 100%;
      box-sizing: border-box;
    }
    :host:focus {
      outline: none;
      border-color: #007AFF;
    }
    `)
}

export function Toggle(isOn: State<boolean>): UIComponent {
  const toggle = new UIComponent('label')
    .style(`
      :host {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
      }
      input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      span {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
      }
      span:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      input:checked + span {
        background-color: #007AFF;
      }
      input:checked + span:before {
        transform: translateX(26px);
      }
    `);
  
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = isOn.value;
  
  input.addEventListener('change', () => {
    isOn.value = input.checked;
  });
  
  // Subscribe to state changes
  isOn.subscribe(() => {
    input.checked = isOn.value;
  });
  
  const slider = document.createElement('span');
  
  toggle.getElement.appendChild(input);
  toggle.getElement.appendChild(slider);
  
  return toggle;
}

export function Slider(value: State<number>, range: { min: number, max: number, step: number }): UIComponent {
  const slider = new UIComponent('input');
  const element = slider.getElement as HTMLInputElement;
  element.setAttribute('type', 'range');
  element.setAttribute('min', range.min.toString());
  element.setAttribute('max', range.max.toString());
  element.setAttribute('step', range.step.toString());
  
  slider.bind(value, (val, component) => {
    const _element = component.getElement as HTMLInputElement;
    _element.value = val.toString();
  });
  
  slider.onInput(() => {
    value.value = parseFloat(element.value);
  });
  
  return slider;
}

// TODO: Might need to make this ImageAsync that can be lazy loaded and can validate it's url.
export function Image(src: string): UIComponent {
  const image =  new UIComponent('img').style({ width: '100%', height: '100%' })
  image.getElement.setAttribute('src', src);

  return image;
}

// #endregion


// Finalé
export function mount(component: UIComponent, container: HTMLElement | string): () => void {
  const targetElement = typeof container === "string" ? document.querySelector(container) : container;

  if(!targetElement) {
    throw new Error(`Container element not found: ${container}`);
  }

  const renderedElement = component.render();
  targetElement.appendChild(renderedElement);

  return () => {
    component.dispose();
    targetElement.removeChild(renderedElement);
  }
}