'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Task {
    id: string;
    title: string;
    priority: string;
    status: string;
    dueAt: Date | string; // serialized form passes string usually
    recurringTaskId?: string | null;
}

interface Props {
    task: Task;
}

export const TaskItem = ({ task }: Props) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [status, setStatus] = useState(task.status);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            toast.success('Task deleted');
            // Refresh to update list
            router.refresh();
        } catch (e) {
            toast.error('Could not delete task');
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        // Optimistic update
        setStatus(newStatus);

        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Failed to update');
            toast.success(`Task ${newStatus.toLowerCase()}`);
            router.refresh(); // Optional, depending on if we want to move it to a 'completed' section
        } catch (e) {
            toast.error('Update failed');
            setStatus(task.status); // Revert
        }
    };

    const isCompleted = status === 'COMPLETED';

    return (
        <li className={`p-3 border rounded hover:bg-gray-50 flex justify-between items-start group transition-opacity ${isDeleting ? 'opacity-50' : ''}`}>
            <div className="flex gap-3 items-center">
                <div className="">
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className={`text-xs font-semibold rounded border-0 py-1 px-2 cursor-pointer focus:ring-2 focus:ring-inset focus:ring-blue-500 ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
                <div>
                    <div className={`font-medium flex items-center gap-2 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.title}
                        {task.recurringTaskId && (
                            <span title="Recurring Task" className="text-blue-500 text-xs">
                                🔄
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Due: {format(new Date(task.dueAt), 'EEE h:mm a')} |
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {task.priority}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Delete Task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
            </div>
        </li>
    );
};
