"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const pairFormSchema = z.object({
  fromSymbol: z.string().min(1, "From symbol is required"),
  fromName: z.string().min(1, "From name is required"),
  toSymbol: z.string().min(1, "To symbol is required"),
  toName: z.string().min(1, "To name is required"),
});

type PairFormValues = z.infer<typeof pairFormSchema>;

interface AddPairDialogProps {
  onPairAdded: () => void;
}

export function AddPairDialog({ onPairAdded }: AddPairDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PairFormValues>({
    resolver: zodResolver(pairFormSchema),
    defaultValues: {
      fromSymbol: "",
      fromName: "",
      toSymbol: "",
      toName: "",
    },
  });

  async function onSubmit(data: PairFormValues) {
    try {
      const response = await fetch("http://localhost:8000/crypto/pairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: {
            id: data.fromSymbol.toLowerCase(),
            symbol: data.fromSymbol.toUpperCase(),
            name: data.fromName,
          },
          to: {
            id: data.toSymbol.toLowerCase(),
            symbol: data.toSymbol.toUpperCase(),
            name: data.toName,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add trading pair");
      }

      toast({
        title: "Success",
        description: "Trading pair added successfully",
      });

      setOpen(false);
      form.reset();
      onPairAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trading pair. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pair
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Trading Pair</DialogTitle>
          <DialogDescription>
            Create a new cryptocurrency trading pair to track its price.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">From Currency</h4>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="fromSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="BTC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fromName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bitcoin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">To Currency</h4>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="toSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="ETH" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Ethereum" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Add Trading Pair</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
