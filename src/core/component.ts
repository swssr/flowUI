import { EdgeValue, Font, State } from ".";
import Color from "./color";

type EventOf<T extends HTMLElement> = T extends HTMLInputElement ? Event & { target: T } : Event;
type ValueOf<T> = T extends { value: infer V } ? V : never;

type CSSProperties = { 
  [K in keyof CSSStyleDeclaration as K extends string ? (CSSStyleDeclaration[K] extends Function ? never : K) : never]?: CSSStyleDeclaration[K]
} & Record<string, any>;

type NonEmptyCSSProperties = CSSProperties & { [key: string]: unknown };

export default class UIComponent<TElement = HTMLElement> {
  private element: HTMLElement;
  private customElement: HTMLElement;
  private styles: Record<string, any> = {};
  private styleSheet: string = "";
  private children: UIComponent[] = [];
  private stateUnsubscribers: Array<() => void> = [];
  private componentId: string;
  private styleRules: Map<string, Record<string, any>> = new Map();
  private shadowRoot: ShadowRoot | null = null;

  constructor(tagName: string = "div") {
    this.componentId = `f-${crypto.randomUUID().substring(0, 8)}`;
    
    if (!customElements.get(this.componentId)) {
      class CustomElement extends HTMLElement {
        constructor() {
          super();
        }
      }
      
      customElements.define(this.componentId, CustomElement);
    }
    
    this.customElement = document.createElement(this.componentId);
    this.element = document.createElement(tagName);
    this.shadowRoot = this.customElement.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.element);
  }

  dispose(): void {
    this.stateUnsubscribers.forEach(unsub => unsub());
    this.children.forEach(child => child.dispose());
  }

  addUnsub(func: () => void) {
    this.stateUnsubscribers.push(func);
  }

  get getElement(): HTMLElement {
    return this.element;
  }

  padding(edgeOrValue?: EdgeValue | number & {}, value?: number): UIComponent {
    if (edgeOrValue === undefined) {
      this.styles.padding = "10px";
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

  style(styles: NonEmptyCSSProperties): UIComponent;
  style(styles: string): UIComponent;

  style(styles: string | NonEmptyCSSProperties): UIComponent {
    if(typeof styles === "string") {
      this.styleSheet = styles;
    } else if(typeof styles === "object") {
      const className = this.generateClassName(`style-${Object.keys(styles).join("-")}`);
      this.styleRules.set(className, styles);
      this.element.classList.add(className);
    }

    return this;
  }

  text(content: string | number): UIComponent {
    this.element.textContent = content as string;
    return this;
  }

  html(content: string): UIComponent {
    this.element.innerHTML = content;
    return this;
  }

  setAttribute(name: string, value: string): UIComponent {
    this.element.setAttribute(name, value);
    return this;
  }

  private generateClassName(ruleName: string): string {
    return `${crypto.randomUUID().substring(0, 8)}-${ruleName}`;
  }

  add(...components: UIComponent[]): UIComponent {
    this.children.push(...components);
    return this;
  }

  onTap(handler: (e: MouseEvent) => void): UIComponent {
    this.element.addEventListener("click", handler);
    return this;
  }

  onClick(handler: (e: MouseEvent) => void): UIComponent {
    this.element.addEventListener("click", handler);
    return this;
  }

  onChange(handler: (value: any, e: Event) => void): UIComponent {
    this.element.addEventListener("change", event => {
      const element = event.target as typeof this.element & { value: any };
      handler(element?.value, event);
    });
    return this;
  }

  onInput(handler: (value: any, e: EventOf<HTMLInputElement>) => void): UIComponent {
    this.element.addEventListener("input", (event) => {
      const element = event.target as HTMLInputElement;
      handler(element.value, event as EventOf<HTMLInputElement>);
    });
    return this;
  }

  bind<T>(state: State<T>, updateFn: (value: T, component: UIComponent) => void): UIComponent {
    console.log("Initial update", state.value);
    updateFn(state.value, this);

    const unsub = state.subscribe(() => updateFn(state.value, this));
    this.stateUnsubscribers.push(unsub);

    return this;
  }

  bindTo<T>(state: State<T>): UIComponent {
    return state.to(this);
  }

  render(): HTMLElement {
    Object.assign(this.element.style, this.styles);
    
    if (this.styleRules.size > 0 || this.styleSheet) {
      const styleElement = document.createElement("style");
      let cssText = '';
      
      this.styleRules.forEach((styleObj, className) => {
        cssText += `.${className} {\n`;
        Object.entries(styleObj).forEach(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          cssText += `  ${cssProp}: ${value};\n`;
        });
        cssText += '}\n';
        
        this.element.classList.add(className);
      });
      
      if (this.styleSheet) {
        cssText += this.styleSheet;
      }
      
      styleElement.textContent = cssText;
      
      if (this.shadowRoot) {
        this.shadowRoot.insertBefore(styleElement, this.shadowRoot.firstChild);
      }
    }
    
    this.children.forEach(child => {
      const childElement = child.render();
      this.element.appendChild(childElement);
    });
    
    return this.customElement;
  }
  
  getShadowRoot(): ShadowRoot | null {
    return this.shadowRoot;
  }
}