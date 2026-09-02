import { useCallback, useEffect, useState } from 'react';

import { onboardingStorage } from '@/utils/storage';

// Controla a flag "já viu o onboarding" (persistida). Usado por app/index.tsx
// para decidir a rota inicial e por app/(auth)/onboarding.tsx ao concluir.
export function useOnboarding() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    onboardingStorage.hasSeen().then(setSeen);
  }, []);

  const complete = useCallback(async () => {
    await onboardingStorage.markSeen();
    setSeen(true);
  }, []);

  return { isLoading: seen === null, seen: seen ?? false, complete };
}
