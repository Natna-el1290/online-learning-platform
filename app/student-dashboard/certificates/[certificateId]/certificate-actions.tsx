// app/student-dashboard/certificates/[certificateId]/certificate-actions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Award } from "lucide-react";
import Link from "next/link";
import { Certificate } from "@prisma/client";

interface CertificateActionsProps {
  certificate: Certificate;
  fullName: string;
  issuedDate: string;
}

export function CertificateActions({
  certificate,
  fullName,
  issuedDate,
}: CertificateActionsProps) {
  const handleDownloadPDF = async () => {
    try {
      // Implement PDF generation
      const response = await fetch(
        `/api/certificates/${certificate.id}/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificate.courseTitle.replace(/\s+/g, "_")}_Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  const handleShareLinkedIn = () => {
    const shareText = `I completed "${certificate.courseTitle}" and earned a certificate!`;
    const url = window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, "_blank");
  };

  const handleVerifyOnline = () => {
    // Navigate to verification page or open verification modal
    window.open(
      `/verify-certificate?certificateId=${certificate.certificateId}`,
      "_blank",
    );
  };

  return (
    <>
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button
          size="lg"
          onClick={handleDownloadPDF}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF Certificate
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleShareLinkedIn}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share on LinkedIn
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link
            href="/student-dashboard/certificates"
            className="flex items-center"
          >
            <Award className="w-4 h-4 mr-2" />
            View All Certificates
          </Link>
        </Button>
      </div>

      {/* Verification Info */}
      <Card className="bg-muted/30 border-dashed">
        <div className="p-6">
          <h3 className="font-semibold mb-4 text-center text-lg">
            Certificate Verification
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Certificate Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate ID:</span>
                  <span className="font-mono font-semibold">
                    {certificate.certificateId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued Date:</span>
                  <span>{issuedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient:</span>
                  <span>{fullName}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Verification</h4>
              <p className="text-sm text-muted-foreground">
                This certificate can be verified online using the certificate ID
                above. For verification inquiries, please contact support.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleVerifyOnline}
                >
                  Verify Certificate Online
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    navigator.clipboard.writeText(certificate.certificateId)
                  }
                >
                  Copy ID
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
