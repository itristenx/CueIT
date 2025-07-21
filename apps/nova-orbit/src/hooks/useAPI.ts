import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketAPI, knowledgeBaseAPI, userAPI } from '@/lib/api';

export function useTickets(params: any = {}) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => {
      const token = await getToken();
      return ticketAPI.getAll(params, token!);
    },
    enabled: !!getToken,
  });
}

export function useTicket(id: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const token = await getToken();
      return ticketAPI.getById(id, token!);
    },
    enabled: !!id && !!getToken,
  });
}

export function useCreateTicket() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      return ticketAPI.create(data, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: async (variables) => {
      const token = await getToken();
      return ticketAPI.update(variables.id, variables.data, token!);
    },
    onSuccess: (_: any, variables: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAddComment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { id: string; data: any }>({
    mutationFn: async (variables) => {
      const token = await getToken();
      return ticketAPI.addComment(variables.id, variables.data, token!);
    },
    onSuccess: (_: any, variables: { id: string }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
    },
  });
}

export function useTicketStats() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const token = await getToken();
      return ticketAPI.getStats(token!);
    },
    enabled: !!getToken,
  });
}

export function useKnowledgeBase(params: any = {}) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['knowledge-base', params],
    queryFn: async () => {
      const token = await getToken();
      return knowledgeBaseAPI.getAll(params, token!);
    },
    enabled: !!getToken,
  });
}

export function useKnowledgeBaseSearch(query: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['knowledge-base-search', query],
    queryFn: async () => {
      const token = await getToken();
      return knowledgeBaseAPI.search(query, token!);
    },
    enabled: !!query && !!getToken,
  });
}

export function useKnowledgeBaseArticle(id: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['knowledge-base-article', id],
    queryFn: async () => {
      const token = await getToken();
      return knowledgeBaseAPI.getById(id, token!);
    },
    enabled: !!id && !!getToken,
  });
}

export function useUserProfile() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const token = await getToken();
      return userAPI.getProfile(token!);
    },
    enabled: !!getToken,
  });
}

export function useUpdateProfile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      return userAPI.updateProfile(data, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
