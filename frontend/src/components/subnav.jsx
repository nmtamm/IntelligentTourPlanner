import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Calendar } from './ui/calendar';

export default function SubNav() {
    return (
        <div className="bg-gray-50 flex px-8 py-2 space-x-6 text-sm font-medium">
            <button className="px-3 py-1 bg-white text-black rounded-md">Plan your adventure</button>
            <button className="px-3 py-1 bg-white text-black rounded-md">My trips</button>
            <button className="px-3 py-1 bg-white text-black rounded-md">Settings</button>
        </div>
    );
}
