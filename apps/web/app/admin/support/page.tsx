"use client";

import { useGetAdminSupportMessagesQuery, useUpdateSupportMessageStatusMutation } from "@/store/apiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AdminSupportPage() {
  const { data: messages, isLoading } = useGetAdminSupportMessagesQuery(undefined);
  const [updateStatus] = useUpdateSupportMessageStatusMutation();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support Messages</h2>
        <p className="text-muted-foreground">View and manage support requests from users.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Subject</th>
                  <th className="px-6 py-4 font-medium">Message</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Loading messages...
                    </td>
                  </tr>
                ) : messages?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No support messages found.
                    </td>
                  </tr>
                ) : (
                  messages?.map((msg: any) => (
                    <tr key={msg._id} className="bg-card hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{msg.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{msg.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">{msg.subject}</td>
                      <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={msg.message}>
                        {msg.message}
                      </td>
                      <td className="px-6 py-4">
                        <Select 
                          defaultValue={msg.status} 
                          onValueChange={(val) => handleStatusChange(msg._id, val)}
                        >
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="h-8 text-xs">Reply via Email</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
