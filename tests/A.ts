class A {
	scream: () => void = console.log.bind(console, "SCREAM");
	shout: () => void = console.log.bind(console, "SHOUT");

	private counter: number = 0;

	count() {
		return this.counter++;
	}

	constructor() {
		this.shout = this.shout.bind(console, "!");
	}
}

var myA = new A();

while (myA.count() < 10) {
	myA.scream();
	console.log("&");
	myA.shout();
}