export type Step = "service" | "details" | "location" | "appointment" | "personal" | "success"

export interface FormData {
  clientName: string
  phone: string
  email: string
  serviceType: string
  packageSize: string
  location: string
  appointmentType: "immediate" | "scheduled"
  scheduledDate: string
  scheduledTime: string
  organization: string
  activityType: string
  monthlyEvacuations: string
  notes: string
}

export const BLANK_FORM: FormData = {
  clientName: "",
  phone: "",
  email: "",
  serviceType: "",
  packageSize: "",
  location: "",
  appointmentType: "immediate",
  scheduledDate: "",
  scheduledTime: "09:00",
  organization: "",
  activityType: "",
  monthlyEvacuations: "",
  notes: "",
}
