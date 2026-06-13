"use client";

import React, { useState, useMemo } from "react";
import { useGetAllTransactionsQuery, useDeleteTransactionMutation } from "@/lib/feature/payment/paymentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const { data: transactions = [], isLoading } = useGetAllTransactionsQuery(undefined);
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx: any) => {
      const matchesSearch = 
        tx.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tx.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPlan = planFilter === "all" || tx.plan?.name?.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || tx.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [transactions, searchQuery, planFilter, statusFilter]);

  // Extract unique plans for the filter dropdown
  const uniquePlans = useMemo(() => {
    const plans = new Set<string>();
    transactions.forEach((tx: any) => {
      if (tx.plan?.name) plans.add(tx.plan.name);
    });
    return Array.from(plans);
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments Management</h2>
          <p className="text-muted-foreground mt-1">
            View all transactions across the platform.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A list of all user purchases and active subscriptions.</CardDescription>
        </CardHeader>
        <div className="px-6 flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Select value={planFilter} onValueChange={(val) => setPlanFilter(val || "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {uniquePlans.map((plan: string) => (
                  <SelectItem key={plan} value={plan.toLowerCase()}>{plan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredTransactions.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               No transactions found matching your filters.
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx: any) => (
                  <TableRow key={tx._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={tx.user?.avatar} />
                          <AvatarFallback>{tx.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{tx.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{tx.user?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{tx.plan?.name || "Unknown Plan"}</TableCell>
                    <TableCell>
                      {tx.currency?.toLowerCase() === 'bdt' ? `${tx.amount} BDT` : `$${tx.amount.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-xs uppercase font-semibold text-muted-foreground">
                      {tx.paymentMethod || 'stripe'}
                    </TableCell>
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
              This action cannot be undone. This will permanently delete this transaction record from the database.
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
