import { Card, CardBody, CardTitle } from "./card";
import { Button } from "./button";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm shadow-2xl relative">
        <Button 
          className="btn-ghost btn-icon absolute top-3 right-3 size-8 rounded-full bg-muted hover:bg-muted-foreground/10"
          onClick={onClose}
        >
          ✕
        </Button>
        <CardBody className="p-6">
          <CardTitle className="text-xl mb-2 mr-6">{title}</CardTitle>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
          <div className="flex justify-end gap-3">
            <Button className="btn-outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button 
              className={isDestructive ? "bg-destructive text-white hover:bg-destructive/90" : "btn-primary"} 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
