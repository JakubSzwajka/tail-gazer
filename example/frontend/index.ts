import * as process from 'process';
import { setInterval } from 'timers/promises';

const messages = [
	'Hello, world!',
	'TypeScript frontend is running...',
	'Rendering components...',
	'Fetching data...',
	'Updating state...',
];

async function printRandomMessage() {
	for await (const _ of setInterval(2000)) {
		console.log(messages[Math.floor(Math.random() * messages.length)]);
	}
}

printRandomMessage().catch((err) => {
	console.error('Error:', err);
	process.exit(1);
});
