import ILogHandler from "./ILogHandler";
import LogLevel from "./LogLevel";


class Logger {
    private readonly minLevel: LogLevel | null;
    private readonly prefix: string;
    private readonly logTime: boolean;
    private readonly logDate: boolean;

    public constructor(prefix: string, minLevel: LogLevel | null = null, logTime: boolean = true, logDate: boolean = true) {
        this.minLevel = minLevel;
        this.prefix = prefix;
        this.logTime = logTime;
        this.logDate = logDate;
    }

    private canLog(level: LogLevel): boolean {
        if (this.minLevel == null) return true;
        return this.minLevel < level;
    }

    private doLogWithLevel(level: LogLevel, message: any): void {
        if (this.canLog(level)) this.log(level, message);
    }

    public debug(message: any): void {
        this.doLogWithLevel(LogLevel.Debug, message);
    }

    public info(message: any): void {
        this.doLogWithLevel(LogLevel.Info, message);
    }

    public notice(message: any): void {
        this.doLogWithLevel(LogLevel.Notice, message);
    }

    public warn(message: any): void {
        this.doLogWithLevel(LogLevel.Warn, message);
    }

    public error(message: any): void {
        this.doLogWithLevel(LogLevel.Error, message);
    }

    public fatal(message: any): void {
        this.doLogWithLevel(LogLevel.Fatal, message);
    }

    public log(level: LogLevel, message: any): void {
        let msg: string;
        if (typeof message === "string") {
            msg = message as string;
        }
        // warn: Cannot use nullable context on type any. Text: "message?.ToString() ?? "";"
        else if (message == null) {
            msg = "";
        }
        else {
            // warn: Cannot call toString() on type any. Text: "message.ToString();"
            msg = new String(message) as string;
        }

        Logger.handler?.log(level, msg, this.prefix, this.logDate, this.logTime);
    }

    // warn: static property may not be persistent
    public static handler: ILogHandler | null = null;
}

export default Logger;