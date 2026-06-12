"use client";

import { useGetPendingManualPaymentsQuery, useVerifyManualPaymentMutation } from "@/lib/feature/payment/paymentApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminManualPaymentsPage() {
  const { data: pendingPayments = [], isLoading, refetch } = useGetPendingManualPaymentsQuery(undefined);
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyManualPaymentMutation();

  const handleVerify = async (transactionId: string, status: 'completed' | 'failed') => {
    if (!window.confirm(`Are you sure you want to ${status === 'completed' ? 'Approve' : 'Reject'} this payment?`)) {
      return;
    }

    try {
      const res = await verifyPayment({ transactionId, status }).unwrap();
      if (res.success) {
        toast.success(`Payment ${status === 'completed' ? 'approved' : 'rejected'} successfully.`);
        refetch();
      }
    } catch (error: any) {
      console.error("Failed to verify payment:", error);
      toast.error(error?.data?.error || "Failed to verify payment.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manual Payments</h2>
        <p className="text-muted-foreground">Verify and manage manual (bKash/Nagad) payment submissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>Review manual payment requests from users before approving their plan.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending manual payments found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan requested</TableHead>
                    <TableHead>Method & Sender</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount (BDT)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment: any) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{payment.user?.name}</span>
                          <span className="text-xs text-muted-foreground">{payment.user?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{payment.plan?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="uppercase text-xs font-semibold">{payment.paymentMethod}</span>
                          <span className="font-mono text-sm">{payment.senderNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{payment.trxId}</span>
                      </TableCell>
                      <TableCell className="font-medium">{payment.amount} BDT</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleVerify(payment._id, 'completed')}
                          disabled={isVerifying}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleVerify(payment._id, 'failed')}
                          disabled={isVerifying}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
