import { logError } from './loggerService';

export default function customFormatDate(
    date: Date,
    format: string = 'yyyy.MM.dd HH:mm:ss GMT',
): string {
    let dt: Date;
    try {
        switch (true) {
            case date instanceof Date && !isNaN(date.getTime()):
                dt = date;
                break;
            case typeof date === 'string':
                dt = new Date(/^-?\d+$/.test(date) ? Number(date) : date);
                break;
            default:
                logError(
                    "In 'customFormatDate()' method, only the date format, date as string or milliseconds is accepted as the first parameter",
                );
                return '';
        }

        if (isNaN(dt.getTime())) {
            logError('Invalid date value');
            return '';
        }

        var offset = dt.getTimezoneOffset();
        var offsetHr = Math.floor(Math.abs(offset) / 60)
            .toString()
            .padStart(2, '0');
        var offsetMn = (Math.abs(offset) % 60).toString().padStart(2, '0');
        var offsetSign = offset < 0 ? '+' : '-';

        return format.replace(
            /yyyy|yy|MMMM|MMM|MM|dd|HH|mm|ss|GMT|ZZZZ|ZZ/g,
            (match: string) => {
                switch (match) {
                    case 'yyyy':
                        return String(dt.getFullYear());
                    case 'yy':
                        return String(dt.getFullYear()).slice(-2);
                    case 'MMMM':
                        return String(
                            dt.toLocaleString('default', { month: 'long' }),
                        );
                    case 'MMM':
                        return String(
                            dt.toLocaleString('default', { month: 'short' }),
                        );
                    case 'MM':
                        return String(dt.getMonth() + 1).padStart(2, '0');
                    case 'dd':
                        return String(dt.getDate()).padStart(2, '0');
                    case 'HH':
                        return String(dt.getHours()).padStart(2, '0');
                    case 'mm':
                        return String(dt.getMinutes()).padStart(2, '0');
                    case 'ss':
                        return String(dt.getSeconds()).padStart(2, '0');
                    case 'GMT':
                        return `GMT${offsetSign}${offsetHr}:${offsetMn}`;
                    case 'ZZZZ':
                        return `${offsetSign}${offsetHr}${offsetMn}`;
                    case 'ZZ':
                        return `${offsetSign}${offsetHr}`;
                    default:
                        return match; // На случай, если что-то забудем
                }
            },
        );
    } catch (ex: unknown) {
        logError("There was an error in the 'customFormatDate()' method", ex);
        return '!!!';
    }
}
