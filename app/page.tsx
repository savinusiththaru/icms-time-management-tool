import { prisma } from '@/lib/prisma';
import { format, parseISO, isSameWeek } from 'date-fns';
import { revalidatePath } from 'next/cache';
import { TaskItem } from '@/components/TaskItem';
import { WeeklyTaskAddForm } from '@/components/WeeklyTaskAddForm';
import { WeeklyReport } from '@/components/WeeklyReport';
import { TeamManager } from '@/components/TeamManager';
import Image from 'next/image';

// Server Action for Cron Trigger
async function triggerCron() {
  'use server';
  try {
    // In a real scenario, we might fetch to the API route to test the full flow, 
    // or just call the logic directly. Let's fetch the API to ensure the route is working.
    // We need an absolute URL for server-side fetch or use relative if Next supports it (it doesn't usually).
    // Actually, calling the logic directly is safer in Server Actions if code is shared, 
    // but the route has the logic.
    // Let's use localhost fetch for this verification button.
    const res = await fetch('http://localhost:3000/api/cron/generate', { method: 'POST', cache: 'no-store' });
    const json = await res.json();
    console.log("Cron Result:", json);
    revalidatePath('/');
    return { success: true, ...json };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}

export default async function Home() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ weekStart: 'asc' }, { createdAt: 'desc' }],
    take: 50
  });

  // Group by Week
  const tasksByWeek: Record<string, typeof tasks> = {};
  tasks.forEach((t: any) => { // Typing as any or inferred from findMany
    const weekKey = format(new Date(t.weekStart), 'yyyy-MM-dd');
    if (!tasksByWeek[weekKey]) tasksByWeek[weekKey] = [];
    tasksByWeek[weekKey].push(t);
  });

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <Image src="/logo.png" alt="ICMS Logo" width={80} height={80} className="w-16 h-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Weekly Task Manager</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <WeeklyTaskAddForm onCreate={async () => {
            'use server';
            revalidatePath('/');
          }} />

          <div className="mt-8">
            <WeeklyReport />
            <TeamManager />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {Object.keys(tasksByWeek).length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No tasks found.
            </div>
          ) : (
            Object.entries(tasksByWeek).map(([weekStart, weekTasks]) => (
              <div key={weekStart} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2 flex justify-between">
                  <span>Week of {format(parseISO(weekStart), 'MMM d, yyyy')}</span>
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {weekTasks.length} Tasks
                  </span>
                </h2>
                <ul className="space-y-3">
                  {weekTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

    </main>
  );
}
