import { createContext, useContext, useState } from "react"

export interface Preselect {
  serviceType?: string
  packageSize?: string
  containerName?: string
  conversationId?: number
  clientName?: string
  phone?: string
}

export interface ServiceRequestContextType {
  isOpen: boolean
  preselect: Preselect
  preselectedService?: string
  preselectedCleaningPackageSize?: string
  preselectedCleaningPackageName?: string
  openModal: (preselect?: Preselect) => void
  closeModal: () => void
}

const ServiceRequestContext = createContext<ServiceRequestContextType>({
  isOpen: false,
  preselect: {},
  openModal: () => {},
  closeModal: () => {},
})

export function ServiceRequestProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [preselect, setPreselect] = useState<Preselect>({})

  const openModal = (pre?: Preselect) => {
    setPreselect(pre || {})
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setPreselect({})
  }

  return (
    <ServiceRequestContext.Provider
      value={{
        isOpen,
        preselect,
        preselectedService: preselect.serviceType,
        preselectedCleaningPackageSize: preselect.packageSize,
        preselectedCleaningPackageName: preselect.containerName,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  )
}

export function useServiceRequest() {
  return useContext(ServiceRequestContext)
}
