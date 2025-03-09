import UIComponent from "./component";

export type SubCallback<T> = (newValue: T, oldValue: T) => void;

export default class State<T> {
  // Use #<?> on the next version
  private _value: T;
  private subscribers: Set<SubCallback<T>> = new Set();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (!this.isSame(this._value, newValue)) {
      const oldValue = this._value;
      this._value = newValue;
      this.notifySubscribers(newValue, oldValue);
    }
  }

  subscribe(callback: SubCallback<T>): () => void {
    this.subscribers.add(callback);
    // clean up
    return () => this.subscribers.delete(callback);
  }

  map<R>(mapFn: (value: T) => R): MappedState<T, R> {
    return new MappedState(this, mapFn);
  }

  format(formatter: (value: T) => string): MappedState<T, string> {
    return this.map(formatter);
  }

  asStyle<K extends keyof CSSStyleDeclaration>(property: K): MappedState<T, Record<string, any>> {
    return this.map(value => {
      return { [property]: value };
    });
  }

  asCssVar(variableName: string): MappedState<T, Record<string, any>> {
    return this.map(value => {
      return { [`--${variableName}`]: value };
    });
  }

  effect(effectFn: (value: T) => void): () => void {
    effectFn(this.value);
    return this.subscribe((newValue) => effectFn(newValue));
  }

  // Direct binding to component
  to(component: UIComponent, property?: keyof UIComponent): UIComponent {
    if (property) {
      // Explicit property binding
      const setter = component[property] as unknown as (value: T) => UIComponent;
      if (typeof setter === 'function') {
        // Initial update
        setter.call(component, this.value);
        
        // Subscribe to changes
        const unsub = this.subscribe((newValue) => {
          setter.call(component, newValue);
        });
        
        component.addUnsub(unsub);
      }
    } else {
      // Auto binding based on type
      this.bindAuto(component);
    }
    
    return component;
  }
  
  private bindAuto(component: UIComponent): void {
    // For string states
    if (typeof this.value === 'string') {
      if (component.getElement instanceof HTMLInputElement || 
          component.getElement instanceof HTMLTextAreaElement) {
        // Two-way binding for text inputs
        (component.getElement as HTMLInputElement).value = this.value;
        
        const inputHandler = (e: Event) => {
          this.value = (e.target as HTMLInputElement).value as unknown as T;
        };
        
        component.getElement.addEventListener('input', inputHandler);
        component.addUnsub(() => {
          component.getElement.removeEventListener('input', inputHandler);
        });
        
        const unsub = this.subscribe((newValue) => {
          (component.getElement as HTMLInputElement).value = newValue as string;
        });
        
        component.addUnsub(unsub);
      } else {
        // Text content for other elements
        component.text(this.value);
        
        const unsub = this.subscribe((newValue) => {
          component.text(newValue as string);
        });
        
        component.addUnsub(unsub);
      }
    }
    // For boolean states
    else if (typeof this.value === 'boolean') {
      if (component.getElement instanceof HTMLInputElement && 
          component.getElement.type === 'checkbox') {
        // Two-way binding for checkboxes
        (component.getElement as HTMLInputElement).checked = this.value;
        
        const changeHandler = (e: Event) => {
          this.value = (e.target as HTMLInputElement).checked as unknown as T;
        };
        
        component.getElement.addEventListener('change', changeHandler);
        component.addUnsub(() => {
          component.getElement.removeEventListener('change', changeHandler);
        });
        
        const unsub = this.subscribe((newValue) => {
          (component.getElement as HTMLInputElement).checked = newValue as boolean;
        });
        
        component.addUnsub(unsub);
      } else {
        // Visibility toggle for other elements
        component.style({ display: this.value ? '' : 'none' });
        
        const unsub = this.subscribe((newValue) => {
          component.style({ display: newValue ? '' : 'none' });
        });
        
        component.addUnsub(unsub);
      }
    }
    // For number states
    else if (typeof this.value === 'number') {
      if (component.getElement instanceof HTMLInputElement &&
          (component.getElement.type === 'number' || component.getElement.type === 'range')) {
        // Two-way binding for numeric inputs
        (component.getElement as HTMLInputElement).value = String(this.value);
        
        const inputHandler = (e: Event) => {
          const value = parseFloat((e.target as HTMLInputElement).value);
          this.value = (isNaN(value) ? 0 : value) as unknown as T;
        };
        
        component.getElement.addEventListener('input', inputHandler);
        component.addUnsub(() => {
          component.getElement.removeEventListener('input', inputHandler);
        });
        
        const unsub = this.subscribe((newValue) => {
          (component.getElement as HTMLInputElement).value = String(newValue);
        });
        
        component.addUnsub(unsub);
      } else {
        // Text content for other elements
        component.text(String(this.value));
        
        const unsub = this.subscribe((newValue) => {
          component.text(String(newValue));
        });
        
        component.addUnsub(unsub);
      }
    }
    // For object states
    else if (typeof this.value === 'object') {
      // Default to JSON string
      component.text(JSON.stringify(this.value));
      
      const unsub = this.subscribe((newValue) => {
        component.text(JSON.stringify(newValue));
      });
      
      component.addUnsub(unsub);
    }
    // Fallback for other types
    else {
      component.text(String(this.value));
      
      const unsub = this.subscribe((newValue) => {
        component.text(String(newValue));
      });
      
      component.addUnsub(unsub);
    }
  }

  private notifySubscribers(newValue: T, oldValue: T): void {
    this.subscribers.forEach(callback => callback(newValue, oldValue));
  }

  // Move to utils
  isSame(value1: any, value2: any): boolean {
    return JSON.stringify(value1) === JSON.stringify(value2);
  }
}

export class MappedState<T, R> {
  private sourceState: State<T>;
  private transformFn: (value: T) => R;

  constructor(sourceState: State<T>, transformFn: (value: T) => R) {
    this.sourceState = sourceState;
    this.transformFn = transformFn;
  }

  get value(): R {
    return this.transformFn(this.sourceState.value);
  }

  to(component: UIComponent, property?: keyof UIComponent): UIComponent {
    const update = (value: T) => {
      const transformed = this.transformFn(value);
      
      if (property) {
        const setter = component[property] as unknown as (value: R) => UIComponent;
        if (typeof setter === "function") {
          setter.call(component, transformed);
        }
      } else if (typeof transformed === "string") {
        component.text(transformed);
      } else if (typeof transformed === "object") {
        component.style(transformed as Record<string, any>);
      } else if (typeof transformed === "boolean") {
        component.style({ display: transformed ? "" : "none" });
      } else {
        component.text(String(transformed));
      }
    };
    
    // Initial update
    update(this.sourceState.value);
    
    // Subscribe to changes
    const unsub = this.sourceState.subscribe((newValue) => update(newValue));
    component.addUnsub(unsub);
    
    return component;
  }
}