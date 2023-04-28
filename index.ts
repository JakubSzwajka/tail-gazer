#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface Service {
	colorScheme: string;
	logFile: string;
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

// Build multitail command
const multitailCommand = config.services
	.map(
		(service) => `-cS ${service.colorScheme} -l "tail -f ${service.logFile}"`
	)
	.join(' ');

const command = `multitail ${multitailCommand}`;

// Execute multitail command
try {
	execSync(command, { stdio: 'inherit' });
} catch (error: any) {
	console.error('Error executing multitail command:', error.message);
}
