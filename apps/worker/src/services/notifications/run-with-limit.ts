/**
 * Executes a list of asynchronous tasks with a limit on how many run concurrently.
 *
 * @param tasks - The list of asynchronous tasks to execute.
 * @param limit - Maximum number of tasks running at the same time.
 * @returns The results of all tasks in input order.
 */
export async function runWithLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = Array.from<T>({ length: tasks.length });
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < tasks.length) {
      const index = currentIndex++;
      const task = tasks[index];
      if (task) {
        results[index] = await task();
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }).map(worker);
  await Promise.all(workers);
  return results;
}
