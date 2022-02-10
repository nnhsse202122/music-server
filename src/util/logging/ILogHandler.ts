import LogLevel from "./LogLevel";

interface ILogHandler {
    log(level: LogLevel, message: string, prefix: string, logDate: boolean, logTime: boolean): void;
}

export default ILogHandler;