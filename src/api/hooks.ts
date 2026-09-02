import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import * as achievementsApi from '@/api/achievements';
import * as catchesApi from '@/api/catches';
import * as feedApi from '@/api/feed';
import * as speciesApi from '@/api/species';
import * as usersApi from '@/api/users';
import type { Species } from '@/api/types';

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: usersApi.getMe });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id as string),
    enabled: !!id,
  });
}

export function useUserAchievements(id: string | undefined) {
  return useQuery({
    queryKey: ['user-achievements', id],
    queryFn: () => usersApi.getUserAchievements(id as string),
    enabled: !!id,
  });
}

export function useSpeciesList() {
  return useQuery({ queryKey: ['species'], queryFn: speciesApi.getSpeciesList, staleTime: 5 * 60_000 });
}

export function useSpecies(id: string | undefined) {
  return useQuery({
    queryKey: ['species', id],
    queryFn: () => speciesApi.getSpecies(id as string),
    enabled: !!id,
  });
}

export function useAchievementCatalog() {
  return useQuery({
    queryKey: ['achievements-catalog'],
    queryFn: achievementsApi.getAchievements,
    staleTime: 5 * 60_000,
  });
}

export function useSpeciesMap() {
  const { data } = useSpeciesList();
  return useMemo(() => {
    const map: Record<string, Species> = {};
    for (const species of data ?? []) map[species.id] = species;
    return map;
  }, [data]);
}

const FEED_PAGE_SIZE = 3;

export type FeedScope = 'friends' | 'mine';

export function useFeed(scope: FeedScope = 'friends') {
  return useInfiniteQuery({
    queryKey: ['feed', scope],
    queryFn: ({ pageParam }) =>
      scope === 'mine'
        ? feedApi.getMyPosts(pageParam, FEED_PAGE_SIZE)
        : feedApi.getFeed(pageParam, FEED_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < FEED_PAGE_SIZE ? undefined : allPages.length + 1,
  });
}

export function useMyCatches() {
  return useQuery({ queryKey: ['my-catches'], queryFn: catchesApi.getMyCatches });
}
