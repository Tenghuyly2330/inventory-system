import React from "react";
import { PackageOpen, Loader2 } from "lucide-react";

export const Loading = ({ message = "Loading..." }) => (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm font-medium">{message}</p>
      </div>
);

export const EmptyState = ({ title = "No data found", description = "Try refining your search or add a new record.", icon: Icon = PackageOpen, action }) => (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800/80 my-4">
            <div className="p-3 bg-slate-800/80 text-slate-400 rounded-full mb-3">
                  <Icon className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-slate-200">{title}</h4>
            <p className="text-sm text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
            {action}
      </div>
);
