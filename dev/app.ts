import { Divider } from "../src/core";
import { Button, Color, mount, Spacer, State, TextField, Text, VStack, HStack, Toggle } from "../src/index";


function CounterExample() {
    const counter = new State(0);

    const CountButton = (label: string) => Button(label)
        .padding("all", 10)
        .foregroundColor(Color.white)
        .backgroundColor(Color.blue)
        .frame({ width: "max-content" })
        .cornerRadius(6)

    return HStack(
        CountButton("-")
            .onTap(() => counter.value--),

        Text("Count")
            .foregroundColor(Color.red)
            .bindTo(counter),

        CountButton("+")
            .onTap(() => counter.value++),

        Divider(),

        HStack(
            counter
            .format(x => `Hello, the count is: ${x}`)
            .to(Text("")),
        )
        .padding(10)
        .border(1, Color.black.opacity(.1))
    )
    .frame({ width: "100%" })
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
            .cornerRadius(6),
    )
    .padding("horizontal", 20)

}


mount(CounterExample(), "#counter-app");
mount(FormApp(), "#form-app");