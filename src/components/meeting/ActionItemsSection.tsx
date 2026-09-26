"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ActionItem {
  id: string;
  meeting_id: string;
  text: string;
  owner?: string | null;
  is_done?: boolean;
}

interface ActionItemsSectionProps {
  meetingId: string;
  actionItems: ActionItem[];
  onActionItemsUpdate?: (items: ActionItem[]) => void;
}

export default function ActionItemsSection({
  meetingId,
  actionItems = [],
  onActionItemsUpdate,
}: ActionItemsSectionProps) {
  const [items, setItems] = useState<ActionItem[]>(actionItems);
  const [newItemText, setNewItemText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  React.useEffect(() => {
    setItems(actionItems);
  }, [actionItems]);

  const toggleItem = async (id: string, currentStatus: boolean) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, is_done: !currentStatus } : item
    );
    setItems(updated);
    onActionItemsUpdate?.(updated);

    try {
      await supabase
        .from("action_items")
        .update({ is_done: !currentStatus })
        .eq("id", id);
    } catch (err) {
      console.error("Failed to update action item:", err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      const { data, error } = await supabase
        .from("action_items")
        .insert({
          meeting_id: meetingId,
          text: newItemText.trim(),
          is_done: false,
        })
        .select()
        .single();

      if (!error && data) {
        const updated = [...items, data];
        setItems(updated);
        onActionItemsUpdate?.(updated);
        setNewItemText("");
        setIsAdding(false);
      }
    } catch (err) {
      console.error("Failed to add action item:", err);
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-2 pb-4 border-b border-indigo-500/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <h3 className="text-xs font-bold tracking-wider text-slate-300 uppercase">
            ACTION ITEMS
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
        >
          {isAdding ? "Cancel" : "+ Add Item"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Describe action item..."
            className="flex-1 bg-[#181a2b] text-xs text-slate-100 px-3 py-1.5 rounded-lg border border-indigo-500/30 focus:outline-none focus:border-cyan-400"
            autoFocus
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:brightness-110"
          >
            Save
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-[#121422] rounded-xl p-3.5 text-center border border-indigo-500/15">
          <p className="text-xs text-slate-400 italic">
            No action items detected yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id, !!item.is_done)}
              className={`flex items-start gap-2.5 p-3 rounded-xl bg-[#131523] border border-indigo-500/15 cursor-pointer transition-all hover:bg-[#181b2d] hover:border-cyan-500/30 ${
                item.is_done ? "opacity-60" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={!!item.is_done}
                onChange={() => {}}
                className="mt-0.5 rounded text-cyan-400 focus:ring-0 cursor-pointer accent-cyan-400"
              />
              <div className="flex-1 flex flex-col gap-0.5">
                <span
                  className={`text-xs text-slate-200 ${
                    item.is_done ? "line-through text-slate-500" : ""
                  }`}
                >
                  {item.text}
                </span>
                {item.owner && (
                  <span className="text-[10px] text-cyan-400 font-medium">
                    Owner: {item.owner}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
