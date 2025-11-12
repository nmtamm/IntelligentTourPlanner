import React from 'react';
import TopNav from "./topnav";
import SubNav from "./subnav";

export default function Header() {
    return (
        <div className="sticky top-0 w-full">
            <TopNav />
            <SubNav />
        </div>
    );
}