import { useDispatch, useSelector } from 'react-redux';

// Plain JS re-exports kept in one place so components import hooks from
// here rather than 'react-redux' directly (mirrors the typed-hooks pattern
// used in TypeScript RTK projects).
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
