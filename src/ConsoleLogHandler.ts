import ILogHandler from "./util/logging/ILogHandler";
import LogLevel from "./util/logging/LogLevel";

let colors = [
    32, // Debug = Dark Green
    36, // Info = Dark Cyan
    93, // Notice = Bright Yellow
    33, // Warn = Dark Yellow
    91, // Error = Bright Red
    31, // Fatal = Dark Red
];

class ConsoleLogHandler implements ILogHandler {
    public log(level: LogLevel, message: string, prefix: string, logDate: boolean, logTime: boolean): void
    {
        let logBuilder = "";

        if (logDate || logTime) {
            let time = new Date();

            logBuilder += "\u001b[90m";
            logBuilder += '[';

            if (logDate) {
                let month = time.getMonth() + 1;
                let day = time.getDate();
                let year = time.getFullYear();

                logBuilder += `${month}/${day.toString().padStart(2, '0')}/${year.toString().padStart(4, '0')}`;

                if (logTime)
                    logBuilder += ' ';
            }

            if (logTime) {
                let hour = time.getHours();
                let minute = time.getMinutes();
                let second = time.getSeconds();

                let pm = false;
                if (hour > 11) {
                    hour -= 12;
                    pm = true;
                }

                if (hour == 0) hour = 12;

                logBuilder += `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')} ${(pm ? "PM" : "AM")}`;
            }

            logBuilder += ']';
            logBuilder += "\u001b[39m";
            logBuilder += ' ';
        }

        let color = (<number>level);
        let hasColor = true;
        if (color < 0 || color >= colors.length) {
            hasColor = false;
            color = 0;
        }
        else {
            color = colors[color];
        }

        if (hasColor) {
            logBuilder += "\u001b[" + color + "m";
        }

        logBuilder += `[${prefix}/${LogLevel[level]}] `;

        if (hasColor) {
            logBuilder += "\u001b[39m";
        }

        logBuilder += message;

        let msg = logBuilder.toString();

        console.log(msg);
    }
}

export default ConsoleLogHandler;