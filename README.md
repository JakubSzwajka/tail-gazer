# TailGazer

TailGazer is a command-line tool that uses `multitail` to display logs from multiple services in a single terminal window. TailGazer allows you to define service configurations in a JSON file, making it easy to monitor logs for multiple projects.

## Installation

1. Ensure that Node.js and npm are installed on your machine.
2. Install `multitail` using your package manager. For example, on macOS, you can use Homebrew:

```bash
brew install multitail
```

3. Install TailGazer globally:
```
npm install -g tail-gazer
```

## Usage

1. Navigate to your project directory.
2. Create a tail-gazer.json file in the project directory with the following structure:

```json
{
  "services": [
    {
      "colorScheme": "python",
      "logFile": "backend.log"
    },
    {
      "colorScheme": "javascript",
      "logFile": "frontend.log"
    }
  ]
}
```

Replace the colorScheme and logFile values with the appropriate values for your project.

3. Run tail-gazer

```
tail-gazer
```


TailGazer will use the tail-gazer.json file to display logs from the specified services in a single terminal window with the defined color schemes.