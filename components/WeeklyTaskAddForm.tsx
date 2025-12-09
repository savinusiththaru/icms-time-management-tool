'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import { addWeeks, setDay, startOfWeek, isMonday, format } from 'date-fns';

interface Props {
    onCreate: () => void;
}

interface User {
    id: string;
    name: string;
}

// Define FormInputs interface if it's not already defined elsewhere
// Assuming a basic structure for now, adjust as per your actual form fields
interface FormInputs {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    weekStart: Date;
    dueTime: Date;
    assigneeIds: string[];
    recurrence: {
        enabled: boolean;
        intervalWeeks: number;
        dayOfWeek: number;
    };
}

export const WeeklyTaskAddForm = ({ onCreate }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, control, reset, watch, setValue, getValues, formState: { errors } } = useForm<FormInputs>({
        defaultValues: {
            title: '',
            description: '',
            priority: 'MEDIUM',
            weekStart: startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 }), // Next Monday
            dueTime: new Date(new Date().setHours(17, 0, 0, 0)), // 5 PM -> Ensure Date object
            assigneeIds: [],
            recurrence: {
                enabled: false,
                intervalWeeks: 1,
                dayOfWeek: 1, // Monday
            }
        }
    });

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        setLoadingUsers(true);
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoadingUsers(false));
    }, []);

    const recurrenceEnabled = watch('recurrence.enabled');
    const weekStartValue = watch('weekStart'); // Watch weekStart to trigger re-render for validation message

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {

            // Prepare Payload
            const payload = {
                ...data,
                weekStart: format(startOfWeek(data.weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                dueTime: new Date(data.dueTime).toISOString(),
                assigneeIds: data.assigneeIds, // Pass assignees
                tags: ["weekly"],
                recurrence: data.recurrence.enabled ? {
                    enabled: true,
                    intervalWeeks: Number(data.recurrence.intervalWeeks),
                    dayOfWeek: Number(data.recurrence.dayOfWeek),
                    // endDate: ...
                } : undefined
            };

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    toast.error("Task already exists for this week!");
                } else {
                    toast.error(json.error || json.message || "Failed to create task");
                }
                return;
            }

            toast.success("Task Created Successfully!");
            onCreate();
        } catch (e: any) {
            console.error(e);
            toast.error("Network error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add Weekly Task</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Asia/Colombo</span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Task Title</label>
                    <input
                        {...register('title', { required: true, minLength: 3 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="e.g., Weekly Team Sync"
                    />
                    {errors.title && <span className="text-red-500 text-xs">Title is required (min 3 chars)</span>}
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select {...register('priority')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>

                {/* Week Start */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Week Of</label>

                        <Controller
                            control={control}
                            name="weekStart"
                            rules={{ validate: (d) => isMonday(d) || "Must be a Monday" }}
                            render={({ field }) => (
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 cursor-pointer"
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select Date"
                                    popperClassName="!z-50"
                                />
                            )}
                        />
                        <p className="text-xs text-gray-500 mt-1">Select any day in the week</p>
                        {errors.weekStart && <span className="text-red-500 text-xs">{errors.weekStart.message as string}</span>}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Due Time</label>
                        <Controller
                            control={control}
                            name="dueTime"
                            rules={{ required: 'Due time is required' }}
                            render={({ field }) => (
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption="Time"
                                    dateFormat="h:mm aa"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 cursor-pointer"
                                    popperClassName="!z-50"
                                />
                            )}
                        />
                        {errors.dueTime && <span className="text-red-500 text-xs">{errors.dueTime.message as string}</span>}
                    </div>
                </div>

                {/* Assign To */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    <div className="flex flex-wrap gap-2">
                        {loadingUsers && <span className="text-xs text-gray-500 italic">Loading members...</span>}
                        {!loadingUsers && users.length === 0 && <span className="text-xs text-gray-500 italic">No members found. Add some below!</span>}
                        {!loadingUsers && users.map((u: User) => {
                            const isSelected = (watch('assigneeIds') || []).includes(u.id);
                            return (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => {
                                        const current = getValues('assigneeIds') || [];
                                        const next = isSelected
                                            ? current.filter((id: string) => id !== u.id)
                                            : [...current, u.id];
                                        setValue('assigneeIds', next);
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${isSelected
                                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {u.name} {isSelected && '✓'}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Recurrence Section */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <input type="checkbox" id="recurrence" {...register('recurrence.enabled')} className="rounded text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="recurrence" className="font-medium text-gray-900 select-none">Repeat every week?</label>
                    </div>

                    {recurrenceEnabled && (
                        <div className="bg-gray-50 p-3 rounded-md space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Repeat every</span>
                                <input
                                    type="number"
                                    {...register('recurrence.intervalWeeks', { min: 1 })}
                                    className="w-16 p-1 border rounded text-center text-gray-900"
                                />
                                <span className="text-sm">weeks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">On day:</span>
                                <select {...register('recurrence.dayOfWeek')} className="p-1 border rounded text-sm text-gray-900">
                                    <option value="1">Monday</option>
                                    <option value="2">Tuesday</option>
                                    <option value="3">Wednesday</option>
                                    <option value="4">Thursday</option>
                                    <option value="5">Friday</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
            </form>
        </div>
    );
};
