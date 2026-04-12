import type { EdgeValue, Font, State } from ".";
import type Color from "./color";

export type CSSProperties = {
  [
    K in keyof CSSStyleDeclaration as CSSStyleDeclaration[K] extends string
      ? K
      : never
  ]?: string;
} & Record<string, string | number | undefined>;

type BindingSetter =
  | "text"
  | "html"
  | "style"
  | "backgroundColor"
  | "foregroundColor"
  | "font"
  | "cornerRadius"
  | "frame"
  | "padding";

export type BindingProperty<T> = {
  [K in BindingSetter]: T extends Parameters<UIComponent[K]>[0] ? K : never;
}[BindingSetter];

export default class UIComponent {
  private element: HTMLElement;
  private customElement: HTMLElement;
  private styleElement: HTMLStyleElement;
  private children: UIComponent[] = [];
  private stateUnsubscribers: Array<() => void> = [];
  private shadowRoot: ShadowRoot;

  constructor(tagName: string = "div") {
    if (!customElements.get("flow-ui")) {
      customElements.define("flow-ui", class extends HTMLElement {});
    }

    this.customElement = document.createElement("flow-ui");
    this.element = document.createElement(tagName);
    this.shadowRoot = this.customElement.attachShadow({ mode: "open" });
    this.styleElement = document.createElement("style");
    this.shadowRoot.append(this.styleElement, this.element);
  }

  dispose(): void {
    this.stateUnsubscribers.forEach((unsub) => unsub());
    this.children.forEach((child) => child.dispose());
    this.stateUnsubscribers = [];
  }

  addUnsub(func: () => void) {
    this.stateUnsubscribers.push(func);
  }

  get getElement(): HTMLElement {
    return this.element;
  }

  padding(edgeOrValue?: EdgeValue | number, value?: number): UIComponent {
    if (edgeOrValue === undefined) {
      this.element.style.padding = "10px";
    } else if (typeof edgeOrValue === "number") {
      this.element.style.padding = `${edgeOrValue}px`;
    } else {
      const keyPropertyMap = {
        top: "padding-top",
        bottom: "padding-bottom",
        leading: "padding-left",
        trailing: "padding-right",
        all: "padding",
        horizontal: "padding-inline",
        vertical: "padding-block",
      };

      this.element.style.setProperty(
        keyPropertyMap[edgeOrValue],
        `${value ?? 10}px`,
      );
    }
    return this;
  }

  backgroundColor(color: Color | string): UIComponent {
    this.element.style.backgroundColor = color.toString();
    return this;
  }

  foregroundColor(color: Color | string): UIComponent {
    this.element.style.color = color.toString();
    return this;
  }

  font(font: Font): UIComponent {
    this.element.style.font = font.toString();
    return this;
  }

  frame(
    options: {
      width?: number | string;
      height?: number | string;
      alignment?: string;
    } = {},
  ): UIComponent {
    if (options.width) {
      this.element.style.width =
        typeof options.width === "number"
          ? `${options.width}px`
          : options.width;
    }

    if (options.height) {
      this.element.style.height =
        typeof options.height === "number"
          ? `${options.height}px`
          : options.height;
    }

    if (options.alignment) {
      this.element.style.margin = "auto";
    }

    return this;
  }

  cornerRadius(radius: number): UIComponent {
    this.element.style.borderRadius = `${radius}px`;
    return this;
  }

  border(width: number, color: Color | string): UIComponent {
    this.element.style.border = `${width}px solid ${color.toString()}`;
    return this;
  }

  style(styles: string | CSSProperties): UIComponent {
    if (typeof styles === "string") {
      this.styleElement.textContent = styles;
      return this;
    }

    for (const [property, value] of Object.entries(styles)) {
      if (value === undefined) continue;
      if (property.includes("-")) {
        this.element.style.setProperty(property, String(value));
      } else {
        Object.assign(this.element.style, { [property]: value });
      }
    }
    return this;
  }

  text(content: string | number): UIComponent {
    this.element.textContent = String(content);
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

  add(...components: UIComponent[]): UIComponent {
    this.children.push(...components);
    return this;
  }

  onTap(handler: (e: MouseEvent) => void): UIComponent {
    this.element.addEventListener("click", handler);
    return this;
  }

  onClick(handler: (e: MouseEvent) => void): UIComponent {
    return this.onTap(handler);
  }

  onChange(handler: (value: string, e: Event) => void): UIComponent {
    this.element.addEventListener("change", (event) => {
      const element = this.element as HTMLInputElement;
      handler(element.value, event);
    });
    return this;
  }

  onInput(handler: (value: string, e: Event) => void): UIComponent {
    this.element.addEventListener("input", (event) => {
      const element = this.element as HTMLInputElement;
      handler(element.value, event);
    });
    return this;
  }

  bind<T>(
    state: State<T>,
    updateFn: (value: T, component: UIComponent) => void,
  ): UIComponent {
    updateFn(state.value, this);

    const unsub = state.subscribe(() => updateFn(state.value, this));
    this.stateUnsubscribers.push(unsub);

    return this;
  }

  to<T>(state: State<T>): UIComponent {
    return state.to(this);
  }

  render(): HTMLElement {
    this.children.forEach((child) => {
      const childElement = child.render();
      this.element.appendChild(childElement);
    });

    return this.customElement;
  }

  getShadowRoot(): ShadowRoot {
    return this.shadowRoot;
  }
}
