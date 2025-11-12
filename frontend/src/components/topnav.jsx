import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Calendar } from './ui/calendar';

export default function TopNav() {
    return (
        <nav className="w-full bg-gray-800 flex justify-between items-center px-8 py-3 shadow-md text-white">
            {/*sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80*/}
            <h1 className="text-lg font-semibold">Intelligent Tour Planner</h1>
            <div className="flex items-center space-x-4">
                <span>Quang Duy</span>
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-sm">👤</span>
                </div>
            </div>
        </nav>
    );
}
