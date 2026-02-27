import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '../store/hooks';
import { login as loginAction, register as registerAction, logout as logoutAction } from '../store/slices/authSlice';
import { LoginCredentials, RegisterData } from '../types';

export function useLogin() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => dispatch(loginAction(credentials)).unwrap(),
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (data: RegisterData) => dispatch(registerAction(data)).unwrap(),
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      dispatch(logoutAction());
      queryClient.clear();
    },
  });
}
