"use client";

import React from "react";
import { useGetAllTransactionsQuery } from "@/lib/feature/payment/paymentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminPaymentsPage() {
  const { data: transactions = [], isLoading } = useGetAllTransactionsQuery(undefined);

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
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A list of all user purchases and active subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading...</div>
          ) : transactions.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               No transactions found.
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => (
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
                    <TableCell>${tx.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground max-w-[150px] truncate" title={tx.stripeSessionId}>
                      {tx.stripeSessionId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
