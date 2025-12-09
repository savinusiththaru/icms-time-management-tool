'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface User {
    id: string;
    name: string;
    email: string;
}

export const TeamManager = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (e) {
            console.error('Failed to fetch users', e);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail) return;

        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, email: newEmail })
            });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error || 'Failed to create user');

            toast.success('Team member added!');
            setNewName('');
            setNewEmail('');
            fetchUsers();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Team Management</h2>

            <form onSubmit={handleAddUser} className="flex gap-2 mb-6 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Alice Smith"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="e.g. alice@example.com"
                        type="email"
                    />
                </div>
                <button
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 h-[42px]"
                >
                    {loading ? 'Adding...' : 'Add Member'}
                </button>
            </form>

            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Current Members</h3>
            {users.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No team members yet.</p>
            ) : (
                <div className="space-y-2">
                    {users.map(u => (
                        <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 flex-shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-900 truncate">{u.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{u.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    if (!confirm(`Delete ${u.name}?`)) return;
                                    try {
                                        const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
                                        if (res.ok) {
                                            toast.success('Member deleted');
                                            fetchUsers();
                                        } else {
                                            toast.error('Failed to delete');
                                        }
                                    } catch (e) {
                                        toast.error('Error deleting member');
                                    }
                                }}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition flex-shrink-0"
                                title="Delete Member"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
