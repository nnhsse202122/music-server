// notice: copied from little devil!
import colors from "colors/safe";

/** The level of a log */
export type LogLevel = "none" | "debug" | "info" | "notice" | "warn" | "error";

/**
 * A logger instance : for ease of logging into the console
 */
export default class Logger {

    /** The prefix for this logger */
    public readonly prefix: string;

    /** Whether or not to log the current time */
    public readonly logTime: boolean;

    /** Whether or not to log the date */
    public readonly logDate: boolean;

    /** The log level that logs equal to or below should not be logged */
    public readonly logLevel: LogLevel;

    /**
     * Creates a new logger instance
     * @param prefix The unique prefix for this logger
     * @param logTime Whether the current time should be logged
     * @param logDate Whether the current date should be logged
     * @param logLevel The log level that logs equal to or below should not be logged
     */
    public constructor(prefix: string, logTime: boolean = false, logDate: boolean = false, logLevel: LogLevel = "debug") {
        this.prefix = prefix;
        this.logTime = logTime;
        this.logDate = logDate;
        this.logLevel = logLevel;
    }

    /**
     * Logs a message from the given log level
     * @param message The message to log
     * @param logLevel The type of log level this message is
     */
    public log(message: string, logLevel: LogLevel) {
        let _logLevels = ["debug", "info", "notice", "warn", "error"];
        let _logColors = ["green", "cyan", "brightYellow", "yellow", "red"];

        if (_logLevels.indexOf(this.logLevel) < _logLevels.indexOf(logLevel)) {
            let logMessage = "";

            if (this.logTime || this.logDate) {
                let logDateTime = "[";

                if (this.logDate) {
                    let date = new Date();
                    logDateTime += `${date.getMonth() + 1}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear()} `;
                }
                if (this.logTime) {
                    let time = new Date();
                    let prefix = "AM";

                    let hours = time.getHours();

                    if (hours > 11) {
                        hours -= 12;
                        prefix = "PM";
                    }

                    if (hours === 0) {
                        hours = 12;
                    }

                    logDateTime += `${hours.toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")} ${prefix}`;
                }

                logDateTime = logDateTime.trim();
                logDateTime += "] ";

                logMessage += colors.gray(logDateTime);
            }

            // @ts-ignore
            logMessage += colors[_logColors[_logLevels.indexOf(logLevel)]](`[${this.prefix}/${logLevel[0].toUpperCase()}${logLevel.substring(1).toLowerCase()}] `);

            logMessage += message;

            console.log(logMessage);
        }
    }

    /**
     * Logs a debug message
     * 
     * @param message The message to log
     */
    public debug(message: string) {
        this.log(message, "debug");
    }

    /**
     * Logs an info message
     * 
     * @param message The message to log
     */
    public info(message: string) {
        this.log(message, "info");
    }

    /**
     * Logs a notice message
     * 
     * @param message The message to log
     */
    public notice(message: string) {
        this.log(message, "notice");
    }

    /**
     * Logs a warning message
     * 
     * @param message The message to log
     */
    public warn(message: string) {
        this.log(message, "warn");
    }

    /**
     * Logs an error message
     * 
     * @param message The message to log
     */
    public error(message: string) {
        this.log(message, "error");
    }
}