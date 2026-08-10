import { X } from "lucide-react";

type Template = {
  id: string;
  title: string;
  prompt: string;
  isSystemTemplate: boolean;
};

type TemplatesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  onSelectTemplate: (prompt: string) => void;
};

export function TemplatesModal({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: TemplatesModalProps) {
  if (!isOpen) return null;

  const systemTemplates = templates.filter(t => t.isSystemTemplate);
  const userPrompts = templates.filter(t => !t.isSystemTemplate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>
        <h3 className="text-xl font-semibold mb-2">Prompt Templates</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select a starting point for your character prompt.
        </p>
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* System Templates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">System Templates</h4>
            <div className="space-y-3">
              {systemTemplates.map(template => (
                <div 
                  key={template.id} 
                  className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                  onClick={() => onSelectTemplate(template.prompt)}
                >
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">{template.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.prompt}</div>
                </div>
              ))}
              {systemTemplates.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No system templates found.</p>
              )}
            </div>
          </div>

          {/* User Prompts */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">My Prompts</h4>
            <div className="space-y-3">
              {userPrompts.map(template => (
                <div 
                  key={template.id} 
                  className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors group"
                  onClick={() => onSelectTemplate(template.prompt)}
                >
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">{template.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.prompt}</div>
                </div>
              ))}
              {userPrompts.length === 0 && (
                <p className="text-sm text-muted-foreground italic">You haven't saved any prompts yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
