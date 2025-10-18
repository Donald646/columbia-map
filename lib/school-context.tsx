'use client'

import { createContext, useContext, ReactNode } from 'react'
import { SchoolConfig } from './schools/config'

interface SchoolContextValue {
  school: SchoolConfig
}

const SchoolContext = createContext<SchoolContextValue | null>(null)

export function SchoolProvider({ 
  school, 
  children 
}: { 
  school: SchoolConfig
  children: ReactNode 
}) {
  return (
    <SchoolContext.Provider value={{ school }}>
      {children}
    </SchoolContext.Provider>
  )
}

export function useSchool(): SchoolConfig {
  const context = useContext(SchoolContext)
  
  if (!context) {
    throw new Error('useSchool must be used within SchoolProvider')
  }
  
  return context.school
}

