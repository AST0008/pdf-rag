"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import * as React from "react";

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: { pageNumber?: number };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  context?: Doc[];
  query?: string;
  timestamp?: string;
}

interface ApiResponse {
  status: string;
  data: {
    answer: string;
    context: Doc[];
    query: string;
    timestamp: string;
  };
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [expandedContext, setExpandedContext] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    setError(null);
    const userMessage = message;
    setMessage("");

    try {
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      const res = await fetch(
        `http://localhost:8000/chat?message=${encodeURIComponent(userMessage)}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data: ApiResponse = await res.json();
      console.log("data", data.data.context);
      if (data.status === "success") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.data.answer,
            context: data.data.context,
            query: data.data.query,
            timestamp: data.data.timestamp,
          },
        ]);
      } else {
        throw new Error("API returned unsuccessful status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred. Try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const formatMessageContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <p key={index} className="leading-relaxed text-sm md:text-base">
        {line}
      </p>
    ));
  };

  const hasMessages = messages.length > 0;

  const toggleContext = (index: number) => {
    setExpandedContext(expandedContext === index ? null : index);
  };

  return (
    <div className="relative flex flex-col h-[60vh] md:h-[calc(100vh-5.5rem)] p-0 bg-gray-900/95 rounded-2xl shadow-2xl max-w-full md:max-w-4xl mx-auto border-2 border-gray-800 overflow-hidden">
      <ScrollArea className="flex-1 overflow-y-auto px-2 md:px-6 pt-4 md:pt-6 pb-28 md:pb-32">
        <div className="space-y-4 md:space-y-6">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center text-purple-400">
              <svg
                width="40"
                height="40"
                className="mx-auto"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
                />
              </svg>
              <div className="mt-2 text-base md:text-lg font-semibold">
                Welcome to PDF Chat!
              </div>
              <div className="text-xs md:text-sm text-purple-300">
                Type your question below to get started.
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`w-full flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-[85%] md:max-w-xl space-y-2">
                <div
                  className={`p-3 md:p-4 rounded-2xl shadow-lg border break-words ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-indigo-700 to-purple-700 text-white border-indigo-500"
                      : "bg-gradient-to-r from-gray-800 to-purple-900 text-white border border-purple-700"
                  }`}
                >
                  {formatMessageContent(message.content || "")}
                </div>

                {message.role === "assistant" &&
                  message.context &&
                  message.context.length > 0 && (
                    <div className="text-sm">
                      <button
                        onClick={() => toggleContext(index)}
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded-lg"
                      >
                        {expandedContext === index ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            <span>Hide references</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            <span>
                              Show references ({message.context.length})
                            </span>
                          </>
                        )}
                      </button>

                      {expandedContext === index && (
                        <div className="mt-2 space-y-2">
                          {message.context.map((doc, docIndex) => (
                            <div
                              key={docIndex}
                              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                            >
                              <div className="flex items-center gap-2 text-purple-400 mb-1">
                                <BookOpen className="h-4 w-4" />
                                <span className="text-xs">
                                  {doc.metadata?.source || "PDF"}
                                  {doc.metadata?.loc?.pageNumber && (
                                    <span className="text-purple-500">
                                      {" "}
                                      · Page {doc.metadata.loc.pageNumber}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">
                                {doc.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-full">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {error && (
        <div className="text-sm text-red-400 mt-2 px-2 md:px-6">{error}</div>
      )}

      <div className="absolute bottom-0 left-0 w-full bg-gray-950 border-t-2 border-gray-800 px-2 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-3 shadow-xl z-10">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 rounded-full px-4 md:px-6 py-2 md:py-3 text-sm bg-gray-900 text-gray-100 border-2 border-gray-700 focus:border-purple-600 focus:ring-purple-600 shadow-sm placeholder:text-gray-400"
        />
        <Button
          onClick={handleSendChatMessage}
          disabled={!message.trim() || isLoading}
          size="lg"
          className="rounded-full shadow-md bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 text-white px-4 md:px-6 py-2 md:py-3"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
