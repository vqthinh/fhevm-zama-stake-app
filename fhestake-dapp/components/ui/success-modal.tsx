"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  transactionHash?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  description,
  transactionHash
}: SuccessModalProps) {
  const handleViewTransaction = () => {
    if (transactionHash) {
      window.open(`https://sepolia.etherscan.io/tx/${transactionHash}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-green-600">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          {transactionHash && (
            <Button
              variant="outline"
              onClick={handleViewTransaction}
              className="w-full"
            >
              View on Etherscan
            </Button>
          )}
          
          <Button
            onClick={onClose}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}