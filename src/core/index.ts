import UIComponent from "./component";
import State from "./state";

export { default as UIComponent } from "./component";
export { default as State } from "./state";
export { default as Color } from "./color";

export type EdgeValue = "top" | "bottom" | "leading" | "trailing" | "all" | "horizontal" | "vertical";
// export type DotEdge = `.${EdgeValue}`;


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


// #region Layout COmponensts 
export function VStack(...children: UIComponent[]): UIComponent {
  const stack = new UIComponent().style({ display: "flex", flexDirection: "column", height: "100%" })
  return stack.add(...children);
}

export function HStack(...children: UIComponent[]): UIComponent {
  const stack = new UIComponent().style({ display: "flex", flexDirection: "row" })
  return stack.add(...children);
}

export function ZStack(...children: UIComponent[]): UIComponent {
  const stack = new UIComponent().style({ position: "relative" })

  children.forEach((child, index) => {
    child.style({position: "absolute", inset: "0"})
  })

  return stack.add(...children);
}

export function Spacer(gap: number = 1): UIComponent {
  return new UIComponent("div").style(`:host{display: block;flex: ${gap}}`);
}

export function Divider(): UIComponent {
  return new UIComponent("hr");
}

// Basic component
export function Text(content: string): UIComponent {
  return new UIComponent("span").text(content);
}

export function Button(label: string): UIComponent {
  return new UIComponent("button")
    .text(label)
    .style(/*css*/`
      button {
        --bg: #0062CC;
        --color: #ffffff;
        cursor: pointer;
        border: none;
        color: white;
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 600;
        cursor: pointer;
        outline: none;
        border: none;
        width: 100%;
        background-color: var(--bg);

        &:hover {
          --bg:#0e6acc;
        }

        &:active {
          --bg: #004999;
        }
      }
    `)
}

export function TextField(placeholder: string = ""): UIComponent {
  const input = new UIComponent("input");
  input.setAttribute("placeholder", placeholder);
  input.setAttribute("type", "text");
  input.bind

  return input.style(/*css*/`
    input {
      padding: 8px;
      border-radius: 6px;
      border: 1px solid #c0c0c0;
      font-size: 16px;
      width: 100%;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #007AFF;
    }
    `)
}

export function Toggle(isOn: State<boolean>): UIComponent {
  const toggle = new UIComponent('label')
    .style(/*css*/`
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
    _element.value = value.toString();
  });

  slider.onInput(() => {
    value.value = parseFloat(element.value);
  });

  return slider;
}

// TODO: Might need to make this ImageAsync that can be lazy loaded and can validate it's url.
export function Image(src: string): UIComponent {
  return new UIComponent('img').style({ width: '100%', height: '100%' })
  .setAttribute('src', src);
}


export function Link(label: string, href: string): UIComponent {
  return new UIComponent('a')
    .text(label)
    .style({
      color: '#007AFF',
      textDecoration: 'none'
    })
    .setAttribute('href', href);
}

// #endregion


// Finalé
export function mount(component: UIComponent, container: HTMLElement | string): () => void {
  const targetElement = typeof container === "string" ? document.querySelector(container) : container;

  if (!targetElement) {
    throw new Error(`Container element not found: ${container}`);
  }

  const renderedElement = component.render();
  targetElement.appendChild(renderedElement);

  return () => {
    component.dispose();
    targetElement.removeChild(renderedElement);
  }
}