// Loads a list of tasks and keeps loading / error / meta state.
// Call refetch() to load again. refetch(true) is "silent": no loading spinner.
import { useCallback, useEffect, useRef, useState } from 'react';
import { getTasks } from '../api/taskApi';

export default function useTasks(params) {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  // params is an object, so we compare it as text to avoid useless reloads
  const paramsKey = JSON.stringify(params);

  const load = useCallback(
    async (silent = false) => {
      const requestId = ++latestRequest.current;
      if (!silent) setLoading(true);
      setError('');
      try {
        const result = await getTasks(JSON.parse(paramsKey));
        if (requestId !== latestRequest.current) return; // an older request, ignore
        setTasks(result.data);
        setMeta(result.meta);
      } catch (err) {
        if (requestId !== latestRequest.current) return;
        setError(err.message);
      } finally {
        if (requestId === latestRequest.current) setLoading(false);
      }
    },
    [paramsKey]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { tasks, setTasks, meta, loading, error, refetch: load };
}
