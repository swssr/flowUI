import { DotEdge, EdgeValue, Font, State } from ".";
import Color from "./color";

// THis shit will probably become complex in the future. I wanna also learn how signals are implemented.
// So brewing complexity - might end up moving to own submodule

export default class UIComponent<TElement = HTMLElement> {
  private element: HTMLElement;
  private styles: Record<string, any> = {};
  private styleSheet: string = "";
  private children: UIComponent[] = [];
  private useShadowDOM: boolean = false;
  private stateUnsubscribers: Array<() => void> = [];

  constructor(tagName: string = "div") {
    this.element = document.createElement(tagName);
  }

  // Clean up bro
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
      };

      this.styles[keyPropertyMap[edge]] = `${value}px`;
    }
    return this;
  }

  backgroundColor(color: Color | (string & {})): UIComponent {
    this.styles.backgroundColor = color.toString();
    return this;
  }

  foregroundColor(color: Color | (string & {})): UIComponent {
    this.styles.color = color.toString();
    return this;
  }

  font(font: Font): UIComponent {
    this.styles.font = font.toString();
    return this;
  }

  frame(options: { width?: number | string; height?: number | string; alignment?: string; } = {}): UIComponent {
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
          return `[data-component-id="${scopeId}"] ${selector.trim()} {${rest.join('{')}}`;
        })
        .join('}');

      this.element.appendChild(style);
    }


    this.children.forEach(child => this.element.appendChild(child.render()));

    return this.element;
  }
}
