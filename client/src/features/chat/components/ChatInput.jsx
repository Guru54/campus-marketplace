import { useRef, useEffect } from "react";
import { Send } from "lucide-react";

export const ChatInput = ({
  draft,
  sending,
  onDraftChange,
  onKeyDown,
  onSendMessage,
}) => {
  const textareaRef = useRef(null);

  // Auto-resize logic for the textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Pehle height 'auto' set karni zaroori hai taaki text delete hone par box shrink ho sake
      textarea.style.height = "auto";
      
      // maxHeight 128px limit ke andar scrollHeight ke hisaab se grow karo
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 128)}px`;
    }
  }, [draft]);

  return (
    <div className="shrink-0 flex items-end gap-3 px-4 py-3 bg-white/5 border-t border-white/10">
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={onDraftChange}
        onKeyDown={onKeyDown}
        rows={1}
        maxLength={1000}
        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
        aria-label="Type your message"
        className="flex-1 resize-none px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition overflow-y-auto scrollbar-hide"
        style={{ minHeight: "42px", maxHeight: "128px" }} // Explicit inline styles for reliable constraints
      />
      <button
        onClick={onSendMessage}
        disabled={!draft.trim() || sending}
        aria-label="Send message"
        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Send size={16} />
      </button>
    </div>
  );
};