import type { ReactNode } from 'react'
import { NavigationProvider } from './navigation'
import { ShopProvider } from './shopContext'
import { CustomerProvider } from './customerContext'
import { WorkProvider } from './workContext'
import { FinanceProvider } from './financeContext'
import { InventoryProvider } from './inventoryContext'
import { SchedulerProvider } from './schedulerContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NavigationProvider>
      <ShopProvider>
        <CustomerProvider>
          <WorkProvider>
            <FinanceProvider>
              <InventoryProvider>
                <SchedulerProvider>{children}</SchedulerProvider>
              </InventoryProvider>
            </FinanceProvider>
          </WorkProvider>
        </CustomerProvider>
      </ShopProvider>
    </NavigationProvider>
  )
}
