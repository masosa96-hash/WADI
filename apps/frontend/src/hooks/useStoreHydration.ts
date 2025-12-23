import { useEffect, useState } from "react";
import { useChatStore } from "../store/chatStore";

export const useStoreHydration = () => {
  const [hydrated, setHydrated] = useState(() => {
    return useChatStore.persist.hasHydrated();
  });

  useEffect(() => {
    const unsub = useChatStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useChatStore.persist.hasHydrated() && !hydrated) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setHydrated(true);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [hydrated]);

  return hydrated;
};
