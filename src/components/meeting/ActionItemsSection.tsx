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
    <div className="flex flex-col gap-2.5 pt-2 pb-4 border-b border-[#2a2c32]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider text-[#80858e] uppercase">
          ACTION ITEMS
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] font-medium text-[#00beff] hover:underline cursor-pointer"
        >
          {isAdding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Action item description..."
            className="flex-1 bg-[#28292f] text-xs text-white px-2.5 py-1.5 rounded border border-[#393b44] focus:outline-none focus:border-[#00beff]"
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#00beff] text-black text-xs font-semibold px-3 py-1.5 rounded cursor-pointer hover:bg-[#00a8e6]"
          >
            Save
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-[#202126] rounded-md p-3 text-center border border-[#2c2e35]">
          <p className="text-xs text-[#80858e] italic">
            None detected. Add manually on transcript tab
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id, !!item.is_done)}
              className={`flex items-start gap-2.5 p-2.5 rounded bg-[#202126] border border-[#2b2d35] cursor-pointer transition-colors hover:bg-[#25262c] ${
                item.is_done ? "opacity-60" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={!!item.is_done}
                onChange={() => {}}
                className="mt-0.5 rounded text-[#00beff] focus:ring-0 cursor-pointer accent-[#00beff]"
              />
              <div className="flex-1 flex flex-col gap-0.5">
                <span
                  className={`text-xs text-white/90 ${
                    item.is_done ? "line-through text-white/50" : ""
                  }`}
                >
                  {item.text}
                </span>
                {item.owner && (
                  <span className="text-[10px] text-[#00beff] font-medium">
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
