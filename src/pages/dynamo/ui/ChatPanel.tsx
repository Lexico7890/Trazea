import { MessageSquare, RotateCcw, PanelRightClose, X } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { ChatMessages } from "./ChatMessages";
import type { ChatMessage } from "../model/types";
import { useDynamoStore } from "../model/useDynamoStore";

interface ChatPanelProps {
  messages: ChatMessage[];
  isPanelOpen: boolean;
  isDrawerOpen: boolean;
  onPanelOpenChange: (open: boolean) => void;
  onDrawerOpenChange: (open: boolean) => void;
  onResetSession: () => void;
  isProcessing: boolean;
  onSelectOption: (messageId: string, optionId: string, optionLabel: string) => void;
}

export function ChatPanel({
  messages,
  isPanelOpen,
  isDrawerOpen,
  onPanelOpenChange,
  onDrawerOpenChange,
  onResetSession,
  isProcessing,
  onSelectOption,
}: ChatPanelProps) {
  const chatContent = (
    <ChatMessages
      messages={messages}
      onSelectOption={onSelectOption}
      isProcessing={isProcessing}
    />
  );

  return (
    <>
      <div
        className="hidden lg:block h-full border-l border-border bg-background/95 backdrop-blur-sm transition-all duration-500 ease-out overflow-hidden"
        style={{ width: isPanelOpen ? "400px" : "0", borderLeftWidth: isPanelOpen ? 1 : 0 }}
      >
        <div
          className="h-full w-[400px] flex flex-col min-h-0 transition-all duration-500 ease-out"
          style={{ opacity: isPanelOpen ? 1 : 0, transform: isPanelOpen ? "translateX(0)" : "translateX(8px)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-sm">Conversación</h3>
              {messages.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {messages.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={onResetSession}
                title="Nueva conversación"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={() => onPanelOpenChange(false)}
                title="Cerrar panel"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          {chatContent}
        </div>
      </div>

      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          onDrawerOpenChange(open);
          if (!open) {
            useDynamoStore.getState().setPanelOpen(false);
          }
        }}
      >
        <DrawerContent className="lg:hidden max-h-[75vh] flex flex-col">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-500" />
                <DrawerTitle className="text-sm">Conversación</DrawerTitle>
                {messages.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {messages.length}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={onResetSession}
                  title="Nueva conversación"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => onDrawerOpenChange(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </DrawerHeader>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{chatContent}</div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
