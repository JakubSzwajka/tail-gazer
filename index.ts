#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import * as kleur from 'kleur';
import { Command } from 'commander';

interface Service {
	name: string;
	dir: string;
	command: string;
	logFile?: string;
}

interface ServiceOptions {
	logsDir: string;
	serviceColumnWidth: number;
}

interface ProgramConfig {
	config: string;
}

const loadConfig = (options: ProgramConfig) => {
	const configFile = path.resolve(process.cwd(), options.config);
	if (!fs.existsSync(configFile)) {
		console.error('Error: tail-gazer.json not found in the current directory');
		process.exit(1);
	}

	const config: { services: Service[] } = JSON.parse(
		fs.readFileSync(configFile, 'utf-8')
	);

	return config;
};

const getRandomColor = (): CallableFunction => {
	const colors = [
		kleur.green,
		kleur.yellow,
		kleur.blue,
		kleur.magenta,
		kleur.cyan,
	];

	const randomIndex = Math.floor(Math.random() * colors.length);
	return colors[randomIndex];
};

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

const startService = (
	service: Service,
	startServiceOptions: ServiceOptions
) => {
	const [command, ...args] = service.command.split(' ');
	const options = {
		cwd: path.join(process.cwd(), service.dir),
		env: { ...process.env, PYTHONUNBUFFERED: '1' },
	};

	const child = spawn(command, args, options);

	if (service.logFile) {
		service.logFile = path.join(
			startServiceOptions.logsDir,
			`${service.name.replace(/ /g, '_')}.log`
		);
		const logStream = fs.createWriteStream(service.logFile, { flags: 'a' });
		child.stdout.pipe(logStream);
		child.stderr.pipe(logStream);
	}

	const colorize = getRandomColor();
	const serviceName = service.name.padEnd(
		startServiceOptions.serviceColumnWidth
	);

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

const main = () => {
	const program = new Command();

	program
		.version('0.1')
		.description('Tail logs of multiple services')
		.option('-c, --config <path>', 'Path to config file', 'tail-gazer.json');

	program.parse(process.argv);
	const config = loadConfig(program.opts<ProgramConfig>());

	const maxLength = config.services.reduce(
		(max, service) => Math.max(max, service.name.length),
		0
	);

	const logsDir = path.join(process.cwd(), 'tail-gazer-logs');
	if (!fs.existsSync(logsDir)) {
		fs.mkdirSync(logsDir);
	}

	const startServiceOptions: ServiceOptions = {
		logsDir,
		serviceColumnWidth: maxLength + 1,
	};

	config.services.forEach((service) => {
		startService(service, startServiceOptions);
	});
};

main();
