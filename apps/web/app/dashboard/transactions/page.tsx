"use client";

import React from "react";
import { useGetUserTransactionsQuery } from "@/lib/feature/payment/paymentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  const { data: transactions = [], isLoading } = useGetUserTransactionsQuery(undefined);

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
            <div className="flex justify-center p-8 text-muted-foreground animate-pulse">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              You don't have any transactions yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => (
                  <TableRow key={tx._id}>
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
