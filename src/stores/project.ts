import { supabase } from "@/lib/supabase/client";
import { Project } from "@/types/types";
import { create } from "zustand";

type ProjectState = {
  project: Project | null;
  getProject: (id: string | number) => Promise<void>;
};

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  getProject: async (username: any) => {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "*, departments(*), crm(*), creator(*, creatorApps(*)), recruit(*)"
      )
      .eq("username", username)
      .single();

    if (error) {
      console.log("Error fetching project info:", error);
      return;
    }

    if (data) {
      set({
        project: {
          ...data,
          _repository: `lobaz2g-${data.domain}-${data.username}`,
        },
      });
    }
  },
}));
