"use client";

import React from "react";
import { useGetUserTransactionsQuery, useDeleteTransactionMutation } from "@/lib/feature/payment/paymentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";

export default function TransactionsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: transactions = [], isLoading } = useGetUserTransactionsQuery(undefined);
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      await deleteTransaction(transactionToDelete).unwrap();
      toast.success("Transaction deleted successfully");
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to delete transaction");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground mt-1">
            View your recent subscriptions and payments.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>A list of your recent purchases and active subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              You don't have any transactions yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => (
                  <TableRow key={tx._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{user?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{tx.plan?.name || "Unknown Plan"}</TableCell>
                    <TableCell>{tx.currency?.toLowerCase() === 'bdt' ? `${tx.amount} BDT` : `$${tx.amount.toFixed(2)}`}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteClick(tx._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete this transaction record from your history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
