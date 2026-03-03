import { publicProcedure } from "../../../create-context";
import { serviceCenterStore } from "@/backend/store";

export const listServiceCentersProcedure = publicProcedure
  .query(async () => {
    const centers = serviceCenterStore.list();
    return { serviceCenters: centers };
  });
