import Logger from "./Logger";

class GlobalLogger {
    private constructor() {
        throw new Error("Static classes cannot be instantiated");
    }

    // warn: static property may not be persistent
    private static logger: Logger = new Logger("GLOBAL");

    public static debug(message: any): void {
        this.logger.debug(message);
    }

    public static info(message: any): void {
        this.logger.info(message);
    }

    public static notice(message: any): void {
        this.logger.notice(message);
    }

    public static warn(message: any): void {
        this.logger.warn(message);
    }

    public static error(message: any): void {
        this.logger.error(message);
    }

    public static fatal(message: any): void {
        this.logger.fatal(message);
    }
}

export default GlobalLogger;