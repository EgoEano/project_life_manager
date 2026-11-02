import { useState, useEffect } from 'react';
import DatabaseLocal from '../storage/dbAdapter';

export function useDbReady() {
    const [isReady, setIsReady] = useState(() => DatabaseLocal.isReady());

    useEffect(() => {
        if (isReady) return;

        const interval = setInterval(() => {
            if (DatabaseLocal.isReady()) {
                setIsReady(true);
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isReady]);

    return isReady;
}
