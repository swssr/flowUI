import { Button, Color, mount, Spacer, State, TextField, Text, VStack }  from "../src/index";


function CounterExample() {
    const state = new State({ count: 0 });

    return VStack(
        TextField("Hello World")
            .backgroundColor(Color.white)
            .foregroundColor(Color.black),

        Spacer(),

        Button("Click Me")
            .onTap(() => state.value.count++)
            .padding("all", 10)
            .foregroundColor(Color.white)
            .backgroundColor(Color.blue)
            .cornerRadius(6),
    )
}


function FormApp() {
    const state = new State({ name: "", email: "" });
    const submitted = new State(false);

    return VStack(
        TextField("Name")
            .onInput(event => state.value.name = event?.target?.value)
            .padding("all", 10)
            .foregroundColor(Color.black)
            .backgroundColor(Color.white)
            .cornerRadius(6),

        TextField("Email")
            .onInput(event => state.value.email = event?.target?.value)
            .padding("all", 10)
            .foregroundColor(Color.black)
            .backgroundColor(Color.white)
            .cornerRadius(6),

        Spacer(),


        Button("Submit")
            .onTap(() => {
                submitted.value = !submitted.value;
                console.log("Form data: ", state.value);
                confirm("Form data: " + JSON.stringify(state.value));
            })
            .padding("all", 10)
            .foregroundColor(Color.white)
            .backgroundColor(Color.blue)
            .cornerRadius(6),
            
            
        Text("")
            .bind(submitted, (value, component) => {
                component.text(value ? "Form submitted" : "");
            })
            .padding("top", 10)
    )

}


document.addEventListener("DOMContentLoaded", () => {
    try {
        mount(CounterExample(), "#counter-app");
        mount(FormApp(), "#counter-app");
    } catch (error) {
        console.error("Error mounting examples: ", error);
    }
})
mount(CounterExample(), "#app");