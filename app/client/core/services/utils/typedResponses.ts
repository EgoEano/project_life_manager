export type OperationResult<T = unknown> = {
    success: boolean;
    data?: T | null;
    message?: string | null;
    code?: number | null;
    errors?: string[] | null;
};

export function createOperationResult<T = unknown>({
    success,
    data = null,
    message = null,
    code = null,
    errors = null,
}: OperationResult<T>) {
    return {
        success,
        data,
        message,
        code,
        errors: Array.isArray(errors) ? errors : errors ? [errors] : [],
    };
}
