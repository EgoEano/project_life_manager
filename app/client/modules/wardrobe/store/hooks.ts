import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../stores'; // путь к вашему store.ts

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector);
