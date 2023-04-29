Tail Gazer
Tail Gazer is a command-line tool for tailing logs of multiple services.

Installation
Install the package globally with npm:

Copy code
npm install -g tail-gazer
Usage
The tool expects a configuration file in JSON format, with an array of service objects.
Each service object should have the following properties:

name: The name of the service.
dir: The working directory for the service.
command: The command to start the service.
logFile: (optional) The file path to log service output to.
Example configuration:

json
Copy code
{
  "services": [
    {
      "name": "Frontend Service",
      "dir": "./frontend",
      "command": "npm run dev",
      "logFile": "./logs/frontend.log"
    },
    {
      "name": "Backend Service",
      "dir": "./backend",
      "command": "python app.py",
      "logFile": "./logs/backend.log"
    }
  ]
}
To run Tail Gazer, navigate to the directory containing your configuration file and run:

Copy code
tail-gazer
By default, Tail Gazer looks for a file named tail-gazer.json. You can specify a different file with the --config or -c option:

arduino
Copy code
tail-gazer --config my-tail-gazer-config.json
The tool will tail the logs of all services specified in the configuration file, printing the output to the console. The tool also creates a tail-gazer-logs directory in the current directory and saves log files there, if logFile property is provided in the configuration.

License
This project is licensed under the MIT License. See the LICENSE file for details.