import type UIComponent from "./component";
import type { BindingProperty, CSSProperties } from "./component";

export type SubCallback<T> = (newValue: T, oldValue: T) => void;

export default class State<T> {
  private _value: T;
  private subscribers = new Set<SubCallback<T>>();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (this.isSame(this._value, newValue)) return;
    const oldValue = this._value;
    this._value = newValue;
    this.subscribers.forEach((callback) => callback(newValue, oldValue));
  }

  subscribe(callback: SubCallback<T>): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  map<R>(mapFn: (value: T) => R): MappedState<T, R> {
    return new MappedState(this, mapFn);
  }

  format(formatter: (value: T) => string): MappedState<T, string> {
    return this.map(formatter);
  }

  asStyle(property: string): MappedState<T, Record<string, T>> {
    return this.map((value) => ({ [property]: value }));
  }

  asCssVar(variableName: string): MappedState<T, Record<string, T>> {
    return this.asStyle(`--${variableName}`);
  }

  effect(effectFn: (value: T) => void): () => void {
    effectFn(this.value);
    return this.subscribe((newValue) => effectFn(newValue));
  }

  to(component: UIComponent, property?: BindingProperty<T>): UIComponent {
    if (property) {
      const setter = component[property] as (value: T) => UIComponent;
      return component.bind(this, (value) => setter.call(component, value));
    }

    const element = component.getElement;
    let update: (value: T) => void;
    let read: (() => T) | undefined;
    let event = "input";

    if (
      typeof this.value === "string" &&
      (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement)
    ) {
      update = (value) => {
        element.value = String(value);
      };
      read = () => element.value as T;
    } else if (
      typeof this.value === "boolean" &&
      element instanceof HTMLInputElement &&
      element.type === "checkbox"
    ) {
      update = (value) => {
        element.checked = Boolean(value);
      };
      read = () => element.checked as T;
      event = "change";
    } else if (
      typeof this.value === "number" &&
      element instanceof HTMLInputElement &&
      ["number", "range"].includes(element.type)
    ) {
      update = (value) => {
        element.value = String(value);
      };
      read = () => {
        const value = parseFloat(element.value);
        return (Number.isNaN(value) ? 0 : value) as T;
      };
    } else if (typeof this.value === "boolean") {
      const display = element.style.display;
      update = (value) => {
        component.style({ display: value ? display : "none" });
      };
    } else if (typeof this.value === "object") {
      update = (value) => {
        component.text(JSON.stringify(value));
      };
    } else {
      update = (value) => {
        component.text(String(value));
      };
    }

    if (read) {
      const readValue = read;
      const handler = () => {
        this.value = readValue();
      };
      element.addEventListener(event, handler);
      component.addUnsub(() => element.removeEventListener(event, handler));
    }
    return component.bind(this, update);
  }

  isSame(value1: T, value2: T): boolean {
    return Object.is(value1, value2);
  }
}

export class MappedState<T, R> {
  constructor(
    private sourceState: State<T>,
    private transformFn: (value: T) => R,
  ) {}

  get value(): R {
    return this.transformFn(this.sourceState.value);
  }

  to(component: UIComponent, property?: BindingProperty<R>): UIComponent {
    const setter = property
      ? (component[property] as (value: R) => UIComponent)
      : undefined;
    const display = component.getElement.style.display;
    return component.bind(this.sourceState, (value) => {
      const transformed = this.transformFn(value);
      if (setter) {
        setter.call(component, transformed);
      } else if (typeof transformed === "object" && transformed !== null) {
        component.style(transformed as CSSProperties);
      } else if (typeof transformed === "boolean") {
        component.style({ display: transformed ? display : "none" });
      } else {
        component.text(String(transformed));
      }
    });
  }
}
