// app/student-dashboard/certificates/certificate-request-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Award } from "lucide-react";
import { useRouter } from "next/navigation";

interface CertificateRequestButtonProps {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  userId: string;
}

export function CertificateRequestButton({
  enrollmentId,
  courseId,
  courseTitle,
  instructorName,
  userId,
}: CertificateRequestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRequestCertificate = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentId,
          courseId,
          courseTitle,
          instructorName,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate certificate");
      }

      // Redirect to the newly created certificate page
      if (data.certificate?.id) {
        router.push(`/student-dashboard/certificates/${data.certificate.id}`);
        router.refresh(); // Refresh the page to show new certificate
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRequestCertificate}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating Certificate...
        </>
      ) : (
        <>
          <Award className="w-4 h-4 mr-2" />
          Generate Certificate
        </>
      )}
    </Button>
  );
}
