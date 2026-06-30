import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../store/themeSlice";

export function useTheme() {
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

  return {
    mode,
    toggleTheme: () => dispatch(toggleTheme()),
  };
}

export default useTheme;
