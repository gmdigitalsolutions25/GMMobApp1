import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getVehiclesByPhoneProcedure } from "./routes/vehicles/get-by-phone/route";
import { createVehicleProcedure } from "./routes/vehicles/create/route";
import { deleteVehicleProcedure } from "./routes/vehicles/delete/route";
import { createAppointmentProcedure } from "./routes/appointments/create/route";
import { getAppointmentsByUserProcedure } from "./routes/appointments/get-by-user/route";
import { updateAppointmentStatusProcedure } from "./routes/appointments/update-status/route";
import { upsertUserProcedure } from "./routes/users/upsert/route";
import { getUserByPhoneProcedure } from "./routes/users/get-by-phone/route";
import { listServiceCentersProcedure } from "./routes/service-centers/list/route";
import { sparePartsSearchProcedure } from "./routes/ai/spare-parts/route";
import { sendOtpProcedure } from "./routes/auth/send-otp/route";
import { verifyOtpProcedure } from "./routes/auth/verify-otp/route";
import { setPinProcedure } from "./routes/auth/set-pin/route";
import { verifyPinProcedure } from "./routes/auth/verify-pin/route";
import { changePinProcedure } from "./routes/auth/change-pin/route";
import { refreshTokenProcedure } from "./routes/auth/refresh-token/route";
import { registerPushTokenProcedure } from "./routes/push-tokens/register/route";
// Monitoring routes
import { listErrorsProcedure, errorStatsProcedure, resolveErrorProcedure } from "./routes/monitoring/errors/route";
import { submitBugReportProcedure, listBugReportsProcedure, updateBugReportStatusProcedure, logClientErrorProcedure } from "./routes/monitoring/bug-reports/route";
import { liveHealthProcedure, dashboardSummaryProcedure, saveHealthSnapshotProcedure, getHealthHistoryProcedure } from "./routes/monitoring/system-health/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  vehicles: createTRPCRouter({
    getByPhone: getVehiclesByPhoneProcedure,
    create: createVehicleProcedure,
    delete: deleteVehicleProcedure,
  }),
  appointments: createTRPCRouter({
    create: createAppointmentProcedure,
    getByUser: getAppointmentsByUserProcedure,
    updateStatus: updateAppointmentStatusProcedure,
  }),
  users: createTRPCRouter({
    upsert: upsertUserProcedure,
    getByPhone: getUserByPhoneProcedure,
  }),
  serviceCenters: createTRPCRouter({
    list: listServiceCentersProcedure,
  }),
  ai: createTRPCRouter({
    spareParts: sparePartsSearchProcedure,
  }),
  auth: createTRPCRouter({
    sendOtp: sendOtpProcedure,
    verifyOtp: verifyOtpProcedure,
    setPin: setPinProcedure,
    verifyPin: verifyPinProcedure,
    changePin: changePinProcedure,
    refreshToken: refreshTokenProcedure,
  }),
  pushTokens: createTRPCRouter({
    register: registerPushTokenProcedure,
  }),
  monitoring: createTRPCRouter({
    errors: createTRPCRouter({
      list: listErrorsProcedure,
      stats: errorStatsProcedure,
      resolve: resolveErrorProcedure,
    }),
    bugs: createTRPCRouter({
      submit: submitBugReportProcedure,
      list: listBugReportsProcedure,
      updateStatus: updateBugReportStatusProcedure,
      logClientError: logClientErrorProcedure,
    }),
    health: createTRPCRouter({
      live: liveHealthProcedure,
      summary: dashboardSummaryProcedure,
      saveSnapshot: saveHealthSnapshotProcedure,
      history: getHealthHistoryProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;
