#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const kleur = __importStar(require("kleur"));
const commander_1 = require("commander");
const loadConfig = (options) => {
    const configFile = path_1.default.resolve(process.cwd(), options.config);
    if (!fs_1.default.existsSync(configFile)) {
        console.error('Error: tail-gazer.json not found in the current directory');
        process.exit(1);
    }
    const config = JSON.parse(fs_1.default.readFileSync(configFile, 'utf-8'));
    return config;
};
const getRandomColor = () => {
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
const printLogLine = (serviceName, line, colorize, isError = false) => {
    const timestamp = new Date().toLocaleTimeString([], {
        hour12: false,
        timeZoneName: undefined,
    });
    const logPrefix = colorize(`${timestamp} ${serviceName}`);
    const logFunc = isError ? console.error : console.log;
    logFunc(`${logPrefix}  ${line}`);
};
const startService = (service, startServiceOptions) => {
    const [command, ...args] = service.command.split(' ');
    const options = {
        cwd: path_1.default.join(process.cwd(), service.dir),
        env: Object.assign(Object.assign({}, process.env), { PYTHONUNBUFFERED: '1' }),
    };
    const child = (0, child_process_1.spawn)(command, args, options);
    if (service.logFile) {
        service.logFile = path_1.default.join(startServiceOptions.logsDir, `${service.name.replace(/ /g, '_')}.log`);
        const logStream = fs_1.default.createWriteStream(service.logFile, { flags: 'a' });
        child.stdout.pipe(logStream);
        child.stderr.pipe(logStream);
    }
    const colorize = getRandomColor();
    const serviceName = service.name.padEnd(startServiceOptions.serviceColumnWidth);
    child.stdout.on('data', (data) => {
        const lines = data
            .toString()
            .split('\n')
            .filter((line) => line.trim() !== '');
        lines.forEach((line) => printLogLine(serviceName, line, colorize));
    });
    child.stderr.on('data', (data) => {
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
    const program = new commander_1.Command();
    program
        .version('0.1')
        .description('Tail logs of multiple services')
        .option('-c, --config <path>', 'Path to config file', 'tail-gazer.json');
    program.parse(process.argv);
    const config = loadConfig(program.opts());
    const maxLength = config.services.reduce((max, service) => Math.max(max, service.name.length), 0);
    const logsDir = path_1.default.join(process.cwd(), 'tail-gazer-logs');
    if (!fs_1.default.existsSync(logsDir)) {
        fs_1.default.mkdirSync(logsDir);
    }
    const startServiceOptions = {
        logsDir,
        serviceColumnWidth: maxLength + 1,
    };
    config.services.forEach((service) => {
        startService(service, startServiceOptions);
    });
};
main();
