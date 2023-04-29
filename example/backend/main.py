import time
import random

messages = [
    "Hello, world!",
    "Python backend is running...",
    "Processing data...",
    "Sending a request...",
    "Receiving a response...",
]


def main():
    while True:
        print(random.choice(messages))
        time.sleep(2)


if __name__ == "__main__":
    main()