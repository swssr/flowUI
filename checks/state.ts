import State from "../src/core/state";

function check(condition: boolean) {
  if (!condition) throw new Error("State regression");
}

const state = new State(1n);
const changes: Array<[bigint, bigint]> = [];
const unsubscribe = state.subscribe((value, oldValue) =>
  changes.push([value, oldValue]),
);
state.value = 2n;
state.value = 2n;
check(changes.length === 1 && changes[0][0] === 2n && changes[0][1] === 1n);
unsubscribe();
state.value = 3n;
check(changes.length === 1);

const initial = { name: "Simo" };
const object = new State(initial);
let notifications = 0;
object.subscribe(() => notifications++);
object.value = initial;
check(notifications === 0);
object.value = { ...initial };
check(notifications === 1);

const cycle: { self?: unknown } = {};
cycle.self = cycle;
const cyclic = new State(cycle);
cyclic.value = { self: cycle };
check(cyclic.value !== cycle);

const nan = new State(NaN);
nan.subscribe(() => {
  throw new Error("NaN must compare equal");
});
nan.value = NaN;

const callable = new State<() => number>(() => 1);
const replacement = () => 2;
callable.value = replacement;
check(callable.value === replacement);

const mapped = state.format((value) => `Count: ${value}`);
check(mapped.value === "Count: 3");
state.value = 4n;
check(mapped.value === "Count: 4");

console.log("State checks passed");
