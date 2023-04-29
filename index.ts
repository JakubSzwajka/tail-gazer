#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import * as kleur from 'kleur';

interface Service {
	name: string;
	dir: string;
	command: string;
	logFile?: string;
}

// Read configuration file
const configFile = path.resolve(process.cwd(), 'tail-gazer.json');
if (!fs.existsSync(configFile)) {
	console.error('Error: tail-gazer.json not found in the current directory');
	process.exit(1);
}

const config: { services: Service[] } = JSON.parse(
	fs.readFileSync(configFile, 'utf-8')
);

const maxLength = config.services.reduce(
	(max, service) => Math.max(max, service.name.length),
	0
);

function getRandomColor(): (text: string) => string {
	const colors = [
		kleur.green,
		kleur.yellow,
		kleur.blue,
		kleur.magenta,
		kleur.cyan,
	];

	const randomIndex = Math.floor(Math.random() * colors.length);
	return colors[randomIndex];
}

const printLogLine = (
	serviceName: string,
	line: string,
	colorize: any,
	isError = false
) => {
	const timestamp = new Date().toLocaleTimeString([], {
		hour12: false,
		timeZoneName: undefined,
	});
	const logPrefix = colorize(`${timestamp} ${serviceName}`);
	const logFunc = isError ? console.error : console.log;
	logFunc(`${logPrefix}  ${line}`);
};

const logsDir = path.join(process.cwd(), 'tail-gazer-logs');
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir);
}

const startService = (service: Service) => {
	const [command, ...args] = service.command.split(' ');
	const options = {
		cwd: path.join(process.cwd(), service.dir),
		env: { ...process.env, PYTHONUNBUFFERED: '1' },
	};

	const child = spawn(command, args, options);

	if (service.logFile) {
		service.logFile = path.join(
			logsDir,
			`${service.name.replace(/ /g, '_')}.log`
		);
		const logStream = fs.createWriteStream(service.logFile, { flags: 'a' });
		child.stdout.pipe(logStream);
		child.stderr.pipe(logStream);
	}

	const colorize = getRandomColor();
	const serviceName = service.name.padEnd(maxLength + 1);

	child.stdout.on('data', (data: Buffer) => {
		const lines = data
			.toString()
			.split('\n')
			.filter((line) => line.trim() !== '');
		lines.forEach((line) => printLogLine(serviceName, line, colorize));
	});

	child.stderr.on('data', (data: Buffer) => {
		const lines = data
			.toString()
			.split('\n')
			.filter((line) => line.trim() !== '');
		lines.forEach((line) => printLogLine(serviceName, line, colorize, true));
	});

	child.on('error', (error) => {
		console.error(`Error starting "${service.name}":`, error.message);
	});

	console.log(`Started "${service.name}"`);
};

config.services.forEach(startService);
