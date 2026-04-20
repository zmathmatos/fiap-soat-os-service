class Logger {
  static log(message: string): void {
    if (process.env.NODE_ENV !== "test") {
      console.log(message);
    }
  }
}

export default Logger;
