"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SupportFormData = {
  name: string;
  email: string;
  msg: string;
};

export default function SupportPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportFormData>();
  const [mailSending, setMailSending] = useState(false);

  useEffect(() => {
    if (errors.name) toast.error(errors.name.message as string, { duration: 2000 });
    if (errors.email) toast.error(errors.email.message as string, { duration: 2000 });
    if (errors.msg) toast.error(errors.msg.message as string, { duration: 2000 });
  }, [errors.name, errors.email, errors.msg]);

  const handleSendMessage = async (msgData: SupportFormData) => {
    setMailSending(true);

    Swal.fire({
      title: "Sending Message...",
      text: "Please wait a moment!",
      icon: "info",
      color: "#fff",
      background: "#05030efc",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Send message to Admin
      await emailjs.send(
        "service_025dcpe", // Your Service ID
        "template_etaio6n", // Admin Template ID
        {
          name: msgData.name,
          email: msgData.email,
          msg: msgData.msg,
        },
        "F9-rnJCGVisBrLm_G" // Public Key
      );

      toast.success("Message Sent!");
      Swal.fire({
        title: "Message Sent!",
        text: `Thank you, ${msgData.name}! Please check your email.`,
        icon: "success",
        confirmButtonText: "Okay",
        color: "#fff",
        background: "#05030efc",
      });

      reset();
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        title: "Message Sending Failed!",
        text: error?.text || "Something went wrong! Please try again later.",
        icon: "error",
        confirmButtonText: "Close",
        color: "#fff",
        background: "#05030efc",
      });
    } finally {
      setMailSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Contact Support</h2>
        <p className="text-muted-foreground mt-2">Have a question or need help? Send us a message.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
          <CardDescription>We typically reply within 24 hours.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleSendMessage)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Your Name" 
                {...register("name", { required: "Name is required" })}
                disabled={mailSending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Your Email" 
                {...register("email", { required: "Email is required" })}
                disabled={mailSending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="msg">Message</Label>
              <Textarea 
                id="msg" 
                className="min-h-[150px]"
                placeholder="Describe your issue or question in detail..."
                {...register("msg", { required: "Message is required" })}
                disabled={mailSending}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="py-4 px-6 rounded-md font-medium" type="submit" disabled={mailSending}>
              {mailSending ? "Sending..." : "Send Message"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
