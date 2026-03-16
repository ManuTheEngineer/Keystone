"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { subscribeToProject, type ProjectData } from "@/lib/services/project-service";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsub = subscribeToProject(user.uid, projectId, (project: ProjectData | null) => {
      if (!project) {
        router.replace("/dashboard");
      } else {
        setVerified(true);
      }
      setChecking(false);
    });

    return unsub;
  }, [user, projectId, router]);

  if (checking || !verified) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <KeystoneIcon size={32} className="text-sand mx-auto mb-3 animate-pulse" />
          <p className="text-[12px] text-muted">Loading project...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
